import { Volume2, RotateCcw } from 'lucide-react'
import { Stage, Phone, Roll, type Act } from '../stageshow/kit'
import './mapa-demo.css'

// Mapa's landing demo: how it feels to use. A finger lands on the orange start
// dot and traces the big "m" in one stroke, the ink following exactly under
// it; the letter is done, its tile in the word fills and the sound chip drops
// in ("mmm"). The child taps Again, which is the visible cause of the reset.
//
// Real strings: Trace the letter, the word's tiles (m a p a), mmm, Again.
// The letter is the Mapa mark's own geometry (stems 192 apart, r96 arches).

type S = { p: number; done: boolean; clearing: boolean }
const START: S = { p: 0, done: false, clearing: false }

// ---- the stroke, sampled once: lines and arches in the mark's 1024 space ----
type Pt = { x: number; y: number }
const segs: ((t: number) => Pt)[] = []
const line = (a: Pt, b: Pt) => segs.push((t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }))
const arch = (cx: number) => segs.push((t) => ({ x: cx - 96 * Math.cos(Math.PI * t), y: 430 - 96 * Math.sin(Math.PI * t) }))
line({ x: 320, y: 300 }, { x: 320, y: 724 })
line({ x: 320, y: 724 }, { x: 320, y: 430 })
arch(416)
line({ x: 512, y: 430 }, { x: 512, y: 724 })
line({ x: 512, y: 724 }, { x: 512, y: 430 })
arch(608)
line({ x: 704, y: 430 }, { x: 704, y: 724 })

const PTS: Pt[] = []
segs.forEach((f, i) => { for (let k = i ? 1 : 0; k <= 48; k++) PTS.push(f(k / 48)) })
const LEN = [0]
for (let i = 1; i < PTS.length; i++) LEN.push(LEN[i - 1] + Math.hypot(PTS[i].x - PTS[i - 1].x, PTS[i].y - PTS[i - 1].y))
const TOTAL = LEN[LEN.length - 1]
const D = 'M' + PTS.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')

function at(f: number): Pt {
  const want = Math.max(0, Math.min(1, f)) * TOTAL
  let i = 1
  while (i < LEN.length - 1 && LEN[i] < want) i++
  const t = (want - LEN[i - 1]) / (LEN[i] - LEN[i - 1] || 1)
  return { x: PTS[i - 1].x + (PTS[i].x - PTS[i - 1].x) * t, y: PTS[i - 1].y + (PTS[i].y - PTS[i - 1].y) * t }
}

const REST = { x: 330, y: 470 }

// the letter's viewBox inside the board, in mark units
const VB = { x: 232, y: 212, w: 560, h: 600 }

const script = async (a: Act<S>) => {
  await a.wait(900)
  const box = a.rect('letter')
  const toStage = (p: Pt) => ({ x: box.x + ((p.x - VB.x) / VB.w) * box.width, y: box.y + ((p.y - VB.y) / VB.h) * box.height })
  a.mark('trace')
  await a.move(toStage(at(0)))
  let prog = 0
  await a.drag(
    toStage(at(1)),
    () => a.put({ p: prog }),
    { duration: 4200, path: (e) => { prog = e; return toStage(at(e)) } },
  )
  a.put({ p: 1, done: true })
  a.mark('done')
  await a.wait(2600)
  a.mark('again')
  await a.click('again')
  a.put({ clearing: true, done: false })
  await a.wait(650)
  await a.snap({ p: 0, clearing: false })
  // the finger lifts away and comes back to rest where the loop began
  await a.move(REST)
  await a.wait(300)
}

const WORD = ['m', 'a', 'p', 'a']

export default function MapaDemo() {
  return (
    <Stage<S>
      width={400}
      height={500}
      compact={{ below: 400, width: 358, height: 490 }}
      initial={START}
      poster={{ p: 1, done: true, clearing: false }}
      script={script}
      cursor={{ at: REST, style: 'touch' }}
      className="mapa-demo"
    >
      {(s, _rect, layout) => (
        <Phone width={300} className="mapa-phone" style={{ left: layout === 'compact' ? 29 : 50 }}>
          <div className="mapa-screen">
            <div className="mapa-top">
              <div className="mapa-title">Trace the letter</div>
              <div className="mapa-word">
                {WORD.map((l, i) => (
                  <span key={i} className="mapa-tile" data-now={i === 0 || undefined} data-done={(i === 0 && s.done) || undefined}>{l}</span>
                ))}
              </div>
            </div>

            <div className="mapa-board">
              <svg data-target="letter" className="mapa-letter" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} aria-hidden>
                <path d={D} className="mapa-guide" />
                <path d={D} className="mapa-midline" />
                <path
                  d={D}
                  pathLength={1}
                  className="mapa-ink"
                  data-done={s.done || undefined}
                  data-clearing={s.clearing || undefined}
                  style={{ strokeDashoffset: 1 - s.p }}
                />
                <circle cx="320" cy="300" r="46" className="mapa-start" data-hide={s.p > 0.02 || undefined} />
              </svg>
            </div>

            <div className="mapa-foot">
              {/* the sound button is always there; finishing the letter lights it and it says the sound */}
              <span className="mapa-chip" data-on={s.done || undefined}>
                <Volume2 size={16} strokeWidth={2.25} absoluteStrokeWidth aria-hidden />
                <Roll>{s.done ? 'mmm' : 'Listen'}</Roll>
              </span>
              <span className="mapa-again" data-target="again" data-show={s.done || undefined}>
                <RotateCcw size={16} strokeWidth={2.25} absoluteStrokeWidth aria-hidden />
                Again
              </span>
            </div>
          </div>
        </Phone>
      )}
    </Stage>
  )
}
