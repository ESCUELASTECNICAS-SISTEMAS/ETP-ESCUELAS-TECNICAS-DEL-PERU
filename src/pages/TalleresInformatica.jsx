import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import CourseCard from '../components/UI/CourseCard'

export default function CursosInformatica(){
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await axios.get(endpoints.COURSES)
        if (!mounted) return
        const apiCursos = Array.isArray(res.data) ? res.data : []
        const needsMedia = apiCursos.some(c => c.thumbnail_media_id)
        let media = []
        if (needsMedia) {
          try {
            const mres = await axios.get(endpoints.MEDIA)
            media = Array.isArray(mres.data) ? mres.data : []
          } catch (e) {}
        }
        const mapped = apiCursos.map(c => ({
          ...c,
          titulo: c.title || c.titulo || c.name,
          image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m => String(m.id) === String(c.thumbnail_media_id)) || {}).url : null),
        }))
        if (mapped.length) setCursos(mapped)
      } catch (err) {
        console.warn('fetch courses failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Filtrar solo cursos de ofimática
  const informatica = cursos.filter(c => {
    const tipo = (c.tipo || c.type || '').toLowerCase()
    return tipo === 'ofimatica' || tipo === 'informatica' || tipo === 'ofimática'
  })

  return (
    <div className="container py-5">
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
        </div>
      ) : informatica.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox fs-1 text-muted"></i>
          <h4 className="mt-3 text-muted">No hay cursos disponibles</h4>
        </div>
      ) : (
        <div className="row g-4">
          {informatica.map((c, i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i}>
              <CourseCard item={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
