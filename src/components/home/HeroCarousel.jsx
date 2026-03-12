import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function HeroCarousel() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSlides = async () => {
    setLoading(true)
    try{
      const res = await axios.get(endpoints.CAROUSEL)
      // filter active, sort by order_index asc, take first 3
      const data = (res.data || []).filter(s => s.active).sort((a,b)=> (a.order_index||0) - (b.order_index||0)).slice(0,3)
      setSlides(data)
    }catch(err){
      console.error('HeroCarousel fetch error', err)
    }finally{setLoading(false)}
  }

  useEffect(()=>{ fetchSlides() }, [])

  // fallback static images when API returns none
  const fallback = [
    {
      id: 'f1',
      url: '/assets/images/Hero1.jpg',
      alt: 'Formacion tecnica',
      title: 'ETP - Escuelas Tecnicas del Peru',
      subtitle: 'Capacitate con nosotros',
      description: 'Formacion tecnica y profesional para potenciar tu futuro.'
    },
    {
      id: 'f2',
      url: '/assets/images/Hero1.jpg',
      alt: 'Modalidades',
      title: 'Modalidades flexibles',
      subtitle: 'Presencial y virtual',
      description: 'Estudia a tu ritmo con docentes especializados.'
    },
    {
      id: 'f3',
      url: '/assets/images/Hero1.jpg',
      alt: 'Especialidades',
      title: 'Especialidades de alta demanda',
      subtitle: 'Cursos y programas',
      description: 'Construye habilidades practicas con certificacion.'
    }
  ]

  const items = (slides.length > 0
    ? slides.map(s => ({
        id: s.id,
        url: s.media?.url,
        alt: s.media?.alt_text || s.title,
        title: s.title || '',
        subtitle: s.subtitle || '',
        description: s.description || ''
      }))
    : fallback
  )
    .filter(it => Boolean(it.url))
    .slice(0, 3)

  const carouselRef = useRef(null)

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    let instance = null
    // prefer Bootstrap's Carousel if available
    try{
      if (window.bootstrap && window.bootstrap.Carousel) {
        instance = new window.bootstrap.Carousel(el, { interval: 1000, ride: 'carousel', pause: 'hover', touch: true })
      } else {
        // fallback: advance by clicking next every 5s
        const timer = setInterval(() => {
          const btn = el.querySelector('.carousel-control-next')
          if (btn) btn.click()
        }, 5000)
        instance = { _fallbackTimer: timer }
      }
    }catch(e){
      console.error('init hero carousel autoplay', e)
    }

    return () => {
      try{
        if (instance) {
          if (instance.dispose) instance.dispose()
          if (instance._fallbackTimer) clearInterval(instance._fallbackTimer)
        }
      }catch(e){}
    }
  }, [items.length])

  return (
    <section id="inicio">
      <div id="heroCarousel" ref={carouselRef} className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
        <div className="carousel-indicators">
          {items.map((_, i) => (
            <button key={i} type="button" data-bs-target="#heroCarousel" data-bs-slide-to={i} className={i===0 ? 'active' : ''} aria-current={i===0 ? 'true' : undefined} aria-label={`Slide ${i+1}`}></button>
          ))}
        </div>

        <div className="carousel-inner">
          {items.map((it, idx) => (
            <div key={it.id} className={`carousel-item${idx===0 ? ' active' : ''}`}>
              <img src={it.url} className="d-block w-100 hero-carousel" alt={it.alt || ''} />
              {(it.subtitle || it.description) && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
                  <div className="container">
                    <div className="row justify-content-start">
                      <div className="col-10 col-md-9 col-lg-7 text-start ps-3 ps-md-0 pe-0">
                        {it.subtitle && (
                          <>
                            <p
                              className="d-block d-md-none fw-bold mb-1 lh-1"
                              style={{
                                color: 'var(--accent)',
                                fontSize: 'clamp(1.2rem, 7vw, 1.9rem)',
                                fontFamily: 'Poppins, sans-serif',
                                letterSpacing: '-0.05em',
                                maxWidth: '13ch'
                              }}
                            >
                              {it.subtitle}
                            </p>
                            <p
                              className="d-none d-md-block fw-bold mb-2 mb-md-3 lh-1"
                              style={{
                                color: 'var(--accent)',
                                fontSize: 'clamp(1.55rem, 5.2vw, 4.1rem)',
                                fontFamily: 'Poppins, sans-serif',
                                letterSpacing: '-0.05em',
                                maxWidth: '17ch'
                              }}
                            >
                              {it.subtitle}
                            </p>
                          </>
                        )}
                        {it.description && (
                          <div className="border-start border-4 ps-3 d-none d-md-block" style={{borderColor:'var(--accent)'}}>
                            <p
                              className="mb-0"
                              style={{
                                color: '#ffffff',
                                fontSize: 'clamp(1.3rem, 2.5vw, 2.2rem)',
                                fontWeight: 700,
                                fontFamily: 'Poppins, sans-serif',
                                letterSpacing: '-0.05em',
                                lineHeight: 1.25,
                                maxWidth: '30ch'
                              }}
                            >
                              {it.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </section>
  )
}
