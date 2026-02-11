import React, { useEffect, useState } from 'react'
import axios from 'axios'
import info from '../../data/informatica.json'
import CardCurso from '../UI/CardCurso'
import { endpoints } from '../../utils/apiStatic'

const buildLocalCursos = () => (info?.cursos || []).map((titulo, i) => ({
  id: `inf-${i}`,
  titulo,
  modalidad: 'Virtual / Presencial',
  duracion: '40 horas',
  image: '/assets/images/Hero1.jpg'
}))

export default function Informatica(){
  const [cursos, setCursos] = useState(buildLocalCursos())

  useEffect(() => {
    let mounted = true
    const fallback = () => { if(mounted) setCursos(buildLocalCursos()) }

    const load = async () => {
      try{
        const res = await axios.get(endpoints.COURSES)
        if(!mounted) return
        const apiCursos = Array.isArray(res.data) ? res.data : []
        const needsMedia = apiCursos.some(c => c.thumbnail_media_id)
        let media = []
        if(needsMedia){
          try{
            const mediaRes = await axios.get(endpoints.MEDIA)
            media = Array.isArray(mediaRes.data) ? mediaRes.data : []
          }catch(e){ /* keep placeholder image */ }
        }

        const mapped = apiCursos.map(c => ({
          ...c,
          titulo: c.title || c.titulo || c.name,
          modalidad: c.modalidad || c.mode || c.modality || 'Modalidad flexible',
          duracion: c.duracion || c.duration || '40 horas',
          image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m => String(m.id) === String(c.thumbnail_media_id)) || {}).url : null),
        }))

        const ofimatica = mapped.filter(c => {
          const tipo = (c.type || c.tipo || '').toLowerCase()
          return tipo === 'ofimatica'
        })

        if(!mounted) return
        if(ofimatica.length) setCursos(ofimatica)
        else fallback()
      }catch(err){ fallback() }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <section id="informatica" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div>
            <h3 className="section-title">Ofimática</h3>
            <p className="section-subtitle">Domina las herramientas digitales esenciales</p>
          </div>
          <a href="/cursos-informatica" className="section-link">Ver todos <i className="bi bi-arrow-right"></i></a>
        </div>

        <div className="row g-4">
          {cursos.map(c => (
            <div className="col-12 col-sm-6 col-md-4" key={c.id || c.titulo}>
              <CardCurso curso={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
