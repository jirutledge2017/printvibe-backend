const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
// Large limit so customers can upload their own photos for printing (base64)
app.use(express.json({ limit: '40mb' }));

// Serve the StippleCrown.com storefront
app.use(express.static(path.join(__dirname, 'public')));

// Anthropic init — powers the StippleCrown Concierge chat; optional
let anthropic;
if (process.env.ANTHROPIC_API_KEY) {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic();
} else {
  console.warn('[WARN] ANTHROPIC_API_KEY is not set — AI concierge will use built-in answers');
}

const PRINTFUL_API = 'https://api.printful.com';
const TOKEN = process.env.PRINTFUL_TOKEN;

// Stripe init — will warn if key is missing
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('[WARN] STRIPE_SECRET_KEY is not set — payment processing disabled');
}

// ── VARIANT MAPS ─────────────────────────────────────────────────
const VARIANT_MAP = {
  poster: {
    '4x6':   16364,
    '5x7':   16364,
    '8x10':   4463,
    '11x14': 14125,
    '16x20':  3877,
    '24x36':     2,
  },
  canvas: {
    '4x6':   19293,
    '5x7':   19293,
    '8x10':  19293,
    '11x14': 19298,
    '16x20':     6,
    '24x36':   825,
  },
  metal: {
    '4x6':   15134,
    '5x7':   15134,
    '8x10':  15134,
    '11x14': 15136,
    '16x20': 15137,
    '24x36': 15139,
  },
  framed: {
    // Enhanced Matte Paper Framed Poster (Black frame) - product 2
    '4x6':    4651, // no 4x6; maps to 8x10 ($20.35)
    '5x7':    4651, // no 5x7; maps to 8x10 ($20.35)
    '8x10':   4651,  // $20.35
    '11x14': 14292,  // $30.09
    '16x20':  4399,  // $41.77
    '24x36':     4,  // $74.41
  },
};

const PRODUCT_ID_MAP = { poster: 1, canvas: 3, metal: 588, framed: 2 };

