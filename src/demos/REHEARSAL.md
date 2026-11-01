# Rehearsal: app-page demos (Stageshow)

Kit: `src/stageshow/kit` (copied from the Stageshow skill, MIT, see `src/stageshow/LICENSE`).

## OjuDemo (`/oju`)
- Gold copied: `phone-touch` (400 × 520 stage, phone pinned one gutter from the top, off the bottom; compact 358 wide).
- Changed: dark Oju screen (pitch map, Home/School fences, Family sheet of `Row`s), no cursor. Story: Tobi's live pin walks Home → School, fence lights, row rolls to "At School", dark iOS banner. The second scene is the walk home, so the loop ends where it began and no data rewinds.
- Poster: Tobi at School with the banner showing.
- Gate: `film.mjs --gate` passed. The remaining manual line is the route fading in on the map, which is intended.

## MapaDemo (`/mapa`)
- Gold copied: `phone-touch` framing; tracing drives `a.drag` along the Mapa mark's own m geometry, so the ink stays under the finger.
- Changed: cream playful screen, sticker board, word tiles (m a p a), Listen chip that lights to "mmm", and Again as the visible cause of the reset.
- Poster: the finished m, with the chip lit and Again showing.
- Gate: `film.mjs --gate` passed.

## Not checked
- The dark theme and other looks (the site has a single dark page; the demos are designed for it).
- The fresh-eye review in `references/review.md` was done by the author only, not by a second reviewer.
- Safari: Oju's walk uses CSS `offset-path`, which needs Safari 16+.
