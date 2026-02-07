import React from 'react'
import { useParams } from 'react-router-dom'
import cursos from '../data/cursos.json'

export default function CourseDetail(){
  const { id } = useParams()
  const item = cursos.find(c => c.id === id)

  if(!item) return (
    <div className="section-padding">
      <div className="container">
        <h3>Curso no encontrado</h3>
      </div>
    </div>
  )

  return (
    <div className="section-padding">
      <div className="container">
        <h2>{item.titulo}</h2>
        <p className="text-muted">{item.modalidad} • {item.tipo || 'Curso'}</p>
        {item.pago_unico && <p>Pago único: S/ {item.pago_unico}</p>}
        {item.precio && <p>Precio: S/ {item.precio}</p>}
        {item.matricula && <p>Matrícula: S/ {item.matricula}</p>}
        {item.temario && (
          <>
            <h5>Temario</h5>
            <ul>
              {item.temario.map((t,i) => <li key={i}>{t}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
