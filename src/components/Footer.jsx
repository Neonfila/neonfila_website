import { Link } from 'react-router-dom'
import NeonMark from './NeonMark.jsx'

export default function Footer() {
  return (
    <footer>
      <p className="foot-brand"><NeonMark size={18} glow={false} /> &copy; 2026 NeonFila. All rights reserved.</p>
      <ul>
        <li><Link to="/privacy">Privacy Policy</Link></li>
        <li><Link to="/terms">Terms of Service</Link></li>
      </ul>
    </footer>
  )
}
