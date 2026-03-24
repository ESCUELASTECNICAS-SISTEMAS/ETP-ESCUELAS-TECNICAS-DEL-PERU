import React, { useEffect, useState } from 'react'
import './index.css'
import Navbar from './components/layout/Navbar'
import ToastContainer from './setupReactToastify'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CursosPage from './pages/CursosPage'
import CarrerasPage from './pages/CarrerasPage'
import CursosInformatica from './pages/TalleresInformatica'
import TalleresPage from './pages/TalleresPage'
import CincoMesesPage from './pages/CincoMesesPage'
import CourseDetail from './pages/CourseDetail'
import NoticiasPage from './pages/NoticiasPage'
import NoticiaDetail from './pages/NoticiaDetail'
import NosoatrosPage from './pages/NosoatrosPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminCarousel from './pages/AdminCarousel'
import AdminMedia from './pages/AdminMedia'
import AdminCourses from './pages/AdminCourses'
import AdminUsers from './pages/AdminUsers'
import AdminLoginEvents from './pages/AdminLoginEvents'
import GalleryPage from './pages/GalleryPage'
import AdminGallery from './pages/AdminGallery'
import AdminCertificaciones from './pages/AdminCertificaciones'
import AdminDocentes from './pages/AdminDocentes'
import AdminConvenios from './pages/AdminConvenios'
import AdminSeminarios from './pages/AdminSeminarios'
import AdminNoticias from './pages/AdminNoticias'
import AdminSocialLinks from './pages/AdminSocialLinks'
import AdminTips from './pages/AdminTips'
import AdminNosotros from './pages/AdminNosotros'
import AdminPreinscripciones from './pages/AdminPreinscripciones'
import AdminBlog from './pages/AdminBlog'
import AdminRoute from './components/layout/AdminRoute'
import { Routes, Route, useLocation } from 'react-router-dom'
import { sendVisit } from './utils/visits'
import BlogDetail from './pages/BlogDetail'
import BlogsPage from './pages/BlogsPage'

/* ── Sedes ─────────────────────────────────────────────────────── */
const SEDES = [
  {
    id: 'ica',
    label: 'Ica',
    telefono: '900424028',
    redes: [
      { network: 'facebook',  value: 'https://www.facebook.com/etp.ica' },
      { network: 'instagram', value: 'https://www.instagram.com/etp_ica/' },
    ],
  },
  {
    id: 'arequipa',
    label: 'Arequipa',
    telefono: '962825490',
    redes: [
      { network: 'facebook',  value: 'https://www.facebook.com/etp.arequipa' },
      { network: 'instagram', value: 'https://www.instagram.com/etp_arequipa/' },
    ],
  },
]

function buildWaHref(telefono, msg) {
  const digits = String(telefono || '').replace(/\D/g, '')
  if (!digits) return '#'
  const num = digits.startsWith('51') ? digits : '51' + digits
  return `https://wa.me/${num}?text=${encodeURIComponent(msg || '')}`
}

function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    sendVisit({ path: pathname, referrer: document.referrer || undefined })
  }, [pathname])
  return null
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 50)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pathname, hash])
  return null
}

/* ================================================================
   App principal
   ================================================================ */
