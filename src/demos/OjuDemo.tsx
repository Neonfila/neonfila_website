import { Stage, Phone, Notification, Row, Avatar, Bar, Roll, type Act } from '../stageshow/kit'
import './oju-demo.css'

// Oju's landing demo, phone only, no cursor: a "what the system does" story.
// Tobi's live pin walks from the Home fence to the School fence; the fence
// lights as he crosses into it, his row rolls to "At School" and Oju's banner
// drops in. Second scene is the walk home, so the loop ends where it began
// and no data ever rewinds in view.
//
// Real strings: Home, School, Family, Tobi + his status, Mum + hers, the banner.
// Teal is Oju's Live signal and appears only on what is live.

type Place = 'home' | 'school'
type S = { at: Place; moving: boolean; dir: 'out' | 'back'; status: string; banner: boolean; note: string }

const START: S = { at: 'home', moving: false, dir: 'back', status: 'At Home', banner: false, note: 'Tobi is home' }

// Map geometry in screen points (393 wide); the route follows the streets
const HOME = { x: 104, y: 352 }
const SCHOOL = { x: 290, y: 176 }
const ROUTE = `M${HOME.x} ${HOME.y} L104 268 L206 268 L206 176 L${SCHOOL.x} ${SCHOOL.y}`
const TRIP = 3200

const script = async (a: Act<S>) => {
  await a.wait(900)
  a.mark('leave')
  a.put({ moving: true, dir: 'out', status: 'Leaving Home' })
  await a.wait(TRIP - 200)
  a.mark('arrive')
  a.put({ at: 'school', moving: false, status: 'At School' })
  await a.wait(220)
  a.put({ banner: true, note: 'Tobi arrived at School' })
  await a.wait(2600)
  a.put({ banner: false })
  await a.wait(700)
  a.mark('return')
  a.put({ moving: true, dir: 'back', status: 'Leaving School' })
  await a.wait(TRIP - 200)
  a.put({ at: 'home', moving: false, status: 'At Home' })
  await a.wait(220)
  a.put({ banner: true, note: 'Tobi is home' })
  await a.wait(2400)
  a.put({ banner: false })
  await a.wait(700)
}

export default function OjuDemo() {
  return (
    <Stage<S>
      width={400}
      height={520}
      compact={{ below: 400, width: 358, height: 500 }}
      initial={START}
      poster={{ at: 'school', moving: false, dir: 'out', status: 'At School', banner: true, note: 'Tobi arrived at School' }}
      script={script}
      theme="dark"
      className="oju-demo"
    >
      {(s, _rect, layout) => {
        // the pin heads for (or rests at) the end of the trip it is making
        const there = s.dir === 'out'
        return (
          <Phone width={300} dark className="oju-phone" style={{ left: layout === 'compact' ? 29 : 50 }}>
            <div className="oju-screen">
              <svg className="oju-map" viewBox="0 0 393 470" aria-hidden>
                <rect width="393" height="470" fill="#0E1322" />
                <path d="M0 410 C120 380 200 440 393 400 L393 470 L0 470Z" fill="#0F1A2B" />
                <rect x="232" y="292" width="118" height="78" rx="14" fill="#0F2420" />
                <g stroke="#1B2338" strokeLinecap="round" fill="none">
                  <path d="M-10 268 H410" strokeWidth="16" />
                  <path d="M206 -10 V480" strokeWidth="16" />
                  <path d="M104 -10 V480" strokeWidth="10" />
                  <path d="M-10 176 H410" strokeWidth="10" />
                  <path d="M-10 90 L410 40" strokeWidth="8" />
                  <path d="M300 268 V480" strokeWidth="8" />
                  <path d="M-10 352 H206" strokeWidth="8" />
                </g>
                <g stroke="#141B2C" strokeWidth="4" fill="none">
                  <path d="M150 -10 V268" /><path d="M260 -10 V176" /><path d="M-10 214 H206" /><path d="M206 220 H410" />
                </g>
                {/* the route lights behind him as he walks it */}
                <path d={ROUTE} className="oju-route" data-on={s.moving || undefined} pathLength={1} />
                {([['home', HOME], ['school', SCHOOL]] as const).map(([k, p]) => (
                  <circle key={k} cx={p.x} cy={p.y} r="48" className="oju-fence" data-in={(s.at === k && !s.moving) || undefined} />
                ))}
              </svg>
              <span className="oju-label" style={{ left: HOME.x, top: HOME.y + 56 }}>Home</span>
              <span className="oju-label" style={{ left: SCHOOL.x, top: SCHOOL.y + 56 }}>School</span>

              <Avatar name="Mum" size={30} className="oju-pin oju-pin--still" style={{ left: HOME.x + 4, top: HOME.y - 2 }} />
              <span
                className="oju-walker"
                data-there={there || undefined}
                style={{ offsetPath: `path('${ROUTE}')`, transitionDuration: `${TRIP}ms` }}
              >
                <Avatar name="Tobi" size={36} className="oju-pin oju-pin--live" />
              </span>

              <div className="oju-sheet">
                <span className="oju-grabber" />
                <div className="oju-sheet__title">Family</div>
                <Row
                  lead={<Avatar name="Tobi" size={40} />}
                  title="Tobi"
                  subtitle={<Roll>{s.status}</Roll>}
                  meta={<span className="oju-live"><span className="oju-live__dot" />Live</span>}
                />
                <Row lead={<Avatar name="Mum" size={40} />} title="Mum" subtitle="At Home" meta="2 min" />
                <Row lead={<Avatar plain size={40} />} title={<Bar w={64} h={9} r={4} tone={3} />} subtitle={<Bar w={92} h={8} r={4} tone={2} />} />
              </div>
            </div>
            <Notification
              banner
              className="oju-banner"
              data-show={s.banner || undefined}
              icon={<img src={`${import.meta.env.BASE_URL}assets/oju-mark.svg`} alt="" width="38" height="38" />}
              title={s.note}
              body="Family circle"
            />
          </Phone>
        )
      }}
    </Stage>
  )
}
