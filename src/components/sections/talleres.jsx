import React, { useEffect, useState } from 'react'
import cursosLocal from '../../data/cursos.json'
import CourseCard from '../UI/CourseCard'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function Talleres(){
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try{
        const res = await axios.get(endpoints.COURSES)
        if(!mounted) return
        const apiCursos = Array.isArray(res.data) ? res.data : []
        const needsMedia = apiCursos.some(c => c.thumbnail_media_id)
        let media = []
        if(needsMedia){ try{ const mres = await axios.get(endpoints.MEDIA); media = Array.isArray(mres.data)?mres.data:[] }catch(e){}} 
        const mapped = apiCursos.map(c => ({
          ...c,
          titulo: c.title || c.titulo || c.name,
          modalidad: c.modalidad || c.mode || c.modality || '',
          descripcion: c.description || c.descripcion || c.subtitle || '',
          image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m=>String(m.id)===String(c.thumbnail_media_id))||{}).url : null),
        }))
        if(mapped.length) setCursos(mapped)
        else setCursos(cursosLocal.filter(c => c.tipo && c.tipo.toLowerCase() === 'taller'))
      }catch(err){ setCursos(cursosLocal.filter(c => c.tipo && c.tipo.toLowerCase() === 'taller')) }
      finally{ if(mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [])

  const talleres = cursos.filter(c => c.tipo && String(c.tipo).toLowerCase() === 'taller')
  if(loading && talleres.length === 0) return null

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
              <CourseCard item={t} showPrice={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
