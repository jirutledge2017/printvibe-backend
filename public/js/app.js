/* ============================================================
   StippleCrown.com — storefront app
   Talks to the StippleCrown backend:
     GET  /api/config                 → { stripePublishableKey }
     POST /api/create-payment-intent  → { clientSecret, amount }
     POST /api/create-order           → submits order to Printful
     GET  /api/shipping               → live shipping rates
   ============================================================ */

// ---------- catalog ----------
const ARTWORKS = [
  {
    id: 'gilded-panther',
    title: 'Gilded Panther',
    cat: 'wildlife',
    badge: 'Best Seller',
    accent: '#e8b64c',
    desc: 'A jet-black panther crowned in molten gold. Ink and gilding collide in a piece that owns any room it enters.',
    story: 'They say the panther hunts alone because nothing else can keep its pace. Here it wears its solitude like a crown — struck through with veins of gold, the mark of a thing that was never given anything and took the throne anyway. Hang it where you make your hardest decisions. It watches with you.',
  },
  {
    id: 'chromatic-king',
    title: 'Chromatic King',
    cat: 'wildlife',
    badge: 'New',
    accent: '#ff3d5a',
    desc: 'The king of the savanna erupting in crimson, teal, and amber. Pure energy for walls that refuse to be quiet.',
    story: 'A lion doesn\'t roar to be heard — it roars to remind the savanna who it belongs to. We shattered that roar into color: crimson for the fight, teal for the calm after it, amber for the crown. This is the king caught mid-declaration, every hue a word in a language older than fear.',
  },
  {
    id: 'i-am-king',
    title: 'I Am King',
    cat: 'royalty',
    badge: 'Statement Piece',
    accent: '#e8b64c',
    desc: 'Crowned in gold and armored in affirmation — Strong. Leader. Champion. A towering statement of power and self-belief.',
    story: 'Before anyone believes in you, you have to say it out loud. Strong. Leader. Champion. The words are tattooed in gold across a body carved from will alone, because a crown isn\'t handed down here — it\'s spoken into being. Put this on your wall as a daily reminder: you already are what you\'re working to become.',
  },
  {
    id: 'emerald-gaze',
    title: 'Emerald Gaze',
    cat: 'wildlife',
    badge: null,
    accent: '#2dd4bf',
    desc: 'A midnight jaguar with eyes of burning teal, emerging from a storm of ink. Quiet menace, framed in shadow.',
    story: 'In the black of the rainforest, you never see the jaguar — you feel it, a half-second before it decides your fate. We froze that moment: the storm of ink, the body still half-shadow, and two eyes of burning teal that have already made up their mind. Power doesn\'t need to announce itself. It just needs to be seen.',
  },
  {
    id: 'crowned-grace',
    title: 'Crowned Grace',
    cat: 'portrait',
    badge: 'Limited Feel',
    accent: '#8b5cf6',
    desc: 'Serenity in gold and jade — a dreamlike portrait wreathed in roses and wings. Softness with unmistakable presence.',
    story: 'The crane crowns her not with jewels but with wings, and she wears it eyes-closed, unbothered, complete. Roses bloom where a lesser story would put armor. This is the quiet kind of royalty — the woman who has nothing left to prove, wrapped in gold and jade and her own unhurried peace. Grace, it turns out, is the loudest power in the room.',
  },
  {
    id: 'boss-moves-only',
    title: 'Boss Moves Only',
    cat: 'motivation',
    badge: 'New',
    accent: '#e8b64c',
    desc: 'A bull in a tailored suit with horns of solid gold, the city skyline burning below. For offices and rooms where deals get done.',
    story: 'The market has two animals, and only one of them wears a suit. Horns cast in solid gold, the skyline glittering at his back like territory already claimed — this bull charges forward, never away. Hang it above the desk where the real work happens. It doesn\'t ask permission, and neither should you.',
  },
  {
    id: 'legacy',
    title: 'Legacy',
    cat: 'royalty',
    badge: 'Fan Favorite',
    accent: '#e8b64c',
    desc: 'Father and son, crowned in gold, standing in a halo of light. A tribute to the kings we raise and the ones who raised us.',
    story: 'A crown was never meant to be worn alone — it\'s meant to be passed down. Two silhouettes, one grown and one still growing, stand in the same golden light, wearing the same gold, carrying the same name forward. This is the piece for the fathers who build so their sons can inherit, and the sons who\'ll do the same. A kingdom is only as lasting as the hands you hand it to.',
  },
  {
    id: 'rise-above',
    title: 'Rise Above',
    cat: 'motivation',
    badge: 'New',
    accent: '#2dd4bf',
    desc: 'An eagle breaking through storm clouds in a burst of gold and light. For everyone who refuses to stay down.',
    story: 'Every other bird flees the storm. The eagle flies straight into it, spreads its wings, and lets the wind carry it higher than calm air ever could. Here it breaks the clouds in a burst of gold and light — proof that the thing trying to break you is the same thing lifting you up. Rise above. It was always the only way through.',
  },
  {
    id: 'golden-serpent',
    title: 'Golden Serpent',
    cat: 'wildlife',
    badge: null,
    accent: '#e8b64c',
    desc: 'A jet-black serpent laced with hand-set gold leaf, coiled across pure darkness. Minimal, hypnotic, unforgettable.',
    story: 'The serpent has meant the same thing in every culture that ever drew it: rebirth. Shed the old skin, emerge remade, gilded by the process. Against pure black, this one coils in hand-set gold leaf — patient, hypnotic, in no hurry at all. A piece for anyone who has burned down an old version of themselves and come back worth more.',
  },
  {
    id: 'gilded-peace',
    title: 'Gilded Peace',
    cat: 'abstract',
    badge: null,
    accent: '#ff8fab',
    desc: 'A peace sign poured in liquid gold over teal and blush marble. Soft power for bedrooms, studios, and calm corners.',
    story: 'Peace isn\'t the absence of a storm — it\'s the gold seam that holds you together after one. Poured in liquid gold across teal and blush marble, this is peace as the Japanese see it in kintsugi: the crack made precious, the healing made visible. Hang it in the corner where you exhale. Softness, it turns out, is its own kind of strength.',
  },
];

