// ── PRODUCT CATALOG ──────────────────────────────────────────────
// Wall-art collections surfaced to the storefront. Each item points at
// artwork (imageUrl) and declares which print materials/sizes it's sold in.
// Prices are suggested retail (USD); Printful cost is handled at order time.
//
// NOTE: imageUrl values are placeholders. Swap them for real artwork URLs
// (or a CDN/Printful file URL) as the designs are produced.

// Material options. `available: true` = orderable now (real Printful variant
// IDs are mapped in server.js). `available: false` = surfaced to the storefront
// as "coming soon" until its Printful variant IDs are filled in (see
// GENERATE_ARTWORK.md — those IDs must be pulled from the Printful API).
const MATERIALS = [
  { id: 'poster',        label: 'Matte Paper Poster',           available: true  },
  { id: 'poster_luster', label: 'Premium Luster Photo Poster',  available: false },
  { id: 'canvas',        label: 'Gallery Canvas',               available: true  },
  { id: 'metal',         label: 'Metal Print',                  available: true  },
  { id: 'acrylic',       label: 'Acrylic Print',                available: false },
  { id: 'framed',        label: 'Framed Poster — Black',        available: true  },
  { id: 'framed_white',  label: 'Framed Poster — White',        available: false },
  { id: 'framed_wood',   label: 'Framed Poster — Natural Wood',  available: false },
];

// Suggested retail price (USD) by material + size. Storefront can override.
const PRICING = {
  poster:        { '4x6':  9, '5x7': 11, '8x10': 16, '11x14': 24, '16x20': 34, '24x36':  59 },
  poster_luster: { '4x6': 12, '5x7': 14, '8x10': 19, '11x14': 28, '16x20': 39, '24x36':  66 },
  canvas:        { '4x6': 19, '5x7': 22, '8x10': 32, '11x14': 49, '16x20': 69, '24x36': 119 },
  metal:         { '4x6': 24, '5x7': 27, '8x10': 39, '11x14': 59, '16x20': 84, '24x36': 149 },
  acrylic:       { '4x6': 34, '5x7': 39, '8x10': 54, '11x14': 79, '16x20': 109, '24x36': 189 },
  framed:        { '4x6': 29, '5x7': 32, '8x10': 44, '11x14': 64, '16x20': 89, '24x36': 154 },
  framed_white:  { '4x6': 29, '5x7': 32, '8x10': 44, '11x14': 64, '16x20': 89, '24x36': 154 },
  framed_wood:   { '4x6': 34, '5x7': 37, '8x10': 49, '11x14': 69, '16x20': 94, '24x36': 164 },
};

const ALL_SIZES = ['4x6', '5x7', '8x10', '11x14', '16x20', '24x36'];

// Ids of materials orderable right now.
function availableMaterialIds() {
  return MATERIALS.filter((m) => m.available).map((m) => m.id);
}

// Full material list with per-size prices + availability (for the storefront).
function materialOptions() {
  return MATERIALS.map((m) => ({ ...m, prices: { ...PRICING[m.id] } }));
}

// Helper: build a size→price map for the given materials (defaults to all).
function priceMatrix(materials = MATERIALS.map((m) => m.id)) {
  const out = {};
  for (const mat of materials) out[mat] = { ...PRICING[mat] };
  return out;
}

function art(id) {
  // Deterministic placeholder image keyed by id so previews stay stable.
  return `https://picsum.photos/seed/${id}/900/1200`;
}

const COLLECTIONS = [
  {
    id: 'anime',
    title: 'Anime Characters',
    subtitle: 'Bold, stylized anime & manga hero portraits',
    items: [
      { id: 'anime-01', title: 'Neon Ronin',        tags: ['anime', 'cyberpunk', 'portrait'] },
      { id: 'anime-02', title: 'Sakura Spirit',     tags: ['anime', 'fantasy', 'pastel'] },
      { id: 'anime-03', title: 'Shadow Blade',      tags: ['anime', 'action', 'dark'] },
      { id: 'anime-04', title: 'Celestial Mage',    tags: ['anime', 'magic', 'cosmic'] },
      { id: 'anime-05', title: 'Rogue Pilot',       tags: ['anime', 'mecha', 'sci-fi'] },
      { id: 'anime-06', title: 'Kitsune Guardian',  tags: ['anime', 'mythology', 'fox'] },
    ],
  },
  {
    id: 'animals',
    title: 'Animals',
    subtitle: 'Striking wildlife & animal wall art',
    items: [
      { id: 'animal-01', title: 'Mountain Lion',    tags: ['animals', 'wildlife', 'big-cat'] },
      { id: 'animal-02', title: 'Arctic Wolf',      tags: ['animals', 'wildlife', 'wolf'] },
      { id: 'animal-03', title: 'Golden Eagle',     tags: ['animals', 'birds', 'majestic'] },
      { id: 'animal-04', title: 'Savanna Elephant', tags: ['animals', 'safari', 'gentle-giant'] },
      { id: 'animal-05', title: 'Koi Pond',         tags: ['animals', 'fish', 'zen'] },
      { id: 'animal-06', title: 'Red Fox',          tags: ['animals', 'forest', 'fox'] },
    ],
  },
  {
    id: 'warriors',
    title: 'Army Warriors',
    subtitle: 'Battle-ready warriors, soldiers & military art',
    items: [
      { id: 'warrior-01', title: 'Spartan Vanguard',  tags: ['warriors', 'ancient', 'spartan'] },
      { id: 'warrior-02', title: 'Samurai Standoff',  tags: ['warriors', 'samurai', 'honor'] },
      { id: 'warrior-03', title: 'Desert Recon',      tags: ['warriors', 'modern', 'military'] },
      { id: 'warrior-04', title: 'Viking Raider',     tags: ['warriors', 'norse', 'axe'] },
      { id: 'warrior-05', title: 'Knight Templar',    tags: ['warriors', 'medieval', 'knight'] },
      { id: 'warrior-06', title: 'Night Operator',    tags: ['warriors', 'special-forces', 'tactical'] },
    ],
  },
];

// Expand each item into a full product record.
function expandItem(collectionId, item) {
  return {
    id: item.id,
    collection: collectionId,
    title: item.title,
    tags: item.tags,
    imageUrl: art(item.id),
    // Orderable-now material ids (backward compatible string array).
    materials: availableMaterialIds(),
    // Full option list incl. "coming soon" materials, with labels + prices.
    materialOptions: materialOptions(),
    sizes: ALL_SIZES,
    prices: priceMatrix(),
  };
}

function getCollections() {
  return COLLECTIONS.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    count: c.items.length,
    items: c.items.map((it) => expandItem(c.id, it)),
  }));
}

function getCollection(id) {
  const c = COLLECTIONS.find((x) => x.id === String(id).toLowerCase());
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    count: c.items.length,
    items: c.items.map((it) => expandItem(c.id, it)),
  };
}

function getProduct(id) {
  for (const c of COLLECTIONS) {
    const it = c.items.find((x) => x.id === String(id).toLowerCase());
    if (it) return expandItem(c.id, it);
  }
  return null;
}

module.exports = {
  getCollections, getCollection, getProduct,
  PRICING, MATERIALS, materialOptions, availableMaterialIds,
};
