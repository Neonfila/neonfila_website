import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer>
      <p>&copy; 2026 NeonFila. All rights reserved.</p>
      <ul>
        <li><Link to="/privacy">Privacy Policy</Link></li>
        <li><Link to="/terms">Terms of Service</Link></li>
      </ul>
    </footer>
  )
}
