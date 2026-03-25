import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

// Función para detectar URLs y convertirlas en enlaces
const linkifyText = (text) => {
  if (!text) return text
  
  // Regex para detectar URLs (http, https, ftp, www)
  const urlRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
  
  return text.replace(urlRegex, (url) => {
    let fullUrl = url
    if (!url.match(/^https?:\/\//)) {
      fullUrl = 'http://' + url
    }
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-primary fw-bold text-decoration-underline">${url}</a>`
  })
}

// Función para procesar el HTML y convertir URLs en enlaces
const processHtmlContent = (html) => {
  if (!html) return html
  
  // Crear un div temporal para manipular el HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Función recursiva para procesar nodos de texto
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      const linkedText = linkifyText(text)
      if (linkedText !== text) {
        const wrapper = document.createElement('span')
        wrapper.innerHTML = linkedText
        node.parentNode.replaceChild(wrapper, node)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'A') {
      Array.from(node.childNodes).forEach(processNode)
    }
  }
  
  Array.from(tempDiv.childNodes).forEach(processNode)
  return tempDiv.innerHTML
}

export default function NoticiaDetail() {
  const { slug } = useParams()
  const [noticia, setNoticia] = useState(null)
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await axios.get(`${endpoints.NEWS}/slug/${slug}`)
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
  }, [slug])

  // Barra de progreso de lectura
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  const processedContent = processHtmlContent(contentHtml)
  const titleText = noticia?.title || noticia?.titulo || noticia?.name || 'Noticia'
  const dateText = noticia?.published_at
    ? new Date(noticia.published_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
    : (noticia?.fecha || noticia?.publishedOn || '')
  const category = noticia?.categoria || noticia?.category || null
  const author = noticia?.author || null

  const mediaUrl = media
    ? resolveMediaUrl(media)
    : (noticia?.image || noticia?.image_url || noticia?.featured_media_url || noticia?.media?.url || null)

  let shareId = noticia?.id ?? noticia?.ID ?? noticia?._id
  if (!shareId) {
    const raw = (noticia?.slug || noticia?.slugified || noticia?.slug_name || '') + ''
    const cleaned = raw.replace(/^\/+|\/+$/g, '')
    const parts = cleaned.split('/').filter(Boolean)
    shareId = parts.length ? parts.pop() : cleaned
  }
  if (!shareId) shareId = noticia?.id ?? noticia?.ID ?? noticia?._id ?? '0'
  const BASE_URL = 'https://etp-escuelas-tecnicas-del-peru-production.up.railway.app'
  const shareUrl = `${BASE_URL}/noticia/${encodeURIComponent(shareId)}`

  const leadMatch = contentHtml && contentHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  const leadHtml = leadMatch ? '<p>' + leadMatch[1] + '</p>' : ''
  const restHtml = leadMatch ? contentHtml.replace(leadMatch[0], '') : contentHtml

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden">
        {/* Fondo animado */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #667eea 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          opacity: '0.15'
        }}></div>
        <div className="text-center position-relative z-1">
          <div className="spinner-grow text-primary mb-3" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h3 className="h4 text-primary fw-bold">Cargando noticia...</h3>
        </div>
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    )
  }

  if (!noticia) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'radial-gradient(circle at 20% 50%, #667eea 0%, transparent 50%), radial-gradient(circle at 80% 80%, #764ba2 0%, transparent 50%), radial-gradient(circle at 40% 20%, #f093fb 0%, transparent 50%)',
          opacity: '0.1'
        }}></div>
        <div className="text-center p-5 position-relative z-1">
          <div className="display-1 mb-4 text-primary" style={{ animation: 'float 3s ease-in-out infinite' }}>📰</div>
          <h2 className="fw-bold mb-3">Noticia no encontrada</h2>
          <p className="text-muted mb-4">Lo sentimos, la noticia que buscas no está disponible.</p>
          <Link to="/noticias" className="btn btn-primary btn-lg px-5 rounded-pill shadow-lg hover-lift">
            ← Volver a noticias
          </Link>
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
            transition: all 0.3s ease;
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        /* Fondo animado */
        .animated-bg {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          position: relative;
          overflow: hidden;
        }
        
        .animated-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(102,126,234,0.03) 0%, transparent 70%),
                      radial-gradient(circle at 80% 20%, rgba(118,75,162,0.05) 0%, transparent 50%),
                      radial-gradient(circle at 20% 80%, rgba(240,147,251,0.03) 0%, transparent 50%);
          animation: rotate 30s linear infinite;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Barra de progreso */
        .progress-bar-top {
          position: fixed;
          top: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          z-index: 9999;
          transition: width 0.1s ease;
          box-shadow: 0 0 10px rgba(102,126,234,0.5);
        }
        
        /* Card hover effects */
        .article-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: slideUp 0.6s ease-out;
        }
        
        .article-card:hover {
          transform: translateY(-10px) scale(1.01);
          box-shadow: 0 30px 60px rgba(0,0,0,0.12) !important;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Hero image zoom */
        .hero-image-container {
          overflow: hidden;
        }
        
        .hero-image {
          transition: transform 0.7s ease;
        }
        
        .hero-image-container:hover .hero-image {
          transform: scale(1.05);
        }
        
        /* Badge pulse */
        .badge-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(13,110,253,0.7); }
          70% { box-shadow: 0 0 0 15px rgba(13,110,253,0); }
          100% { box-shadow: 0 0 0 0 rgba(13,110,253,0); }
        }
        
        /* Content animations */
        .content-fade-in {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Share buttons */
        .share-btn {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          position: relative;
          overflow: hidden;
        }
        
        .share-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .share-btn:hover::before {
          width: 100%;
          height: 100%;
        }
        
        .share-btn:hover {
          transform: translateY(-5px) scale(1.1);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        /* Lead paragraph */
        .lead-highlight {
          position: relative;
          padding-left: 1.5rem;
          border-left: 4px solid #667eea;
          background: linear-gradient(90deg, rgba(102,126,234,0.05) 0%, transparent 100%);
          padding: 1.5rem;
          border-radius: 0 1rem 1rem 0;
          animation: slideInLeft 0.6s ease-out;
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        /* Breadcrumb glass effect */
        .breadcrumb-glass {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 30px rgba(0,0,0,0.1);
        }
        
        /* Reading progress indicator */
        .reading-indicator {
          position: relative;
        }
        
        .reading-indicator::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        
        .reading-indicator:hover::after {
          transform: scaleX(1);
        }
        
        /* Floating shapes decoration */
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: floatShape 20s infinite ease-in-out;
        }
        
        .shape-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: 10%;
          right: -150px;
          animation-delay: 0s;
        }
        
        .shape-2 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: 20%;
          left: -100px;
          animation-delay: 5s;
        }
        
        @keyframes floatShape {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        /* Typography enhancements */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Meta items hover */
        .meta-item {
          transition: all 0.3s ease;
        }
        
        .meta-item:hover {
          transform: translateX(5px);
          color: #667eea !important;
        }
        
        /* Link hover effect in content */
        .article-content a {
          position: relative;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .article-content a::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }
        
        .article-content a:hover::after {
          width: 100%;
        }
        
        /* Button back animation */
        .btn-back {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .btn-back:hover {
          padding-left: 2.5rem;
          padding-right: 2.5rem;
        }
        
        /* Category tag */
        .category-tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        
        .category-tag::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: rotate(45deg);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
      `}</style>

      {/* Barra de progreso de lectura */}
      <div className="progress-bar-top" style={{ width: `${scrollProgress}%` }}></div>

      <div className="animated-bg min-vh-100 position-relative">
        {/* Formas flotantes decorativas */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>

        <div className="container py-5 position-relative z-1">
          
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4 content-fade-in">
            <ol className="breadcrumb breadcrumb-glass rounded-pill px-4 py-2 d-inline-flex mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-primary fw-semibold hover-opacity">
                  <i className="bi bi-house-door me-1"></i>Inicio
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/noticias" className="text-decoration-none text-primary fw-semibold">Noticias</Link>
              </li>
              <li className="breadcrumb-item active text-truncate fw-bold" style={{ maxWidth: '250px' }}>
                {titleText}
              </li>
            </ol>
          </nav>

          {/* Main Article Card */}
          <article className="card article-card border-0 shadow-lg overflow-hidden bg-white">
            
            {/* Hero Image */}
            {mediaUrl && (
              <div className="hero-image-container position-relative">
                <img
                  src={mediaUrl}
                  alt={media?.alt_text || media?.alt || titleText}
                  className="hero-image w-100"
                  style={{ maxHeight: '550px', objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 start-0 w-100" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                  height: '200px'
                }}></div>
                {category && (
                  <div className="position-absolute top-0 start-0 m-4">
                    <span className="badge category-tag badge-pulse fs-6 px-4 py-2 rounded-pill text-white fw-bold shadow-lg">
                      <i className="bi bi-tag me-1"></i>
                      {category}
                    </span>
                  </div>
                )}
                {media?.caption && (
                  <div className="position-absolute bottom-0 start-0 w-100 text-center pb-3">
                    <span className="text-white-50 small">{media.caption}</span>
                  </div>
                )}
              </div>
            )}

            {/* Article Content */}
            <div className="card-body p-4 p-md-5">
              
              {!mediaUrl && category && (
                <div className="mb-3 content-fade-in">
                  <span className="badge category-tag fs-6 px-4 py-2 rounded-pill text-white fw-bold">
                    <i className="bi bi-tag me-1"></i>
                    {category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="display-4 fw-bold mb-4 gradient-text content-fade-in" style={{ animationDelay: '0.1s' }}>
                {titleText}
              </h1>

              {/* Meta Info */}
              <div className="d-flex flex-wrap align-items-center gap-4 mb-4 pb-4 border-bottom border-2 content-fade-in" style={{ animationDelay: '0.2s' }}>
                {author && (
                  <div className="d-flex align-items-center gap-3 meta-item cursor-pointer">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg"
                      style={{ 
                        width: '50px', 
                        height: '50px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      {author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold">{author}</div>
                      <div className="text-muted small text-uppercase tracking-wide">Autor</div>
                    </div>
                  </div>
                )}
                
                {dateText && (
                  <div className="d-flex align-items-center gap-2 text-muted meta-item">
                    <i className="bi bi-calendar3 fs-5 text-primary"></i>
                    <div>
                      <div className="fw-semibold">{dateText}</div>
                      <div className="small">Publicado</div>
                    </div>
                  </div>
                )}
                
                <div className="d-flex align-items-center gap-2 text-muted meta-item reading-indicator">
                  <i className="bi bi-clock fs-5 text-primary"></i>
                  <div>
                    <div className="fw-semibold">{Math.ceil(contentHtml.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min</div>
                    <div className="small">Lectura</div>
                  </div>
                </div>
              </div>

              {/* Lead Paragraph */}
              {leadHtml && (
                <div 
                  className="lead-highlight mb-4 fs-5 text-secondary content-fade-in"
                  style={{ animationDelay: '0.3s' }}
                  dangerouslySetInnerHTML={{ __html: processHtmlContent(leadHtml) }}
                />
              )}

              {/* Main Content */}
              <div
                className="article-content fs-5 lh-lg text-dark content-fade-in"
                style={{ animationDelay: '0.4s' }}
                dangerouslySetInnerHTML={{
                  __html: processHtmlContent(restHtml) || processHtmlContent(contentHtml) || '<p class="text-muted text-center py-5 fst-italic">No hay contenido disponible para esta noticia.</p>',
                }}
              />

              {/* Tags/Keywords section (if available) */}
              {noticia?.tags && (
                <div className="mt-5 pt-4 border-top content-fade-in" style={{ animationDelay: '0.5s' }}>
                  <h5 className="text-muted mb-3 text-uppercase small fw-bold tracking-wider">
                    <i className="bi bi-bookmarks me-2"></i>Etiquetas
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {noticia.tags.map((tag, idx) => (
                      <span key={idx} className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-5 pt-4 border-top border-2 content-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-4">
                  
                  {/* Back Button */}
                  <Link 
                    to="/noticias" 
                    className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold btn-back"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver a noticias
                  </Link>

                  {/* Share Section */}
                  <div className="d-flex flex-column align-items-start align-items-md-end gap-3">
                    <span className="text-muted small fw-bold text-uppercase tracking-wider">
                      <i className="bi bi-share me-1"></i>Compartir
                    </span>
                    <div className="d-flex gap-3">
                      
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(titleText + ' - ' + shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success rounded-circle share-btn d-flex align-items-center justify-content-center"
                        style={{ width: '50px', height: '50px' }}
                        title="WhatsApp"
                      >
                        <i className="bi bi-whatsapp fs-4"></i>
                      </a>

                      {/* Facebook */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary rounded-circle share-btn d-flex align-items-center justify-content-center"
                        style={{ width: '50px', height: '50px' }}
                        title="Facebook"
                      >
                        <i className="bi bi-facebook fs-4"></i>
                      </a>

                      {/* Twitter/X */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(titleText)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-dark rounded-circle share-btn d-flex align-items-center justify-content-center"
                        style={{ width: '50px', height: '50px' }}
                        title="X (Twitter)"
                      >
                        <i className="bi bi-twitter-x fs-4"></i>
                      </a>

                      {/* LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-info rounded-circle share-btn d-flex align-items-center justify-content-center"
                        style={{ width: '50px', height: '50px', backgroundColor: '#0077b5', borderColor: '#0077b5' }}
                        title="LinkedIn"
                      >
                        <i className="bi bi-linkedin fs-4"></i>
                      </a>

                      {/* Copy Link */}
                      <button
                        className={`btn ${copied ? 'btn-success' : 'btn-outline-secondary'} rounded-circle share-btn d-flex align-items-center justify-content-center`}
                        style={{ width: '50px', height: '50px' }}
                        onClick={handleCopyLink}
                        title="Copiar enlace"
                      >
                        <i className={`bi ${copied ? 'bi-check-lg' : 'bi-link-45deg'} fs-4`}></i>
                      </button>
                    </div>
                    
                    {copied && (
                      <span className="text-success small fw-bold animate-fade-in">
                        <i className="bi bi-check-circle me-1"></i>¡Enlace copiado!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Related Articles Suggestion */}
          <div className="mt-5 text-center content-fade-in" style={{ animationDelay: '0.7s' }}>
            <Link 
              to="/noticias" 
              className="btn btn-light btn-lg rounded-pill px-5 shadow-sm hover-lift fw-semibold"
            >
              <i className="bi bi-grid-3x3-gap-fill me-2 text-primary"></i>
              Ver todas las noticias
            </Link>
          </div>
        </div>
      </div>

      {/* Bootstrap Icons */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />
    </>
  )
}