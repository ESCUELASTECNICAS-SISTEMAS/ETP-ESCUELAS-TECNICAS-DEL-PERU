import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function NoticiasPage(){
  const [noticias, setNoticias] = useState([])
  const [mediaList, setMediaList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try{
        const [nRes, mRes] = await Promise.all([axios.get(endpoints.NEWS), axios.get(endpoints.MEDIA)])
        if(!mounted) return
        const allNews = Array.isArray(nRes.data) ? nRes.data : []
        const medias = Array.isArray(mRes.data) ? mRes.data : []
        // filter published and active
        const visible = allNews.filter(n => n && (n.published === true) && (n.active !== false))
        setNoticias(visible)
        setMediaList(medias)
      }catch(e){ console.error('load noticias', e); setNoticias([]); setMediaList([]) }
      finally{ if(mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [])

  const findMedia = (id) => (mediaList || []).find(m => String(m.id) === String(id))

  return (
    <section id="noticias-page" className="section-padding">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Noticias y Seminarios</h2>
          <p className="text-muted">Mantente informado sobre eventos, cursos y convocatorias.</p>
        </div>

        {loading && <div>Cargando noticias...</div>}

        {noticias.length > 0 ? (
          <>
            {/* Featured first news */}
            {noticias[0] && (() => {
              const n = noticias[0]
              const m = findMedia(n.featured_media_id)
              return (
                <div className="news-featured mb-4">
                  <div className="row g-0 align-items-center">
                    <div className="col-12 col-lg-7">
                      <div className="featured-media rounded overflow-hidden shadow-sm">
                        {m ? <img src={m.url} alt={m.alt_text||n.title} /> : <div className="featured-placeholder" />}
                        <div className="featured-overlay">
                          <span className="news-badge">{n.categoria || n.category || 'Noticia'}</span>
                          <h3 className="featured-title">{n.title || n.titulo}</h3>
                          <p className="text-white small mb-0">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-5">
                      <div className="p-4">
                        <p className="text-muted">{(n.summary || n.resumen || '').slice(0,220)}</p>
                        <a href={`/noticia/${n.id}`} className="btn btn-accent">Leer noticia</a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Grid for remaining news */}
            <div className="row g-4 news-grid">
              {noticias.slice(1).map((n) => {
                const m = findMedia(n.featured_media_id)
                return (
                  <div className="col-12 col-md-6 col-lg-4" key={n.id}>
                    <article className="news-card h-100">
                      <div className="media-wrap">
                        {m ? <img src={m.url} alt={m.alt_text||n.title} /> : <div className="media-placeholder" />}
                      </div>
                      <div className="card-body p-3 d-flex flex-column">
                        <div className="mb-2"><span className="news-badge">{n.categoria || n.category || 'Noticia'}</span></div>
                        <h5 className="mb-2">{n.title || n.titulo}</h5>
                        <p className="text-muted small mb-3">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ''}</p>
                        <p className="flex-grow-1 text-truncate-3">{n.summary || n.resumen || ''}</p>
                        <div className="mt-3">
                          <a href={`/noticia/${n.id}`} className="btn btn-outline-primary btn-sm">Leer más</a>
                        </div>
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-muted">No hay noticias disponibles.</div>
        )}

      </div>
    </section>
  )
}
