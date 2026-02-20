import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function NoticiaDetail(){
  const { id } = useParams()
  const [noticia, setNoticia] = useState(null)
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try{
        const res = await axios.get(`${endpoints.NEWS}/${id}`)
        if(!mounted) return
        const n = res.data
        setNoticia(n)
        if(n && n.featured_media_id){
          try{
            const mRes = await axios.get(`${endpoints.MEDIA}/${n.featured_media_id}`)
            if(!mounted) return
            setMedia(mRes.data)
          }catch(e){ console.error('fetch media', e) }
        }
      }catch(e){ console.error('fetch noticia', e); setNoticia(null) }
      finally{ if(mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [id])

  if(loading) return <div className="container py-5">Cargando noticia...</div>
  if(!noticia) return (
    <div className="container py-5">
      <p>Noticia no encontrada.</p>
      <Link to="/noticias" className="btn btn-outline-primary btn-sm">Volver a noticias</Link>
    </div>
  )

  return (
    <section className="py-5">
      <div className="container">
        <div className="mb-4">
          <Link to="/noticias" className="btn btn-link">← Volver</Link>
        </div>

        {media ? (
          <div className="mb-4">
            <img src={media.url} alt={media.alt_text || noticia.title || 'imagen'} className="img-fluid w-100 rounded" style={{objectFit:'cover'}} />
          </div>
        ) : null}

        <h1 className="mb-2">{noticia.title || noticia.titulo}</h1>
        <p className="text-muted small mb-4">{noticia.published_at ? new Date(noticia.published_at).toLocaleString() : ''}</p>

        <div className="content mb-5" dangerouslySetInnerHTML={{ __html: noticia.content || noticia.descripcion || noticia.body || '' }} />

        <div className="d-flex justify-content-between align-items-center">
          <div></div>
          <Link to="/noticias" className="btn btn-outline-secondary">Volver a noticias</Link>
        </div>
      </div>
    </section>
  )
}
