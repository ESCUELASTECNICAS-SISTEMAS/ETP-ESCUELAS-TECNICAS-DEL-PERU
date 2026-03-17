import React, { useEffect, useState } from 'react'
import './index.css'
import Navbar from './components/layout/Navbar'
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
import axios from 'axios'
import { endpoints } from './utils/apiStatic'

const DEFAULT_WA_MESSAGE = 'Buenas%20%F0%9F%91%8B%20vengo%20de%20su%20p%C3%A1gina%20web%20y%20deseo%20m%C3%A1s%20informaci%C3%B3n%20de%20los%20cursos%2C%20por%20favor%20%F0%9F%98%8A'

function formatWaHref(number) {
  if (!number) return '#'
  const digits = String(number).replace(/\D/g, '')
  if (!digits) return '#'
  let num = digits
  if (!num.startsWith('51')) {
    num = num.replace(/^0+/, '')
    if (!num.startsWith('51')) num = '51' + num
  }
  return `https://wa.me/${num}?text=${DEFAULT_WA_MESSAGE}`
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
  const [waModalOpen, setWaModalOpen] = useState(false)
  const [hideWaOnHero, setHideWaOnHero] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState(() => {
    try {
      const raw = localStorage.getItem('etp_selected_sucursal')
      return raw ? JSON.parse(raw) : null
    } catch (e) { return null }
  })

  useEffect(() => {
    const onChange = (ev) => setSelectedSucursal(ev?.detail || null)
    window.addEventListener('etp:sucursal:change', onChange)
    return () => window.removeEventListener('etp:sucursal:change', onChange)
  }, [])

  useEffect(() => {
    const el = document.getElementById('heroCarousel')
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => setHideWaOnHero(en.intersectionRatio > 0.4))
    }, { threshold: [0, 0.1, 0.4, 0.6, 1] })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  function getWhatsappNumberFromSelection() {
    try {
      const s = selectedSucursal
      if (s && s.telefono) return s.telefono
    } catch (e) {}
    return '950 340 502'
  }

  function openWaWithMessage(number, message) {
    const digits = String(number || '').replace(/\D/g, '')
    if (!digits) return
    let num = digits
    if (!num.startsWith('51')) {
      num = num.replace(/^0+/, '')
      if (!num.startsWith('51')) num = '51' + num
    }
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message || '')}`, '_blank', 'noopener')
  }

  function handleWaSubmit() {
    const dni = document.getElementById('wa_dni')?.value || ''
    const cel = document.getElementById('wa_cel')?.value || ''
    const n = getWhatsappNumberFromSelection()
    openWaWithMessage(n, `Hola, me inscribo desde la web. DNI: ${dni} - Celular: ${cel}`)
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

      {/* Floating social + WhatsApp pill */}
      <div
        className="position-fixed bottom-0 end-0 p-3 d-flex flex-column align-items-end gap-2"
        style={{ zIndex: 1080 }}
      >
        <SocialLinksButtons selectedSucursal={selectedSucursal} />
        <hr className="w-100 my-0 border-secondary opacity-25" />
        {!hideWaOnHero && (
          <button
            onClick={() => setWaModalOpen(true)}
            className="btn shadow d-flex align-items-center justify-content-center border-0"
            style={{ backgroundColor: '#25D366', color: '#fff', padding: '10px 18px', borderRadius: 999, fontWeight: 700, fontSize: '1rem' }}
            aria-label="Matricularme ahora"
          >
            <i className="bi bi-whatsapp me-2" style={{ fontSize: '1.2rem' }}></i>
            <span>Matricularme ahora</span>
          </button>
        )}
      </div>

      {/* WhatsApp modal */}
      {waModalOpen && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ zIndex: 1090 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document" style={{ maxWidth: 900 }}>
              <div className="modal-content" style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>

                {/* Mobile top banner */}
                <div className="d-block d-md-none text-white p-3"
                  style={{ background: 'linear-gradient(135deg,#1565c0,#7b1fa2)' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold mb-1">Hola, escribe tu numero de DNI y celular</h5>
                      <small className="opacity-75">y te contactara un asesor de admision a tu WhatsApp</small>
                    </div>
                    <button type="button" className="btn-close btn-close-white ms-2" onClick={() => setWaModalOpen(false)}></button>
                  </div>
                </div>

                <div className="row g-0">
                  {/* Left image panel (desktop only) */}
                  <div className="col-md-5 position-relative d-none d-md-block" style={{ minHeight: 420, background: '#f0f0f0' }}>
                    <img src="/assets/images/chico_ventana_flotante.jpeg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                    <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ zIndex: 1, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                      <div className="text-white">
                        <h3 className="fw-bold mb-2">Hola, escribe tu numero de DNI y celular</h3>
                        <p className="opacity-75 mb-1">y te contactara un asesor de admision a tu</p>
                        <span className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill" style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(4px)' }}>
                          <i className="bi bi-whatsapp fs-5"></i>
                          <span className="fw-bold">WhatsApp</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right form panel */}
                  <div className="col-md-7 p-4 bg-white">
                    <div className="d-none d-md-flex justify-content-end mb-2">
                      <button type="button" className="btn-close" onClick={() => setWaModalOpen(false)}></button>
                    </div>

                    <form onSubmit={e => { e.preventDefault(); handleWaSubmit() }}>
                      <div className="row g-2 align-items-center mb-3">
                        <div className="col-auto">
                          <select className="form-select" style={{ minWidth: 85 }}>
                            <option>DNI</option>
                          </select>
                        </div>
                        <div className="col">
                          <input id="wa_dni" className="form-control form-control-lg" placeholder="Numero de documento" required />
                        </div>
                      </div>

                      <div className="mb-3">
                        <input id="wa_cel" className="form-control form-control-lg" placeholder="Celular" required />
                      </div>

                      <div className="mb-2 form-check">
                        <input type="checkbox" className="form-check-input" id="wa_priv_min" />
                        <label className="form-check-label small" htmlFor="wa_priv_min">
                          Acepto las politicas de privacidad y uso de datos de <u>menores de edad</u>
                        </label>
                      </div>
                      <div className="mb-2 form-check">
                        <input type="checkbox" className="form-check-input" id="wa_priv_adult" />
                        <label className="form-check-label small" htmlFor="wa_priv_adult">
                          Acepto las politicas de privacidad y uso de datos de <u>mayores de edad</u>
                        </label>
                      </div>
                      <div className="mb-4 form-check">
                        <input type="checkbox" className="form-check-input" id="wa_contactme" />
                        <label className="form-check-label small" htmlFor="wa_contactme">
                          Solicito que se comuniquen conmigo para brindarme informacion
                        </label>
                      </div>

                      <div className="d-grid">
                        <button type="submit" className="btn btn-lg fw-bold text-white"
                          style={{ background: 'linear-gradient(90deg,#7b1fa2,#1565c0)', borderRadius: 999, padding: '12px 0', boxShadow: '0 8px 24px rgba(123,31,162,.3)' }}>
                          Enviar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setWaModalOpen(false)}></div>
        </>
      )}
    </div>
  )
}

/* ================================================================
   Social links floating buttons
   ================================================================ */
function SocialLinksButtons({ selectedSucursal }) {
  const [links, setLinks] = useState([])

  useEffect(() => {
    let mounted = true
    const parseData = (data) => {
      if (!data) return []
      if (Array.isArray(data)) return data
      if (data.network && data.value) return [data]
      return Object.keys(data).map(k => {
        const v = data[k]
        if (typeof v === 'string') return { network: k, value: v, active: true }
        if (v && v.network && v.value) return v
        return null
      }).filter(Boolean)
    }

    const load = async () => {
      try {
        const res = await axios.get(endpoints.SOCIAL_LINKS)
        if (!mounted) return
        setLinks(parseData(res.data))
      } catch (e) {
        try {
          const res2 = await axios.get(`${endpoints.SOCIAL_LINKS}/1`)
          if (!mounted) return
          setLinks(parseData(res2.data))
        } catch (_) {}
      }
    }
    load()
    return () => { mounted = false }
  }, [selectedSucursal])

  const visible = (links || []).filter(l => l && l.active)
  const sucursalId = selectedSucursal ? selectedSucursal.id : null
  const forSucursal = sucursalId
    ? visible.filter(l => l.sucursal && String(l.sucursal.id) === String(sucursalId))
    : []
  const source = forSucursal.length ? forSucursal : visible
  const byNetwork = new Map()
  for (const item of source) {
    const net = String(item.network || '').toLowerCase()
    if (!net) continue
    if (!byNetwork.has(net)) byNetwork.set(net, item)
  }
  const filtered = Array.from(byNetwork.values()).filter(l => ['instagram', 'facebook'].includes(String(l.network).toLowerCase()))
  if (!filtered.length) return null

  const netConfig = {
    instagram: {
      icon: 'bi bi-instagram',
      style: { background: 'radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)', color: '#fff' }
    },
    facebook: {
      icon: 'bi bi-facebook',
      style: { background: '#1877F2', color: '#fff' }
    }
  }

  return (
    <>
      {filtered.map((s, i) => {
        const net = String(s.network).toLowerCase()
        const cfg = netConfig[net] || { icon: 'bi bi-link', style: {} }
        return (
          <a
            key={s.id || `${net}-${i}`}
            href={s.value}
            target="_blank" rel="noopener noreferrer"
            className="btn rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: 48, height: 48, fontSize: '1.25rem', ...cfg.style }}
            aria-label={s.network}
          >
            <i className={cfg.icon} aria-hidden="true"></i>
          </a>
        )
      })}
    </>
  )
}
