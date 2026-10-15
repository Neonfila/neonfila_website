import { useLocation, useNavigate } from 'react-router-dom'

// HashRouter owns the URL hash, so plain #anchors would break routing.
// ScrollLink scrolls to a section id instead — on the current page, or
// from another page via home first. Reduced-motion users jump, not glide.
export default function ScrollLink({ to, className, children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function scroll(id) {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <button
      type="button"
      className={className || 'linklike'}
      onClick={() => {
        if (pathname !== '/') {
          navigate('/')
          window.setTimeout(() => scroll(to), 80)
        } else {
          scroll(to)
        }
      }}
    >
      {children}
    </button>
  )
}
