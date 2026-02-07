import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Escuelas Técnicas del Perú</h5>
            <p className="mb-0">Formando profesionales técnicos para el desarrollo del país.</p>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <small>© {new Date().getFullYear()} Escuelas Técnicas del Perú. Todos los derechos reservados.</small>
          </div>
        </div>
      </div>
    </footer>
  )
}
