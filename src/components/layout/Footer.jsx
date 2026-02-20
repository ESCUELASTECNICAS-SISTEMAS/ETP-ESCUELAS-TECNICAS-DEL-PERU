import React, { useState } from 'react'

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-mortarboard-fill me-2 text-primary"></i>
              Escuelas Técnicas del Perú
            </h5>
            <p className="text-light opacity-75 mb-0">
              Formando profesionales técnicos para el desarrollo del país.
            </p>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-semibold mb-3 text-uppercase">
              <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
              Contacto
            </h6>
            <div className="d-flex flex-column gap-2">
              <a 
                href="https://maps.app.goo.gl/mJTJ4rQjkrrSQ6wJ7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-light text-decoration-none d-flex align-items-start gap-2 opacity-75 hover-opacity-100"
                style={{ transition: 'opacity 0.2s' }}
              >
                <i className="bi bi-pin-map-fill mt-1 text-info"></i>
                <span>Av San Martin Nº 398, Ica 11001</span>
              </a>
              <a 
                href="mailto:etp_sedeica@hotmail.com"
                className="text-light text-decoration-none d-flex align-items-center gap-2 opacity-75 hover-opacity-100"
                style={{ transition: 'opacity 0.2s' }}
              >
                <i className="bi bi-envelope-fill text-warning"></i>
                <span>etp_sedeica@hotmail.com</span>
              </a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-semibold mb-3 text-uppercase">
              <i className="bi bi-share-fill me-2 text-success"></i>
              Síguenos
            </h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-light fs-4" aria-label="Facebook" style={{ transition: 'color 0.2s' }}>
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-light fs-4" aria-label="Instagram" style={{ transition: 'color 0.2s' }}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-light fs-4" aria-label="WhatsApp" style={{ transition: 'color 0.2s' }}>
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="fw-semibold mb-3 text-uppercase">
              <i className="bi bi-map me-2 text-info"></i>
              Ubicación
            </h6>
            <MapEmbed />
          </div>
        </div>
        
        <hr className="my-4 border-secondary opacity-25" />
        
        <div className="text-center">
          <small className="opacity-75">
            © {new Date().getFullYear()} Escuelas Técnicas del Perú. Todos los derechos reservados.
          </small>
        </div>
      </div>
    </footer>
  )
}

function MapEmbed(){
  const [show, setShow] = useState(false)
  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3868.7304519616844!2d-75.73450892469184!3d-14.069299086297398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9110e2c1e5555555%3A0x5555555555555555!2sAv.%20San%20Mart%C3%ADn%20398%2C%20Ica%2011001!5e0!3m2!1ses!2spe!4v1234567890123!5m2!1ses!2spe"

  if(show){
    return (
      <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm" style={{ maxHeight: '200px' }}>
        <iframe 
          src={mapUrl}
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa de ubicación ETP"
        ></iframe>
      </div>
    )
  }

  return (
    <div className="border rounded p-3 d-flex flex-column align-items-center justify-content-center" style={{minHeight:160}}>
      <i className="bi bi-pin-map-fill fs-1 text-info mb-2"></i>
      <div className="text-center mb-2">
        <div className="fw-semibold">Av San Martin Nº 398, Ica 11001</div>
        <a href="https://maps.app.goo.gl/mJTJ4rQjkrrSQ6wJ7" target="_blank" rel="noopener noreferrer" className="small text-decoration-none">Abrir en Google Maps</a>
      </div>
      <button className="btn btn-outline-primary btn-sm" onClick={() => setShow(true)}>Cargar mapa</button>
    </div>
  )
}
