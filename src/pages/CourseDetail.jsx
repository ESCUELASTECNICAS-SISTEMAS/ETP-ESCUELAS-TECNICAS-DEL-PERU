import React from 'react'
import { useParams } from 'react-router-dom'
import cursos from '../data/cursos.json'
import programas from '../data/programas.json'

// helper to resolve image from different shapes
const resolveImage = (item) => {
  if(!item) return null
  return item.image || item.imagen || item.image_url || item.url || (item.thumbnail && item.thumbnail.url) || (item.media && item.media.url) || item.foto || null
}

export default function CourseDetail(){
  const { id } = useParams()
  let item = cursos.find(c => c.id === id)
  let source = 'cursos'
  if(!item){
    item = programas.find(p => p.id === id)
    source = item ? 'programas' : source
  }

  if(!item) return (
    <div className="section-padding">
      <div className="container">
        <h3>Elemento no encontrado</h3>
      </div>
    </div>
  )

  return (
    <div className="section-padding">
      <div className="container">
        {(() => {
          const img = resolveImage(item)
          if (img) return (
            <div className="course-hero mb-4">
              <img src={img} alt={item.titulo || ''} />
            </div>
          )
          return null
        })()}

        <h2>{item.titulo}</h2>
        <p className="text-muted">{item.modalidad} • {item.tipo || (source === 'programas' ? 'Programa' : 'Curso')}</p>
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
