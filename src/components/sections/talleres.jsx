import React from 'react'
import cursos from '../../data/cursos.json'
import CourseCard from '../UI/CourseCard'

export default function Talleres(){
  const talleres = cursos.filter(c => c.tipo && c.tipo.toLowerCase() === 'taller')

  if(!talleres.length) return null

  return (
    <section id="talleres" className="section-padding">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Cursos y Talleres</h3>
          <a href="#" className="link-primary">Ver todos</a>
        </div>
        <div className="row g-4">
          {talleres.map((t,i) => (
            <div className="col-12 col-md-4" key={i}>
              <CourseCard item={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