// Prices per material/size (retail USD). Sizes match the backend's Printful variant map.
const PRICING = {
  poster: { label: 'Museum Poster', sizes: { '8x10': 24, '11x14': 34, '16x20': 49, '24x36': 79 } },
  canvas: { label: 'Gallery Canvas', sizes: { '8x10': 59, '11x14': 79, '16x20': 109, '24x36': 159 } },
  metal:  { label: 'Brushed Metal', sizes: { '8x10': 69, '11x14': 95, '16x20': 129, '24x36': 189 } },
  framed: { label: 'Framed Matte', sizes: { '8x10': 69, '11x14': 89, '16x20': 119, '24x36': 169 } },
};
const SIZE_LABELS = { '8x10': '8×10″', '11x14': '11×14″', '16x20': '16×20″', '24x36': '24×36″' };

const API = ''; // same origin

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n) => `$${Number(n).toFixed(2)}`;
const fromPrice = (id) => Math.min(...Object.values(PRICING.poster.sizes));

// ---------- gold dust particles ----------
(function dust() {
  const canvas = $('#dust');
  const ctx = canvas.getContext('2d');
  let w, h, parts = [];
  const N = Math.min(70, Math.floor(window.innerWidth / 22));

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < N; i++) {
    parts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.08 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      a: 0.15 + Math.random() * 0.5,
      tw: Math.random() * Math.PI * 2,
    });
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.vy; p.x += p.vx;
      if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
      if (p.x < -4) p.x = w + 4;
      if (p.x > w + 4) p.x = -4;
      const twinkle = 0.55 + Math.sin(t * 0.0012 + p.tw) * 0.45;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 182, 76, ${(p.a * twinkle).toFixed(3)})`;
      ctx.fill();
    }
    if (!reduced) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// ---------- nav scroll state ----------
const navBar = $('#navBar');
window.addEventListener('scroll', () => {
  navBar.classList.toggle('is-scrolled', window.scrollY > 30);
}, { passive: true });

// ---------- scroll reveal ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.revealDelay || 0;
      setTimeout(() => e.target.classList.add('is-visible'), +delay);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
$$('[data-reveal]').forEach((el) => revealObserver.observe(el));

// ---------- parallax ----------
(function parallax() {
  const els = $$('[data-parallax]');
  if (!els.length) return;
  let ticking = false;
  function update() {
    const sy = window.scrollY;
    els.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      el.style.transform = `translateY(${sy * speed}px)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

