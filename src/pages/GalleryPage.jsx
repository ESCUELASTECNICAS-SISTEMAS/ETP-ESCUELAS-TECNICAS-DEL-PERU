import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

const ALLOWED_CATEGORIES = ['promociones', 'testimonios', 'administrativo']

const CATEGORY_META = {
  promociones:    { icon: 'bi-megaphone',    color: '#e74c3c' },
  testimonios:    { icon: 'bi-chat-quote',   color: '#2ecc71' },
  administrativo: { icon: 'bi-building',     color: '#3498db' },
}

export default function GalleryPage(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [lightbox, setLightbox] = useState(null) // index in filtered

  useEffect(()=>{
    let mounted = true
    const load = async () => {
      setLoading(true)
      try{
        const res = await axios.get(endpoints.MEDIA)
        if(!mounted) return
        const data = (res.data || [])
          .filter(m => m.active && m.category && ALLOWED_CATEGORIES.includes(m.category.toLowerCase()))
          .map(m => ({ ...m, category: m.category.toLowerCase() }))
        setItems(data)
      }catch(e){ console.error('gallery fetch', e) }
      finally{ if(mounted) setLoading(false) }
    }
    load()
    return ()=>{ mounted = false }
  }, [])

  const filtered = category ? items.filter(i => i.category === category) : items

  // lightbox navigation
  const openLightbox = (idx) => setLightbox(idx)
  const closeLightbox = () => setLightbox(null)
  const goPrev = useCallback(() => setLightbox(i => (i > 0 ? i - 1 : filtered.length - 1)), [filtered.length])
  const goNext = useCallback(() => setLightbox(i => (i < filtered.length - 1 ? i + 1 : 0)), [filtered.length])

  // keyboard nav
  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox, goPrev, goNext])

  const lbItem = lightbox !== null ? filtered[lightbox] : null

  return (
    <div className="container section-padding">
      <style>{`
        .gallery-hero { text-align:center; padding: 2.5rem 0 1.5rem; }
        .gallery-hero h2 { font-family: Poppins, sans-serif; font-weight: 700; font-size: clamp(1.8rem,4vw,2.8rem); letter-spacing:-.03em; }
        .gallery-hero p { color:#6c757d; font-size:1.05rem; max-width:520px; margin:0 auto; }
        .gallery-filters { display:flex; justify-content:center; gap:.6rem; flex-wrap:wrap; margin-bottom:2rem; }
        .gallery-filters .gf-btn { border:2px solid #dee2e6; background:#fff; border-radius:50px; padding:.45rem 1.2rem; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .25s; display:inline-flex; align-items:center; gap:6px; }
        .gallery-filters .gf-btn:hover { border-color:var(--accent); color:var(--accent); }
        .gallery-filters .gf-btn.active { background:var(--accent); color:#fff; border-color:var(--accent); }
        .gallery-grid { columns: 3 280px; column-gap: 1rem; }
        .gallery-card { break-inside:avoid; margin-bottom:1rem; border-radius:12px; overflow:hidden; position:relative; cursor:pointer; box-shadow:0 2px 12px rgba(0,0,0,.08); transition:transform .3s,box-shadow .3s; }
        .gallery-card:hover { transform:translateY(-4px); box-shadow:0 8px 28px rgba(0,0,0,.15); }
        .gallery-card img { width:100%; display:block; transition:transform .4s; }
        .gallery-card:hover img { transform:scale(1.04); }
        .gallery-card .overlay { position:absolute; inset:0; background:linear-gradient(transparent 50%,rgba(0,0,0,.6)); opacity:0; transition:opacity .3s; display:flex; flex-direction:column; justify-content:flex-end; padding:1rem; color:#fff; }
        .gallery-card:hover .overlay { opacity:1; }
        .gallery-card .overlay .cat-badge { font-size:.75rem; background:rgba(255,255,255,.2); backdrop-filter:blur(4px); border-radius:20px; padding:2px 10px; display:inline-block; margin-bottom:4px; width:fit-content; }
        .gallery-card .overlay .alt-text { font-size:.85rem; font-weight:600; }
        /* lightbox */
        .lb-overlay { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,.88); display:flex; align-items:center; justify-content:center; animation:lbFadeIn .25s; }
        @keyframes lbFadeIn { from{opacity:0} to{opacity:1} }
        .lb-img { max-width:90vw; max-height:85vh; border-radius:10px; box-shadow:0 12px 40px rgba(0,0,0,.5); object-fit:contain; }
        .lb-close { position:absolute; top:18px; right:22px; background:none; border:none; color:#fff; font-size:2rem; cursor:pointer; opacity:.8; }
        .lb-close:hover { opacity:1; }
        .lb-arrow { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,.15); backdrop-filter:blur(6px); border:none; color:#fff; font-size:1.6rem; width:48px; height:48px; border-radius:50%; cursor:pointer; display:grid; place-items:center; transition:background .2s; }
        .lb-arrow:hover { background:rgba(255,255,255,.3); }
        .lb-arrow.left { left:16px; }
        .lb-arrow.right { right:16px; }
        .lb-caption { position:absolute; bottom:18px; left:50%; transform:translateX(-50%); color:#fff; text-align:center; font-size:.95rem; max-width:80vw; }
        .lb-counter { position:absolute; top:20px; left:22px; color:rgba(255,255,255,.7); font-size:.85rem; }
      `}</style>

      {/* Hero */}
      <div className="gallery-hero">
        <h2>Galería ETP</h2>
        <p>Descubre nuestras actividades, promociones y testimonios de la comunidad ETP.</p>
      </div>

      {/* Filters */}
      <div className="gallery-filters">
        <button className={`gf-btn${category === '' ? ' active' : ''}`} onClick={()=>setCategory('')}>
          <i className="bi bi-grid-3x3-gap"></i> Todas
        </button>
        {ALLOWED_CATEGORIES.map(c => {
          const meta = CATEGORY_META[c] || {}
          return (
            <button key={c} className={`gf-btn${category === c ? ' active' : ''}`} onClick={()=>setCategory(c)}>
              <i className={`bi ${meta.icon || 'bi-tag'}`}></i> {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Cargando...</span></div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-image" style={{fontSize:'3rem'}}></i>
          <p className="mt-2">No hay imágenes en esta categoría.</p>
        </div>
      )}

      <div className="gallery-grid">
        {filtered.map((m, idx) => {
          const meta = CATEGORY_META[m.category] || {}
          return (
            <div key={m.id} className="gallery-card" onClick={()=>openLightbox(idx)}>
              <img src={m.url} alt={m.alt_text || ''} loading="lazy" />
              <div className="overlay">
                <span className="cat-badge" style={{borderLeft:`3px solid ${meta.color || '#fff'}`}}>
                  <i className={`bi ${meta.icon || 'bi-tag'} me-1`}></i>{m.category}
                </span>
                {m.alt_text && <span className="alt-text">{m.alt_text}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lbItem && (
        <div className="lb-overlay" onClick={closeLightbox}>
          <div className="lb-counter">{lightbox + 1} / {filtered.length}</div>
          <button className="lb-close" onClick={closeLightbox}><i className="bi bi-x-lg"></i></button>
          <button className="lb-arrow left" onClick={e=>{e.stopPropagation();goPrev()}}><i className="bi bi-chevron-left"></i></button>
          <img className="lb-img" src={lbItem.url} alt={lbItem.alt_text || ''} onClick={e=>e.stopPropagation()} />
          <button className="lb-arrow right" onClick={e=>{e.stopPropagation();goNext()}}><i className="bi bi-chevron-right"></i></button>
          {lbItem.alt_text && <div className="lb-caption">{lbItem.alt_text}</div>}
        </div>
      )}
    </div>
  )
}