export default function App() {
  const [waModalOpen, setWaModalOpen]   = useState(false)
  const [hideWaOnHero, setHideWaOnHero] = useState(false)
  const [sedeId, setSedeId]             = useState(() => localStorage.getItem('etp_sede_id') || 'ica')

  useEffect(() => {
    localStorage.setItem('etp_sede_id', sedeId)
    const sede = SEDES.find(s => s.id === sedeId) || SEDES[0]
    window.dispatchEvent(new CustomEvent('etp:sucursal:change', { detail: { id: sede.id, telefono: sede.telefono } }))
  }, [sedeId])

  useEffect(() => {
    const el = document.getElementById('heroCarousel')
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => setHideWaOnHero(en.intersectionRatio > 0.4))
    }, { threshold: [0, 0.1, 0.4, 0.6, 1] })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const sede = SEDES.find(s => s.id === sedeId) || SEDES[0]

  function handleWaSubmit(nombre, cel) {
    const msg = `¡Hola! 👋 Me interesa inscribirme. Mi nombre es ${nombre} y mi celular es ${cel}. ¿Me pueden dar más información?`
    window.open(buildWaHref(sede.telefono, msg), '_blank', 'noopener')
    setWaModalOpen(false)
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <RouteTracker />
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<NosoatrosPage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/programas" element={<CarrerasPage />} />
          <Route path="/talleres" element={<TalleresPage />} />
          <Route path="/cinco-meses" element={<CincoMesesPage />} />
          <Route path="/cursos-informatica" element={<CursosInformatica />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          <Route path="/noticia/:id" element={<NoticiaDetail />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/nosotros" element={<NosoatrosPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/carousel" element={<AdminRoute><AdminCarousel /></AdminRoute>} />
          <Route path="/admin/media" element={<AdminRoute><AdminMedia /></AdminRoute>} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/admin/gallery" element={<AdminRoute><AdminGallery /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/login-events" element={<AdminRoute><AdminLoginEvents /></AdminRoute>} />
          <Route path="/admin/certificaciones" element={<AdminRoute><AdminCertificaciones /></AdminRoute>} />
          <Route path="/admin/certificaciones/:courseId" element={<AdminRoute><AdminCertificaciones /></AdminRoute>} />
          <Route path="/admin/docentes" element={<AdminRoute><AdminDocentes /></AdminRoute>} />
          <Route path="/admin/convenios" element={<AdminRoute><AdminConvenios /></AdminRoute>} />
          <Route path="/admin/seminarios" element={<AdminRoute><AdminSeminarios /></AdminRoute>} />
          <Route path="/admin/noticias" element={<AdminRoute><AdminNoticias /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
          <Route path="/admin/social" element={<AdminRoute><AdminSocialLinks /></AdminRoute>} />
          <Route path="/admin/nosotros" element={<AdminRoute><AdminNosotros /></AdminRoute>} />
          <Route path="/admin/tips" element={<AdminRoute><AdminTips /></AdminRoute>} />
          <Route path="/admin/pre-inscripciones" element={<AdminRoute><AdminPreinscripciones /></AdminRoute>} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/programa/:id" element={<CourseDetail />} />
        </Routes>
      </main>
      <Footer />

      {/* ── Panel flotante ─────────────────────────────────────────── */}
      <FloatingPanel
        sede={sede}
        sedes={SEDES}
        sedeId={sedeId}
        setSedeId={setSedeId}
        hideWa={hideWaOnHero}
        onOpenModal={() => setWaModalOpen(true)}
      />

      {/* ── Modal WhatsApp ─────────────────────────────────────────── */}
      {waModalOpen && (
        <WaModal
          sede={sede}
          sedes={SEDES}
          sedeId={sedeId}
          setSedeId={setSedeId}
          onClose={() => setWaModalOpen(false)}
          onSubmit={handleWaSubmit}
        />
      )}
      <ToastContainer />
    </div>
  )
}

/* ================================================================
   Panel flotante
   ================================================================ */
const NET_CONFIG = {
  facebook:  { icon: 'bi bi-facebook',  bg: '#1877F2' },
  instagram: { icon: 'bi bi-instagram', bg: 'radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)' },
}

function FloatingPanel({ sede, sedes, sedeId, setSedeId, hideWa, onOpenModal }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 20,
      zIndex: 1080,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 10,
    }}>
      {/* Sede toggle */}
      <div style={{
        background: 'rgba(15,15,25,0.82)',
        backdropFilter: 'blur(14px)',
        borderRadius: 999,
        padding: '4px 5px',
        display: 'flex',
        gap: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {sedes.map(s => (
          <button
            key={s.id}
            onClick={() => setSedeId(s.id)}
            style={{
              borderRadius: 999,
              border: 'none',
              padding: '5px 14px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all .22s cubic-bezier(.4,0,.2,1)',
              background: sedeId === s.id ? 'linear-gradient(120deg,#a855f7,#3b82f6)' : 'transparent',
              color: sedeId === s.id ? '#fff' : 'rgba(255,255,255,0.55)',
              boxShadow: sedeId === s.id ? '0 2px 10px rgba(168,85,247,0.45)' : 'none',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Redes sociales */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(sede.redes || []).map((r, i) => {
          const net = r.network.toLowerCase()
          const cfg = NET_CONFIG[net] || { icon: 'bi bi-link', bg: '#555' }
          return (
            <a
              key={i}
              href={r.value}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={r.network}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.15rem', color: '#fff',
                background: cfg.bg,
                boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
                textDecoration: 'none',
                transition: 'transform .18s, box-shadow .18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.38)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.28)' }}
            >
              <i className={cfg.icon} aria-hidden="true" />
            </a>
          )
        })}
      </div>

      {/* Botón WhatsApp */}
      {!hideWa && (
        <button
          onClick={onOpenModal}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 999, border: 'none',
            background: 'linear-gradient(120deg,#22c55e,#16a34a)',
            color: '#fff', fontWeight: 800, fontSize: '0.95rem',
            letterSpacing: '0.02em', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(34,197,94,0.45)',
            transition: 'transform .18s, box-shadow .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,197,94,0.45)' }}
        >
          <i className="bi bi-whatsapp" style={{ fontSize: '1.1rem' }} />
          <span>¡Inscríbete ahora!</span>
        </button>
      )}
    </div>
  )
}

/* ================================================================
   Modal WhatsApp — rediseñado
   ================================================================ */
function WaModal({ sede, sedes, sedeId, setSedeId, onClose, onSubmit }) {
  const [nombre, setNombre] = useState('')
  const [cel,    setCel]    = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim() || !cel.trim()) return
    onSubmit(nombre.trim(), cel.trim())
  }

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <>
      <style>{`
        @keyframes waFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes waSlideUp { from { opacity:0; transform:translateY(28px) scale(.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        .wa-left-panel { display: none !important; }
        @media (min-width: 640px) { .wa-left-panel { display: flex !important; } }
        .wa-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; }
        .wa-send-btn:hover { transform: scale(1.02); box-shadow: 0 8px 28px rgba(22,163,74,0.52) !important; }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1090,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)',
        animation: 'waFadeIn .2s ease',
      }} />

      {/* Contenedor centrado */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1091,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: 840,
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.45)',
          display: 'flex',
          animation: 'waSlideUp .28s cubic-bezier(.4,0,.2,1)',
        }}>

          {/* ── Panel izquierdo (foto + copy) ── */}
          <div className="wa-left-panel" style={{
            flex: '0 0 42%', position: 'relative',
            minHeight: 500, flexDirection: 'column',
          }}>
            <img
              src="/assets/images/chico_ventana_flotante.jpeg"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
            {/* Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(170deg,rgba(88,28,135,0.6) 0%,rgba(15,23,42,0.85) 100%)',
            }} />
            {/* Contenido */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '36px 30px' }}>
              {/* Live badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999,
                padding: '6px 16px', marginBottom: 20, width: 'fit-content',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
                  boxShadow: '0 0 8px #4ade80, 0 0 16px #4ade8066',
                  animation: 'none',
                }} />
                <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em' }}>ASESORES EN LÍNEA AHORA</span>
              </div>

              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.7rem', lineHeight: 1.18, marginBottom: 12 }}>
                Tu futuro<br />empieza hoy 🚀
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
                Más de <strong style={{ color: '#fff' }}>10,000 egresados</strong> ya cambiaron<br />su vida estudiando con nosotros.
              </p>

              {/* Stats rápidos */}
              <div style={{ display: 'flex', gap: 16 }}>
                {[['🎓','Certificación\noficial'],['⚡','Respuesta\nen minutos'],['💼','Bolsa de\ntrabajo']].map(([icon, txt]) => (
                  <div key={txt} style={{
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 12, padding: '10px 12px', textAlign: 'center', flex: 1,
                  }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
                    <div style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{txt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Panel derecho (formulario) ── */}
          <div style={{ flex: 1, background: '#fff', padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: '#9333ea', marginBottom: 5, textTransform: 'uppercase' }}>
                  ¡Es gratis y sin compromiso!
                </p>
                <h3 style={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f0f1a', margin: 0, lineHeight: 1.2 }}>
                  Habla con un asesor 💬
                </h3>
              </div>
              <button onClick={onClose} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '0.95rem', color: '#6b7280', flexShrink: 0, marginLeft: 12,
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Sede selector — segmented */}
            <div style={{
              display: 'flex', gap: 6, marginBottom: 22,
              background: '#f3f4f6', borderRadius: 14, padding: 5,
            }}>
              {sedes.map(s => (
                <button key={s.id} type="button" onClick={() => setSedeId(s.id)} style={{
                  flex: 1, borderRadius: 10, border: 'none', padding: '10px 0',
                  fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all .2s',
                  background: sedeId === s.id ? '#fff' : 'transparent',
                  color: sedeId === s.id ? '#7c3aed' : '#9ca3af',
                  boxShadow: sedeId === s.id ? '0 2px 10px rgba(0,0,0,0.09)' : 'none',
                }}>
                  📍 Sede {s.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Tu nombre completo
                </label>
                <input
                  className="wa-input"
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: María Fernández"
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '2px solid #e5e7eb', fontSize: '0.92rem',
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                    transition: 'border-color .18s, box-shadow .18s',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                  Número de celular
                </label>
                <input
                  className="wa-input"
                  type="tel"
                  value={cel}
                  onChange={e => setCel(e.target.value)}
                  placeholder="Ej: 987 654 321"
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '2px solid #e5e7eb', fontSize: '0.92rem',
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                    transition: 'border-color .18s, box-shadow .18s',
                  }}
                />
              </div>

              {/* Indicador de sede activa */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 12, padding: '11px 14px',
              }}>
                <i className="bi bi-whatsapp" style={{ color: '#16a34a', fontSize: '1.15rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.79rem', color: '#166534', fontWeight: 600 }}>
                  Un asesor de <strong>Sede {sede.label}</strong> te escribirá en minutos
                </span>
              </div>

              {/* Botón enviar */}
              <button
                type="submit"
                className="wa-send-btn"
                style={{
                  padding: '15px 0', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(120deg,#16a34a,#22c55e)',
                  color: '#fff', fontWeight: 800, fontSize: '1rem',
                  letterSpacing: '0.02em', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  boxShadow: '0 6px 22px rgba(22,163,74,0.42)',
                  transition: 'transform .18s, box-shadow .18s', marginTop: 2,
                }}
              >
                <i className="bi bi-whatsapp" style={{ fontSize: '1.1rem' }} />
                Quiero asesoría gratis ahora
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>
                🔒 Tus datos son confidenciales y no serán compartidos
              </p>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}