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
    return () => { mounted = false }
  }, [id])

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="text-muted fw-semibold">Cargando noticia…</p>
    </div>
  )

  // ── Not found ────────────────────────────────────────────────────
  if (!noticia) return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '60vh' }}>
      <div className="mb-4" style={{ fontSize: '4rem', lineHeight: 1 }}>📭</div>
      <h2 className="fw-bold mb-2">Noticia no encontrada</h2>
      <p className="text-muted mb-4">Es posible que haya sido eliminada o movida.</p>
      <Link to="/noticia" className="btn btn-primary px-4 rounded-pill">
        ← Volver a noticia
      </Link>
    </div>
  )

  // ── Helpers ──────────────────────────────────────────────────────
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

  const resolveMediaUrl = (m) => {
    if (!m) return null
    if (m.url) return m.url
    if (m.source_url) return m.source_url
    if (m.sourceUrl) return m.sourceUrl
    if (m.guid && m.guid.rendered) return m.guid.rendered
    if (m.media_details && m.media_details.sizes) {
      const sizes = m.media_details.sizes
      if (sizes.large?.source_url) return sizes.large.source_url
      if (sizes.full?.source_url) return sizes.full.source_url
      const first = Object.values(sizes).find(s => s?.source_url)
      if (first) return first.source_url
    }
    return null
  }

  const contentHtml = extractContent(noticia)
  const titleText = noticia.title || noticia.titulo || noticia.name || 'Noticia'
  const dateText = noticia.published_at
    ? new Date(noticia.published_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
    : (noticia.fecha || noticia.publishedOn || '')
  const category = noticia.categoria || noticia.category || null
  const author = noticia.author || null

  const mediaUrl = media
    ? resolveMediaUrl(media)
    : (noticia.image || noticia.image_url || noticia.featured_media_url || noticia.media?.url || null)

  let shareId = noticia.id ?? noticia.ID ?? noticia._id
  if (!shareId) {
    const raw = (noticia.slug || noticia.slugified || noticia.slug_name || '') + ''
    const cleaned = raw.replace(/^\/+|\/+$/g, '')
    const parts = cleaned.split('/').filter(Boolean)
    shareId = parts.length ? parts.pop() : cleaned
  }
  if (!shareId) shareId = noticia.id ?? noticia.ID ?? noticia._id ?? '0'
  const BASE_URL = 'https://etp-escuelas-tecnicas-del-peru-production.up.railway.app'
  const shareUrl = `${BASE_URL}/noticia/${encodeURIComponent(shareId)}`

  // Split lead paragraph from rest of content
  const leadMatch = contentHtml && contentHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  const leadHtml = leadMatch ? '<p>' + leadMatch[1] + '</p>' : ''
  const restHtml = leadMatch ? contentHtml.replace(leadMatch[0], '') : contentHtml

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      {/* ── Inline styles injected once ── */}
      <style>{`
        .noticia-hero-img {
          width: 100%;
          max-height: 520px;
          object-fit: cover;
          border-radius: 1rem;
        }
        .article-content img {
          max-width: 100%;
          border-radius: .5rem;
          margin: 1rem 0;
        }
        .article-content p {
          line-height: 1.85;
          margin-bottom: 1.25rem;
        }
        .article-content h2,
        .article-content h3 {
          margin-top: 2rem;
          font-weight: 700;
        }
        .article-content a {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .lead-paragraph p {
          font-size: 1.2rem;
          line-height: 1.75;
          font-weight: 400;
          color: #374151;
        }
        .share-btn {
          transition: transform .15s, box-shadow .15s;
        }
        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,.15);
        }
        .divider-bar {
          width: 3.5rem;
          height: 4px;
          border-radius: 99px;
          background: #0d6efd;
          margin-bottom: 1.5rem;
        }
      `}</style>

      <section className="py-5 bg-light" style={{ minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '860px' }}>

          {/* ── Breadcrumb / back ── */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb align-items-center mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-muted small fw-semibold">Inicio</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/noticia" className="text-decoration-none text-muted small fw-semibold">Noticia</Link>
              </li>
              <li className="breadcrumb-item active text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                {titleText}
              </li>
            </ol>
          </nav>

          {/* ── Main card ── */}
          <article className="bg-white rounded-4 shadow-sm overflow-hidden">

            {/* Hero image */}
            {mediaUrl && (
              <div className="position-relative">
                <img
                  src={mediaUrl}
                  alt={(media && (media.alt_text || media.alt)) || titleText}
                  className="noticia-hero-img"
                  style={{ borderRadius: '1rem 1rem 0 0', maxHeight: '480px' }}
                />
                {/* Category pill over image */}
                {category && (
                  <span
                    className="position-absolute top-0 start-0 m-3 badge text-uppercase fw-semibold px-3 py-2 rounded-pill"
                    style={{ fontSize: '.7rem', letterSpacing: '.08em', background: '#0d6efd', color: '#fff' }}
                  >
                    {category}
                  </span>
                )}
                {/* Image caption */}
                {media && (media.caption || media.caption_text) && (
                  <p
                    className="text-muted small text-center py-2 mb-0 bg-light"
                    dangerouslySetInnerHTML={{ __html: media.caption || media.caption_text }}
                  />
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-4 p-md-5">

              {/* Category (no image) */}
              {category && !mediaUrl && (
                <span
                  className="badge text-uppercase fw-semibold px-3 py-2 rounded-pill mb-3 d-inline-block"
                  style={{ fontSize: '.7rem', letterSpacing: '.08em', background: '#e8f0fe', color: '#0d6efd' }}
                >
                  {category}
                </span>
              )}

              {/* Title */}
              <h1 className="fw-bold mb-3 lh-sm" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
                {titleText}
              </h1>

              {/* Decorative bar */}
              <div className="divider-bar" />

              {/* Meta row */}
              {(author || dateText) && (
                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                  {author && (
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: '36px', height: '36px', fontSize: '.8rem', flexShrink: 0 }}
                      >
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold small lh-sm">{author}</div>
                        <div className="text-muted" style={{ fontSize: '.72rem' }}>Autor</div>
                      </div>
                    </div>
                  )}
                  {dateText && (
                    <div className="d-flex align-items-center gap-1 text-muted small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                      </svg>
                      <span>{dateText}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Separator ── */}
              <hr className="mb-4" />

              {/* Lead paragraph */}
              {leadHtml && (
                <div
                  className="lead-paragraph mb-4 pb-2"
                  dangerouslySetInnerHTML={{ __html: leadHtml }}
                />
              )}

              {/* Article body */}
              <div
                className="article-content"
                style={{ color: '#1f2937' }}
                dangerouslySetInnerHTML={{
                  __html: restHtml || contentHtml || '<p class="text-muted">No hay contenido disponible para esta noticia.</p>',
                }}
              />

              {/* ── Footer ── */}
              <hr className="mt-5 mb-4" />

              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
                {/* Back button */}
                <Link to="/noticia" className="btn btn-outline-secondary rounded-pill px-4">
                  ← Volver a noticia
                </Link>

                {/* Share buttons */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="text-muted small fw-semibold me-1">Compartir:</span>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(titleText + ' ' + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm rounded-pill share-btn"
                    style={{ background: '#25D366', color: '#fff', border: 'none' }}
                    title="WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                    <span className="ms-1 d-none d-sm-inline">WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm rounded-pill share-btn"
                    style={{ background: '#1877F2', color: '#fff', border: 'none' }}
                    title="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                    </svg>
                    <span className="ms-1 d-none d-sm-inline">Facebook</span>
                  </a>

                  {/* Copy link */}
                  <button
                    className="btn btn-sm btn-outline-secondary rounded-pill share-btn"
                    title="Copiar enlace"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        // brief feedback
                        const btn = document.activeElement
                        const original = btn.innerHTML
                        btn.innerHTML = '✓ Copiado'
                        setTimeout(() => { btn.innerHTML = original }, 1800)
                      })
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                    </svg>
                    <span className="ms-1">Copiar</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* ── Back to top nudge ── */}
          <div className="text-center mt-5 mb-2">
            <Link to="/noticia" className="btn btn-link text-muted small text-decoration-none">
              ← Ver todas las noticia
            </Link>
          </div>

        </div>
      </section>
    </>
  )
}