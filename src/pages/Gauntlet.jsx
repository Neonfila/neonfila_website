import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './gauntlet.css'
import DEMO_EVENTS from './gauntlet-demo.json'

// The Gauntlet: describe an idea, the research engine checks it on the live web
// against the studio's selection law, and the law (not the model) gives the
// verdict. Studio tool for now: the engine runs locally
// (studio repo, tools/selection-law/research-server.mjs).
const API = (import.meta.env.VITE_GAUNTLET_API || '').replace(/\/$/, '')
const STORE = 'gauntlet.verdicts.v2'

const VERDICTS = {
  dead: { word: 'Dead on arrival', short: 'Dead' },
  not_yet: { word: 'Not proven yet', short: 'Not proven' },
  alive: { word: 'Worth building', short: 'Alive' },
}
const RESULT_LABEL = { pass: 'Pass', fail: 'Fail', unproven: 'Unproven' }
const QUERY_LABEL = { hit: 'Found', miss: 'Missing', untested: 'Untested' }

function loadLog() {
  try {
    const list = JSON.parse(localStorage.getItem(STORE) || '[]')
    return Array.isArray(list) ? list.filter(v => v && v.verdict && v.name) : []
  } catch { return [] }
}
function saveLog(list) {
  try { localStorage.setItem(STORE, JSON.stringify(list.slice(0, 50))) } catch { /* private mode: keep in memory */ }
}

const host = url => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }
const day = iso => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

// POST, then read the engine's event stream until it ends.
async function runEngine(body, onEvent, signal) {
  const res = await fetch(`${API}/api/gauntlet/run`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal,
  })
  if (!res.ok || !res.body) {
    let message = 'The research engine is not answering.'
    try { message = (await res.json()).error || message } catch { /* not JSON: engine is down */ }
    throw new Error(message)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop()
    for (const frame of frames) {
      const line = frame.split('\n').find(l => l.startsWith('data: '))
      if (line) onEvent(JSON.parse(line.slice(6)))
    }
  }
}

// The recorded example is bundled with the page, so it plays with no engine.
async function runDemo(onEvent, signal) {
  for (const event of DEMO_EVENTS) {
    if (event.type !== 'verdict') await new Promise(r => setTimeout(r, 450))
    if (signal.aborted) throw new DOMException('Stopped', 'AbortError')
    onEvent(event)
  }
}

function Evidence({ items }) {
  if (!items?.length) return null
  return (
    <ul className="g-evidence">
      {items.map((e, i) => (
        <li key={i}>
          <a href={e.url} target="_blank" rel="noreferrer noopener">{host(e.url)}</a>
          {e.fact && <span>{e.fact}</span>}
        </li>
      ))}
    </ul>
  )
}