// ---------- 3D tilt (hero cards, about art, product cards) ----------
function attachTilt(el, strength = 10) {
  let raf = null;
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateY(${(px * strength).toFixed(2)}deg) rotateX(${(-py * strength).toFixed(2)}deg) translateY(-4px)`;
      el.style.animationPlayState = 'paused';
    });
  });
  el.addEventListener('mouseleave', () => {
    if (raf) cancelAnimationFrame(raf);
    el.style.transform = '';
    el.style.animationPlayState = '';
  });
}
$$('[data-tilt]').forEach((el) => attachTilt(el, 8));

// ---------- collection grid ----------
const grid = $('#grid');
let activeCat = 'all';

function renderGrid() {
  const list = activeCat === 'all' ? ARTWORKS : ARTWORKS.filter((a) => a.cat === activeCat);
  grid.innerHTML = list.map((a, i) => `
    <article class="art-card" data-id="${a.id}" style="--d:${i * 90}ms; --accent:${a.accent}">
      <div class="art-card__frame">
        <picture>
          <source srcset="art/${a.id}-web.webp" type="image/webp" />
          <img src="art/${a.id}-web.jpg" alt="${a.title} — luxury wall art print" loading="lazy" />
        </picture>
        ${a.badge ? `<span class="art-card__badge">${a.badge}</span>` : ''}
        <div class="art-card__glare"></div>
      </div>
      <div class="art-card__body">
        <div>
          <span class="cat">${a.cat}</span>
          <h4>${a.title}</h4>
        </div>
        <div class="art-card__price">
          <span>from</span>
          <strong>$${fromPrice(a.id)}</strong>
        </div>
      </div>
    </article>
  `).join('');

  $$('.art-card', grid).forEach((card) => {
    attachTilt(card, 6);
    card.addEventListener('click', () => openProduct(card.dataset.id));
  });
}
renderGrid();

$('#filters').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  $$('#filters .chip').forEach((c) => c.classList.remove('is-active'));
  chip.classList.add('is-active');
  activeCat = chip.dataset.cat;
  renderGrid();
});

// ---------- product modal ----------
const productModal = $('#productModal');
let pmState = { id: null, material: 'poster', size: '16x20' };

function openProduct(id) {
  const art = ARTWORKS.find((a) => a.id === id);
  if (!art) return;
  pmState = { id, material: 'poster', size: '16x20' };

  $('#pmImg').src = `art/${id}-web.jpg`;
  $('#pmImg').alt = art.title;
  $('#pmTitle').textContent = art.title;
  $('#pmCat').textContent = `${art.cat} · Signature Collection`;
  $('#pmDesc').textContent = art.desc;
  const storyEl = $('#pmStory');
  if (storyEl) { storyEl.textContent = art.story || ''; storyEl.hidden = !art.story; }

  $('#pmMaterials').innerHTML = Object.entries(PRICING).map(([key, m]) =>
    `<button class="chip ${key === pmState.material ? 'is-active' : ''}" data-material="${key}">${m.label}</button>`
  ).join('');
  renderSizes();
  updatePmPrice();
  openModal(productModal);
}

function renderSizes() {
  const sizes = PRICING[pmState.material].sizes;
  $('#pmSizes').innerHTML = Object.keys(sizes).map((s) =>
    `<button class="chip ${s === pmState.size ? 'is-active' : ''}" data-size="${s}">${SIZE_LABELS[s]}</button>`
  ).join('');
}

function updatePmPrice() {
  $('#pmPrice').textContent = money(PRICING[pmState.material].sizes[pmState.size]);
}

$('#pmMaterials').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  pmState.material = chip.dataset.material;
  if (!PRICING[pmState.material].sizes[pmState.size]) pmState.size = '16x20';
  $$('#pmMaterials .chip').forEach((c) => c.classList.toggle('is-active', c.dataset.material === pmState.material));
  renderSizes();
  updatePmPrice();
});

$('#pmSizes').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  pmState.size = chip.dataset.size;
  $$('#pmSizes .chip').forEach((c) => c.classList.toggle('is-active', c.dataset.size === pmState.size));
  updatePmPrice();
});

$('#pmAdd').addEventListener('click', () => {
  const art = ARTWORKS.find((a) => a.id === pmState.id);
  if (!art) return;
  Cart.add({
    id: `${pmState.id}-${pmState.material}-${pmState.size}-${Date.now()}`,
    artId: pmState.id,
    name: `${art.title} — ${PRICING[pmState.material].label} ${SIZE_LABELS[pmState.size]}`,
    title: art.title,
    materialId: pmState.material,
    sizeDim: pmState.size,
    price: PRICING[pmState.material].sizes[pmState.size],
    imageUrl: `${location.origin}/art/${pmState.id}.png`,
    thumb: `art/${pmState.id}-thumb.jpg`,
  });
  closeModal(productModal);
  toast(`${art.title} added to cart ✨`);
  Cart.open();
});

// ---------- modal helpers ----------
function openModal(m) {
  m.classList.add('is-open');
  m.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(m) {
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
$$('.modal').forEach((m) => {
  m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); });
  $$('[data-close-modal]', m).forEach((b) => b.addEventListener('click', () => closeModal(m)));
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  $$('.modal.is-open').forEach(closeModal);
  Cart.close();
});

// ---------- cart ----------
const PROMO_CODES = { CROWN10: 0.10 };

const Cart = (() => {
  const KEY = 'stipplecrown.cart';
  const PROMO_KEY = 'stipplecrown.promo';
  let items = [];
  let promo = null;
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
  const savedPromo = localStorage.getItem(PROMO_KEY);
  if (savedPromo && PROMO_CODES[savedPromo]) promo = savedPromo;

  const save = () => { localStorage.setItem(KEY, JSON.stringify(items)); render(); };
  const subtotal = () => items.reduce((s, i) => s + i.price, 0);
  const discount = () => (promo ? Math.round(subtotal() * PROMO_CODES[promo] * 100) / 100 : 0);

  function add(item) { items.push(item); save(); }
  function remove(id) { items = items.filter((i) => i.id !== id); save(); }
  function clear() { items = []; save(); }

  function applyPromo(code) {
    const c = String(code || '').trim().toUpperCase();
    if (!PROMO_CODES[c]) return false;
    promo = c;
    localStorage.setItem(PROMO_KEY, c);
    render();
    return true;
  }

  function render() {
    const body = $('#cartBody');
    if (items.length === 0) {
      body.innerHTML = '<p class="muted">Your cart is empty.</p>';
    } else {
      body.innerHTML = items.map((i) => `
        <div class="cart-item">
          <div class="cart-item__thumb" style="background-image:url(${i.thumb})"></div>
          <div>
            <h4>${i.title}</h4>
            <div class="cart-item__meta">${PRICING[i.materialId].label} · ${SIZE_LABELS[i.sizeDim]}</div>
            <button class="cart-item__rm" data-id="${i.id}">Remove</button>
          </div>
          <div class="cart-item__price">${money(i.price)}</div>
        </div>
      `).join('');
      $$('.cart-item__rm', body).forEach((b) =>
        b.addEventListener('click', () => remove(b.dataset.id)));
    }
    const d = discount();
    $('#discountRow').hidden = d <= 0;
    $('#cartDiscount').textContent = `-${money(d)}`;
    $('#cartTotal').textContent = money(subtotal() - d);
    $('#cartCount').textContent = items.length;
  }

  function open() { $('#cartDrawer').classList.add('is-open'); $('#scrim').classList.add('is-open'); }
  function close() { $('#cartDrawer').classList.remove('is-open'); $('#scrim').classList.remove('is-open'); }

  $('#cartBtn').addEventListener('click', open);
  $('#closeCart').addEventListener('click', close);
  $('#scrim').addEventListener('click', close);
  render();

  return {
    add, remove, clear, open, close, applyPromo,
    get items() { return items; },
    get promo() { return promo; },
    subtotal, discount,
  };
})();

// promo code UI
$('#promoApply').addEventListener('click', () => {
  const msg = $('#promoMsg');
  msg.hidden = false;
  if (Cart.applyPromo($('#promoInput').value)) {
    msg.textContent = '✓ 10% off applied!';
    msg.classList.remove('is-error');
  } else {
    msg.textContent = 'That code isn\'t valid.';
    msg.classList.add('is-error');
  }
});

// ---------- checkout ----------
const Checkout = (() => {
  const modal = $('#checkoutModal');
  let stripe = null, cardElement = null, config = null;
  let shippingCost = 0, customer = null;

  async function loadConfig() {
    if (config) return config;
    try {
      const res = await fetch(`${API}/api/config`);
      config = await res.json();
    } catch { config = {}; }
    return config;
  }

  function setStep(n) {
    $$('.co__step', modal).forEach((s, i) => s.classList.toggle('is-active', i <= n));
    $$('.co__pane', modal).forEach((p) => p.classList.remove('is-active'));
    [$('#coShipping'), $('#coPayment'), $('#coDone')][n].classList.add('is-active');
  }

  async function open() {
    if (Cart.items.length === 0) { toast('Your cart is empty'); return; }
    Cart.close();
    setStep(0);
    $('#shipQuote').hidden = true;
    openModal(modal);
  }

  // STEP 1 → 2
  $('#coShipping').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#toPayment');

    customer = {
      name: $('#fName').value.trim(),
      email: $('#fEmail').value.trim(),
      address: {
        address1: $('#fAddress').value.trim(),
        city: $('#fCity').value.trim(),
        state: $('#fState').value.trim().toUpperCase(),
        zip: $('#fZip').value.trim(),
        country: $('#fCountry').value,
      },
    };

    // Printful rejects US/Canada orders without a state — catch it here
    // with a friendly message instead of a failed order at the last step.
    if (['US', 'CA'].includes(customer.address.country) && !customer.address.state) {
      const stateInput = $('#fState');
      stateInput.focus();
      toast('Please add your state (2-letter code, e.g. CA) to continue');
      return;
    }

    btn.disabled = true; btn.textContent = 'Calculating shipping…';

    // live shipping quote from Printful (via backend) for the first item
    shippingCost = 0;
    try {
      const first = Cart.items[0];
      const q = new URLSearchParams({
        address1: customer.address.address1,
        city: customer.address.city,
        state: customer.address.state,
        zip: customer.address.zip,
        country: customer.address.country,
        materialId: first.materialId,
        sizeDim: first.sizeDim,
      });
      const res = await fetch(`${API}/api/shipping?${q}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.rates) && data.rates.length) {
        const cheapest = data.rates.reduce((a, b) => (+a.rate <= +b.rate ? a : b));
        shippingCost = +cheapest.rate;
        const quote = $('#shipQuote');
        quote.hidden = false;
        quote.textContent = `📦 ${cheapest.name}: ${money(shippingCost)} — ${cheapest.minDeliveryDays || '?'}–${cheapest.maxDeliveryDays || '?'} days`;
      }
    } catch { /* shipping quote is best-effort */ }

    renderSummary();
    await preparePayment();
    setStep(1);
    btn.disabled = false; btn.textContent = 'Continue to Payment';
  });

  function renderSummary() {
    const sub = Cart.subtotal();
    const disc = Cart.discount();
    $('#coSummary').innerHTML = `
      ${Cart.items.map((i) => `<div class="row"><span>${i.name}</span><span>${money(i.price)}</span></div>`).join('')}
      ${disc ? `<div class="row"><span>Discount (${Cart.promo})</span><span>-${money(disc)}</span></div>` : ''}
      <div class="row"><span>Shipping</span><span>${shippingCost ? money(shippingCost) : 'FREE'}</span></div>
      <div class="row total"><span>Total</span><strong>${money(sub - disc + shippingCost)}</strong></div>
    `;
  }

  async function preparePayment() {
    const cfg = await loadConfig();
    const hasStripe = !!cfg.stripePublishableKey && typeof window.Stripe === 'function';
    $('#cardWrap').style.display = hasStripe ? '' : 'none';
    $('#stripeMissing').hidden = hasStripe;
    if (!hasStripe) return;
    if (!stripe) {
      stripe = window.Stripe(cfg.stripePublishableKey);
      const elements = stripe.elements();
      cardElement = elements.create('card', {
        style: {
          base: {
            color: '#f4f0e6',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            '::placeholder': { color: '#6f6880' },
          },
          invalid: { color: '#ff3d5a' },
        },
      });
      cardElement.mount('#cardElement');
    }
  }

  // STEP 2 → 3
  $('#payBtn').addEventListener('click', async () => {
    const btn = $('#payBtn');
    const errEl = $('#cardError');
    errEl.hidden = true;
    btn.disabled = true; btn.textContent = 'Processing…';

    try {
      const cfg = await loadConfig();
      const disc = Cart.discount();
      const itemsForPayment = [
        ...Cart.items.map((i) => ({ name: i.name, price: i.price })),
        ...(disc ? [{ name: `Discount (${Cart.promo})`, price: -disc }] : []),
        ...(shippingCost ? [{ name: 'Shipping', price: shippingCost }] : []),
      ];

      let paymentIntentId = null;

      if (cfg.stripePublishableKey && stripe && cardElement) {
        // 1. Create payment intent
        const piRes = await fetch(`${API}/api/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsForPayment, email: customer.email }),
        });
        const piData = await piRes.json();
        if (!piRes.ok) throw new Error(piData.error || 'Could not start payment');

        // 2. Confirm card payment
        const result = await stripe.confirmCardPayment(piData.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { name: customer.name, email: customer.email },
          },
        });
        if (result.error) throw new Error(result.error.message);
        paymentIntentId = result.paymentIntent.id;
      }

      // 3. Submit order to Printful via backend
      const orderRes = await fetch(`${API}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: Cart.items.map((i) => ({
            name: i.name,
            materialId: i.materialId,
            sizeDim: i.sizeDim,
            price: i.price,
            imageUrl: i.imageUrl,
          })),
          paymentIntentId,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error?.message || orderData.error || 'Order failed');

      $('#doneMsg').textContent =
        `Thank you, ${customer.name.split(' ')[0]}! Order #${orderData.order?.id ?? '—'} is heading to production. A confirmation is on its way to ${customer.email}.`;
      Cart.clear();
      setStep(2);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'Pay Now';
    }
  });

  $('#backToShipping').addEventListener('click', () => setStep(0));
  $('#checkoutBtn').addEventListener('click', open);

  return { open };
})();

