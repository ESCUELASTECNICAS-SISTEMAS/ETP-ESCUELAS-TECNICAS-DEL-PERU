import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import CourseCard from '../components/UI/CourseCard'

export default function CursosPage(){
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('todos')

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

  // Filtrar solo cursos generales (no talleres, no informatica, no cinco_meses)
  const cursosGenerales = cursos.filter(c => {
    const tipo = (c.tipo || c.type || '').toLowerCase()
    return !tipo || tipo === 'curso' || tipo === 'cursos'
  })

  // Filtrar por búsqueda y categoría
  const cursosFiltrados = useMemo(() => {
    let resultado = cursosGenerales

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      resultado = resultado.filter(c =>
        (c.titulo || c.title || '').toLowerCase().includes(term) ||
        (c.subtitle || c.descripcion || '').toLowerCase().includes(term)
      )
    }

    if (selectedFilter !== 'todos') {
      resultado = resultado.filter(c => {
        const modalidad = String(c.modalidad || c.mode || '').toLowerCase()
        if (selectedFilter === 'virtual') return modalidad.includes('virtual')
        if (selectedFilter === 'presencial') return modalidad.includes('presencial')
        if (selectedFilter === 'oferta') return Boolean(c.oferta || c.en_oferta)
        return true
      })
    }

    return resultado
  }, [cursosGenerales, searchTerm, selectedFilter])

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="cursos-skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-body">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
        <div className="skeleton-footer"></div>
      </div>
    </div>
  )

  return (
    <div className="cursos-page">
      {/* Hero Moderno */}
      <section className="cursos-hero">
        <div className="cursos-hero-bg">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="container cursos-hero-content">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <span className="cursos-badge">
                <i className="bi bi-collection-fill me-2"></i>
                Catálogo 2025
              </span>
              <h1 className="cursos-title">
                Cursos Profesionales
                <span className="title-highlight">ETP</span>
              </h1>
              <p className="cursos-subtitle">
                Descubre nuestra oferta de formación técnica diseñada para impulsar tu carrera profesional. 
                Aprende con expertos y certifícate con validez nacional.
              </p>
              <div className="cursos-stats">
                <div className="stat-item">
                  <span className="stat-number">{cursosGenerales.length}+</span>
                  <span className="stat-label">Cursos</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">15+</span>
                  <span className="stat-label">Años de experiencia</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">50k+</span>
                  <span className="stat-label">Graduados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Barra de Filtros */}
      <section className="cursos-filters">
        <div className="container">
          <div className="filters-wrapper">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
            <div className="filter-chips">
              {[
                { id: 'todos', label: 'Todos', icon: 'grid-fill' },
                { id: 'presencial', label: 'Presencial', icon: 'building-fill' },
                { id: 'virtual', label: 'Virtual', icon: 'laptop-fill' },
                { id: 'oferta', label: 'En Oferta', icon: 'tag-fill' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  className={`filter-chip ${selectedFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  <i className={`bi bi-${filter.icon}`}></i>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="cursos-content">
        <div className="container">
          {/* Results bar */}
          {!loading && (
            <div className="results-bar">
              <span className="results-count">
                {cursosFiltrados.length} {cursosFiltrados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
              </span>
              {(searchTerm || selectedFilter !== 'todos') && (
                <button
                  className="clear-filters"
                  onClick={() => { setSearchTerm(''); setSelectedFilter('todos') }}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="cursos-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="cursos-empty">
              <div className="empty-illustration">
                <i className="bi bi-search"></i>
              </div>
              <h3>No encontramos cursos</h3>
              <p>Intenta ajustar tu búsqueda o filtros para encontrar lo que necesitas.</p>
              {(searchTerm || selectedFilter !== 'todos') && (
                <button
                  className="btn-reset"
                  onClick={() => { setSearchTerm(''); setSelectedFilter('todos') }}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Ver todos los cursos
                </button>
              )}
            </div>
          ) : (
            <div className="cursos-grid">
              {cursosFiltrados.map((c, i) => (
                <div
                  className="curso-item"
                  key={c.id || i}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <CourseCard item={c} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
