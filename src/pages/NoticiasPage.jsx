import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

// Componente para tarjeta de noticia
const NewsCard = ({ noticia, media, isFeatured = false }) => {
  const formattedDate = noticia.published_at 
    ? new Date(noticia.published_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : ''

  if (isFeatured) {
    return (
      <div className="card mb-5 border-0 shadow-sm">
        <div className="row g-0">
          <div className="col-12 col-lg-7">
            <div className="position-relative" style={{ minHeight: '400px' }}>
              {media ? (
                <img 
                  src={media.url} 
                  alt={media.alt_text || noticia.title}
                  className="w-100 h-100 object-fit-cover rounded-start"
                  style={{ objectFit: 'cover', minHeight: '400px' }}
                />
              ) : (
                <div className="bg-light h-100 d-flex align-items-center justify-content-center rounded-start" style={{ minHeight: '400px' }}>
                  <span className="text-muted">Sin imagen</span>
                </div>
              )}
              <div className="position-absolute bottom-0 start-0 w-100 p-4 text-white" 
                   style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                <span className="badge bg-primary mb-2">
                  {noticia.categoria || noticia.category || 'Noticia'}
                </span>
                <h2 className="h3 mb-2">{noticia.title || noticia.titulo}</h2>
                <p className="mb-0 small opacity-75">
                  <i className="bi bi-calendar3 me-2"></i>{formattedDate}
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="card-body h-100 d-flex flex-column p-4 p-lg-5">
              <p className="card-text text-secondary flex-grow-1">
                {(noticia.summary || noticia.resumen || '').slice(0, 220)}...
              </p>
              <div className="mt-4">
                <a href={`/noticia/${noticia.slug || noticia.id}`} className="btn btn-primary">
                  Leer noticia completa
                  <i className="bi bi-arrow-right ms-2"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card h-100 border-0 shadow-sm">
      <div style={{ height: '220px', overflow: 'hidden' }}>
        {media ? (
          <img 
            src={media.url} 
            alt={media.alt_text || noticia.title}
            className="w-100 h-100 object-fit-cover"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="bg-light h-100 d-flex align-items-center justify-content-center">
            <span className="text-muted">Sin imagen</span>
          </div>
        )}
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge bg-primary">
            {noticia.categoria || noticia.category || 'Noticia'}
          </span>
        </div>
      </div>
      
      <div className="card-body d-flex flex-column">
        <div className="mb-2">
          <p className="text-muted small mb-0">
            <i className="bi bi-calendar3 me-2"></i>{formattedDate}
          </p>
        </div>
        
        <h5 className="card-title mb-3">
          {noticia.title || noticia.titulo}
        </h5>
        
        <p className="card-text text-secondary mb-4">
          {(noticia.summary || noticia.resumen || '').substring(0, 120)}...
        </p>
        
        <div className="mt-auto">
          <a 
            href={`/noticia/${noticia.slug || noticia.id}`} 
            className="btn btn-outline-primary btn-sm"
          >
            Leer más
            <i className="bi bi-chevron-right ms-2"></i>
          </a>
        </div>
      </div>
    </div>
  )
}

// Componente principal
export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([])
  const [mediaList, setMediaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      try {
        const [newsResponse, mediaResponse] = await Promise.all([
          axios.get(endpoints.NEWS),
          axios.get(endpoints.MEDIA)
        ])
        
        if (!mounted) return
        
        const allNews = Array.isArray(newsResponse.data) ? newsResponse.data : []
        const medias = Array.isArray(mediaResponse.data) ? mediaResponse.data : []
        
        // Filter published and active news
        const visibleNews = allNews.filter(n => 
          n && n.published === true && n.active !== false
        )
        
        setNoticias(visibleNews)
        setMediaList(medias)
        setError(null)
      } catch (error) {
        console.error('Error loading news:', error)
        setError('No se pudieron cargar las noticias. Por favor, intenta más tarde.')
        setNoticias([])
        setMediaList([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    loadData()
    return () => { mounted = false }
  }, [])

  const findMedia = (id) => {
    if (!id) return null
    return mediaList.find(m => String(m.id) === String(id))
  }

  const [featuredNews, ...remainingNews] = noticias

  // Estado de carga
  if (loading) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando noticias...</p>
          </div>
        </div>
      </section>
    )
  }

  // Estado de error
  if (error) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="text-center py-5">
            <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3 d-block"></i>
            <h3 className="mb-3">Oops! Algo salió mal</h3>
            <p className="text-muted mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-5 bg-light">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3">
            Actualidad
          </span>
          <h1 className="display-4 fw-bold mb-3">Noticias y Seminarios</h1>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '700px' }}>
            Mantente informado sobre eventos, cursos y convocatorias. 
            Descubre las últimas novedades y actualizaciones.
          </p>
        </div>

        {/* Contenido */}
        {noticias.length > 0 ? (
          <>
            {/* Noticia destacada */}
            {featuredNews && (
              <NewsCard 
                noticia={featuredNews} 
                media={findMedia(featuredNews.featured_media_id)} 
                isFeatured={true}
              />
            )}

            {/* Título de sección para noticias recientes */}
            {remainingNews.length > 0 && (
              <div className="mb-4">
                <h2 className="h3 fw-bold mb-2">Noticias Recientes</h2>
                <div className="border-bottom border-primary" style={{ width: '100px', height: '3px' }}></div>
              </div>
            )}

            {/* Grid de noticias */}
            <div className="row g-4">
              {remainingNews.map((noticia) => (
                <div className="col-12 col-md-6 col-lg-4" key={noticia.id}>
                  <NewsCard 
                    noticia={noticia} 
                    media={findMedia(noticia.featured_media_id)}
                  />
                </div>
              ))}
            </div>

            {/* Redes sociales */}
            <div className="mt-5 pt-4">
              <div className="bg-primary text-white rounded-3 p-4 p-lg-5 text-center">
                <h3 className="h4 mb-3">¡Síguenos en nuestras redes sociales!</h3>
                <p className="mb-4 opacity-75">
                  Mantente informado de todas las novedades, eventos y noticias importantes siguiéndonos en Facebook e Instagram.
                </p>
                <div className="d-flex justify-content-center gap-4">
                  <a href="https://www.facebook.com/etp.ica" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-lg rounded-pill px-4 d-flex align-items-center gap-2">
                    <i className="bi bi-facebook fs-4 text-primary"></i> Facebook
                  </a>
                  <a href="https://www.instagram.com/etp_ica/" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-lg rounded-pill px-4 d-flex align-items-center gap-2">
                    <i className="bi bi-instagram fs-4 text-danger"></i> Instagram
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
            <h3 className="h4 mb-2">No hay noticias disponibles</h3>
            <p className="text-muted">Pronto publicaremos nuevas actualizaciones.</p>
          </div>
        )}
      </div>
    </section>
  )
}