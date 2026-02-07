import React from 'react'

export default function CardCurso({curso}){
  return (
    <div className="card h-100">
      <img src={curso.image || '/assets/images/cursos/curso-1.jpg'} className="card-img-top" alt={curso.titulo} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{curso.titulo}</h5>
        <p className="card-text text-muted">{curso.modalidad} · {curso.duracion}</p>
        <p className="mt-auto"><a href="#" className="btn btn-outline-primary btn-sm">Más información</a></p>
      </div>
    </div>
  )
}
