import { Stage, Phone, Notification, Row, Avatar, Swap, States, type Act } from '../stageshow/kit'
import './oju-demo.css'

// Oju's landing demo, built to the real app's look (brief from the Oju app
// session, docs/website-motion-brief.md in the oju repo). One phone, a calm
// Lagos map with three family pins. A finger lifts the "Where everyone is"
// sheet; Tolu's arrival at School drops in as a notification and rolls his
// row; the SOS card pulses once and Mum's SOS arrives; the finger lowers the
// sheet back to the map. Rows reset only while the sheet is down and they
// are below the crop, so nothing rewinds in view.
//
// Real strings: the greeting, SOS, Ikeja, Lekki, Where everyone is, the three
// rows, the two notifications. Orange is SOS only; green is Online only.

type S = { up: number; tolu: 'near' | 'school'; sos: boolean; pulse: number; banner: 0 | 1 | 2; note: 1 | 2 }
const START: S = { up: 0, tolu: 'near', sos: false, pulse: 0, banner: 0, note: 1 }

const NOTES = {
  1: { title: 'Tolu arrived at School', body: 'Allen Avenue, Ikeja' },
  2: { title: 'SOS from Mum', body: 'Open Oju to see the last location.' },
}

// stage points for the swipe (stage design px), and where the finger rests
const LOW = { x: 200, y: 400 }
const HIGH = { x: 206, y: 250 }
const REST = { x: 330, y: 300 }

const script = async (a: Act<S>) => {
  await a.wait(900)
  a.mark('lift')
  await a.move(LOW)
  await a.drag(HIGH, (_at, _from, t) => a.put({ up: Math.min(1, t * 0.6) }), { duration: 260 })
  a.put({ up: 1 })
  await a.wait(1500)
  a.mark('arrive')
  a.put({ banner: 1, note: 1, tolu: 'school' })
  await a.wait(2300)
  a.put({ banner: 0 })
  await a.wait(500)
  a.mark('sos')
  a.put((s) => ({ pulse: s.pulse + 1, sos: true }))
  await a.wait(200)
  a.put({ banner: 2, note: 2 })
  await a.wait(2500)
  a.put({ banner: 0 })
  await a.wait(500)
  a.mark('lower')
  await a.move(HIGH)
  await a.drag(LOW, (_at, _from, t) => a.put({ up: Math.max(0, 1 - t * 0.6) }), { duration: 260 })
  a.put({ up: 0 })
  await a.wait(700)
  // Tolu's and Mum's rows are below the crop now: their day starts again unseen
  await a.snap({ tolu: 'near', sos: false, pulse: 0, note: 1 })
  await a.move(REST)
  await a.wait(300)
}

export default function OjuDemo() {
  return (
    <Stage<S>
      width={400}
      height={426}
      compact={{ below: 400, width: 358, height: 420 }}
      initial={START}
      poster={{ up: 1, tolu: 'school', sos: false, pulse: 0, banner: 1, note: 1 }}
      script={script}
      cursor={{ at: REST, style: 'touch' }}
      className="oju-demo"
    >
      {(s, _rect, layout) => (
        <Phone width={300} className="oju-phone" style={{ left: layout === 'compact' ? 29 : 50 }}>
          <div className="oju-screen">
            <svg className="oju-map" viewBox="0 0 393 420" preserveAspectRatio="xMinYMin slice" aria-hidden>
              <rect width="393" height="420" fill="#EEF0E8" />
              {/* Lagos lagoon between the mainland and Lekki, the Atlantic below */}
              <path d="M-10 164 C70 146 120 186 196 176 C262 168 310 136 410 146 L410 198 C330 194 270 212 196 220 C120 228 60 202 -10 212Z" fill="#CBE5EB" />
              <path d="M-10 392 C120 376 260 400 410 380 L410 430 L-10 430Z" fill="#CBE5EB" />
              <g stroke="#FFFFFF" strokeLinecap="round" fill="none">
                <path d="M40 -10 L130 160" strokeWidth="10" />
                <path d="M-10 120 C80 112 200 140 410 96" strokeWidth="9" />
                <path d="M226 -10 C214 60 236 120 214 170" strokeWidth="7" />
                <path d="M-10 60 L250 36" strokeWidth="6" />
                <path d="M120 252 C200 238 300 252 410 238" strokeWidth="9" />
                <path d="M196 176 L230 296" strokeWidth="7" />
                <path d="M330 270 L350 380" strokeWidth="6" />
              </g>
              <circle cx="96" cy="104" r="34" className="oju-fence" data-in={s.tolu === 'school' || undefined} />
            </svg>
            <span className="oju-area" style={{ left: 36, top: 148 }}>Ikeja</span>
            <span className="oju-area" style={{ left: 238, top: 370 }}>Lekki</span>

            <span className="oju-pin oju-pin--a" style={{ left: 96, top: 216 }}><Avatar name="Tolu" size={34} /></span>
            <span className="oju-pin oju-pin--b" style={{ left: 200, top: 236 }}>
              <span className="oju-pulse" />
              <Avatar name="Mariam" size={34} />
            </span>
            <span className="oju-pin oju-pin--c" style={{ left: 300, top: 368 }}><Avatar name="Mum" size={34} /></span>

            <div className="oju-sheet" style={{ transform: `translateY(${(1 - s.up) * 180}px)` }}>
              <span className="oju-grabber" />
              <div className="oju-sheet__title">Where everyone is</div>
              <div data-target="rows">
                <Row
                  lead={<Avatar name="Mariam" size={40} />}
                  title="Mariam"
                  subtitle="At Home"
                  meta={<span className="oju-online"><span className="oju-online__dot" />Online</span>}
                />
                <Row
                  lead={<Avatar name="Tolu" size={40} />}
                  title="Tolu"
                  subtitle={<Swap id={s.tolu}>{s.tolu === 'school' ? 'At School, Allen Avenue' : 'Near Allen Avenue, Ikeja'}</Swap>}
                  meta="4.2 km"
                />
                <Row
                  lead={<Avatar name="Mum" size={40} />}
                  title="Mum"
                  subtitle="Near Admiralty Way, Lekki"
                  meta={
                    <States
                      align="end"
                      value={s.sos ? 'sos' : 'far'}
                      states={{ far: <span>12 km</span>, sos: <span className="oju-sos-badge">SOS</span> }}
                    />
                  }
                />
              </div>
            </div>

            {/* the header stays put over the map: greeting and the SOS card */}
            <header className="oju-head">
              <div className="oju-greet">Good evening, Gbolahan</div>
              <span className="oju-sos" data-target="sos">
                <span key={s.pulse} className="oju-sos__ring" data-go={s.pulse > 0 || undefined} />
                SOS
              </span>
            </header>
          </div>
          <Notification
            banner
            className="oju-banner"
            data-show={s.banner > 0 || undefined}
            data-sos={s.note === 2 || undefined}
            icon={<img src={`${import.meta.env.BASE_URL}assets/oju-mark.svg`} alt="" width="38" height="38" />}
            title={NOTES[s.note].title}
            body={NOTES[s.note].body}
          />
        </Phone>
      )}
    </Stage>
  )
}
