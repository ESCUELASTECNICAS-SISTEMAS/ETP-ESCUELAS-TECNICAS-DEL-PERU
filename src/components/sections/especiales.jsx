import React from 'react'
import cursos from '../../data/cursos.json'
import CourseCard from '../UI/CourseCard'

export default function Especiales(){
  const especiales = cursos.filter(c => c.tipo && c.tipo.toLowerCase() === 'especial')

  if(!especiales.length) return null

  return (
    <section id="especiales" className="section-padding">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Cursos Especiales</h3>
          <a href="#" className="link-primary">Ver todos</a>
        </div>
        <div className="row g-4">
          {especiales.map((e,i) => (
            <div className="col-12 col-md-4" key={i}>
              <CourseCard item={e} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
