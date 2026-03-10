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

const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

const ORDER_RULES = [
  { rank: 1, words: ['especialista', 'informatica'] },
  { rank: 2, words: ['especialista', 'excel'] },
  { rank: 3, words: ['especialista', 'diseno', 'grafico'] },
  { rank: 4, words: ['produccion', 'edicion', 'video'] },
  { rank: 5, words: ['mantenimiento', 'reparacion'] },
  { rank: 6, words: ['power', 'bi'] },
  { rank: 7, words: ['sql', 'server'] },
]

const getCourseRank = (course) => {
  const t = normalizeText(course?.titulo || course?.title || course?.name || '')
  if (t.includes('ofimatica')) return 1
  if (t.includes('informatica') || t.includes('infromatica')) return 2
  const match = ORDER_RULES.find(rule => rule.words.every(w => t.includes(w)))
  return match ? match.rank : 999
}

export default function Informatica({ selectedSucursalId = null, selectedModalidad = null }){
  const [allCursos, setAllCursos] = useState([])

  useEffect(() => {
    let mounted = true
    const fallback = () => { if(mounted) setAllCursos(buildLocalCursos()) }

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

        const mapped = apiCursos
          .filter(c => c.published !== false)
          .map(c => ({
            ...c,
            titulo: c.title || c.titulo || c.name,
            modalidad: c.modalidad || c.mode || c.modality || 'Modalidad flexible',
            duracion: c.duracion || c.duration || '40 horas',
            image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m => String(m.id) === String(c.thumbnail_media_id)) || {}).url : null),
          }))

        if(!mounted) return
        setAllCursos(mapped.length > 0 ? mapped : buildLocalCursos())
      }catch(err){ fallback() }
    }

    load()
    return () => { mounted = false }
  }, [])

  const cursos = allCursos.filter(c => {
    const rawModalidad = String(c.modalidad || c.mode || c.modality || '').trim().toLowerCase()
    const modalidadText = rawModalidad.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const hasVirtualWord = modalidadText.includes('virtual')
    const hasPresencialWord = modalidadText.includes('presencial')
    const isMixedText = modalidadText.includes('hibrid') || modalidadText.includes('mixto') || modalidadText.includes('semi')
    const isVirtual = Boolean(c.is_virtual) || hasVirtualWord || isMixedText
    const isPresencial = Boolean(c.is_presencial) || hasPresencialWord || isMixedText

    if (selectedModalidad === 'virtual' && !isVirtual) return false
    if (selectedModalidad === 'presencial' && !isPresencial) return false

    if (selectedSucursalId != null && selectedModalidad !== 'virtual') {
      const sucursales = Array.isArray(c.sucursales) ? c.sucursales : []
      const belongsToSucursal = sucursales.some(s => String(s.id) === String(selectedSucursalId))
      if (!belongsToSucursal) return false
    }

    const tipo = (c.type || c.tipo || '').toLowerCase()
    return tipo === 'ofimatica' || tipo === 'ofimática' || tipo === 'informatica' || tipo === 'informática'
  }).sort((a, b) => {
    const rankDiff = getCourseRank(a) - getCourseRank(b)
    if (rankDiff !== 0) return rankDiff
    return String(a.titulo || a.title || '').localeCompare(String(b.titulo || b.title || ''), 'es')
  })

  if(cursos.length === 0) return null

  return (
    <section id="informatica" className="section-padding">
      <div className="container">
        <div className="section-header">
          <div>
            <h3 className="section-title">Capacítate con Nosotros</h3>
            <p className="section-subtitle">Domina las herramientas digitales esenciales</p>
          </div>
          <a href="/cursos-informatica" className="section-link">Ver todos <i className="bi bi-arrow-right"></i></a>
        </div>

        {/* Subtítulos: lista de cursos (p. ej. Excel, Power BI) */}
        <div className="mb-3">
          {(info?.cursos || []).map((s, i) => (
            <span key={i} className="badge bg-secondary bg-opacity-10 text-dark me-2 mb-2">{s}</span>
          ))}
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
