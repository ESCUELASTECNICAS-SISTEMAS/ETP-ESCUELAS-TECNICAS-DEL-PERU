import React from 'react'
import info from '../data/informatica.json'
import CourseCard from '../components/UI/CourseCard'

export default function CursosInformatica(){
  const items = (info.cursos || []).map((titulo, i) => ({
    id: `curso-informatica-${i}`,
    tipo: 'Curso',
    titulo,
    modalidad: 'Presencial/Virtual',
    pago_unico: null,
    precio: null,
    matricula: info.matricula,
    pension: info.pension,
    temario: []
  }))

  return (
    <div className="section-padding">
      <div className="container">
        <h2 className="mb-4">Ofimática</h2>
        <div className="row g-4">
          {items.map((c,i) => (
            <div className="col-12 col-md-4" key={i}>
              <CourseCard item={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
