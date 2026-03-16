import React, { useState, useEffect } from 'react'
// Noticias will be loaded from API (published + active)
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'
import CourseCard from '../UI/CourseCard'

export default function Carreras({ selectedSucursalId = null, selectedModalidad = null }){
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [carreras, setCarreras] = useState([])
  const [noticias, setNoticias] = useState([])

  useEffect(() => {
    if(!noticias || noticias.length === 0) return
    if(paused) return
    const id = setInterval(() => setCurrent(i => (i + 1) % noticias.length), 3500)
    return () => clearInterval(id)
  }, [paused, noticias])

  useEffect(() => {
    let mounted = true
    const loadNews = async () => {
      try{
        const res = await axios.get(endpoints.NEWS)
        if(!mounted) return
        const all = Array.isArray(res.data) ? res.data : []
        // load media list to resolve featured images (best-effort)
        let medias = []
        try{ const mres = await axios.get(endpoints.MEDIA); medias = Array.isArray(mres.data)?mres.data:[] }catch(e){}
        const visible = all.filter(n => n && (n.published === true) && (n.active !== false))
        const mapped = visible.map(n => ({
          ...n,
          titulo: n.title || n.titulo || n.name,
          resumen: n.summary || n.resumen || n.excerpt || '',
          image: n.image || n.image_url || (n.featured_media_id ? ((medias.find(m => String(m.id) === String(n.featured_media_id))||{}).url) : (n.media && n.media.url)) || '/assets/images/Hero1.jpg'
        }))
        setNoticias(mapped)
      }catch(err){ console.error('fetch noticias', err); setNoticias([]) }
    }
    loadNews()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try{
        const res = await axios.get(endpoints.COURSES)
        if(!mounted) return
        const apiCursos = Array.isArray(res.data) ? res.data : []
        const needsMedia = apiCursos.some(c => c.thumbnail_media_id)
        let media = []
        if(needsMedia){ try{ const mres = await axios.get(endpoints.MEDIA); media = Array.isArray(mres.data)?mres.data:[] }catch(e){} }
        const mapped = apiCursos
          .filter(c => c.published !== false && c.active !== false)
          .map(c => ({
            ...c,
            titulo: c.title || c.titulo || c.name,
            modalidad: c.modalidad || c.mode || c.modality || '',
            descripcion: c.description || c.descripcion || c.subtitle || '',
            image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m=>String(m.id)===String(c.thumbnail_media_id))||{}).url : null),
          }))
        if (mapped.length) setCarreras(mapped)
      }catch(err){ /* keep local */ }
    }
    load()
    return () => { mounted = false }
  }, [])

  const prev = () => setCurrent(i => (i - 1 + noticias.length) % noticias.length)
  const next = () => setCurrent(i => (i + 1) % noticias.length)

  const normalize = (s = '') => String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const getCarreraOrder = (c) => {
    const t = normalize(c.title || c.titulo || c.name || '')
    if (t.includes('apoyo') && t.includes('administrativo')) return 1
    if (t.includes('asistencia') && t.includes('contabilidad')) return 2
    if (t.includes('reparacion') && t.includes('mantenimiento') && (t.includes('computadora') || t.includes('laptop'))) return 3
    return 99
  }

  const carrerasAuxiliares = carreras.filter(c => {
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
    const tipo = String((c.type || c.tipo || '')).toLowerCase()
    // Only include explicit 'carr' types
    return tipo.includes('carr')
  }).sort((a, b) => {
    const orderA = getCarreraOrder(a)
    const orderB = getCarreraOrder(b)
    if (orderA !== orderB) return orderA - orderB
    return (a.title || a.titulo || '').localeCompare(b.title || b.titulo || '', 'es')
  })

  if(carrerasAuxiliares.length === 0) return null

  return (
    <section id="carreras" className="section-padding">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-9">
            <div className="section-header">
              <div>
                <h3 className="section-title">Carreras</h3>
                <p className="section-subtitle">Formación técnica con certificación oficial</p>
              </div>
              <a href="/programas" className="section-link">Ver todas <i className="bi bi-arrow-right"></i></a>
            </div>

            <div className="row g-4">
              {carrerasAuxiliares.map((c, i) => (
                <div className="col-12 col-md-4" key={i}>
                  <CourseCard item={c} />
                </div>
              ))}
            </div>
          </div>

          <aside className="col-12 col-md-3 d-none d-md-block">
            <div className="news-aside" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              <h5 className="mb-3">Noticias</h5>
              {noticias && noticias.length > 0 && (
                <div className="news-viewport" style={{height: Math.min(4, noticias.length) * 86 + 'px'}}>
                  <div className="news-list" style={{transform: `translateY(-${current * 86}px)`}}>
                    {noticias.map((n, idx) => (
                      <a href="/noticias" key={idx} className="news-item card small-card text-decoration-none text-dark">
                        <div className="row g-0">
                          <div className="col-4">
                            <img src={n.image || '/assets/images/Hero1.jpg'} alt={n.titulo} className="img-fluid rounded-start" style={{height:'100%',objectFit:'cover'}} />
                          </div>
                          <div className="col-8">
                            <div className="card-body py-2 px-2">
                              <h6 className="card-title mb-1" style={{fontSize:'.92rem'}}>{n.titulo}</h6>
                              <p className="small text-muted mb-0">{n.resumen}</p>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={prev} aria-label="Anterior noticia">↑</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={next} aria-label="Siguiente noticia">↓</button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
