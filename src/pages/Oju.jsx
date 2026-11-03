import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import OjuDemo from '../demos/OjuDemo.tsx'

// Oju's own page: trust-first, calm. Copy and status from the Oju app session's
// website brief (oju repo, docs/website-motion-brief.md). Orange only on SOS.
const FEATURES = [
  { term: 'Your family, together', detail: 'See where everyone is right now, on one calm map.', dot: 'teal' },
  { term: 'Private by design', detail: 'Only people you approve can see you. Pause anytime.', dot: null },
  { term: 'Help in one tap', detail: 'Arrivals, check-ins and SOS reach every phone at once.', dot: 'orange' },
]

export default function Oju() {
  useEffect(() => { document.title = 'Oju — NeonFila' }, [])
  return (
    <main id="main" className="app-site app-site--oju">
      <div className="app-top">
        <section className="app-hero" aria-labelledby="oju-title">
          <img src={`${import.meta.env.BASE_URL}assets/oju-mark.svg`} alt="Oju mark — a watchful O with a teal pupil" className="app-mark" width="64" height="64" />
          <p className="app-kicker">Oju · Yoruba for “eye”</p>
          <h1 id="oju-title">Your family,<br />in sight.</h1>
          <p className="app-lede">
            A family-safety app for Nigeria and the diaspora: see where your family
            is, get told when they arrive or leave, and send SOS. Private, no ads,
            never sold.
          </p>
          <div className="app-cta">
            <p className="app-status status" data-status="dev">Android pilot · iPhone coming</p>
            <a className="pilot-btn" href="mailto:hello@neonfila.com?subject=Join%20the%20Oju%20pilot">Join the pilot</a>
          </div>
        </section>
        <div className="app-demo" aria-hidden="true">
          <OjuDemo />
        </div>
      </div>

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
          Families are using Oju on Android now. Want in? <a className="mail" href="mailto:hello@neonfila.com?subject=Join%20the%20Oju%20pilot">hello@neonfila.com</a>
        </p>
      </section>

      <p className="back-home">
        <Link to="/">← Back to the studio</Link>
      </p>
    </main>
  )
}
