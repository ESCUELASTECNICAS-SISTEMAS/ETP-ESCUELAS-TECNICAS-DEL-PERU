import React from 'react'
import programas from '../data/programas.json'
import CourseCard from '../components/UI/CourseCard'

export default function ProgramasPage(){
  return (
    <div className="section-padding">
      <div className="container">
        <h2 className="mb-4">Programas</h2>
        <div className="row g-4">
          {programas.map((p,i) => (
            <div className="col-12 col-md-4" key={i}>
              <CourseCard item={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
