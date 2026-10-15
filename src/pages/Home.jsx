import { useEffect, useRef } from 'react'
import ScrollLink from '../components/ScrollLink.jsx'

// apps pipeline: one data-driven table — add apps here, nowhere else
const APPS = [
  { name: 'Oju', desc: 'Family location & safety for African circles', status: 'dev', statusLabel: 'In development' },
  { name: 'Kids Learn & Play', desc: 'Offline learning games, ages 3–7', status: 'idea', statusLabel: 'Concept' },
  { name: 'Pregnancy Companion', desc: 'Week-by-week, calm and local', status: 'draft', statusLabel: 'Content drafting' },
]

const INDEX = [
  { id: 'studio', label: 'The studio' },
  { id: 'apps', label: 'Apps in the pipeline' },
  { id: 'contact', label: 'Contact' },
]

const OPERATING = [
  { term: 'Build', detail: 'Lightweight, cross-platform, functional.' },
  { term: 'Launch', detail: 'App Store and Google Play, immediately.' },
  { term: 'Decide', detail: 'Traction scales it. Silence kills it.' },
]

// one intentional transition: sections rise in once, calm, reduced-motion safe
function useRise() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const sections = root.querySelectorAll('main > section')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return // stay static
    sections.forEach(s => s.classList.add('rise'))
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) }
      })
    }, { threshold: 0.15 })
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const rootRef = useRise()

  return (
    <div ref={rootRef}>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-left">
            <p className="kicker">Independent software studio</p>
            <h1 id="hero-title">
              We build{' '}
              <span className="strike">
                <span className="strike-word">apps</span>
                <span className="strike-line" aria-hidden="true" />
              </span>{' '}
              <span className="hlword">solutions</span>.
              <br />Fast.
            </h1>
            <p className="lede">
              NeonFila ships consumer applications — our own bets and client
              projects alike. Built quickly, launched honestly, kept only if
              they earn their keep.
            </p>
            <p className="creed">Build fast. Test market fit. Scale or kill.</p>
          </div>
          <aside className="hero-index" aria-label="Contents">
            <ol>
              {INDEX.map(i => (
                <li key={i.id}><ScrollLink to={i.id}>{i.label}</ScrollLink></li>
              ))}
            </ol>
          </aside>
        </section>

        {/* creed tape — slow, editorial, paused for reduced-motion */}
        <div className="tape" aria-hidden="true">
          <div className="tape-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="tape-run">
                BUILD FAST <i>✶</i> SHIP WEEKLY <i>✶</i> TEST MARKET FIT <i>✶</i> SCALE OR KILL <i>✶</i>{' '}
              </span>
            ))}
          </div>
          <p className="visually-hidden">Build fast. Ship weekly. Test market fit. Scale or kill.</p>
        </div>

        <section id="studio" className="split" aria-labelledby="studio-title">
          <div className="section-number" aria-hidden="true">01</div>
          <div>
            <h2 id="studio-title">The studio</h2>
            <p>
              A standalone sandbox entity: swift decisions, no committee,
              products shipped without group consensus. Every app is a bet
              placed in weeks, not quarters.
            </p>
            <dl className="operating">
              {OPERATING.map(o => (
                <div key={o.term}>
                  <dt>{o.term}</dt>
                  <dd>{o.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="apps" className="apps" aria-labelledby="apps-title">
          <div className="section-number" aria-hidden="true">02</div>
          <div>
            <h2 id="apps-title">Apps in the pipeline</h2>
            <ul className="app-list">
              {APPS.map(a => (
                <li key={a.name}>
                  <span className="app-name">{a.name}</span>
                  <span className="app-desc">{a.desc}</span>
                  <span className="status" data-status={a.status}>{a.statusLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="split" aria-labelledby="contact-title">
          <div className="section-number" aria-hidden="true">03</div>
          <div>
            <h2 id="contact-title">Contact</h2>
            <p>
              For partnerships, app support, or press:{' '}
              <a className="mail" href="mailto:hello@neonfila.com">hello@neonfila.com</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
