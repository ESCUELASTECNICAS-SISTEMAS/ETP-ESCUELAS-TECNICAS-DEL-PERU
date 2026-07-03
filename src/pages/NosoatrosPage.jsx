import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import NuestrosBlogsSection from '../components/home/NuestrosBlogsSection'

const KEYFRAMES = `
@keyframes spin { to { transform: rotate(360deg); } }
`

function injectKF() {
  if (document.getElementById('__nkf2')) return
  const s = document.createElement('style')
  s.id = '__nkf2'
  s.textContent = KEYFRAMES
  document.head.appendChild(s)
}

function Counter({ end }) {
  const [c, setC] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const dur = 1800
        const inc = parseFloat(end) / steps
        let cur = 0
        const t = setInterval(() => {
          cur += inc
          if (cur >= parseFloat(end)) { setC(end); clearInterval(t) }
          else setC(Math.floor(cur))
        }, dur / steps)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])
  return <span ref={ref}>{c}</span>
}

function ParallaxSection({ image, ciudad, anios, children }) {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const contentRef = useRef(null)
  const [useCssFixed, setUseCssFixed] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 992px) and (prefers-reduced-motion: no-preference)')
    setUseCssFixed(desktop.matches)
    const onChange = () => setUseCssFixed(desktop.matches)
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const section = sectionRef.current
    const bg = bgRef.current
    const content = contentRef.current
    if (!section) return

    const contentObs = new IntersectionObserver(([e]) => {
      if (content) content.classList.toggle('visible', e.isIntersecting)
    }, { threshold: 0.25 })
    contentObs.observe(section)

    if (reduced || useCssFixed) {
      return () => contentObs.disconnect()
    }

    const onScroll = () => {
      if (!bg) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < 0 || rect.top > vh) return
      const progress = (vh - rect.top) / (vh + rect.height)
      const offset = (progress - 0.5) * 120
      bg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      contentObs.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [useCssFixed])

  const bgImage = image || '/assets/images/Hero1.jpg'

  return (
    <section ref={sectionRef} className="on-parallax" aria-label="Instalaciones ETP">
      <div
        ref={bgRef}
        className={`on-parallax-bg${useCssFixed ? ' on-parallax-bg--css' : ''}`}
        style={{ backgroundImage: `url(${bgImage})` }}
        role="presentation"
      />
      <div className="on-parallax-overlay" />
      <div className="container">
        <div ref={contentRef} className="on-parallax-content">
          {children || (
            <>
              <span className="d-block mb-3 fw-bold text-uppercase"
                style={{ fontSize: '.68rem', letterSpacing: '.22em', color: 'var(--accent)' }}>
                Formación práctica
              </span>
              <h2 className="on-parallax-title">
                Acompáñanos a descubrir<br />
                nuestros <span>laboratorios</span><br />
                y talleres prácticos
              </h2>
              <p className="on-parallax-desc">
                Nuestros espacios están equipados con herramientas y tecnología de punta para que aprendas
                haciendo. Más de {anios || 13} años formando técnicos en {ciudad || 'Ica'} con docentes
                certificados y metodología orientada al mercado laboral real.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/programas" className="on-btn-primary">Más información</Link>
                <a href="#contacto" className="on-btn-outline">Contáctanos</a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

const PROGRAMAS = [
  { icon: '🎓', title: 'Carreras Técnicas', desc: 'Formación profesional con certificación y alta empleabilidad.', href: '/programas' },
  { icon: '⚡', title: 'Cursos de 5 Meses', desc: 'Programas intensivos para insertarte rápido al mercado laboral.', href: '/programas' },
  { icon: '🔧', title: 'Talleres Prácticos', desc: 'Aprende haciendo con docentes especializados y laboratorios.', href: '/programas' },
  { icon: '💻', title: 'Informática', desc: 'Ofimática, Excel avanzado y herramientas digitales del día a día.', href: '/programas' },
  { icon: '⚙️', title: 'Instalaciones', desc: 'Electricidad, seguridad electrónica y reparación de equipos.', href: '/programas' },
  { icon: '🚀', title: 'Emprendimiento', desc: 'Gestión de negocios y habilidades para emprender con éxito.', href: '/programas' },
]

function HeroCarouselON({ data }) {
  const [active, setActive] = useState(0)
  const bgImage = data?.imagen || '/assets/images/Hero1.jpg'

  const slides = [
    {
      lines: [`${data?.anios || 13}+ AÑOS`, 'FORMANDO TÉCNICOS', `EN ${(data?.ciudad || 'ICA').toUpperCase()}`],
      cta: 'Conocer ETP',
      href: '#quienes-somos',
    },
    {
      lines: ['TU CARRERA TÉCNICA', 'EMPIEZA', 'HOY'],
      cta: 'Ver programas',
      href: '/programas',
    },
    {
      lines: ['FORMACIÓN PRÁCTICA', 'ALINEADA AL', 'MERCADO LABORAL'],
      cta: 'Solicitar información',
      href: '#contacto',
    },
  ]

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [slides.length])

  return (
    <section className="on-hero">
      {slides.map((slide, i) => (
        <div key={i} className={`on-hero-slide${i === active ? ' active' : ''}`}>
          <div className="on-hero-bg" style={{ backgroundImage: `url(${bgImage})` }} />
          <div className="container h-100 d-flex align-items-center" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <div className="on-hero-content">
              <h1 className="on-hero-title">
                {slide.lines.map((line, j) => (
                  <React.Fragment key={j}>
                    {j === slide.lines.length - 1 && slide.lines.length > 1 ? (
                      <span>{line}</span>
                    ) : (
                      <>{line}<br /></>
                    )}
                  </React.Fragment>
                ))}
              </h1>
              <div className="d-flex flex-wrap gap-3">
                <a href={slide.href} className="on-btn-primary">
                  {slide.cta}
                </a>
                <a href="#contacto" className="on-btn-outline">
                  Más información
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="on-hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`on-hero-dot${i === active ? ' active' : ''}`}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  )
}

export default function NosotrosPage() {
  const videoRef = useRef(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [preForm, setPreForm] = useState({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', modalidad_id: '', course_id: '', sucursal_id: '' })
  const [preSending, setPreSending] = useState(false)
  const [preMsg, setPreMsg] = useState('')
  const [preErr, setPreErr] = useState('')
  const [modalidades, setModalidades] = useState([])
  const [sucursales, setSucursales] = useState([])

  useEffect(() => { injectKF() }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await axios.get(endpoints.NOSOTROS, { timeout: 5000 })
        const rec = Array.isArray(res.data) ? res.data[0] : res.data
        setData(rec || null)
        if (!rec) setError('No hay registros en la base de datos')
      } catch (e) { setError(`Error: ${e.message}`) }
      finally { setLoading(false) }
    })()
    axios.get(endpoints.MODALIDADES).then(r => {
      setModalidades(Array.isArray(r.data) ? r.data : [])
    }).catch(() => setModalidades([]))
    axios.get(endpoints.SUCURSALES).then(r => {
      setSucursales(Array.isArray(r.data) ? r.data : [])
    }).catch(() => setSucursales([]))
  }, [])

  const preBase = endpoints.PRE_INSCRIPCIONES || `${(import.meta.env.VITE_API_BASE || 'http://localhost:3000').replace(/\/$/, '')}/pre-inscripciones`

  const submitPre = (e) => {
    e.preventDefault()
    setPreErr(''); setPreMsg(''); setPreSending(true)
    const payload = {
      nombre: preForm.nombres,
      apellido: preForm.apellidos,
      nombres: preForm.nombres,
      apellidos: preForm.apellidos,
      dni: preForm.dni,
      celular: preForm.telefono,
      telefono: preForm.telefono,
      email: preForm.email,
      modalidad_id: preForm.modalidad_id ? Number(preForm.modalidad_id) : undefined,
      course_id: preForm.course_id ? Number(preForm.course_id) : undefined,
      sucursal_id: preForm.sucursal_id ? Number(preForm.sucursal_id) : undefined,
      acepta_politicas: true,
    }
    axios.post(preBase, payload).then(() => {
      setPreMsg('¡Pre-inscripción enviada! Te contactaremos pronto.')
      setPreForm({ nombres: '', apellidos: '', dni: '', telefono: '', email: '', modalidad_id: '', course_id: '', sucursal_id: '' })
    }).catch(() => {
      setPreErr('No se pudo enviar. Intenta de nuevo o revisa los datos.')
    }).finally(() => setPreSending(false))
  }

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#0f0f14' }}>
      <div className="text-center">
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #FD710F', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
        <p className="fw-semibold" style={{ color: '#888', letterSpacing: '0.08em', fontSize: '.9rem' }}>Cargando…</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#0f0f14', padding: '0 20px' }}>
      <div className="text-center text-white p-4 rounded-4" style={{ border: '1px solid rgba(255,255,255,0.1)', maxWidth: 420, width: '100%' }}>
        <div className="fs-1 mb-3">{error ? '❌' : '⚠️'}</div>
        <h5 className="fw-bold mb-2">{error ? 'Error al cargar' : 'Sin datos'}</h5>
        <p style={{ color: '#888' }}>{error || 'No hay información disponible.'}</p>
      </div>
    </div>
  )

  const valores = (data?.valores || []).map(v => typeof v === 'string' ? { title: v.replace(/:$/, '').trim() } : v)

  return (
    <div className="on-page">

      {/* 1 ▸ Hero carousel estilo ON Empresas */}
      <HeroCarouselON data={data} />

      {/* 8 ▸ Canales de contacto (estilo ON) */}
      <section id="contacto" className="py-5" style={{ background: '#fff', padding: '5rem 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="on-section-label d-block mb-2">Contáctanos</span>
            <h2 className="on-section-title">Conoce nuestros canales de atención</h2>
            <p className="mx-auto mt-3" style={{ color: '#666', maxWidth: 560 }}>
              Múltiples canales diseñados para darte una respuesta eficiente y especializada.
            </p>
          </div>
          <div className="row g-4 mb-5">
            <div className="col-12 col-md-4">
              <div className="on-contact-card">
                <div className="on-contact-icon"><i className="bi bi-telephone-fill" /></div>
                <h3 className="fw-bold mb-2" style={{ fontSize: '1.05rem' }}>Atención telefónica</h3>
                <p className="mb-3" style={{ color: '#666', fontSize: '.9rem' }}>
                  Llámanos de lunes a domingo, de 8:00 a 21:30 horas.
                </p>
                <a href="tel:+51900424028" className="on-btn-primary" style={{ fontSize: '.9rem', padding: '0.65rem 1.5rem' }}>
                  Llamar ahora
                </a>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="on-contact-card">
                <div className="on-contact-icon"><i className="bi bi-globe2" /></div>
                <h3 className="fw-bold mb-2" style={{ fontSize: '1.05rem' }}>Canal web</h3>
                <p className="mb-3" style={{ color: '#666', fontSize: '.9rem' }}>
                  Completa el formulario y un asesor te contactará para confirmar tu vacante.
                </p>
                <a href="#formulario" className="on-btn-primary" style={{ fontSize: '.9rem', padding: '0.65rem 1.5rem' }}>
                  Solicitar información
                </a>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="on-contact-card">
                <div className="on-contact-icon" style={{ background: '#e8f8ee', color: '#25D366' }}>
                  <i className="bi bi-whatsapp" />
                </div>
                <h3 className="fw-bold mb-2" style={{ fontSize: '1.05rem' }}>WhatsApp</h3>
                <p className="mb-3" style={{ color: '#666', fontSize: '.9rem' }}>
                  Escríbenos y recibe asesoría personalizada sobre nuestros programas.
                </p>
                <a href="https://wa.me/51900424028" target="_blank" rel="noopener noreferrer"
                  className="on-btn-primary" style={{ fontSize: '.9rem', padding: '0.65rem 1.5rem', background: '#25D366', color: '#fff' }}>
                  Escríbenos
                </a>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div id="formulario" className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="on-form-wrap">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div style={{ width: 4, height: 28, background: 'var(--primary)' }} />
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--primary)' }}>Solicita más información</h4>
                </div>
                <p className="text-muted mb-4" style={{ fontSize: '.9rem' }}>Un asesor te contactará para confirmar tu vacante.</p>

                {preErr && <div className="alert alert-danger py-2 mb-3">{preErr}</div>}
                {preMsg && <div className="alert alert-success py-2 mb-3">{preMsg}</div>}

                <form className="row g-3" onSubmit={submitPre}>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Nombres<span className="text-danger">*</span></label>
                    <input className="form-control" value={preForm.nombres}
                      onChange={e => setPreForm(f => ({ ...f, nombres: e.target.value }))} required />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Apellidos<span className="text-danger">*</span></label>
                    <input className="form-control" value={preForm.apellidos}
                      onChange={e => setPreForm(f => ({ ...f, apellidos: e.target.value }))} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Correo electrónico</label>
                    <input type="email" className="form-control" value={preForm.email}
                      onChange={e => setPreForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Teléfono móvil<span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text fw-semibold" style={{ fontSize: '.82rem' }}>PE +51</span>
                      <input className="form-control" value={preForm.telefono}
                        onChange={e => setPreForm(f => ({ ...f, telefono: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Número de documento</label>
                    <input className="form-control" value={preForm.dni}
                      onChange={e => setPreForm(f => ({ ...f, dni: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Curso o programa<span className="text-danger">*</span></label>
                    <select className="form-select" value={preForm.course_id}
                      onChange={e => setPreForm(f => ({ ...f, course_id: e.target.value }))} required>
                      <option value="">Selecciona un curso/programa</option>
                      <option value="1">Reparación de Celulares</option>
                      <option value="2">Diseño y Armado de Muebles en Melamina</option>
                      <option value="3">Reparación de Computadoras</option>
                      <option value="4">Instalación de Cámaras de Seguridad</option>
                      <option value="5">Inteligencia Artificial</option>
                      <option value="6">Auxiliar en Soporte Informático</option>
                      <option value="7">Instalaciones Eléctricas Residenciales</option>
                      <option value="8">Emprendimiento y Gestión de Negocios</option>
                      <option value="9">Informática (Ofimática, Excel, etc.)</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Sucursal<span className="text-danger">*</span></label>
                    <select className="form-select" value={preForm.sucursal_id}
                      onChange={e => setPreForm(f => ({ ...f, sucursal_id: e.target.value }))} required>
                      <option value="">Selecciona una sucursal</option>
                      {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre || s.title || s.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small">Modalidad<span className="text-danger">*</span></label>
                    <select className="form-select" value={preForm.modalidad_id}
                      onChange={e => setPreForm(f => ({ ...f, modalidad_id: e.target.value }))} required>
                      <option value="">Selecciona una modalidad</option>
                      {modalidades.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre || m.title || m.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn w-100 fw-bold py-2" disabled={preSending}
                      style={{ background: 'var(--primary)', color: '#fff', borderRadius: 2, minHeight: 48 }}>
                      {preSending
                        ? <><span className="spinner-border spinner-border-sm me-2" />Enviando…</>
                        : 'Enviar solicitud'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 ▸ Intro corporativa + video */}
      <section className="py-5 py-lg-6" style={{ background: '#fff', padding: '5rem 0' }}>
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-12 col-lg-6">
              <span className="on-section-label d-block mb-3">Escuelas Técnicas del Perú</span>
              <h2 className="on-section-title mb-4" style={{ textTransform: 'uppercase' }}>
                Llegamos para transformar<br />tu futuro técnico
              </h2>
              <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: 520 }}>
                {data?.descripcion || 'Somos especialistas en formación técnica práctica, con docentes certificados y laboratorios de punta para acelerar tu empleabilidad.'}
              </p>
              {data?.logo && (
                <img src={data.logo} alt="Logo ETP" className="mt-4" style={{ height: 48, objectFit: 'contain' }} />
              )}
            </div>
            <div className="col-12 col-lg-6">
              {data?.video_url ? (
                <div className="rounded overflow-hidden shadow-lg" style={{ border: '3px solid var(--primary)' }}>
                  <video ref={videoRef} controls preload="metadata" playsInline
                    poster={data?.video_poster} autoPlay muted
                    style={{ width: '100%', display: 'block', maxHeight: 340, objectFit: 'cover', background: '#000' }}>
                    <source src={data.video_url} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="rounded overflow-hidden" style={{ background: '#f0f2ff', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={data?.imagen || '/assets/images/Hero1.jpg'} alt="ETP" style={{ maxWidth: '100%', maxHeight: 340, objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3 ▸ Grid de programas (como servicios ON) */}
      <section className="py-5" style={{ background: '#f5f7fa', padding: '5rem 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="on-section-label d-block mb-2">Nuestros programas</span>
            <h2 className="on-section-title">Explora nuestras áreas de formación</h2>
            <p className="mx-auto mt-3" style={{ color: '#666', maxWidth: 560 }}>
              Programas diseñados para impulsar tu carrera desde la formación práctica hasta la certificación profesional.
            </p>
          </div>
          <div className="row g-4">
            {PROGRAMAS.map((p, i) => (
              <div className="col-12 col-sm-6 col-lg-4" key={i}>
                <Link to={p.href} className="on-service-card">
                  <div className="on-service-icon">{p.icon}</div>
                  <h3 className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>{p.title}</h3>
                  <p className="mb-0" style={{ color: '#666', fontSize: '.92rem', lineHeight: 1.65 }}>{p.desc}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 ▸ Banda de estadísticas */}
      <section className="on-stat-band">
        <div className="container">
          <div className="row text-center g-4">
            {[
              { n: <><Counter end={data?.anios || 13} />+</>, t: 'Años en el sector' },
              { n: '2K+', t: 'Egresados empleados' },
              { n: '6+', t: 'Programas activos' },
              { n: '24/7', t: 'Atención por WhatsApp' },
            ].map((s, i) => (
              <div className="col-6 col-lg-3" key={i}>
                <div className="on-stat-num">{s.n}</div>
                <div className="on-stat-label">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 ▸ Parallax – instalaciones (estilo ON Data Centers) */}
      <ParallaxSection
        image={data?.imagen}
        ciudad={data?.ciudad}
        anios={data?.anios}
      />

      {/* 5 ▸ Quiénes somos */}
      <section id="quienes-somos" className="py-5" style={{ background: '#fff', padding: '5rem 0' }}>
        <div className="container">
          <div className="row align-items-stretch gy-4">
            <div className="col-12 col-lg-5">
              <div className="h-100 rounded overflow-hidden position-relative"
                style={{
                  minHeight: 320,
                  background: data?.imagen ? `url(${data.imagen}) center/cover no-repeat` : 'var(--primary)',
                }}>
                <div className="position-absolute bottom-0 start-0 p-4 text-white"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', width: '100%' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                    {data?.anios || 13}
                  </div>
                  <p className="mb-0 mt-1" style={{ fontSize: '.9rem' }}>
                    Años transformando vidas en {data?.ciudad || 'Ica'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <span className="on-section-label d-block mb-2">Quiénes somos</span>
              <h2 className="on-section-title mb-4">{data?.titulo || 'Nacimos para resolver la brecha técnica'}</h2>
              <p style={{ color: '#555', lineHeight: 1.85 }}>{data?.descripcion}</p>
              {data?.bullets?.length > 0 && (
                <div className="mt-4">
                  {data.bullets.map((b, i) => (
                    <div key={i} className="d-flex align-items-start gap-3 py-3" style={{ borderTop: '1px solid #eee' }}>
                      <div className="flex-shrink-0 d-flex align-items-center justify-content-center"
                        style={{ width: 28, height: 28, background: 'var(--primary)', color: '#fff', fontSize: '.75rem' }}>
                        ✓
                      </div>
                      <p className="mb-0" style={{ color: '#333', lineHeight: 1.6 }}>{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6 ▸ Misión & Visión */}
      <section className="on-dark-section py-5" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="d-block mb-2 fw-bold text-uppercase" style={{ fontSize: '.68rem', letterSpacing: '.22em', color: 'var(--accent)' }}>
              Filosofía institucional
            </span>
            <h2 className="fw-black text-white" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>Misión &amp; Visión</h2>
          </div>
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="on-mv-card">
                <div className="mb-3" style={{ fontSize: '1.5rem' }}>🎯</div>
                <div className="fw-bold text-uppercase mb-2" style={{ fontSize: '.68rem', letterSpacing: '.18em', color: 'var(--accent)' }}>Misión</div>
                <p className="mb-0 fst-italic" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '.97rem' }}>
                  "{data?.mision}"
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="on-mv-card">
                <div className="mb-3" style={{ fontSize: '1.5rem' }}>🔭</div>
                <div className="fw-bold text-uppercase mb-2" style={{ fontSize: '.68rem', letterSpacing: '.18em', color: 'var(--accent)' }}>Visión</div>
                <p className="mb-0 fst-italic" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '.97rem' }}>
                  "{data?.vision}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 ▸ Valores */}
      {valores.length > 0 && (
        <section className="py-5" style={{ background: '#f5f7fa', padding: '5rem 0' }}>
          <div className="container">
            <div className="text-center mb-5">
              <span className="on-section-label d-block mb-2">Principios</span>
              <h2 className="on-section-title">Nuestros valores</h2>
            </div>
            <div className="row g-3 g-md-4">
              {valores.map((v, i) => (
                <div className="col-12 col-sm-6 col-lg-4" key={i}>
                  <div className="on-service-card" style={{ cursor: 'default' }}>
                    <div className="on-service-icon" style={{ fontSize: '1.2rem' }}>
                      {['⭐', '🤝', '💡', '❤️', '🌱', '🔥'][i % 6]}
                    </div>
                    <h3 className="fw-bold mb-2" style={{ fontSize: '1rem' }}>{v.title || v}</h3>
                    {v.desc && <p className="mb-0" style={{ color: '#666', fontSize: '.9rem' }}>{v.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <NuestrosBlogsSection />

      {/* FAQ */}
      <section className="py-5" style={{ background: '#f5f7fa' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="on-section-label d-block mb-2">Ayuda</span>
            <h2 className="on-section-title">Preguntas frecuentes</h2>
          </div>
          <div className="accordion mx-auto" id="faqAccordion" style={{ maxWidth: 760 }}>
            {[
              { q: '¿Se cobra por el cambio de hora y especialidad?', a: 'No, no se cobra la primera vez que realices un cambio de hora o especialidad.' },
              { q: '¿Se atiende todos los días?', a: 'Sí, la atención es de lunes a domingo, de 8:00 a 21:30 horas.' },
              { q: '¿Los precios varían?', a: 'No, los precios no varían. Si te matriculaste con una promoción, se mantiene el precio hasta finalizar tus estudios.' },
              { q: '¿Cuántas faltas se permiten?', a: 'Se permite hasta el 30% de inasistencias.' },
              { q: '¿Se puede retomar mis estudios?', a: 'Sí, puedes retomar tus estudios si no han pasado más de 6 meses desde que dejaste de estudiar. Si ha pasado más tiempo, puedes conversar con el área de secretaría.' },
            ].map((item, i) => (
              <div className="accordion-item mb-2" key={i} style={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <h2 className="accordion-header" id={`faqHeading${i}`}>
                  <button className="accordion-button collapsed fw-semibold" type="button"
                    data-bs-toggle="collapse" data-bs-target={`#faqCollapse${i}`}
                    style={{ background: '#fff', color: 'var(--primary)' }}>
                    {item.q}
                  </button>
                </h2>
                <div id={`faqCollapse${i}`} className="accordion-collapse collapse"
                  data-bs-parent="#faqAccordion">
                  <div className="accordion-body" style={{ background: '#fff', color: '#444', lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final estilo ON */}
      <section className="on-dark-section text-center py-5" style={{ padding: '6rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <span className="d-inline-block mb-4 fw-bold text-uppercase"
            style={{ fontSize: '.72rem', letterSpacing: '.16em', color: 'var(--accent)' }}>
            Empieza tu futuro hoy
          </span>
          <h2 className="fw-black text-white mb-4" style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', lineHeight: 1.15 }}>
            ¿Listo para construir tu futuro técnico?
          </h2>
          <p className="mb-5" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
            Únete a los miles de profesionales que confiaron en Escuelas Técnicas del Perú.
          </p>
          <Link to="/programas" className="on-btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>
            Ver nuestros programas →
          </Link>
        </div>
      </section>

    </div>
  )
}
