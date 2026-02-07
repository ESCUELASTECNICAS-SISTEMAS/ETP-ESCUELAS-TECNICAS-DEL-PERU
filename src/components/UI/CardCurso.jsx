import React from 'react'

export default function CardCurso({curso}){
  return (
    <div className="card h-100">
      <div className="card-img-wrapper">
        <img src={curso.image || '/assets/images/cursos/curso-1.jpg'} className="card-img-top" alt={curso.titulo} />

        <div className="card-hover-overlay">
          <div className="overlay-ctas">
            <a href="#" className="btn btn-sm btn-light me-2">Más info</a>
            <a href="#contacto" className="btn btn-sm btn-accent">Inscribirme</a>
          </div>
        </div>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{curso.titulo}</h5>
        <p className="card-text text-muted">{curso.modalidad} · {curso.duracion}</p>
        <p className="mt-auto"><a href="#" className="btn btn-outline-primary btn-sm">Más información</a></p>
      </div>
    </div>
  )
}