function Verdict({ v, onCopy, copied }) {
  const meta = VERDICTS[v.verdict]
  const headRef = useRef(null)
  useEffect(() => { headRef.current?.focus({ preventScroll: true }) }, [v])
  return (
    <article className="g-verdict" data-verdict={v.verdict} aria-labelledby="g-verdict-word">
      <header className="g-verdict-head">
        <p className="g-kicker">{v.name}{v.demo && <span className="g-demo-tag">Recorded example, not live research</span>}</p>
        <h2 id="g-verdict-word" ref={headRef} tabIndex={-1}>{meta.word}<span aria-hidden="true">.</span></h2>
        {v.headline && <p className="g-headline">{v.headline}</p>}
        <p className="g-reason">{v.reason}</p>
      </header>

      <ol className="g-checks">
        {v.checks.map(c => (
          <li key={c.id} data-result={c.result}>
            <span className="g-law">{c.law}</span>
            <div>
              <h3>{c.title}</h3>
              <p>{c.finding}</p>
              {c.downgraded && <p className="g-note">Reported as a pass, but with no link to check. No link, no pass.</p>}
              <Evidence items={c.evidence} />
            </div>
            <span className="g-result">{RESULT_LABEL[c.result]}</span>
          </li>
        ))}
      </ol>

      {v.queries.length > 0 && (
        <section className="g-block" aria-labelledby="g-queries">
          <h3 id="g-queries" className="g-label">What a real user would type first</h3>
          <ul className="g-queries">
            {v.queries.map((q, i) => (
              <li key={i} data-result={q.result}>
                <span className="g-query">{q.query}</span>
                <span className="g-query-note">{q.note}</span>
                <span className="g-result">{QUERY_LABEL[q.result]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {v.competitors.length > 0 && (
        <section className="g-block" aria-labelledby="g-rivals">
          <h3 id="g-rivals" className="g-label">Already out there</h3>
          <ul className="g-rivals">
            {v.competitors.map((c, i) => (
              <li key={i}>
                <a href={c.url} target="_blank" rel="noreferrer noopener">{c.title}</a>
                <span>{c.fact}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="g-pair">
        {v.killer && (
          <section aria-labelledby="g-killer">
            <h3 id="g-killer" className="g-label">What kills it</h3>
            <p>{v.killer}</p>
          </section>
        )}
        {v.nextTest && (
          <section aria-labelledby="g-next">
            <h3 id="g-next" className="g-label">Cheapest test before any code</h3>
            <p>{v.nextTest}</p>
          </section>
        )}
      </div>

      {v.unknowns.length > 0 && (
        <section className="g-block" aria-labelledby="g-unknowns">
          <h3 id="g-unknowns" className="g-label">Could not find out</h3>
          <ul className="g-unknowns">{v.unknowns.map((u, i) => <li key={i}>{u}</li>)}</ul>
        </section>
      )}

      <section className="g-block" aria-labelledby="g-killlog">
        <h3 id="g-killlog" className="g-label">Line for the kill log</h3>
        <div className="g-killlog">
          <code>{v.killLogLine}</code>
          <button type="button" className="g-btn g-btn--quiet" onClick={() => onCopy(v.killLogLine)}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      <p className="g-foot">
        {v.demo ? 'From the studio kill log' : `Researched ${day(v.researchedAt)}`}
        {' · '}The law gives the verdict. The research only supplies the evidence.
      </p>
    </article>
  )
}

export default function Gauntlet() {
  const [idea, setIdea] = useState('')
  const [context, setContext] = useState('')
  const [engine, setEngine] = useState({ state: 'checking' })   // checking | ready | nokey | offline
  const [phase, setPhase] = useState('idle')                    // idle | running | done
  const [feed, setFeed] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const [verdict, setVerdict] = useState(null)
  const [log, setLog] = useState(loadLog)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef(null)
  const resultRef = useRef(null)

  useEffect(() => { document.title = 'The Gauntlet — NeonFila' }, [])

  const checkEngine = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/gauntlet/health`)
      const data = await res.json()
      if (!data.ok) throw new Error()
      setEngine({ state: data.ready ? 'ready' : 'nokey', model: data.model })
    } catch { setEngine({ state: 'offline' }) }
  }, [])
  useEffect(() => { checkEngine() }, [checkEngine])

  useEffect(() => {
    if (phase !== 'running') return
    const started = Date.now()
    const timer = setInterval(() => setSeconds(Math.round((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [phase])

  async function run(body) {
    setError(''); setFeed([]); setSeconds(0); setVerdict(null); setCopied(false); setPhase('running')
    const abort = new AbortController()
    abortRef.current = abort
    let got = null
    let failure = ''
    try {
      const onEvent = event => {
        if (event.type === 'verdict') got = event.verdict
        else if (event.type === 'error') failure = event.message
        else setFeed(list => [...list, event])
      }
      if (body.demo) await runDemo(onEvent, abort.signal)
      else await runEngine(body, onEvent, abort.signal)
    } catch (e) {
      if (abort.signal.aborted) { setPhase('idle'); return }
      failure = e instanceof TypeError ? 'The research engine is not running.' : e.message
      checkEngine()
    }
    if (got) {
      setVerdict(got)
      setPhase('done')
      if (!got.demo) {
        const next = [got, ...loadLog()]
        saveLog(next); setLog(next)
      }
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: 'start' }))
    } else {
      setError(failure || 'The research stopped before it reached a verdict. Try again.')
      setPhase('idle')
    }
  }

  function submit(e) {
    e.preventDefault()
    if (idea.trim().length < 12) { setError('Describe the idea in at least a sentence.'); return }
    run({ idea, context })
  }

  function copy(text) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    }, () => {})
  }

  function remove(item) {
    const next = log.filter(v => v !== item)
    saveLog(next); setLog(next)
    if (verdict === item) { setVerdict(null); setPhase('idle') }
  }

  function open(item) {
    setVerdict(item); setPhase('done'); setCopied(false)
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: 'start' }))
  }

  const running = phase === 'running'
  const ready = engine.state === 'ready'

  return (
    <main id="main" className="app-site gauntlet">
      <section className="g-hero" aria-labelledby="g-title">
        <p className="g-kicker">The Gauntlet · studio tool</p>
        <h1 id="g-title">Is it dead<br />on arrival?</h1>
        <p className="app-lede">
          Describe an idea. It gets researched on the live web against the studio’s
          selection law, before anyone writes code. No link, no pass.
        </p>
      </section>

      <form className="g-form" onSubmit={submit} aria-busy={running}>
        <label htmlFor="g-idea">The idea</label>
        <textarea
          id="g-idea" rows={4} maxLength={2000} value={idea} disabled={running}
          onChange={e => setIdea(e.target.value)}
          placeholder="Tell a Lagos commuter which bus gets them from where they are to where they are going."
        />
        <label htmlFor="g-context">Who is it for, and where? <span>Optional</span></label>
        <input
          id="g-context" type="text" maxLength={500} value={context} disabled={running}
          onChange={e => setContext(e.target.value)}
          placeholder="Daily commuters in Lagos, on cheap Android phones"
        />

        <div className="g-actions">
          {running ? (
            <button type="button" className="g-btn" onClick={() => abortRef.current?.abort()}>Stop</button>
          ) : (
            <button type="submit" className="g-btn g-btn--go" disabled={!ready}>Run the gauntlet</button>
          )}
          {!running && (
            <button type="button" className="g-btn g-btn--quiet" onClick={() => run({ demo: true })}>
              See a recorded example
            </button>
          )}
          <p className="g-engine" data-state={engine.state} role="status">
            {engine.state === 'checking' && 'Looking for the research engine'}
            {engine.state === 'ready' && 'Research engine ready'}
            {engine.state === 'nokey' && 'Engine running, but it has no API key yet'}
            {engine.state === 'offline' && 'Research engine is offline'}
          </p>
        </div>

        {engine.state === 'offline' && (
          <p className="g-help">
            The Gauntlet is a studio tool. Live research runs on the studio machine only, so it
            is not available here yet. The recorded example shows what a verdict looks like.{' '}
            <button type="button" className="linklike" onClick={checkEngine}>Check again</button>
          </p>
        )}
        {engine.state === 'nokey' && (
          <p className="g-help">
            Live research needs an Anthropic API key. Put <code>ANTHROPIC_API_KEY=…</code> in{' '}
            <code>tools/selection-law/.env</code> and restart the engine. The recorded example works without one.
          </p>
        )}
        {error && <p className="g-error" role="alert">{error}</p>}
      </form>

      {running && (
        <section className="g-feed" aria-label="Research in progress">
          <p className="g-label"><span className="g-pulse" aria-hidden="true" /> Researching · {seconds}s</p>
          <ol aria-live="polite">
            {feed.map((f, i) => (
              <li key={i} data-type={f.type}>
                {f.type === 'search' && <><span>Search</span><b>{f.query}</b></>}
                {f.type === 'source' && <><span>Read</span><b>{host(f.url)}</b><i>{f.title}</i></>}
                {f.type === 'stage' && <><span>Step</span><b>{f.text}</b></>}
              </li>
            ))}
          </ol>
          <p className="g-feed-note">A live check usually takes one to three minutes.</p>
        </section>
      )}

      <div ref={resultRef} className="g-anchor">
        {phase === 'done' && verdict && <Verdict v={verdict} onCopy={copy} copied={copied} />}
      </div>

      {log.length > 0 && (
        <section className="g-log" aria-labelledby="g-log-title">
          <h2 id="g-log-title" className="g-label">Ideas run so far</h2>
          <ul>
            {log.map((item, i) => (
              <li key={item.researchedAt + i} data-verdict={item.verdict}>
                <button type="button" className="g-log-open" onClick={() => open(item)}>
                  <span className="g-log-name">{item.name}</span>
                  <span className="g-log-reason">{item.reason}</span>
                </button>
                <span className="g-result">{VERDICTS[item.verdict].short}</span>
                <time dateTime={item.researchedAt}>{day(item.researchedAt)}</time>
                <button type="button" className="g-btn g-btn--quiet" onClick={() => remove(item)} aria-label={`Remove ${item.name} from this list`}>Remove</button>
              </li>
            ))}
          </ul>
          <p className="g-foot">Kept in this browser only.</p>
        </section>
      )}

      <p className="back-home"><Link to="/">← Back to the studio</Link></p>
    </main>
  )
}
