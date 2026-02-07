import React from 'react'
import HeroCarousel from '../components/home/HeroCarousel'
import Highlights from '../components/home/Highlights'
import Cursos from '../components/sections/cursos'
import noticias from '../data/noticias.json'

export default function HomePage(){
  return (
    <div>
      <HeroCarousel />
      <Highlights />
      <Cursos />

      <section id="noticias" className="section-padding bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Últimas noticias</h3>
            <a href="#" className="link-primary">Ver todas</a>
          </div>
          <div className="row g-4">
            {noticias.map((n,i) => (
              <div className="col-12 col-md-6" key={i}>
                <div className="card h-100">
                  <div className="row g-0">
                    <div className="col-4 d-none d-sm-block">
                      <img src={n.image || '/assets/images/Hero1.jpg'} className="img-fluid rounded-start h-100" style={{objectFit: 'cover'}} alt={n.titulo} />
                    </div>
                    <div className="col">
                      <div className="card-body">
                        <h5 className="card-title">{n.titulo}</h5>
                        <p className="card-text text-muted">{n.resumen}</p>
                        <a href="#" className="stretched-link">Leer más</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
