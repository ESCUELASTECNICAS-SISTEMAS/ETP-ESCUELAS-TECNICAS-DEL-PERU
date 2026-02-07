import React from 'react'
import cursos from '../data/cursos.json'
import CourseCard from '../components/UI/CourseCard'

export default function CursosPage(){
  return (
    <div className="section-padding">
      <div className="container">
        <h2 className="mb-4">Todos los cursos y talleres</h2>
        <div className="row g-4">
          {cursos.map((c,i) => (
            <div className="col-12 col-md-4" key={i}>
              <CourseCard item={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
