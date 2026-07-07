// ── PRODUCT CATALOG ──────────────────────────────────────────────
// Wall-art collections surfaced to the storefront. Each item points at
// artwork (imageUrl) and declares which print materials/sizes it's sold in.
// Prices are suggested retail (USD); Printful cost is handled at order time.
//
// NOTE: imageUrl values are placeholders. Swap them for real artwork URLs
// (or a CDN/Printful file URL) as the designs are produced.

// Suggested retail price (USD) by material + size. Storefront can override.
const PRICING = {
  poster: { '4x6':  9, '5x7': 11, '8x10': 16, '11x14': 24, '16x20': 34, '24x36': 59 },
  canvas: { '4x6': 19, '5x7': 22, '8x10': 32, '11x14': 49, '16x20': 69, '24x36': 119 },
  metal:  { '4x6': 24, '5x7': 27, '8x10': 39, '11x14': 59, '16x20': 84, '24x36': 149 },
  framed: { '4x6': 29, '5x7': 32, '8x10': 44, '11x14': 64, '16x20': 89, '24x36': 154 },
};

const ALL_MATERIALS = ['poster', 'canvas', 'metal', 'framed'];
const ALL_SIZES = ['4x6', '5x7', '8x10', '11x14', '16x20', '24x36'];

// Helper: build a size→price map for a material.
function priceMatrix(materials = ALL_MATERIALS) {
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
    materials: ALL_MATERIALS,
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

module.exports = { getCollections, getCollection, getProduct, PRICING };
