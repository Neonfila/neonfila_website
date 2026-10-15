import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import ScrollLink from './components/ScrollLink.jsx'
import Home from './pages/Home.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <ScrollLink to="main" className="skip">Skip to content</ScrollLink>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
