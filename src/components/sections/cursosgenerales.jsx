import React from 'react'
import cursos from '../../data/cursos.json'
import CourseCard from '../UI/CourseCard'

export default function CursosGenerales(){
  const generales = cursos.filter(c => !c.tipo || c.tipo.toLowerCase() === 'curso')

  if(!generales.length) return null

  return (
    <section id="cursos-generales" className="section-padding bg-light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Cursos</h3>
          <a href="#" className="link-primary">Ver todos</a>
        </div>
        <div className="row g-4">
          {generales.map((c,i) => (
            <div className="col-12 col-md-4" key={i}>
              <CourseCard item={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
