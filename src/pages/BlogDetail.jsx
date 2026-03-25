import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { endpoints } from '../utils/apiStatic';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

  .blog-detail-root {
    --ink: #1e1b1a;
    --ink-light: #5e5652;
    --ink-faint: #a09894;
    --paper: #fefaf5;
    --paper-dark: #f6f0e9;
    --accent: #b13e2e;
    --accent-warm: #cd5c3b;
    --accent-soft: rgba(177, 62, 46, 0.08);
    --border: rgba(30, 27, 26, 0.1);
    --border-dark: rgba(30, 27, 26, 0.2);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    background: var(--paper);
    min-height: 100vh;
    line-height: 1.5;
  }

  /* Breadcrumb */
  .blog-breadcrumb {
    padding: 18px 0;
    border-bottom: 1px solid var(--border);
    background: rgba(254, 250, 245, 0.96);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }
  .blog-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-light);
    text-decoration: none;
    border: none;
    background: none;
    cursor: pointer;
    padding: 6px 0;
    transition: all 0.2s ease;
  }
  .blog-back-btn:hover { color: var(--accent); gap: 12px; }
  .blog-back-btn svg { transition: transform 0.2s; }
  .blog-back-btn:hover svg { transform: translateX(-5px); }

  /* Hero Sections */
  .blog-hero {
    animation: fadeIn 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) both;
  }
  .hero-single {
    display: flex;
    justify-content: center;
    background: var(--paper-dark);
    padding: 48px 0;
  }
  .hero-single img {
    max-width: min(780px, 90vw);
    max-height: 560px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 16px;
    box-shadow: 0 25px 45px -12px rgba(0,0,0,0.25);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .hero-single img:hover {
    transform: scale(1.01);
    box-shadow: 0 30px 55px -12px rgba(0,0,0,0.3);
  }
  .hero-grid {
    display: grid;
    gap: 6px;
    background: var(--paper-dark);
    overflow: hidden;
  }
  .hero-grid img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: all 0.4s ease;
  }
  .hero-grid img:hover {
    transform: scale(1.02);
    filter: brightness(0.98);
  }
  .grid-2 {
    grid-template-columns: 1fr 1fr;
    max-height: 480px;
  }
  .grid-3 {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    max-height: 520px;
  }
  .grid-3 img:first-child {
    grid-row: 1 / 3;
    height: 100%;
  }
  @media (max-width: 680px) {
    .grid-2, .grid-3 {
      grid-template-columns: 1fr;
      max-height: none;
    }
    .grid-3 img:first-child {
      grid-row: auto;
    }
    .hero-single { padding: 32px 0; }
  }

  /* Article Container */
  .blog-article {
    max-width: 780px;
    margin: 0 auto;
    padding: 56px 28px 88px;
  }

  /* Category */
  .blog-category {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 4px 14px;
    border-radius: 40px;
    margin-bottom: 28px;
  }
  .blog-category::before {
    content: "✦";
    font-size: 0.65rem;
  }

  /* Title */
  .blog-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.2rem, 6vw, 3.6rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin: 0 0 24px;
  }

  /* Byline */
  .blog-byline {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 28px 0 24px;
    border-top: 2px solid var(--ink);
    border-bottom: 1px solid var(--border);
    margin-bottom: 56px;
  }
  .blog-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid var(--paper-dark);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .blog-avatar-placeholder {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--ink);
    color: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 500;
    flex-shrink: 0;
  }
  .blog-author-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ink);
    margin: 0 0 4px;
    letter-spacing: -0.2px;
  }
  .blog-date {
    font-size: 0.75rem;
    color: var(--ink-faint);
    letter-spacing: 0.03em;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .blog-date::before {
    content: "•";
    font-size: 1rem;
  }

  /* Typography - Enhanced */
  .blog-body {
    font-size: 1.08rem;
    line-height: 1.75;
    color: var(--ink-light);
  }
  .blog-body p {
    margin: 0 0 1.6em;
  }
  /* Headings with better hierarchy */
  .blog-body h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.8rem;
    font-weight: 600;
    margin: 2em 0 0.5em;
    color: var(--ink);
    letter-spacing: -0.01em;
    line-height: 1.3;
  }
  .blog-body h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 500;
    margin: 1.8em 0 0.6em;
    color: var(--ink);
    font-style: italic;
  }
  .blog-body h4 {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 2em 0 0.8em;
    color: var(--accent);
  }
  /* Links */
  .blog-body a {
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1.5px solid rgba(177, 62, 46, 0.3);
    transition: all 0.2s ease;
    font-weight: 500;
  }
  .blog-body a:hover {
    color: var(--accent-warm);
    border-bottom-color: var(--accent-warm);
  }
  /* Blockquote - more dramatic */
  .blog-body blockquote {
    margin: 2.2em 0;
    padding: 0.2em 0 0.2em 2em;
    border-left: 4px solid var(--accent);
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.2rem;
    font-style: italic;
    color: var(--ink);
    background: var(--accent-soft);
    border-radius: 0 16px 16px 0;
  }
  /* Pull quotes styling */
  .blog-body blockquote p:first-child::before {
    content: "“";
    font-size: 2rem;
    line-height: 0.8;
    margin-right: 4px;
    color: var(--accent);
  }
  /* Lists */
  .blog-body ul, .blog-body ol {
    margin: 1.2em 0 1.8em 1.4em;
    padding: 0;
  }
  .blog-body li {
    margin-bottom: 0.6em;
  }
  .blog-body li::marker {
    color: var(--accent);
    font-weight: bold;
  }
  /* Images inside content */
  .blog-body img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 2em auto;
    display: block;
    box-shadow: 0 10px 30px -12px rgba(0,0,0,0.15);
    cursor: pointer;
    transition: all 0.25s;
  }
  .blog-body img:hover {
    box-shadow: 0 20px 40px -12px rgba(0,0,0,0.25);
    transform: scale(1.01);
  }
  /* Code */
  .blog-body pre {
    background: #1e1b1a;
    color: #e4e2dd;
    border-radius: 16px;
    padding: 1.4rem;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 2em 0;
    font-family: 'Monaco', 'Menlo', monospace;
  }
  .blog-body code {
    background: var(--paper-dark);
    padding: 0.2em 0.5em;
    border-radius: 8px;
    font-size: 0.85em;
    font-family: monospace;
  }
  /* Tables */
  .blog-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 2em 0;
    font-size: 0.9rem;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .blog-body th {
    background: var(--paper-dark);
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
  }
  .blog-body td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }
  .blog-body tr:last-child td {
    border-bottom: none;
  }
  /* Horizontal rule */
  .blog-body hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    margin: 3em 0;
  }

  /* Modal */
  .blog-modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.88);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
  }
  .blog-modal img {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    animation: zoomIn 0.2s ease;
  }
  .blog-modal-close {
    position: absolute;
    top: 24px;
    right: 32px;
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .blog-modal-close:hover {
    background: rgba(255,255,255,0.3);
  }

  /* Skeleton */
  .blog-skeleton {
    max-width: 780px;
    margin: 60px auto;
    padding: 0 28px;
  }
  .skel-block {
    background: linear-gradient(90deg, #f0ece6 25%, #e5dfd8 50%, #f0ece6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  /* Error */
  .blog-error-card {
    max-width: 480px;
    margin: 100px auto;
    padding: 56px 40px;
    text-align: center;
    background: var(--paper);
    border-radius: 32px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.05);
  }
  .err-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 20px;
  }
  .blog-error-card h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    margin: 0 0 12px;
  }
  .btn-outline-ink, .btn-solid-ink {
    display: inline-block;
    padding: 10px 24px;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 40px;
    transition: all 0.2s;
    margin: 0 6px;
    cursor: pointer;
    font-family: inherit;
  }
  .btn-outline-ink {
    border: 1.5px solid var(--ink);
    color: var(--ink);
    background: transparent;
  }
  .btn-outline-ink:hover {
    background: var(--ink);
    color: var(--paper);
  }
  .btn-solid-ink {
    background: var(--ink);
    color: var(--paper);
    border: none;
  }
  .btn-solid-ink:hover {
    background: var(--accent);
    transform: translateY(-2px);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @media (max-width: 680px) {
    .blog-article { padding: 32px 20px 64px; }
    .blog-title { font-size: 1.8rem; }
    .blog-body h2 { font-size: 1.5rem; }
    .blog-body blockquote { font-size: 1rem; padding-left: 1.2rem; }
  }
`;

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    window.__blogImgClick = (src) => setModalImg(src);
    return () => { delete window.__blogImgClick; };
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoints.BLOGS);
        const found = res.data.find(b => b.slug === slug);
        if (!found) throw new Error('Blog no encontrado');
        if (!found.content && found.id) {
          try {
            const detailRes = await axios.get(`${endpoints.BLOGS}/${found.id}`);
            setBlog({ ...found, ...detailRes.data });
          } catch {
            setBlog(found);
          }
        } else {
          setBlog(found);
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  const getContent = () => {
    if (!blog) return '';
    if (blog.content_rendered) return blog.content_rendered;
    if (blog.content_html) return blog.content_html;
    if (blog.content) {
      if (typeof blog.content === 'object' && blog.content.rendered) return blog.content.rendered;
      if (typeof blog.content === 'string') return blog.content;
    }
    if (blog.body) return blog.body;
    return '<p>No hay contenido disponible para este artículo.</p>';
  };

  const processContent = (html) => {
    if (!html) return html;
    return html.replace(
      /<img([^>]*?)(\/?)\s*>/gi,
      '<img$1 style="cursor:pointer; max-width:100%; height:auto; border-radius:12px;" onclick="window.__blogImgClick && window.__blogImgClick(this.src)" />'
    );
  };

  const renderHero = () => {
    const imgs = blog?.featured_media_urls;
    if (!imgs?.length) return null;

    const count = imgs.length;
    if (count === 1) {
      return (
        <div className="hero-single">
          <img src={imgs[0]} alt={blog.title} onClick={() => setModalImg(imgs[0])} />
        </div>
      );
    }
    if (count === 2) {
      return (
        <div className="hero-grid grid-2">
          {imgs.map((url, i) => (
            <img key={i} src={url} alt={`${blog.title} - imagen ${i+1}`} onClick={() => setModalImg(url)} />
          ))}
        </div>
      );
    }
    return (
      <div className="hero-grid grid-3">
        {imgs.slice(0, 3).map((url, i) => (
          <img key={i} src={url} alt={`${blog.title} - imagen ${i+1}`} onClick={() => setModalImg(url)} />
        ))}
      </div>
    );
  };

  return (
    <div className="blog-detail-root">
      <style>{styles}</style>

      <nav className="blog-breadcrumb">
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 28px' }}>
          <button className="blog-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </nav>

      {loading && (
        <div className="blog-skeleton">
          <div className="skel-block" style={{ height: 460, marginBottom: 48 }} />
          <div className="skel-block" style={{ height: 28, width: '35%' }} />
          <div className="skel-block" style={{ height: 68, width: '90%' }} />
          <div className="skel-block" style={{ height: 60, width: '70%', marginBottom: 40 }} />
          {[88, 92, 75, 65, 80, 55].map((w, i) => (
            <div key={i} className="skel-block" style={{ height: 16, width: `${w}%` }} />
          ))}
        </div>
      )}

      {!loading && (error || !blog) && (
        <div className="blog-error-card">
          <span className="err-icon">📖</span>
          <h2>Artículo no encontrado</h2>
          <p>El artículo que buscas no existe o fue movido a otra dirección.</p>
          <div>
            <button className="btn-outline-ink" onClick={() => navigate(-1)}>Regresar</button>
            <Link to="/" className="btn-solid-ink">Ir al inicio</Link>
          </div>
        </div>
      )}

      {!loading && blog && (
        <>
          <div className="blog-hero">{renderHero()}</div>

          <article className="blog-article">
            {blog.category?.name && (
              <div><span className="blog-category">{blog.category.name}</span></div>
            )}

            <h1 className="blog-title">{blog.title}</h1>

            <div className="blog-byline">
              {blog.author?.avatar ? (
                <img src={blog.author.avatar} alt={blog.author.name} className="blog-avatar" />
              ) : (
                <div className="blog-avatar-placeholder">
                  {blog.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              <div>
                {blog.author?.name && <p className="blog-author-name">{blog.author.name}</p>}
                {blog.published_at && (
                  <span className="blog-date">
                    {new Date(blog.published_at).toLocaleDateString('es-PE', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>

            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: processContent(getContent()) }}
            />
          </article>
        </>
      )}

      {modalImg && (
        <div className="blog-modal" onClick={() => setModalImg(null)}>
          <button className="blog-modal-close" onClick={() => setModalImg(null)}>✕</button>
          <img src={modalImg} alt="Vista ampliada" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}