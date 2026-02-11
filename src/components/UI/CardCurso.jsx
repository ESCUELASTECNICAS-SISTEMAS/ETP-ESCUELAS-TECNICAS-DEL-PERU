import React from 'react'
import { Link } from 'react-router-dom'

export default function CardCurso({curso}){
  const imgSrc = curso.image || curso.imagen || (curso.thumbnail && curso.thumbnail.url) || '/assets/images/cursos/curso-1.jpg'
  const detailUrl = `/curso/${curso.id}`

  return (
    <div className="cc-card">
      <div className="cc-img-wrap">
        <img src={imgSrc} className="cc-img" alt={curso.titulo || curso.title || ''} />
        <div className="cc-img-overlay">
          <Link to={detailUrl} className="btn btn-sm btn-light cc-overlay-btn"><i className="bi bi-eye me-1"></i>Ver más</Link>
          <Link to="/contacto" className="btn btn-sm btn-accent cc-overlay-btn"><i className="bi bi-send me-1"></i>Inscribirme</Link>
        </div>
      </div>
      <div className="cc-body">
        <h5 className="cc-title">{curso.titulo || curso.title}</h5>
        <div className="cc-meta">
          {curso.modalidad && <span className="cc-meta-item"><i className="bi bi-laptop"></i>{curso.modalidad}</span>}
          {curso.duracion && <span className="cc-meta-item"><i className="bi bi-clock"></i>{curso.duracion}</span>}
        </div>
        <Link to={detailUrl} className="cc-cta">
          Ver detalles <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  )
}
