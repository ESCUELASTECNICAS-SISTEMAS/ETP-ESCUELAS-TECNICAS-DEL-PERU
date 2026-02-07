import React, { useState, useEffect } from 'react'
import carreras from '../../data/carreras.json'
import noticias from '../../data/noticias.json'
import CourseCard from '../UI/CourseCard'

export default function Carreras(){
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if(!noticias || noticias.length === 0) return
    if(paused) return
    const id = setInterval(() => setCurrent(i => (i + 1) % noticias.length), 3500)
    return () => clearInterval(id)
  }, [paused])

  const prev = () => setCurrent(i => (i - 1 + noticias.length) % noticias.length)
  const next = () => setCurrent(i => (i + 1) % noticias.length)

  return (
    <section id="carreras" className="section-padding">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Carreras</h3>
              <a href="#" className="link-primary">Ver todas</a>
            </div>

            <div className="row g-4">
              {carreras.map((c, i) => (
                <div className="col-12 col-md-4" key={i}>
                  <CourseCard item={c} />
                </div>
              ))}
            </div>
          </div>

          <aside className="col-12 col-md-3 d-none d-md-block">
            <div className="news-aside" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              <h5 className="mb-3">Noticias</h5>
              {noticias && noticias.length > 0 && (
                <div className="news-viewport" style={{height: Math.min(4, noticias.length) * 86 + 'px'}}>
                  <div className="news-list" style={{transform: `translateY(-${current * 86}px)`}}>
                    {noticias.map((n, idx) => (
                      <a href="/noticias" key={idx} className="news-item card small-card text-decoration-none text-dark">
                        <div className="row g-0">
                          <div className="col-4">
                            <img src={n.image || '/assets/images/Hero1.jpg'} alt={n.titulo} className="img-fluid rounded-start" style={{height:'100%',objectFit:'cover'}} />
                          </div>
                          <div className="col-8">
                            <div className="card-body py-2 px-2">
                              <h6 className="card-title mb-1" style={{fontSize:'.92rem'}}>{n.titulo}</h6>
                              <p className="small text-muted mb-0">{n.resumen}</p>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={prev} aria-label="Anterior noticia">↑</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={next} aria-label="Siguiente noticia">↓</button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
