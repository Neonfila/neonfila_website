import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import ScrollLink from './components/ScrollLink.jsx'
import Home from './pages/Home.jsx'
import Oju from './pages/Oju.jsx'
import Mapa from './pages/Mapa.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Footer from './components/Footer.jsx'

// new page → start at the top (the hash router keeps the old scroll otherwise)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ScrollLink to="main" className="skip">Skip to content</ScrollLink>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oju" element={<Oju />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
