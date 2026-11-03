# Rehearsal: app-page demos (Stageshow)

Kit: `src/stageshow/kit` (copied from the Stageshow skill, MIT, see `src/stageshow/LICENSE`).

## OjuDemo (`/oju`)
- Brief: the Oju app session's `docs/website-motion-brief.md` (oju repo, 2026-11-03).
- Gold copied: `phone-touch` (phone pinned one gutter from the top, off the bottom; compact 358 wide). Stage is 400 × 426, so with the sheet lowered the crop falls in the padding under Mariam's row.
- Look: the real app's warm off-white, teal #2D99B6, orange #FA7319 on SOS only, green on Online only, Outfit for headings and Readex Pro for the rest.
- Story (~12s, longer than the brief's ~8s, because the skill's hero loops run 10–16s and five beats need reading time): a calm Lagos map with three drifting pins; a finger lifts "Where everyone is"; "Tolu arrived at School" drops in and his row crossfades; the SOS card pulses once, Mum's row gets the SOS badge, and "SOS from Mum" drops in; the finger lowers the sheet. Tolu's and Mum's rows reset only once they are below the crop.
- Poster: the sheet up with "Tolu arrived at School" showing (calm rather than alarming).
- Gate: `film.mjs --gate` passed. The remaining line is the greeting re-measuring once when the Outfit web font loads.

## MapaDemo (`/mapa`)
- Gold copied: `phone-touch` framing; tracing drives `a.drag` along the Mapa mark's own m geometry, so the ink stays under the finger.
- Changed: cream playful screen, sticker board, word tiles (m a p a), Listen chip that lights to "mmm", and Again as the visible cause of the reset.
- Poster: the finished m, with the chip lit and Again showing.
- Gate: `film.mjs --gate` passed.

## Not checked
- The dark theme and other looks (the site has a single dark page; the demos are designed for it).
- The fresh-eye review in `references/review.md` was done by the author only, not by a second reviewer.
- Safari: Oju's walk uses CSS `offset-path`, which needs Safari 16+.
