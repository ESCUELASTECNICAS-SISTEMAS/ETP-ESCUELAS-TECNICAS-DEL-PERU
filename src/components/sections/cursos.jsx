import React from 'react'
import CardCurso from '../UI/CardCurso'
import cursos from '../../data/cursos.json'

export default function Cursos(){
  return (
    <section id="cursos" className="section-padding">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Cursos destacados</h3>
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
