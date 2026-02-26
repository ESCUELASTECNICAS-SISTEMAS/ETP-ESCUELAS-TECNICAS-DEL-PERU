import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function NoticiaDetail() {
  const { id } = useParams()
  const [noticia, setNoticia] = useState(null)
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await axios.get(`${endpoints.NEWS}/${id}`)
        if (!mounted) return
        const n = res.data
        setNoticia(n)
        if (n && n.featured_media_id) {
          try {
            const mRes = await axios.get(`${endpoints.MEDIA}/${n.featured_media_id}`)
            if (!mounted) return
            setMedia(mRes.data)
          } catch (e) {
            console.error('fetch media', e)
          }
        }
      } catch (e) {
        console.error('fetch noticia', e)
        setNoticia(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <div className="container py-5">Cargando noticia...</div>

  if (!noticia) return (
    <div className="container py-5">
      <p>Noticia no encontrada.</p>
      <Link to="/noticias" className="btn btn-outline-primary btn-sm">Volver a noticias</Link>
    </div>
  )

  const extractContent = (n) => {
    if (!n) return ''
    if (n.content && typeof n.content === 'object' && n.content.rendered) return n.content.rendered
    if (n.excerpt && typeof n.excerpt === 'object' && n.excerpt.rendered) return n.excerpt.rendered
    if (n.content_html) return n.content_html
    if (n.content && typeof n.content === 'string') return n.content
    if (n.descripcion) return n.descripcion
    if (n.description) return n.description
    if (n.body) return n.body
    if (n.summary) return n.summary
    if (n.excerpt && typeof n.excerpt === 'string') return n.excerpt
    if (n.resumen) return n.resumen
    return ''
  }

  const contentHtml = extractContent(noticia)
  const titleText = noticia.title || noticia.titulo || noticia.name || 'Noticia'
  const dateText = noticia.published_at
    ? new Date(noticia.published_at).toLocaleString()
    : (noticia.fecha || noticia.publishedOn || '')

  const resolveMediaUrl = (m) => {
    if (!m) return null
    if (m.url) return m.url
    if (m.source_url) return m.source_url
    if (m.sourceUrl) return m.sourceUrl
    if (m.guid && m.guid.rendered) return m.guid.rendered
    if (m.media_details && m.media_details.sizes) {
      const sizes = m.media_details.sizes
      if (sizes.large && sizes.large.source_url) return sizes.large.source_url
      if (sizes.full && sizes.full.source_url) return sizes.full.source_url
      const first = Object.values(sizes).find(s => s && s.source_url)
      if (first) return first.source_url
    }
    return null
  }

  const mediaUrl = media
    ? resolveMediaUrl(media)
    : (noticia.image || noticia.image_url || noticia.featured_media_url || noticia.media?.url || null)

  // ────────────────────────────────────────────────────────────────
  // CORRECCIÓN: generamos shareUrl de forma segura sin doble slash
  // ────────────────────────────────────────────────────────────────
  let shareId = noticia.id ?? noticia.ID ?? noticia._id
  if (!shareId) {
    const raw = (noticia.slug || noticia.slugified || noticia.slug_name || '') + ''
    const cleaned = raw.replace(/^\/+|\/+$/g, '') // quita slashes iniciales/finales
    const parts = cleaned.split('/').filter(Boolean)
    shareId = parts.length ? parts.pop() : cleaned
  }
  if (!shareId) shareId = noticia.id ?? noticia.ID ?? noticia._id ?? '0'

  // Forma segura: quitamos cualquier / final del origin y concatenamos
  const cleanOrigin = window.location.origin.replace(/\/+$/, '')
  const shareUrl = `${cleanOrigin}/noticia/${encodeURIComponent(shareId)}`
  // Alternativa con URL (también válida):
  // const shareUrl = new URL(`/noticia/${encodeURIComponent(shareId)}`, window.location.origin + '/').toString()

  return (
    <section className="py-5">
      <div className="container">
        <div className="mb-3">
          <Link to="/noticias" className="btn btn-link">← Volver a Noticias</Link>
        </div>

        {mediaUrl ? (
          <div className="mb-4 noticia-hero-wrapper">
            <img
              src={mediaUrl}
              alt={(media && (media.alt_text || media.alt)) || titleText}
              className="noticia-hero-img img-fluid rounded shadow-sm"
            />
            {(media && (media.caption || media.caption_text)) ? (
              <small
                className="text-muted d-block mt-2"
                dangerouslySetInnerHTML={{ __html: media.caption || media.caption_text }}
              />
            ) : null}
          </div>
        ) : null}

        <div className="row">
          <div className="col-12 col-lg-10 mx-auto">
            <div className="article-card p-4 mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-2">
                <div>
                  {(noticia.categoria || noticia.category) && (
                    <span className="news-badge me-2">{noticia.categoria || noticia.category}</span>
                  )}
                  <h1 className="mb-1">{titleText}</h1>
                  {dateText || noticia.author ? (
                    <div className="article-meta text-muted small">
                      {noticia.author ? <span className="me-2">Por <strong>{noticia.author}</strong></span> : null}
                      {dateText ? <span>{dateText}</span> : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 mt-md-0">
                  <div className="share-buttons d-flex gap-2">
                    <a
                      className="btn btn-outline-primary btn-sm"
                      href={`mailto:?subject=${encodeURIComponent(titleText)}&body=${encodeURIComponent(shareUrl)}`}
                      aria-label="Compartir por email"
                    >
                      ✉️ Email
                    </a>
                    <a
                      className="btn btn-outline-success btn-sm"
                      href={`https://wa.me/?text=${encodeURIComponent(titleText + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* lead paragraph (primer párrafo) */}
              {(() => {
                const m = contentHtml && contentHtml.match(/<p[^>]*>(.*?)<\/p>/i)
                const lead = m ? m[1] : ''
                const rest = m ? contentHtml.replace(m[0], '') : contentHtml
                return (
                  <>
                    {lead ? (
                      <div
                        className="lead-paragraph mb-3"
                        dangerouslySetInnerHTML={{ __html: '<p>' + lead + '</p>' }}
                      />
                    ) : null}
                    <div
                      className="article-content"
                      dangerouslySetInnerHTML={{
                        __html:
                          rest ||
                          contentHtml ||
                          '<p className="text-muted">No hay contenido disponible para esta noticia.</p>',
                      }}
                    />
                  </>
                )
              })()}

              <div className="mt-4 d-flex">
                <Link to="/noticias" className="btn btn-outline-secondary">← Volver a noticias</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}