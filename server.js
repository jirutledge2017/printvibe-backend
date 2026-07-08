const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve the GildedWalls.com storefront
app.use(express.static(path.join(__dirname, 'public')));

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
  service: 'GildedWalls Backend',
  stripe: !!stripe,
  printful: !!TOKEN,
}));

// ── GET /api/config ───────────────────────────────────────────────
// Public runtime config for the storefront (publishable key only — never secrets).
app.get('/api/config', (_req, res) => res.json({
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
}));

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
        source: 'GildedWalls.com',
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
      confirm: false,
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
  console.log(`GildedWalls backend running on http://localhost:${PORT}`);
  if (!TOKEN) console.warn('[WARN] PRINTFUL_TOKEN is not set');
  if (!stripe) console.warn('[WARN] STRIPE_SECRET_KEY is not set');
});