// ---------- print your own studio ----------
const CustomStudio = (() => {
  const drop = $('#cuDrop');
  const input = $('#cuFile');
  const preview = $('#cuPreview');
  const img = $('#cuImg');
  const addBtn = $('#cuAdd');
  let state = { material: 'canvas', size: '16x20', file: null, dataUrl: null };

  function renderChips() {
    $('#cuMaterials').innerHTML = Object.entries(PRICING).map(([key, m]) =>
      `<button class="chip ${key === state.material ? 'is-active' : ''}" data-material="${key}">${m.label}</button>`
    ).join('');
    $('#cuSizes').innerHTML = Object.keys(PRICING[state.material].sizes).map((s) =>
      `<button class="chip ${s === state.size ? 'is-active' : ''}" data-size="${s}">${SIZE_LABELS[s]}</button>`
    ).join('');
    $('#cuPrice').textContent = money(PRICING[state.material].sizes[state.size]);
  }
  renderChips();

  $('#cuMaterials').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.material = chip.dataset.material;
    renderChips();
  });
  $('#cuSizes').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.size = chip.dataset.size;
    renderChips();
  });

  function loadFile(file) {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast('Please use a JPG, PNG, or WebP image');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast('That image is over 30MB — try a smaller one');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.file = file;
      state.dataUrl = reader.result;
      img.src = state.dataUrl;
      drop.hidden = true;
      preview.hidden = false;
      addBtn.disabled = false;
      toast('Photo loaded — pick a material and size ✨');
    };
    reader.readAsDataURL(file);
  }

  drop.addEventListener('click', () => input.click());
  input.addEventListener('change', () => loadFile(input.files && input.files[0]));
  ['dragenter', 'dragover'].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-drag'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-drag'); }));
  drop.addEventListener('drop', (e) => loadFile(e.dataTransfer.files && e.dataTransfer.files[0]));

  $('#cuChange').addEventListener('click', () => {
    preview.hidden = true;
    drop.hidden = false;
    addBtn.disabled = true;
    state.file = null; state.dataUrl = null;
    input.value = '';
  });

  function makeThumb() {
    // small jpeg thumb for the cart drawer
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const c = document.createElement('canvas');
        const scale = 220 / image.width;
        c.width = 220; c.height = Math.round(image.height * scale);
        c.getContext('2d').drawImage(image, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.7));
      };
      image.src = state.dataUrl;
    });
  }

  addBtn.addEventListener('click', async () => {
    if (!state.file) return;
    addBtn.disabled = true;
    const original = addBtn.textContent;
    addBtn.textContent = 'Uploading…';
    try {
      // upload full-res image so Printful can fetch it for printing
      const base64 = state.dataUrl.split(',')[1];
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64, contentType: state.file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      Cart.add({
        id: `custom-${Date.now()}`,
        artId: 'custom',
        name: `Your Photo — ${PRICING[state.material].label} ${SIZE_LABELS[state.size]}`,
        title: 'Your Custom Print',
        materialId: state.material,
        sizeDim: state.size,
        price: PRICING[state.material].sizes[state.size],
        imageUrl: `${location.origin}${data.url}`,
        thumb: await makeThumb(),
      });
      toast('Your custom print is in the cart ✨');
      Cart.open();
    } catch (err) {
      toast(`Upload failed: ${err.message}`);
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = original;
    }
  });
})();

