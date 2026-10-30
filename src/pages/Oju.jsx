import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// Oju's own page: trust-first, calm. Teal appears only as the Live signal
// (status row + live-location row), orange only on SOS — per brand/BRAND_SHEET.md.
const FEATURES = [
  { term: 'Guardian circles', detail: 'The people who watch over each other — invited by one link.', dot: null },
  { term: 'Live location', detail: 'Shared only inside your circle, marked by a pulse you can trust.', dot: 'teal' },
  { term: 'Safe places', detail: 'Home, school, grandma’s — know when the circle arrives and leaves.', dot: null },
  { term: 'SOS', detail: 'One press, everyone knows. Orange exists for exactly this moment.', dot: 'orange' },
]

export default function Oju() {
  useEffect(() => { document.title = 'Oju — NeonFila' }, [])
  return (
    <main id="main" className="app-site app-site--oju">
      <section className="app-hero" aria-labelledby="oju-title">
        <img src={`${import.meta.env.BASE_URL}assets/oju-mark.svg`} alt="Oju mark — a watchful O with a teal pupil" className="app-mark" width="64" height="64" />
        <p className="app-kicker">Oju · Yoruba for “eye”</p>
        <h1 id="oju-title">Your family,<br />in sight.</h1>
        <p className="app-lede">
          Oju keeps a guardian circle around the people you love: live location,
          safe places, and one SOS that reaches everyone at once. Built calm —
          trust, not panic.
        </p>
        <p className="app-status status" data-status="dev">In development</p>
      </section>

      <section className="app-features" aria-label="What Oju does">
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
          Questions before launch? <a className="mail" href="mailto:hello@neonfila.com">hello@neonfila.com</a>
        </p>
      </section>

      <p className="back-home">
        <Link to="/">← Back to the studio</Link>
      </p>
    </main>
  )
}
