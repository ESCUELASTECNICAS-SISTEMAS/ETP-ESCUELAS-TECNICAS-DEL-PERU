import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('etp_user')
      if (raw) setUser(JSON.parse(raw))
    } catch (e) { /* ignore */ }
  }, [])

  useEffect(() => {
    const onLogin = (ev) => setUser(ev?.detail || null)
    window.addEventListener('etp:login', onLogin)
    return () => window.removeEventListener('etp:login', onLogin)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('etp_token')
    localStorage.removeItem('etp_user')
    setUser(null)
  }

  const handleLogin = (u) => setUser(u)

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-light nav-enhanced ${scrolled ? 'scrolled' : ''}`}>
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
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cursos">Cursos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cursos-informatica">Ofimática</Link>
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

              {/* Auth area */}
              {!user && (
                <li className="nav-item ms-2">
                  <Link className="btn btn-login-nav" to="/login">
                    <i className="bi bi-person-circle me-2"></i>Iniciar sesión
                  </Link>
                </li>
              )}

              {user && (
                <li className="nav-item dropdown ms-3">
                  <a className="nav-link dropdown-toggle text-white" href="#" id="userMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {user.name || user.email}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                    <li><Link className="dropdown-item" to="/admin">Panel</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Cerrar sesión</button></li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Login handled on /login page */}
    </>
  )
}