// ---------- StippleCrown Concierge chat ----------
const Concierge = (() => {
  const root = $('#chat');
  const body = $('#chatBody');
  const input = $('#chatText');
  const history = [];
  let busy = false;

  const open = () => { root.classList.add('is-open'); input.focus(); };
  const close = () => root.classList.remove('is-open');
  $('#chatFab').addEventListener('click', open);
  $('#chatClose').addEventListener('click', close);

  function addMsg(role, text, cls = '') {
    const el = document.createElement('div');
    el.className = `chat__msg chat__msg--${role === 'user' ? 'user' : 'bot'} ${cls}`;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  async function send(text) {
    const q = String(text || '').trim();
    if (!q || busy) return;
    busy = true;
    $('#chatQuick')?.remove();
    addMsg('user', q);
    history.push({ role: 'user', content: q });
    input.value = '';
    const typing = addMsg('bot', 'Thinking…', 'chat__msg--typing');

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      typing.remove();
      addMsg('bot', data.reply);
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      typing.remove();
      addMsg('bot', `Sorry — ${err.message}`);
    } finally {
      busy = false;
    }
  }

  $('#chatForm').addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  $('#chatQuick').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) send(b.dataset.q);
  });

  return { open, close };
})();

// ---------- newsletter ----------
$('#newsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#newsEmail').value.trim();
  try {
    const res = await fetch(`${API}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error();
    $('#newsEmail').value = '';
    toast('Welcome to the StippleCrown List ✨');
  } catch {
    toast('Could not subscribe — try again?');
  }
});

// ---------- toast ----------
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
}

// ---------- misc ----------
$('#year').textContent = new Date().getFullYear();
