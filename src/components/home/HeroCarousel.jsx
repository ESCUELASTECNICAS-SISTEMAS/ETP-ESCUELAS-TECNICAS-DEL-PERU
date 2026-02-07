import React from 'react'

export default function HeroCarousel() {
  return (
    <section id="inicio">
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/assets/images/Hero1.jpg" className="d-block w-100 hero-carousel" alt="Formación técnica"/>
            <div className="carousel-caption d-none d-md-block text-start" style={{bottom: '20%'}}>
              <h1 className="display-5 fw-bold">Forma tu futuro técnico hoy</h1>
              <p className="lead">Carreras y cursos diseñados para el mercado laboral.</p>
              <p>
                <a className="btn btn-primary btn-lg me-2" href="#cursos">Ver Cursos</a>
                <a className="btn btn-accent btn-lg" href="#contacto">Inscríbete</a>
              </p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/assets/images/Hero1.jpg" className="d-block w-100 hero-carousel" alt="Modalidades"/>
            <div className="carousel-caption d-none d-md-block text-start" style={{bottom: '20%'}}>
              <h2 className="fw-bold">Modalidades flexibles: Presencial y virtual</h2>
              <p>Aprende a tu ritmo con docentes especializados.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/assets/images/Hero1.jpg" className="d-block w-100 hero-carousel" alt="Especialidades"/>
            <div className="carousel-caption d-none d-md-block text-start" style={{bottom: '20%'}}>
              <h2 className="fw-bold">Especialízate en áreas técnicas demandadas</h2>
              <p>Automotriz, Electricidad, Informática, Mecatrónica y más.</p>
            </div>
          </div>
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
