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

        <div className="row g-4">
          {noticias.map((n) => {
            const m = findMedia(n.featured_media_id)
            return (
              <div className="col-12 col-md-6" key={n.id}>
                <div className="card h-100">
                  <div className="row g-0">
                    {m ? (
                      <div className="col-4 d-none d-sm-block">
                        <img src={m.url} alt={m.alt_text||'imagen'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      </div>
                    ) : (
                      <div className="col-4 d-none d-sm-block">
                        <div style={{height: '100%', background: 'linear-gradient(90deg,var(--primary),var(--accent))'}}></div>
                      </div>
                    )}
                    <div className="col">
                      <div className="card-body">
                        <h5 className="card-title">{n.title || n.titulo || 'Sin título'}</h5>
                        <p className="text-muted small">{n.published_at ? `Fecha: ${new Date(n.published_at).toLocaleString()}` : ''}</p>
                        <p>{n.summary || n.resumen || ''}</p>
                        <a href={`/noticia/${n.id}`} className="btn btn-outline-primary btn-sm">Leer más</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
