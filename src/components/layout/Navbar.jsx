import React from 'react'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img src="/assets/images/logo.png" alt="ETP" height="40" className="me-2" />
          <span className="fw-bold">Escuelas Técnicas del Perú</span>
        </a>
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
              <a className="nav-link active" aria-current="page" href="#inicio">Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#cursos">Cursos</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#modalidades">Modalidades</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#especialidades">Especialidades</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#carreras">Carreras</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#noticias">Noticias</a>
            </li>
            <li className="nav-item">
              <a className="btn btn-accent ms-3" href="#contacto">Contacto</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
