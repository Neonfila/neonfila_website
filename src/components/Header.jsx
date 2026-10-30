import { Link } from 'react-router-dom'
import ScrollLink from './ScrollLink.jsx'
import NeonMark from './NeonMark.jsx'

const links = [
  { to: 'studio', label: 'Studio' },
  { to: 'apps', label: 'Apps' },
  { to: 'contact', label: 'Contact' },
]

export default function Header() {
  return (
    <header className="site-header">
      <nav aria-label="Site">
        <Link className="brand" to="/" aria-label="NeonFila home">
          <NeonMark size={26} />
          <span className="brand-word">neonfila</span>
        </Link>
        <ul>
          {links.map(l => (
            <li key={l.label}><ScrollLink to={l.to}>{l.label}</ScrollLink></li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
