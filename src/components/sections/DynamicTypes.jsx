import React, { useEffect, useState } from 'react'
import axios from 'axios'
import CardCurso from '../UI/CardCurso'
import { endpoints } from '../../utils/apiStatic'

const normalize = (v = '') => String(v || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()

const titleForType = (t) => {
  if (!t || t === 'general') return 'General'
  return String(t).split(/[-_\s]+/).map(s => s.charAt(0).toUpperCase()+s.slice(1)).join(' ')
}

// Words indicating types already covered by static sections
const EXCLUDED_WORDS = ['informatica','ofimatica','taller','cinco','carrera']

export default function DynamicTypes(){
  const [groups, setGroups] = useState([])
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
          try { const mres = await axios.get(endpoints.MEDIA); media = Array.isArray(mres.data) ? mres.data : [] } catch(e){}
        }

        const mapped = apiCursos
          .filter(c => c.published !== false)
          .map(c => ({
            ...c,
            titulo: c.title || c.titulo || c.name,
            image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m => String(m.id) === String(c.thumbnail_media_id)) || {}).url : null),
            tipoRaw: c.type || c.tipo || ''
          }))

        // preserve first-seen order so newly introduced types appear at the end
        const order = []
        const byType = {}
        mapped.forEach(c => {
          const key = normalize(c.tipoRaw) || 'general'
          // skip types that would duplicate static sections
          const excluded = EXCLUDED_WORDS.some(w => key.includes(w))
          if (excluded) return
          if (!byType[key]) { byType[key] = []; order.push(key) }
          byType[key].push(c)
        })

        const result = order.map(k => ({ typeKey: k, typeTitle: titleForType(k), items: byType[k] }))
        if (mounted) setGroups(result)
      } catch (err) {
        console.warn('DynamicTypes load failed', err)
        if (mounted) setGroups([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  if (loading || !groups.length) return null

  return (
    <>
      {groups.map(g => (
        <section key={g.typeKey} className="section-padding">
          <div className="container">
            <div className="section-header">
              <div>
                <h3 className="section-title">{g.typeTitle}</h3>
                <p className="section-subtitle">Capacítate con Nosotros — Domina las herramientas digitales esenciales</p>
              </div>
              <a href={`/cursos?type=${encodeURIComponent(g.typeKey)}`} className="section-link">Explorar nuestros cursos <i className="bi bi-arrow-right"></i></a>
            </div>

            <div className="row g-4">
              {g.items.slice(0,6).map(c => (
                <div className="col-12 col-sm-6 col-md-4" key={c.id || c.titulo}>
                  <CardCurso curso={c} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
