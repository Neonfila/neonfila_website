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

Follows `../docs/DESIGN_LANGUAGE.md` (corporate-site read): Clash Display + mono labels, hairline sections, Solar Orange as the single accent. The hero's showpiece is the neon mark igniting (`src/components/NeonMark.jsx`, same geometry as `../assets/brand/neonfila-mark.svg`). The apps pipeline on the home page is data-driven (`src/pages/Home.jsx` → `APPS`) — add apps there, nowhere else.

## Structure

- `src/App.jsx` — router (`/`, `/privacy`, `/terms`); `ScrollLink` handles in-page jumps (plain `#anchors` would fight the hash router)
- `src/pages/Home.jsx` — hero, studio, apps, contact + the one intentional transition (rise-on-scroll, reduced-motion safe)
- `src/pages/Legal.jsx` (+ Privacy/Terms wrappers) — legal shells
- `src/components/` — Header, Footer, ScrollLink
- `src/styles.css` — the whole visual system (contrast-checked pairs documented in DESIGN_LANGUAGE.md)
- `public/assets/` — logo + favicon files (copied from `../assets/brand/`; keep in sync)

## Required before launch

Complete the Privacy Policy and Terms of Service pages, and finalize the apps table entries — Apple uses this site to verify company legitimacy (see `../docs/ADEDOYIN_ROADMAP.md`).

## Deployment (live at GitHub Pages)

- Live URL: https://neonfila.com (custom domain, `public/CNAME`); also https://neonfila.github.io/neonfila_website/
- DNS: Cloudflare (registrar + nameservers). Apex A records → GitHub Pages IPs 185.199.108–111.153, `www` CNAME → `neonfila.github.io`, all **DNS only** (grey cloud) so GitHub can issue the HTTPS cert.
- Pipeline: `.github/workflows/deploy.yml` — pushes to `main` build and publish `dist/` automatically.

### NOTE: repo was made PUBLIC to enable Pages (2026-10-15)

GitHub Pages is not available on our plan for **private** repos, so `neonfila_website`
was switched to public (`gh repo edit Neonfila/neonfila_website --visibility public`).

If we flip it back to **private**, the live site will stop updating / go dark on GitHub Pages.
Options when we continue:

1. Keep it public (recommended for a corporate site — no secrets inside), or
2. Upgrade the GitHub plan so private repos get Pages, or
3. Keep repo private + host `dist/` elsewhere (Vercel/Netlify free tier, or the
   studio's own hosting) — the build is portable (`npm run build`), zero code change.