function normSize(dim) {
  return String(dim || '')
    .replace(/[×✕xX]/g, 'x')
    .replace(/["""′″]/g, '')
    .replace(/\s/g, '')
    .toLowerCase();
}

function getVariantId(materialId, sizeDim) {
  const mat = (materialId || 'poster').toLowerCase()
    .replace('flat metal', 'metal')
    .replace('flat_metal', 'metal')
    .replace('wood', 'framed');
  const sz = normSize(sizeDim || '8x10');
  const matMap = VARIANT_MAP[mat] || VARIANT_MAP.poster;
  return matMap[sz] || matMap['8x10'];
}

function printfulHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
}

// ── HEALTH CHECK ─────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  ok: true,
  service: 'StippleCrown Backend',
  stripe: !!stripe,
  printful: !!TOKEN,
}));

// ── GET /api/config ───────────────────────────────────────────────
// Public runtime config for the storefront (publishable key only — never secrets).
// Guard: only pk_* keys may ever leave the server. If a secret (sk_*) key is
// pasted into STRIPE_PUBLISHABLE_KEY by mistake, refuse to serve it.
app.get('/api/config', (_req, res) => {
  const key = process.env.STRIPE_PUBLISHABLE_KEY || '';
  res.json({ stripePublishableKey: key.startsWith('pk_') ? key : null });
});

// ── POST /api/create-payment-intent ──────────────────────────────
// Called before card charge. Returns clientSecret for Stripe.js.
app.post('/api/create-payment-intent', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured — add STRIPE_SECRET_KEY to .env' });

  try {
    const { items, email } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total in cents
    const totalCents = Math.round(items.reduce((sum, i) => sum + (Number(i.price) || 0), 0) * 100);
    if (totalCents < 50) return res.status(400).json({ error: 'Order total too low' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      receipt_email: email || undefined,
      metadata: {
        source: 'StippleCrown.com',
        items: JSON.stringify(items.map(i => i.name || 'Custom Print').join(', ')).slice(0, 500),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, amount: totalCents });
  } catch (err) {
    console.error('[Stripe] create-payment-intent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/create-order ────────────────────────────────────────
// Verifies Stripe payment then submits to Printful.
app.post('/api/create-order', async (req, res) => {
  try {
    const { customer, items, paymentIntentId } = req.body;

    // Validate customer
    if (!customer?.name || !customer?.email || !customer?.address) {
      return res.status(400).json({ error: 'Missing required customer fields' });
    }
    const { address } = customer;
    if (!address.address1 || !address.city || !address.zip) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Verify Stripe payment if Stripe is configured
    if (stripe && paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== 'succeeded') {
        return res.status(402).json({
          error: `Payment not completed. Status: ${intent.status}. Please complete payment first.`
        });
      }
    } else if (stripe && !paymentIntentId) {
      return res.status(402).json({ error: 'Payment required before placing order.' });
    }

    // Build Printful order
    const orderItems = items.map((item) => {
      const variantId = getVariantId(item.materialId, item.sizeDim);
      const entry = {
        variant_id: variantId,
        quantity: 1,
        files: [{ url: item.imageUrl || 'https://picsum.photos/800/600' }],
        name: item.name || 'Custom Print',
      };
      if (item.price) entry.retail_price = Number(item.price).toFixed(2);
      return entry;
    });

    const orderPayload = {
      recipient: {
        name:         customer.name,
        email:        customer.email,
        address1:     address.address1,
        city:         address.city,
        state_code:   address.state || '',
        country_code: address.country || 'US',
        zip:          address.zip,
      },
      items: orderItems,
      // confirm:true → paid orders are auto-submitted to Printful production
      // (Printful charges the payment method on file). Was false (drafts) until 2026-07-10.
      confirm: true,
    };

    const pfRes = await fetch(`${PRINTFUL_API}/orders`, {
      method: 'POST',
      headers: printfulHeaders(),
      body: JSON.stringify(orderPayload),
    });

    const data = await pfRes.json();

    if (!pfRes.ok) {
      console.error('[Printful] create-order error:', JSON.stringify(data, null, 2));
      return res.status(pfRes.status).json({
        error: data.result || 'Printful rejected the order',
        details: data,
      });
    }

    const order = data.result;
    res.json({
      success: true,
      order: { id: order.id, status: order.status, created: order.created, costs: order.costs },
    });
  } catch (err) {
    console.error('[server] create-order exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/upload ──────────────────────────────────────────────
// Customers upload their own photo (base64) for custom prints.
// Saved under public/uploads so Printful can fetch it by public URL.
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const UPLOAD_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

app.post('/api/upload', (req, res) => {
  try {
    const { data, contentType } = req.body || {};
    const ext = UPLOAD_TYPES[contentType];
    if (!data || !ext) {
      return res.status(400).json({ error: 'Send { data: <base64>, contentType: image/jpeg|png|webp }' });
    }
    const buf = Buffer.from(data, 'base64');
    if (buf.length < 100) return res.status(400).json({ error: 'Image data is empty or invalid' });
    if (buf.length > 30 * 1024 * 1024) return res.status(413).json({ error: 'Image too large (max 30MB)' });

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const name = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, name), buf);
    res.json({ url: `/uploads/${name}` });
  } catch (err) {
    console.error('[upload] error:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ── POST /api/subscribe ───────────────────────────────────────────
// Newsletter signups, appended to data/subscribers.json
app.post('/api/subscribe', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  try {
    const file = path.join(__dirname, 'data', 'subscribers.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let list = [];
    try { list = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
    if (!list.some((s) => s.email === email)) {
      list.push({ email, at: new Date().toISOString() });
      fs.writeFileSync(file, JSON.stringify(list, null, 2));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[subscribe] error:', err.message);
    res.status(500).json({ error: 'Could not subscribe' });
  }
});

// ── POST /api/chat ────────────────────────────────────────────────
// The StippleCrown Concierge. Uses Claude when ANTHROPIC_API_KEY is set,
// otherwise falls back to built-in answers so the widget always works.
const CONCIERGE_SYSTEM = `You are the StippleCrown Concierge, the friendly AI shopping assistant for StippleCrown.com — a luxury wall-art store selling bold black-and-gold digital artworks printed to order.

The Signature Collection (all available as Museum Poster, Gallery Canvas, Brushed Metal, or Framed Matte, in 8x10", 11x14", 16x20", 24x36"). Each piece has a "story" — share it warmly when a customer is curious about a piece or its meaning:
- Gilded Panther (best seller) — black panther veined in molten gold. Story: the panther hunts alone; it wears its solitude like a crown, a thing that was given nothing and took the throne anyway. For where you make your hardest decisions.
- Chromatic King — lion erupting in crimson/teal/amber. Story: a lion roars to remind the savanna who it belongs to; the color is that roar made visible — crimson for the fight, teal for the calm after, amber for the crown.
- I Am King — crowned figure tattooed in gold affirmations (Strong, Leader, Champion). Story: before anyone believes in you, you say it out loud; a crown here is spoken into being, not handed down. A daily reminder you already are what you're becoming.
- Emerald Gaze — midnight jaguar with burning teal eyes. Story: you never see the jaguar, you feel it a half-second before it decides your fate; power doesn't announce itself, it just needs to be seen.
- Crowned Grace — dreamlike portrait crowned by a crane, wreathed in roses. Story: the quiet kind of royalty — a woman with nothing left to prove; grace is the loudest power in the room.
- Boss Moves Only — bull in a tailored suit, solid-gold horns, skyline behind. Story: the market has two animals and only one wears a suit; this bull charges forward, never away. For the desk where real work happens.
- Legacy (fan favorite) — father & son silhouettes, both crowned in gold. Story: a crown was meant to be passed down; two generations in the same golden light carrying the same name forward. For fathers who build and sons who inherit.
- Golden Serpent — black snake laced with hand-set gold leaf. Story: the serpent means rebirth in every culture — shed the old skin, emerge gilded; for anyone who burned down an old version of themselves and came back worth more.
- Rise Above — eagle breaking through a storm in gold light. Story: every other bird flees the storm; the eagle flies into it and rises higher than calm air allows. The thing trying to break you is what lifts you.
- Gilded Peace — gold peace sign over teal/blush marble. Story: peace is the gold seam that holds you together after the storm — like kintsugi, the crack made precious. For the corner where you exhale.
- Crowned in Bloom — a woman painted in wild pop-art color, petals for a crown. Story: they told her to pick a color and stay in the lines; she chose all of them. Every shade is a season she survived and wore out loud. Blooming never needed permission.
- Cosmic Kingdom — a spiral galaxy turning in deep space, worlds scattered like jewels. Story: everything that ever told you no fits inside a single grain of this; you're made of the same fire, and you're here on purpose. Dream bigger — the universe already bet on you.
- Born of Kings — a lion-tiger (liger) fused into one sovereign. Story: when a lion and tiger share a bloodline, the result outgrows them both — the largest of the great cats, born of two kings and answering to none. You don't come from one kind of strength; you come from all of it.

Prices: Poster $24-$79 · Canvas $59-$159 · Metal $69-$189 · Framed $69-$169, by size.
Customers can also upload their OWN photo in the "Print Your Own" studio and order it on any material.
Promo code CROWN10 gives 10% off. Orders are printed by Printful in ~2-5 business days, then shipped with tracking (live rates shown at checkout, worldwide). Free reprint guarantee if a print arrives damaged.

Rules: Be warm, concise (2-4 sentences unless asked for detail), and helpful. Recommend specific pieces when asked. Never invent products, prices, or policies not listed here. For order status or refunds, ask the customer to email support with their order number. Do not discuss anything unrelated to StippleCrown, wall art, or home décor — politely steer back.`;

const CONCIERGE_FALLBACKS = [
  { re: /(ship|deliver|how long|arrive)/i, a: 'Every piece is printed to order in about 2–5 business days, then shipped with tracking. Live shipping rates for your address are shown at checkout — and we ship worldwide! 📦' },
  { re: /(price|cost|how much)/i, a: 'Prices depend on material and size: Museum Poster $24–$79, Gallery Canvas $59–$159, Brushed Metal $69–$189, Framed Matte $69–$169. Tip: use code CROWN10 for 10% off! ✨' },
  { re: /(discount|promo|code|coupon|deal)/i, a: 'Yes! Use code CROWN10 at checkout for 10% off your order. ✨' },
  { re: /(return|refund|damage|broken)/i, a: 'If your print arrives damaged or less than perfect, we\'ll reprint it free — that\'s our guarantee. Just email support with a photo and your order number.' },
  { re: /(upload|own photo|custom|my picture|my image)/i, a: 'Absolutely — scroll to the "Print Your Own" studio, drop in your photo, pick a material and size, and we\'ll print it like a gallery piece. High-resolution images look best!' },
  { re: /(material|canvas|metal|poster|framed|difference)/i, a: 'We offer four finishes: Museum Poster (archival matte paper), Gallery Canvas (1.5" wrap, ready to hang), Brushed Metal (vivid + waterproof), and Framed Matte (slim black wood frame). Canvas and Metal make the boldest statement pieces!' },
  { re: /(recommend|best|which|popular|gift)/i, a: 'Our best seller is the Gilded Panther — black and gold, owns any room. For color lovers, Chromatic King is stunning, and Legacy makes a beautiful meaningful gift. 🖤✨' },
  { re: /(story|meaning|behind|inspired|represent|symbol)/i, a: 'Every piece in the collection carries its own story ✨ Tap any artwork to open it and read "The Story" behind it — from the lone Gilded Panther who took the throne, to Legacy\'s crown passed from father to son. Which piece caught your eye?' },
];

app.post('/api/chat', async (req, res) => {
  try {
    const history = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const clean = history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (clean.length === 0 || clean[clean.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Send { messages: [...] } ending with a user message' });
    }

    if (anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 600,
        system: CONCIERGE_SYSTEM,
        messages: clean,
      });
      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      return res.json({ reply: text || 'Sorry, I didn\'t catch that — could you rephrase?' });
    }

    // Built-in fallback answers (no API key configured)
    const q = clean[clean.length - 1].content;
    const hit = CONCIERGE_FALLBACKS.find((f) => f.re.test(q));
    res.json({
      reply: hit ? hit.a
        : 'I can help with our collection, materials, sizes, pricing, shipping, and custom photo prints! What would you like to know? ✨',
    });
  } catch (err) {
    console.error('[chat] error:', err.message);
    res.status(500).json({ error: 'The concierge is unavailable right now — please try again.' });
  }
});

// ── GET /api/shipping ─────────────────────────────────────────────
app.get('/api/shipping', async (req, res) => {
  try {
    const {
      address1, city, state = '', zip,
      country = 'US',
      materialId = 'poster',
      sizeDim = '8x10',
    } = req.query;

    if (!address1 || !city || !zip) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }

    const variantId = getVariantId(materialId, sizeDim);
    const pfRes = await fetch(`${PRINTFUL_API}/shipping/rates`, {
      method: 'POST',
      headers: printfulHeaders(),
      body: JSON.stringify({
        recipient: { address1, city, state_code: state, country_code: country, zip },
        items: [{ variant_id: variantId, quantity: 1 }],
      }),
    });

    const data = await pfRes.json();
    if (!pfRes.ok) return res.status(pfRes.status).json({ error: data.result || 'Failed to get shipping' });
    res.json({ rates: data.result });
  } catch (err) {
    console.error('[server] shipping exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/variants/:productId ──────────────────────────────────
app.get('/api/variants/:productId', async (req, res) => {
  try {
    const pfRes = await fetch(`${PRINTFUL_API}/products/${req.params.productId}`, {
      headers: printfulHeaders(),
    });
    const data = await pfRes.json();
    if (!pfRes.ok) return res.status(pfRes.status).json({ error: data.result || 'Product not found' });
    res.json({
      product: data.result.product.title,
      variants: data.result.variants.map((v) => ({
        id: v.id, name: v.name, size: v.size, price: v.price, in_stock: v.in_stock,
      })),
    });
  } catch (err) {
    console.error('[server] variants exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`StippleCrown backend running on http://localhost:${PORT}`);
  if (!TOKEN) console.warn('[WARN] PRINTFUL_TOKEN is not set');
  if (!stripe) console.warn('[WARN] STRIPE_SECRET_KEY is not set');
  const pub = process.env.STRIPE_PUBLISHABLE_KEY || '';
  if (pub && !pub.startsWith('pk_')) {
    console.error('[ERROR] STRIPE_PUBLISHABLE_KEY does not start with pk_ — it looks like a secret key. It will NOT be served to the storefront; card payments are disabled until a pk_ key is set.');
  }
});
