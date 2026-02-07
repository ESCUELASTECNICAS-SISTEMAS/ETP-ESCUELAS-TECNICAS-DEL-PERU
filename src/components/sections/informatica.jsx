import React from 'react'
import info from '../../data/informatica.json'
import CardCurso from '../UI/CardCurso'

export default function Informatica(){
  if(!info) return null

  // Build simple course objects from the informatica list so they render as cards
  const cursos = info.cursos.map((titulo, i) => ({
    id: `inf-${i}`,
    titulo,
    modalidad: 'Virtual / Presencial',
    duracion: '40 horas',
    image: '/assets/images/Hero1.jpg'
  }))

  return (
    <section id="informatica" className="section-padding">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Cursos Informáticos</h3>
          <a href="#" className="link-primary">Ver todos</a>
        </div>

        <div className="row g-4">
          {cursos.map((c, i) => (
            <div className="col-12 col-sm-6 col-md-4" key={i}>
              <CardCurso curso={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
