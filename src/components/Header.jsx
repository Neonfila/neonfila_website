import { Link } from 'react-router-dom'
import ScrollLink from './ScrollLink.jsx'

const links = [
  { to: 'studio', label: 'Studio' },
  { to: 'apps', label: 'Apps' },
  { to: 'contact', label: 'Contact' },
]

export default function Header() {
  return (
    <header className="site-header">
      <nav aria-label="Site">
        <Link className="brand" to="/">
          <img src={`${import.meta.env.BASE_URL}assets/neonfila-pill.svg`} alt="NeonFila" className="brand-pill" width="84" height="22" />
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
