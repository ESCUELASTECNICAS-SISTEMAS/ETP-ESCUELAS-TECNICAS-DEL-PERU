import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import CourseCard from '../components/UI/CourseCard'

export default function CarrerasPage(){
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)

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
        const mapped = apiCursos
          .filter(c => c.active !== false && c.published !== false)
          .map(c => ({
            ...c,
            titulo: c.title || c.titulo || c.name,
            image: c.image || c.imagen || c.image_url || (c.thumbnail && c.thumbnail.url) || (c.media && c.media.url) || (c.thumbnail_media_id ? (media.find(m => String(m.id) === String(c.thumbnail_media_id)) || {}).url : null),
          }))
        if (mapped.length) setCarreras(mapped)
      } catch (err) {
        console.warn('fetch courses failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Filtrar solo carreras/programas (excluir talleres, informatica, cinco_meses)
  const carrerasAuxiliares = carreras.filter(c => {
    const tipo = (c.type || c.tipo || '').toLowerCase()
    return tipo !== 'cursos_talleres' && tipo !== 'ofimatica' && tipo !== 'cinco_meses' && tipo !== 'cinco meses' && tipo !== '5_meses' && tipo !== '5 meses' && tipo !== 'curso' && tipo !== 'cursos'
  }).sort((a, b) => {
    const orderA = getCarreraOrder(a)
    const orderB = getCarreraOrder(b)
    if (orderA !== orderB) return orderA - orderB
    return (a.title || a.titulo || '').localeCompare(b.title || b.titulo || '', 'es')
  })

  return (
    <div className="container py-5">
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
        </div>
      ) : carrerasAuxiliares.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox fs-1 text-muted"></i>
          <h4 className="mt-3 text-muted">No hay carreras disponibles</h4>
        </div>
      ) : (
        <div className="row g-4">
          {carrerasAuxiliares.map((c, i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i}>
              <CourseCard item={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

