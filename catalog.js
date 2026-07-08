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
      { id: 'anime-01', title: 'Neon Ronin', tags: ['anime', 'cyberpunk', 'portrait'],
        tagline: 'A masterless blade in a city that never sleeps.',
        story: 'Under a rain of neon, the Neon Ronin walks alone — no lord, no leash, just a code sharper than his katana. He answers to no one, and that\'s exactly why the streets whisper his name. Hang him where you make your own rules.' },
      { id: 'anime-02', title: 'Sakura Spirit', tags: ['anime', 'fantasy', 'pastel'],
        tagline: 'Beauty that blooms brightest before it falls.',
        story: 'She drifts through a storm of cherry blossoms, calm as still water and twice as deep. The Sakura Spirit is a reminder that the softest things carry the fiercest hearts — a breath of peace for any room that needs it.' },
      { id: 'anime-03', title: 'Shadow Blade', tags: ['anime', 'action', 'dark'],
        tagline: 'You never see the strike that ends it.',
        story: 'One heartbeat she\'s a shadow on the wall; the next, it\'s already over. Shadow Blade moves in the space between seconds — pure focus, zero mercy. For the wall of anyone who lets their work do the talking.' },
      { id: 'anime-04', title: 'Celestial Mage', tags: ['anime', 'magic', 'cosmic'],
        tagline: 'She doesn\'t cast spells. She rewrites the stars.',
        story: 'Galaxies spin at her fingertips and ancient runes burn gold around her. The Celestial Mage bends the cosmos to her will — a piece for the dreamers, the makers, and anyone who believes the universe is theirs to shape.' },
      { id: 'anime-05', title: 'Rogue Pilot', tags: ['anime', 'mecha', 'sci-fi'],
        tagline: 'Grounded by no one. Built for the sky.',
        story: 'The sun sets behind a titan of steel, and the Rogue Pilot leans against it like an old friend. He broke the rules, kept the machine, and flies where he pleases now. Pure freedom, forged in metal.' },
      { id: 'anime-06', title: 'Kitsune Guardian', tags: ['anime', 'mythology', 'fox'],
        tagline: 'Nine tails. A thousand years. One promise kept.',
        story: 'Half spirit, half legend, the Kitsune Guardian has watched over the old shrine since before your grandfather\'s grandfather. Cunning, loyal, and impossible to fool — a mythic protector for the space you hold sacred.' },
    ],
  },
  {
    id: 'animals',
    title: 'Animals',
    subtitle: 'Striking wildlife & animal wall art',
    items: [
      { id: 'animal-01', title: 'Mountain Lion', tags: ['animals', 'wildlife', 'big-cat'],
        tagline: 'Silent, patient, and utterly in charge.',
        story: 'Those golden eyes have already decided everything. The Mountain Lion rules the high country without ever raising its voice — power that doesn\'t need to prove itself. For anyone who leads quietly and never blinks first.' },
      { id: 'animal-02', title: 'Arctic Wolf', tags: ['animals', 'wildlife', 'wolf'],
        tagline: 'Built for the cold. Loyal to the core.',
        story: 'Snow falls, the pack moves as one, and the Arctic Wolf meets your gaze with pale, unshakable eyes. It survives where nothing else can — a symbol of family, grit, and the strength found in the ones who stand beside you.' },
      { id: 'animal-03', title: 'Golden Eagle', tags: ['animals', 'birds', 'majestic'],
        tagline: 'The higher the view, the clearer the path.',
        story: 'Wings wide against an open sky, the Golden Eagle sees what the rest of us miss. It\'s freedom, ambition, and vision — a daily reminder to rise above the noise and keep your eyes on the horizon.' },
      { id: 'animal-04', title: 'Savanna Elephant', tags: ['animals', 'safari', 'gentle-giant'],
        tagline: 'The gentlest giant remembers everything.',
        story: 'Bathed in golden-hour light, the Savanna Elephant moves with the calm of something that has seen it all. Wisdom, family, and quiet strength walk with her. A warm, grounding presence for any home.' },
      { id: 'animal-05', title: 'Koi Pond', tags: ['animals', 'fish', 'zen'],
        tagline: 'Swim upstream. Good fortune follows.',
        story: 'Ribbons of orange and white glide beneath the lily pads in endless, peaceful motion. In legend, the koi that fights the current becomes a dragon — bring home a little luck, calm, and the promise that persistence pays.' },
      { id: 'animal-06', title: 'Red Fox', tags: ['animals', 'forest', 'fox'],
        tagline: 'Clever wins where strength can\'t.',
        story: 'Alert in the morning mist, the Red Fox reads the whole forest in a glance. Sharp, resourceful, and always one step ahead — a warm-toned nod to the ones who outsmart the room instead of overpowering it.' },
    ],
  },
  {
    id: 'warriors',
    title: 'Army Warriors',
    subtitle: 'Battle-ready warriors, soldiers & military art',
    items: [
      { id: 'warrior-01', title: 'Spartan Vanguard', tags: ['warriors', 'ancient', 'spartan'],
        tagline: 'Hold the line. Give no ground.',
        story: 'Shield locked, spear steady, the Spartan Vanguard stands where lesser men break. Bronze and crimson, discipline and defiance — this is the wall art for anyone who refuses to back down when it matters most.' },
      { id: 'warrior-02', title: 'Samurai Standoff', tags: ['warriors', 'samurai', 'honor'],
        tagline: 'One breath. One blade. No regrets.',
        story: 'Rain hammers the earth as the samurai draws steel, calm in the eye of the storm. Honor over fear, mastery over chaos — a striking tribute to discipline, patience, and the courage to face the moment head-on.' },
      { id: 'warrior-03', title: 'Desert Recon', tags: ['warriors', 'modern', 'military'],
        tagline: 'First in, last seen, mission first.',
        story: 'Sun-scorched and steady, the Desert Recon operator moves through the haze with total control. Grit, brotherhood, and quiet resolve — a bold salute to the ones who go where it\'s hardest and get the job done.' },
      { id: 'warrior-04', title: 'Viking Raider', tags: ['warriors', 'norse', 'axe'],
        tagline: 'Fear the sea. Fear the storm. Fear him.',
        story: 'Axe in hand and frost in his beard, the Viking Raider carves his legend across the northern fjords. Fearless, relentless, and forged by the cold — for the wall of anyone who takes what they want from life.' },
      { id: 'warrior-05', title: 'Knight Templar', tags: ['warriors', 'medieval', 'knight'],
        tagline: 'Faith is the armor. Steel is the proof.',
        story: 'Clad in plate with sword raised beneath castle walls, the Knight Templar fights for something bigger than himself. Loyalty, conviction, and unbreakable resolve — a heroic centerpiece for a room with a code.' },
      { id: 'warrior-06', title: 'Night Operator', tags: ['warriors', 'special-forces', 'tactical'],
        tagline: 'The dark is his home field.',
        story: 'Under a green glow of night vision, the Night Operator owns the shadows — silent, precise, already three moves ahead. Pure modern-warrior cool for anyone who does their best work when no one\'s watching.' },
    ],
  },
];

// Expand each item into a full product record.
function expandItem(collectionId, item) {
  return {
    id: item.id,
    collection: collectionId,
    title: item.title,
    tagline: item.tagline,
    story: item.story,
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
