import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ScrollLink from '../components/ScrollLink.jsx'
import NeonMark from '../components/NeonMark.jsx'

// apps pipeline: one data-driven table — add apps here, nowhere else.
// href → the app has its own page; mark → its brand mark, rendered as the icon.
const APPS = [
  { name: 'Oju', desc: 'Family location & safety for African circles', status: 'dev', statusLabel: 'In development', href: '/oju', mark: 'oju-mark.svg' },
  { name: 'Mapa', desc: 'Kids Learn & Play — offline learning games, ages 3–7', status: 'idea', statusLabel: 'Concept', href: '/mapa', mark: 'mapa-mark.svg' },
  { name: 'Pregnancy Companion', desc: 'Week-by-week, calm and local', status: 'draft', statusLabel: 'Content drafting' },
]

const OPERATING = [
  { term: 'Build', detail: 'Lightweight, cross-platform, functional.' },
  { term: 'Launch', detail: 'App Store and Google Play, immediately.' },
  { term: 'Decide', detail: 'Traction scales it. Silence kills it.' },
]

// one intentional transition: sections rise in once, calm, reduced-motion safe.
// plus native cursor spotlights (hero glow + app-row light, pointer-fine only):
// CSS vars follow the pointer, tonal chalk light tracks it — the "expensive"
// dark-UI mechanic from the premium component libraries, house colors only.
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

    // cursor spotlights: hero (--hx/--hy, big wash) + app rows (--mx/--my, per-row)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const tracked = [
        [root.querySelector('.hero'), 'hx', 'hy'],
        [root.querySelector('.hero'), 'tilt'],
        [root.querySelector('.app-list'), 'mx', 'my'],
      ].filter(([el]) => el)
      const handlerFor = (el, xKey, yKey) => e => {
        const r = el.getBoundingClientRect()
        if (xKey === 'tilt') {
          // neon sign leans toward the pointer: -1..1 on each axis
          el.style.setProperty('--tx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
          el.style.setProperty('--ty', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
          return
        }
        el.style.setProperty(`--${xKey}`, `${e.clientX - r.left}px`)
        el.style.setProperty(`--${yKey}`, `${e.clientY - r.top}px`)
      }
      const cleanups = tracked.map(([el, xKey, yKey]) => {
        const handler = handlerFor(el, xKey, yKey)
        el.addEventListener('mousemove', handler)
        return () => el.removeEventListener('mousemove', handler)
      })
      return () => { io.disconnect(); cleanups.forEach(c => c()) }
    }
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
              <span className="w" style={{ '--i': 0 }}>We</span>{' '}
              <span className="w" style={{ '--i': 1 }}>build</span>{' '}
              <span className="w" style={{ '--i': 2 }}>
                <span className="strike">
                  <span className="strike-word">apps</span>
                  <span className="strike-line" aria-hidden="true" />
                </span>
              </span>{' '}
              <span className="w" style={{ '--i': 3 }}><span className="hlword">solutions</span>.</span>
              <br />
              <span className="w" style={{ '--i': 4 }}>Fast.</span>
            </h1>
            <p className="lede">
              NeonFila ships consumer applications — our own bets and client
              projects alike. Built quickly, launched honestly, kept only if
              they earn their keep.
            </p>
            <p className="creed">Build fast. Test market fit. Scale or kill.</p>
          </div>
          <div className="hero-stage" aria-hidden="true">
            <div className="stage-grid" />
            <div className="stage-sign">
              <NeonMark size={400} ignite />
            </div>
            <p className="stage-caption"><span className="building-dot" /> Lights on · shipping weekly</p>
          </div>
        </section>

        {/* creed tape — two counter-scrolling rows, edge-faded, paused for reduced-motion */}
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
            <ol className="pipeline">
              {OPERATING.map((o, i) => (
                <li key={o.term} style={{ '--i': i }}>
                  <span className="pipe-node" aria-hidden="true" />
                  <span className="pipe-num">0{i + 1}</span>
                  <span className="pipe-term">{o.term}</span>
                  <span className="pipe-detail">{o.detail}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="apps" className="apps" aria-labelledby="apps-title">
          <div className="section-number" aria-hidden="true">02</div>
          <div>
            <h2 id="apps-title">Apps in the pipeline</h2>
            <ul className="app-list">
              {APPS.map(a => (
                <li key={a.name}>
                  {a.href
                    ? <Link to={a.href} className="app-row app-row--link">
                        <span className="app-iconcell"><img src={`${import.meta.env.BASE_URL}assets/${a.mark}`} alt="" width="44" height="44" className="app-mark-mini" /></span>
                        <span className="app-name">{a.name}</span>
                        <span className="app-desc">{a.desc}</span>
                        <span className="status" data-status={a.status}>{a.statusLabel}</span>
                        <span className="app-arrow" aria-hidden="true">→</span>
                      </Link>
                    : <div className="app-row">
                        <span className="app-iconcell"><span className="app-mark-mini app-mark-mini--none" aria-hidden="true" /></span>
                        <span className="app-name">{a.name}</span>
                        <span className="app-desc">{a.desc}</span>
                        <span className="status" data-status={a.status}>{a.statusLabel}</span>
                        <span className="app-arrow" aria-hidden="true" />
                      </div>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="split" aria-labelledby="contact-title">
          <div className="section-number" aria-hidden="true">03</div>
          <div>
            <h2 id="contact-title">Contact</h2>
            <p className="cta-line">Got a problem worth an app?</p>
            <p>
              For partnerships, app support, or press:
            </p>
            <a className="mail mail--big" href="mailto:hello@neonfila.com">hello@neonfila.com</a>
            <p className="building">
              <span className="building-dot" aria-hidden="true" />
              Currently building <ScrollLink to="apps">Oju</ScrollLink>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
