import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import CourseCard from '../components/UI/CourseCard'

export default function TalleresPage() {
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
          } catch (e) {
            console.warn('media fetch failed', e)
          }
        }
        const mapped = apiCursos.map(c => ({
          ...c,
          titulo: c.title || c.titulo || c.name,
          modalidad: c.modalidad || c.mode || c.modality || '',
          descripcion: c.description || c.descripcion || c.subtitle || '',
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

  const talleres = cursos.filter(c => {
    const tipo = (c.tipo || c.type || '').toLowerCase()
    return tipo === 'cursos_talleres' || tipo === 'taller' || tipo === 'talleres'
  })

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <div className="container">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#1976d2', width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : talleres.length === 0 ? (
          <div className="text-center py-5">
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
            }}>
              <i className="bi bi-inbox" style={{ fontSize: '2rem', color: '#1976d2' }}></i>
            </div>
            <h4 style={{ color: '#1565c0', fontWeight: '600' }}>No hay talleres disponibles</h4>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-5">
              <div style={{
                display: 'inline-block',
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                marginBottom: '1rem',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <i className="bi bi-tools me-2"></i>
                Formación Práctica
              </div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: '#0d47a1',
                marginBottom: '1rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Cursos Talleres
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#1565c0',
                marginBottom: '2rem'
              }}>
                Capacitación rápida para ingresar al mundo laboral
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2rem',
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '1rem 2rem',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.1)'
              }}>
                <div className="text-center">
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                    {talleres.length}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#5e92f3' }}>Talleres</div>
                </div>
                <div style={{ width: '1px', height: '30px', backgroundColor: '#bbdefb' }}></div>
                <div className="text-center">
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>
                    2-3
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#66bb6a' }}>Meses</div>
                </div>
                <div style={{ width: '1px', height: '30px', backgroundColor: '#bbdefb' }}></div>
                <div className="text-center">
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#ffb74d' }}>Práctico</div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="row g-4">
              {talleres.map((c, i) => (
                <div className="col-12 col-md-6 col-lg-4" key={i}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(25, 118, 210, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(25, 118, 210, 0.15)'
                  }}>
                    <CourseCard item={c} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
