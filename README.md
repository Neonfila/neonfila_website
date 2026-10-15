# NeonFila Corporate Site

Official landing page for [neonfila.com](https://neonfila.com) — React + Vite, plain CSS, zero UI libraries. `npm run build` emits a static `dist/` deployable on any static host (hash routing, relative base — no server rewrites needed).

```sh
cd web
npm install
npm run dev      # local dev
npm run build    # → dist/ (deploy this)
npm run preview  # serve dist/ locally
```

## Design

Follows `../docs/DESIGN_LANGUAGE.md` (corporate-site read): serif display + mono labels, hairline sections, Solar Orange as the single accent. The apps pipeline on the home page is data-driven (`src/pages/Home.jsx` → `APPS`) — add apps there, nowhere else.

## Structure

- `src/App.jsx` — router (`/`, `/privacy`, `/terms`); `ScrollLink` handles in-page jumps (plain `#anchors` would fight the hash router)
- `src/pages/Home.jsx` — hero, studio, apps, contact + the one intentional transition (rise-on-scroll, reduced-motion safe)
- `src/pages/Legal.jsx` (+ Privacy/Terms wrappers) — legal shells
- `src/components/` — Header, Footer, ScrollLink
- `src/styles.css` — the whole visual system (contrast-checked pairs documented in DESIGN_LANGUAGE.md)
- `public/assets/` — logo + favicon files (copied from `../assets/brand/`; keep in sync)

## Required before launch

Complete the Privacy Policy and Terms of Service pages, and finalize the apps table entries — Apple uses this site to verify company legitimacy (see `../docs/ADEDOYIN_ROADMAP.md`).
