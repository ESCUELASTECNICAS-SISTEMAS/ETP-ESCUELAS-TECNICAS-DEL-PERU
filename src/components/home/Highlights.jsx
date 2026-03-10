import React, { useEffect, useRef, useState } from 'react'

export default function Highlights(){
  const TARGET_YEARS = 14
  const [years, setYears] = useState(1)
  const [animateYears, setAnimateYears] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setAnimateYears(true)
          observer.disconnect()
        }
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
      title: 'Modalidades',
      text: 'Presencial y Virtual para tu comodidad',
      icon: 'bi-laptop',
      iconBg: 'bg-primary'
    },
    {
      title: 'Certificacion',
      text: 'Cursos con certificacion oficial reconocida',
      icon: 'bi-award',
      iconBg: 'bg-warning'
    },
    {
      title: `+${years} años`,
      text: 'De experiencia formando profesionales tecnicos',
      icon: 'bi-star-fill',
      iconBg: 'bg-primary'
    }
  ]

  return (
    <section className="py-3 py-md-4 bg-light" ref={sectionRef}>
      <div className="container">
        <div className="row g-3 justify-content-center">
          {items.map((it, idx) => (
            <div className="col-12 col-md-6 col-lg-4" key={idx}>
              <div className="card h-100 border border-secondary-subtle shadow-sm rounded-3">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <span className={`rounded-circle ${it.iconBg} text-white d-inline-flex align-items-center justify-content-center`} style={{width:'2.25rem',height:'2.25rem'}}>
                      <i className={`bi ${it.icon}`}></i>
                    </span>
                    <h5 className="h5 fw-bold mb-0">{it.title}</h5>
                  </div>
                  <p className="text-secondary mb-0 small">{it.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
