# Artwork Generation Brief — PrintVibe Wall Art

> Handoff for an **interactive** Claude Code session (Adobe Firefly needs a
> per-action approval click that automated/background sessions can't show).
> Open Claude Code on desktop or CLI, on branch
> `claude/capcut-anime-animal-warrior-ixomkm`, and follow this brief.

## Context (already done, committed & pushed)

- `catalog.js` defines **3 collections × 6 pieces = 18 items**, each with a
  placeholder `imageUrl` (`https://picsum.photos/seed/<id>/900/1200`).
- Endpoints in `server.js`:
  - `GET /api/products` — all collections
  - `GET /api/products/:collection` — one collection (`anime` | `animals` | `warriors`)
  - `GET /api/product/:id` — one piece (e.g. `anime-01`)

## Task

Generate real artwork for all 18 pieces with **Adobe Firefly** and replace the
placeholder `imageUrl` values in `catalog.js` with the real hosted image URLs,
then commit and push to the branch.

## Requirements

- **Portrait** orientation, **print quality** — aim for the highest resolution
  Firefly offers; these get printed up to **24×36″** (~7200×10800 px @ 300 DPI).
- **Commercial-use / print-on-demand** — Firefly is commercially safe, which is
  why it's the chosen tool for resale.
- **Clean art only** — no text, watermarks, or borders.
- **Host via Printful** (see below), then put the Printful-hosted URL in
  `catalog.js` as the item's `imageUrl`.
- Keep the item **ids and titles exactly as they are** — only swap `imageUrl`.

## Hosting = Printful file library (preferred)

Firefly produces the image, but Printful needs a **stable public** link, and we
want everything living in Printful so it's one system. So don't use a separate
host — upload each generated image into the Printful file library and reuse the
URL Printful gives back.

Flow per image (uses the same `PRINTFUL_TOKEN` this backend already uses):

1. Generate the image with Firefly → you get a (possibly temporary) source URL.
2. `POST https://api.printful.com/files` with `{ "url": "<firefly source url>" }`
   and the `Authorization: Bearer $PRINTFUL_TOKEN` header. Printful downloads and
   stores its own permanent copy.
3. From the response `result`, capture the file **`id`** and **`preview_url`**.
4. In `catalog.js`, set the item's `imageUrl` to that `preview_url`. (Optionally
   also record the Printful file `id` — orders can reference `{ id }` directly
   instead of a URL, which is more robust than passing a URL each time.)

Confirm the exact Files API fields against current Printful docs before wiring;
the important point is: **Printful hosts the final art, and we store its URL.**

## The 18 pieces

### Anime Characters
| id | title | prompt |
|----|-------|--------|
| `anime-01` | Neon Ronin | masked cyberpunk ronin with neon-lit katana, magenta/cyan rim light, dynamic pose, high-detail manga style |
| `anime-02` | Sakura Spirit | ethereal anime maiden among falling cherry blossoms, soft pastel palette, fantasy glow |
| `anime-03` | Shadow Blade | dark anime assassin mid-strike, moody blue/black palette, motion energy, dramatic shadows |
| `anime-04` | Celestial Mage | anime sorcerer channeling cosmic magic, swirling galaxies and glowing runes, deep purples and gold |
| `anime-05` | Rogue Pilot | anime mecha pilot beside a giant robot, sci-fi cockpit glow, cinematic sunset backdrop |
| `anime-06` | Kitsune Guardian | nine-tailed fox spirit in humanoid form, autumn shrine setting, orange/red mythological palette |

### Animals
| id | title | prompt |
|----|-------|--------|
| `animal-01` | Mountain Lion | powerful cougar staring forward, intense golden eyes, painterly wildlife realism, earthy tones |
| `animal-02` | Arctic Wolf | white wolf in falling snow, piercing pale-blue eyes, cold high-contrast palette |
| `animal-03` | Golden Eagle | majestic eagle wings spread mid-flight, dramatic sky, sharp detail |
| `animal-04` | Savanna Elephant | lone elephant at golden-hour on the savanna, warm dusty light, gentle-giant mood |
| `animal-05` | Koi Pond | vivid orange and white koi swimming among lily pads, top-down zen composition, water ripples |
| `animal-06` | Red Fox | alert red fox in a misty forest, rich autumn palette, soft depth of field |

### Army Warriors
| id | title | prompt |
|----|-------|--------|
| `warrior-01` | Spartan Vanguard | armored hoplite with crested helmet, spear and round shield, bronze/crimson, cinematic |
| `warrior-02` | Samurai Standoff | lone samurai in the rain, drawn katana, storm-grey palette, honor-and-tension mood |
| `warrior-03` | Desert Recon | modern special-forces soldier in desert tactical gear, sandy sunlit haze, gritty realism |
| `warrior-04` | Viking Raider | fierce Norse warrior with axe and shield, snowy fjord backdrop, cold steel and fur |
| `warrior-05` | Knight Templar | medieval knight in plate armor with sword and cross shield, castle backdrop, heroic light |
| `warrior-06` | Night Operator | tactical night-ops soldier with NVGs, green low-light glow, stealth atmosphere |

## Materials each piece is sold in

Eight materials are defined in `catalog.js` (`MATERIALS`). Four are **LIVE**
(real Printful variant IDs mapped in `server.js`); four are **COMING SOON**
(`available: false`, variant IDs are `null` placeholders — surfaced to the
storefront but the order/shipping routes reject them until wired).

| Material | Printful product | Status | Notes |
|----------|------------------|--------|-------|
| `poster`        | Enhanced Matte Paper Poster (1)        | LIVE | budget, matte paper |
| `canvas`        | Canvas print (3)                       | LIVE | gallery-wrapped |
| `metal`         | Metal / aluminum print (588)           | LIVE | vivid "sheet metal" |
| `framed`        | Matte Framed Poster, Black (2)         | LIVE | black frame |
| `poster_luster` | Premium Luster Photo Poster (171)      | SOON | premium photo paper |
| `acrylic`       | Acrylic Print (confirm id)             | SOON | glossy acrylic |
| `framed_white`  | Framed Poster, White (2, white variant)| SOON | white frame |
| `framed_wood`   | Framed Poster, Natural Wood (2, wood)  | SOON | wood frame |

Sizes per material: 4x6, 5x7, 8x10, 11x14, 16x20, 24x36 (see `PRICING` in
`catalog.js`). One print-res source image per piece covers every material and
size — no need to generate per-material.

### Second task: activate the 4 "coming soon" materials

This needs the **Printful API** (blocked from the automated session, available
here). For each SOON material:

1. Find the product and its variants: `GET https://api.printful.com/products/:id`
   with `Authorization: Bearer $PRINTFUL_TOKEN` (e.g. 171 for luster; for
   `framed_white`/`framed_wood` use product 2 and pick the white/natural frame
   variants; confirm the acrylic product id from `GET /products`).
2. Fill the real per-size variant IDs into `VARIANT_MAP[<material>]` in
   `server.js` (replace the `null`s), and set `PRODUCT_ID_MAP[acrylic]`.
3. Flip that material to `available: true` in `catalog.js` `MATERIALS`.
4. Verify: `curl /api/materials` shows it LIVE, and
   `curl "/api/shipping?...&materialId=<material>&sizeDim=16x20"` no longer 400s
   with "not available yet".

## When done

1. Replace all 18 `imageUrl` values in `catalog.js` with the Printful-hosted URLs.
2. Run the server locally (`npm start`) and `curl` the endpoints to confirm they
   return the new URLs.
3. Commit and push to `claude/capcut-anime-animal-warrior-ixomkm`.
