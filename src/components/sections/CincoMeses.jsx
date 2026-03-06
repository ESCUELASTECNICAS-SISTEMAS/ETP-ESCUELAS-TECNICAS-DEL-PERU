import React, { useEffect, useState } from 'react'
import cursosLocal from '../../data/cursos.json'
import CourseCard from '../UI/CourseCard'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function CincoMeses(){
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
        if(needsMedia){ 
          try{ 
            const mres = await axios.get(endpoints.MEDIA)
            media = Array.isArray(mres.data) ? mres.data : []
          } catch(e){ 
            console.warn('media fetch failed', e)
          }
        }
        const mapped = apiCursos
          .filter(c => c.published !== false)
          .map(c => ({
            ...c,
            titulo: c.title || c.titulo || c.name,
            modalidad: c.modalidad || c.mode || c.modality || '',
            descripcion: c.description || c.descripcion || c.subtitle || '',
            image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m=>String(m.id)===String(c.thumbnail_media_id))||{}).url : null),
          }))
        if(mapped.length) setCursos(mapped)
        else setCursos(cursosLocal.filter(c => c.tipo && c.tipo.toLowerCase() === 'cinco_meses'))
      }catch(err){ 
        console.warn('fetch courses failed, falling back', err)
        setCursos(cursosLocal.filter(c => c.tipo && c.tipo.toLowerCase() === 'cinco_meses'))
      }finally{ 
        if(mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const cincoMeses = cursos.filter(c => {
    const tipo = (c.tipo || c.type || '').toLowerCase()
    return tipo === 'cinco_meses' || tipo === 'cinco meses' || tipo === '5_meses' || tipo === '5 meses'
  })

  if(cincoMeses.length === 0) return null

  return (
    <section id="cinco-meses" className="section-padding bg-light">
      <div className="container">
        <div className="section-header">
          <div>
            <h3 className="section-title">Cursos de 5 Meses</h3>
            <p className="section-subtitle">Formación intensiva con certificación rápida</p>
          </div>
          <a href="/cursos" className="section-link">Ver todos <i className="bi bi-arrow-right"></i></a>
        </div>
        <div className="row g-4">
          {cincoMeses.map((c,i) => (
            <div className="col-12 col-md-4" key={i}>
              <CourseCard item={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
