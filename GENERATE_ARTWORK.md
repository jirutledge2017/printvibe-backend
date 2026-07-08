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
- After each generation, **host the image at a stable public URL** that Printful
  can fetch, and put that URL in `catalog.js` as the item's `imageUrl`.
- Keep the item **ids and titles exactly as they are** — only swap `imageUrl`.

## Hosting note

Firefly produces the image, but Printful needs a **stable public** link. Options:
push to Adobe/Creative Cloud assets, an S3/CDN bucket, or Shopify's CDN (the
Shopify connector is available in-session). Confirm the host before wiring URLs.

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

## When done

1. Replace all 18 `imageUrl` values in `catalog.js`.
2. Run the server locally (`npm start`) and `curl` the endpoints to confirm they
   return the new URLs.
3. Commit and push to `claude/capcut-anime-animal-warrior-ixomkm`.
