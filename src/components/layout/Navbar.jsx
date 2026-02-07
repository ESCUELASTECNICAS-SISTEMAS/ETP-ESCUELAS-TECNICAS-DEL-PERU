import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white nav-enhanced ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="Escuelas Técnicas del Perú">
          <img src="/assets/images/logo.jpg" alt="ETP" className="me-2 brand-img" />
          <div className="brand-text">
            <div className="brand-title">Escuelas Técnicas</div>
            <div className="brand-subtitle">del Perú</div>
          </div>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cursos">Cursos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cursos-informatica">Cursos Informáticos</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#carreras">Carreras</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/noticias">Noticias</Link>
            </li>
            <li className="nav-item">
              <a className="btn btn-accent ms-3 contact-btn" href="#contacto">Contacto</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
