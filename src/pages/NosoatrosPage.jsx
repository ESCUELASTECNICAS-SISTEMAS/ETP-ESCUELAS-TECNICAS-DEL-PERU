import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const duration = 1800
        const inc = parseFloat(end) / steps
        let current = 0
        const timer = setInterval(() => {
          current += inc
          if (current >= parseFloat(end)) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, duration / steps)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function NosotrosPage() {
  const bgVideoRef = useRef(null)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const v = bgVideoRef.current
    if (!v) return

    // Only start loading when the hero is visible
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        v.preload = 'auto'
        v.load()
        const tryPlay = () => {
          const p = v.play()
          if (p && typeof p.catch === 'function') p.catch(() => {})
        }
        v.addEventListener('canplay', () => { setVideoReady(true); tryPlay() }, { once: true })
        observer.disconnect()
      }
    }, { threshold: 0.1 })
    observer.observe(v)
    return () => observer.disconnect()
  }, [])

  return (
    <div>

      {/* ══ HERO con video de fondo ══ */}
      <div
        className="position-relative overflow-hidden d-flex align-items-center justify-content-center text-center"
        style={{ minHeight: '100vh' }}
      >
        {/* Video de fondo – GPU-accelerated, lazy-loaded */}
        <video
          ref={bgVideoRef}
          preload="none"
          muted
          loop
          playsInline
          poster="https://res.cloudinary.com/du6mveaoo/video/upload/so_0/q_auto,f_jpg,w_1280/v1772496442/0605_aarpwd.jpg"
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            objectFit: 'cover',
            zIndex: 0,
            willChange: 'transform',
            transform: 'translateZ(0)',
            opacity: videoReady ? 1 : 0.3,
            transition: 'opacity 0.8s ease'
          }}
        >
          <source src="https://res.cloudinary.com/du6mveaoo/video/upload/q_auto,f_auto/v1772496442/0605_aarpwd.mp4" type="video/mp4" />
        </video>

        {/* Overlay removed to show video without filters */}

        {/* Contenido */}
        <div className="container py-5 position-relative" style={{ zIndex: 2 }}>
          <span
            className="d-inline-block text-uppercase fw-bold mb-4 px-3 py-2 rounded-pill"
            style={{
              background: 'rgba(253,113,15,0.12)',
              color: 'var(--accent)',
              border: '1.5px solid rgba(253,113,15,0.35)',
              letterSpacing: '3px',
              fontSize: '0.85rem',
              textShadow: '0 1px 8px rgba(0,0,0,0.6)'
            }}
          >
            Conoce nuestra historia
          </span>
          <h1
            className="fw-bold mb-4"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              color: '#ffffff',
              textShadow: '0 6px 36px rgba(0,0,0,0.85), 0 3px 12px rgba(0,0,0,0.6)',
              lineHeight: 1.1,
              letterSpacing: '-1px'
            }}
          >
            Sobre{' '}
            <span
              style={{
                color: 'var(--accent)',
                textShadow: '0 3px 12px rgba(0,0,0,0.75), 0 0 14px rgba(253,113,15,0.22)'
              }}
            >
              Nosotros
            </span>
          </h1>
          <p
            className="mb-5 mx-auto"
            style={{
              color: '#ffffff',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              textShadow: '0 3px 18px rgba(0,0,0,0.75)',
              maxWidth: '600px',
              fontWeight: 600,
              lineHeight: 1.6
            }}
          >
            Conoce nuestra historia, misión y compromiso con la educación de calidad
          </p>
          <a
            href="#quienes-somos"
            className="btn btn-lg px-5 py-3 rounded-pill fw-bold"
            style={{
              background: 'linear-gradient(135deg, var(--accent), rgba(253,113,15,0.85))',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 32px rgba(253,113,15,0.25)',
              fontSize: '1rem',
              letterSpacing: '0.5px'
            }}
          >
            Descubrir más ↓
          </a>
        </div>

        {/* Flecha animada al fondo */}
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x pb-4"
          style={{ zIndex: 2, opacity: 0.7 }}
        >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M15 6v18M7 17l8 8 8-8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ══ QUIÉNES SOMOS ══ */}
      <div id="quienes-somos" className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="badge rounded-pill text-bg-warning fs-6 px-3 py-2 mb-3">¿Quiénes Somos?</span>
            <h2 className="display-5 fw-bold mb-4">
              Transformando vidas a través de la <span className="text-primary fst-italic">formación</span>
            </h2>
            <p className="text-secondary fs-5 lh-lg mb-3">
              Somos un equipo dedicado a transformar vidas a través de la educación de calidad.
              Con años de experiencia en la formación de profesionales, hemos impactado positivamente
              a miles de estudiantes que hoy son competentes en sus campos.
            </p>
            <p className="text-secondary fs-5 lh-lg">
              Nuestra trayectoria se fundamenta en la pasión por la educación de calidad y el desarrollo
              integral de nuestros estudiantes, combinando lo mejor de la teoría y la práctica profesional.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="row g-3">
              {[
                { icon: 'bi-person-check-fill', color: 'text-primary', bg: 'bg-primary', title: 'Docentes Especializados', desc: 'Con experiencia profesional real en la industria' },
                { icon: 'bi-journal-check', color: 'text-success', bg: 'bg-success', title: 'Currículo Actualizado', desc: 'Alineado con las demandas del mercado laboral' },
                { icon: 'bi-building', color: 'text-info', bg: 'bg-info', title: 'Infraestructura Moderna', desc: 'Laboratorios y espacios acondicionados' },
                { icon: 'bi-headset', color: 'text-warning', bg: 'bg-warning', title: 'Atención Personalizada', desc: 'Apoyo continuo para el éxito de cada alumno' },
              ].map((p, i) => (
                <div className="col-6" key={i}>
                  <div className="card border-0 shadow-sm h-100 rounded-4 p-1">
                    <div className="card-body text-center p-3">
                      <div className={`${p.bg} bg-opacity-10 rounded-3 p-3 mb-3 d-inline-flex`}>
                        <i className={`bi ${p.icon} fs-3 ${p.color}`}></i>
                      </div>
                      <h6 className="fw-bold mb-1">{p.title}</h6>
                      <small className="text-muted">{p.desc}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MISIÓN / VISIÓN ══ */}
      <div className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge rounded-pill text-bg-primary fs-6 px-3 py-2 mb-3">Filosofía Institucional</span>
            <h2 className="display-5 fw-bold">Lo que nos <span className="text-danger fst-italic">define</span></h2>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 rounded-4 h-100 text-white overflow-hidden shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--primary), #3b30e8)' }}>
                <div className="card-body p-5">
                  <div className="fs-1 mb-3">🎯</div>
                  <span className="badge border border-white border-opacity-50 text-white mb-3 px-3 py-2 fw-normal">MISIÓN</span>
                  <h3 className="fw-bold mb-4">Nuestra Razón de Ser</h3>
                  <blockquote className="blockquote fst-italic mb-0 border-start border-warning border-3 ps-3">
                    <p className="fs-5 lh-lg opacity-75">
                      "Formar profesionales competentes, innovadores y comprometidos con la excelencia académica,
                      dotados de habilidades prácticas y conocimientos aplicables que les permitan transformar sus
                      vidas y contribuir al desarrollo sostenible de sus comunidades."
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 rounded-4 h-100 text-white overflow-hidden shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d60)' }}>
                <div className="card-body p-5">
                  <div className="fs-1 mb-3">🔭</div>
                  <span className="badge border border-white border-opacity-50 text-white mb-3 px-3 py-2 fw-normal">VISIÓN</span>
                  <h3 className="fw-bold mb-4">Nuestro Horizonte</h3>
                  <blockquote className="blockquote fst-italic mb-0 border-start border-warning border-3 ps-3">
                    <p className="fs-5 lh-lg opacity-75">
                      "Ser una institución reconocida por su innovación educativa y la calidad de sus egresados,
                      contribuyendo al progreso social y al desarrollo profesional de nuestras comunidades."
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ VALORES ══ */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="badge rounded-pill text-bg-warning fs-6 px-3 py-2 mb-3">Nuestros Valores</span>
          <h2 className="display-5 fw-bold">Los principios que <span className="text-primary fst-italic">nos guían</span></h2>
          <p className="text-muted fs-5 mt-3">Los principios que guían cada una de nuestras acciones</p>
        </div>
        <div className="row g-4">
          {[
            { icon: 'bi-star-fill', color: 'text-warning', bg: 'bg-warning', title: 'Excelencia', desc: 'Nos comprometemos con la máxima calidad en cada aspecto de nuestro trabajo educativo, superando expectativas.' },
            { icon: 'bi-handshake-fill', color: 'text-success', bg: 'bg-success', title: 'Integridad', desc: 'Actuamos con transparencia, honestidad y responsabilidad en todas nuestras acciones, construyendo confianza.' },
            { icon: 'bi-lightbulb-fill', color: 'text-info', bg: 'bg-info', title: 'Innovación', desc: 'Buscamos constantemente nuevas formas de mejorar la educación con metodologías modernas.' },
            { icon: 'bi-heart-fill', color: 'text-danger', bg: 'bg-danger', title: 'Compromiso', desc: 'Estamos plenamente dedicados al éxito de cada estudiante, acompañándolos en cada etapa de su formación.' },
            { icon: 'bi-tree-fill', color: 'text-success', bg: 'bg-success', title: 'Sostenibilidad', desc: 'Formamos profesionales conscientes de su impacto social y ambiental, preparados para contribuir al futuro.' },
            { icon: 'bi-fire', color: 'text-danger', bg: 'bg-danger', title: 'Pasión', desc: 'Enseñamos con entusiasmo y dedicación genuina, transmitiendo el amor por el aprendizaje continuo.' },
          ].map((v, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <div className="card border-0 shadow-sm rounded-4 h-100 p-1">
                <div className="card-body p-4">
                  <div className={`${v.bg} bg-opacity-10 rounded-3 p-3 mb-3 d-inline-flex`}>
                    <i className={`bi ${v.icon} fs-2 ${v.color}`}></i>
                  </div>
                  <h5 className={`fw-bold mb-2 ${v.color}`}>{v.title}</h5>
                  <p className="text-muted mb-0 lh-lg">{v.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas removed per request */}

      {/* Video institucional section removed per request */}

    </div>
  )
}