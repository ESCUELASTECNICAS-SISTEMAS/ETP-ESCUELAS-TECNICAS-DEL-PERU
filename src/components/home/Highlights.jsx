import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function Highlights() {
  const TARGET_YEARS = 14
  const [years, setYears] = useState(1)
  const [animateYears, setAnimateYears] = useState(false)
  const [sucursalesText, setSucursalesText] = useState('Cargando sedes...')
  const [sucursalesNames, setSucursalesNames] = useState([])
  const sectionRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const fetchSucursales = async () => {
      try {
        const res = await axios.get(endpoints.SUCURSALES)
        const list = Array.isArray(res.data) ? res.data : []
        const active = list.filter(s => s && s.active !== false)
        const names = active.map(s => s.nombre).filter(Boolean)
        const summary = names.length <= 3
          ? names.join(' • ')
          : `${names.slice(0, 3).join(' • ')} y ${names.length - 3} más`
        if (!mounted) return
        setSucursalesNames(names)
        setSucursalesText(summary || 'Sedes activas disponibles')
      } catch {
        if (!mounted) return
        setSucursalesNames([])
        setSucursalesText('Sedes activas disponibles')
      }
    }
    fetchSucursales()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) { setAnimateYears(true); observer.disconnect() }
      },
      { threshold: 0.35 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!animateYears) return
    const durationMs = 3200
    const start = performance.now()
    let rafId = 0
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setYears(Math.max(1, Math.round(1 + (TARGET_YEARS - 1) * eased)))
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [animateYears])

  const items = [
    {
      title: 'Sedes',
      text: sucursalesText,
      icon: 'bi-geo-alt-fill',
      iconBg: 'bg-success',
      badgeCls: 'text-bg-success',
      ring: 'border-success',
    },
    {
      title: `+${years} años`,
      text: 'De experiencia capacitando a miles de estudiantes',
      icon: 'bi-star-fill',
      iconBg: 'bg-info',
      badgeCls: 'text-bg-info',
      ring: 'border-info',
    },
    {
      title: 'Modalidades',
      text: 'Presencial y Virtual para tu comodidad',
      icon: 'bi-laptop',
      iconBg: 'bg-primary',
      badgeCls: 'text-bg-primary',
      ring: 'border-primary',
    },
    {
      title: 'Certificación',
      text: 'Cursos con certificación oficial ',
      icon: 'bi-award-fill',
      iconBg: 'bg-warning',
      badgeCls: 'text-bg-warning',
      ring: 'border-warning',
    },
  ]

  return (
    <section className="py-3 py-md-4 bg-light" ref={sectionRef}>
      <div className="container">
        <div className="row g-3 justify-content-center">
          {items.map((it, idx) => (
            <div className="col-12 col-md-6 col-lg-3" key={idx}>
              <div
                className={`card h-100 border-2 ${it.ring} shadow rounded-4 bg-white overflow-hidden`}
                onMouseEnter={e => e.currentTarget.classList.add('shadow-lg')}
                onMouseLeave={e => e.currentTarget.classList.remove('shadow-lg')}
              >
                {/* Colored top stripe */}
                <div className={`${it.iconBg} bg-gradient`} style={{ height: '4px' }} />

                <div className="card-body px-3 py-3 d-flex align-items-center gap-3">
                  {/* Icon circle */}
                  <div
                    className={`${it.iconBg} bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm`}
                    style={{ width: '3rem', height: '3rem' }}
                  >
                    <i className={`bi ${it.icon} fs-5`}></i>
                  </div>

                  {/* Text */}
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="fw-bold mb-0 text-truncate">{it.title}</h6>
                      <span className={`badge rounded-pill ${it.badgeCls} ms-auto flex-shrink-0`}>ETP</span>
                    </div>
                    {it.title === 'Sedes' ? (
                      sucursalesNames.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {sucursalesNames.slice(0, 4).map((name) => (
                            <span key={name} className="badge rounded-pill border border-success-subtle text-success-emphasis bg-success-subtle fw-semibold px-2 py-1">
                              <i className="bi bi-geo-alt-fill me-1"></i>{name}
                            </span>
                          ))}
                          {sucursalesNames.length > 4 && (
                            <span className="badge rounded-pill text-bg-light border">+{sucursalesNames.length - 4}</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-secondary mb-0 small lh-sm">{sucursalesText}</p>
                      )
                    ) : (
                      <p className="text-secondary mb-0 small lh-sm">{it.text}</p>
                    )}
                  </div>
                </div>

                {/* Decorative dots bottom-right */}
                <div className="position-relative">
                  <div
                    className={`position-absolute bottom-0 end-0 ${it.iconBg} opacity-10 rounded-circle`}
                    style={{ width: '60px', height: '60px', transform: 'translate(30%, 30%)' }}
                  />
                  <div
                    className={`position-absolute bottom-0 end-0 ${it.iconBg} opacity-10 rounded-circle`}
                    style={{ width: '36px', height: '36px', transform: 'translate(10%, 60%)' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}