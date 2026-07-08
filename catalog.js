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
        tagline: 'Too cool for a boss, too broody for small talk.',
        story: 'The Neon Ronin answers to no lord, no landlord, and definitely no group chat. He stalks the rain-soaked streets looking mysterious and criminally underdressed for the weather. Hang him up and instantly become 40% more mysterious — results may vary.' },
      { id: 'anime-02', title: 'Sakura Spirit', tags: ['anime', 'fantasy', 'pastel'],
        tagline: 'Serene on the outside, absolute menace on the inside.',
        story: 'She floats through a blizzard of cherry blossoms radiating pure zen — the kind of calm you only get from ignoring all your notifications. The Sakura Spirit brings peace, beauty, and a subtle hint that she could ruin your whole day if provoked. Perfect for the room where you pretend to meditate.' },
      { id: 'anime-03', title: 'Shadow Blade', tags: ['anime', 'action', 'dark'],
        tagline: 'Blinked? You missed the whole fight.',
        story: 'Shadow Blade is so fast she\'s already three rooms away by the time you finish reading this. No dramatic speeches, no warning, just vibes and consequences. For anyone whose personality is "quietly terrifying and always early."' },
      { id: 'anime-04', title: 'Celestial Mage', tags: ['anime', 'magic', 'cosmic'],
        tagline: 'Rewrites the stars. Still can\'t find her keys.',
        story: 'She commands entire galaxies with a flick of the wrist — cosmic power, ancient runes, the whole overachiever starter pack. The Celestial Mage is proof you can bend the universe to your will and still be a chaotic genius. For dreamers who aim way, way too high (respectfully).' },
      { id: 'anime-05', title: 'Rogue Pilot', tags: ['anime', 'mecha', 'sci-fi'],
        tagline: 'Commitment issues, but make it heroic.',
        story: 'He ditched the rules, kept the giant robot, and now leans on it at sunset like it\'s a lifestyle brand. The Rogue Pilot is what happens when "I do my own thing" gets a five-story mech and excellent lighting. Freedom never looked this dramatically unemployed.' },
      { id: 'anime-06', title: 'Kitsune Guardian', tags: ['anime', 'mythology', 'fox'],
        tagline: 'Nine tails, zero patience for your nonsense.',
        story: 'This nine-tailed fox spirit has guarded the shrine for a thousand years and has seen every excuse you\'re about to make. Wise, loyal, and quietly judging your life choices, the Kitsune Guardian protects your space and your vibe. Cheaper than a security system and twice as judgmental.' },
    ],
  },
  {
    id: 'animals',
    title: 'Animals',
    subtitle: 'Striking wildlife & animal wall art',
    items: [
      { id: 'animal-01', title: 'Mountain Lion', tags: ['animals', 'wildlife', 'big-cat'],
        tagline: 'The boss who never says a word in meetings.',
        story: 'Those golden eyes already decided your fate three sentences ago. The Mountain Lion runs the entire mountain and has never once raised its voice — just a slow blink that means "we\'re done here." For anyone who leads quietly and refuses to blink first, especially in staring contests.' },
      { id: 'animal-02', title: 'Arctic Wolf', tags: ['animals', 'wildlife', 'wolf'],
        tagline: 'Doesn\'t feel the cold. Doesn\'t care about yours.',
        story: 'While you\'re complaining about the AC, the Arctic Wolf is thriving in a full-on blizzard, pale eyes locked on and totally unbothered. Fiercely loyal to the pack, mildly unimpressed by everyone else. A frosty reminder that your crew is everything — and that you should really grab a jacket.' },
      { id: 'animal-03', title: 'Golden Eagle', tags: ['animals', 'birds', 'majestic'],
        tagline: 'Literally looks down on everybody. Earned it.',
        story: 'The Golden Eagle soars miles above the drama with wings spread and zero interest in your opinions. Freedom, ambition, incredible eyesight, and the confidence of something with no natural predators. Hang it up as a daily reminder to rise above the nonsense — from a very great height.' },
      { id: 'animal-04', title: 'Savanna Elephant', tags: ['animals', 'safari', 'gentle-giant'],
        tagline: 'Never forgets. Especially that thing you said.',
        story: 'Calm, wise, and gigantic, the Savanna Elephant has seen it all and remembers every bit of it — including your birthday and that awkward thing from 2019. A warm, grounding gentle giant for your wall, and honestly better at remembering stuff than you are.' },
      { id: 'animal-05', title: 'Koi Pond', tags: ['animals', 'fish', 'zen'],
        tagline: 'Swimming in circles, but make it good luck.',
        story: 'Orange and white koi glide beneath the lily pads in serene, hypnotic loops, radiating good fortune and mild superiority. Legend says a determined koi becomes a dragon — these ones are mostly focused on snacks, but they\'ll bring calm and luck to your space all the same.' },
      { id: 'animal-06', title: 'Red Fox', tags: ['animals', 'forest', 'fox'],
        tagline: 'Definitely up to something. Respect it.',
        story: 'The Red Fox has read the entire forest, filed it away, and is already three steps ahead of a plan you don\'t know about yet. Clever, sly, and suspiciously charming — for the person who wins with brains instead of brawn and calls it "strategy."' },
    ],
  },
  {
    id: 'warriors',
    title: 'Army Warriors',
    subtitle: 'Battle-ready warriors, soldiers & military art',
    items: [
      { id: 'warrior-01', title: 'Spartan Vanguard', tags: ['warriors', 'ancient', 'spartan'],
        tagline: 'Never skips leg day. Or the front line.',
        story: 'Shield up, spear ready, abs visible from space — the Spartan Vanguard holds the line while everyone else holds excuses. Bronze, crimson, and pure "come back with your shield or on it" energy. For anyone whose comeback story starts with "so I refused to give up."' },
      { id: 'warrior-02', title: 'Samurai Standoff', tags: ['warriors', 'samurai', 'honor'],
        tagline: 'Absolute legend. Terrible at checking the forecast.',
        story: 'The samurai draws steel in a torrential downpour, perfectly calm and perfectly soaked, because honor waits for no umbrella. All discipline, all drama, zero regrets. A striking tribute to focus, mastery, and standing your ground even when it\'s clearly raining.' },
      { id: 'warrior-03', title: 'Desert Recon', tags: ['warriors', 'modern', 'military'],
        tagline: 'Elite operator. Will be finding sand for weeks.',
        story: 'Cool, focused, and coated in about nine pounds of desert, the Recon operator moves through the haze like the mission is already won. Grit, brotherhood, and total control — a bold salute to the ones who go where it\'s hardest and somehow make it look easy.' },
      { id: 'warrior-04', title: 'Viking Raider', tags: ['warriors', 'norse', 'axe'],
        tagline: 'Aggressively redecorating your coastline since 793 AD.',
        story: 'Axe in hand, frost in the beard, and absolutely no chill, the Viking Raider treats every shoreline like a clearance sale. Fearless, relentless, and forged by the cold — for the wall of anyone who goes after what they want and calls it "networking."' },
      { id: 'warrior-05', title: 'Knight Templar', tags: ['warriors', 'medieval', 'knight'],
        tagline: 'Wears 60 pounds of armor. Still stands taller.',
        story: 'Sword raised beneath the castle walls, the Knight Templar fights for something bigger than himself — and yes, that full plate is as hot and heavy as it looks. Loyalty, conviction, and dramatic lighting for days. A heroic centerpiece for a room that clearly has a code.' },
      { id: 'warrior-06', title: 'Night Operator', tags: ['warriors', 'special-forces', 'tactical'],
        tagline: 'Owns the night. Definitely not a morning person.',
        story: 'Bathed in the green glow of night vision, the Night Operator is silent, precise, and already three moves ahead while everyone else is asleep. Pure modern-warrior cool for anyone who does their best work in the dark — literally or figuratively.' },
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
