import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// Mapa's own page: playful but strict. Giant display type, one orange accent
// (the start dot — the trace accent), audio-forward, honest concept status.
const FEATURES = [
  { term: 'Letter tracing', detail: 'One finger, one stroke — an orange dot shows where to begin.', dot: 'orange' },
  { term: 'Sounds & letters', detail: 'Audio-forward: tap, hear, repeat. Every letter speaks.', dot: null },
  { term: 'Numbers & names', detail: 'Count, sort, and recognize the world’s written shapes.', dot: null },
  { term: 'Offline forever', detail: 'No internet, no ads, no accounts. We collect nothing.', dot: null },
]

export default function Mapa() {
  useEffect(() => { document.title = 'Mapa — NeonFila' }, [])
  return (
    <main id="main" className="app-site app-site--mapa">
      <section className="app-hero" aria-labelledby="mapa-title">
        <img src={`${import.meta.env.BASE_URL}assets/mapa-mark.svg`} alt="Mapa mark — a traced lowercase m with an orange start dot" className="app-mark" width="64" height="64" />
        <p className="app-kicker">Mapa · Learn &amp; play · Ages 3–7</p>
        <h1 id="mapa-title">First letters, traced by <span className="mapa-hl">small fingers</span>.</h1>
        <p className="app-lede">
          Mapa turns the first letter into the first game: trace a big chalk “m”,
          hear every sound, meet every number — fully offline, made for small
          hands and short attention spans.
        </p>
        <p className="app-status status" data-status="idea">Concept</p>
      </section>

      <section className="app-features" aria-label="What Mapa does">
        <dl className="operating">
          {FEATURES.map(f => (
            <div key={f.term}>
              <dt>
                {f.dot && <span className={`dot dot--${f.dot}`} aria-hidden="true" />}
                {f.term}
              </dt>
              <dd>{f.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="app-note">
          Early feedback welcome: <a className="mail" href="mailto:hello@neonfila.com">hello@neonfila.com</a>
        </p>
      </section>

      <p className="back-home">
        <Link to="/">← Back to the studio</Link>
      </p>
    </main>
  )
}
