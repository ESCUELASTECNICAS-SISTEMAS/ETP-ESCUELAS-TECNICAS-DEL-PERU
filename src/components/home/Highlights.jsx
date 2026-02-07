import React from 'react'

export default function Highlights(){
  const items = [
    {title: 'Modalidades', text: 'Presencial · Virtual', icon: 'bi-laptop'},
    {title: 'Certificados', text: 'Cursos con certificación oficial y reconocida', icon: 'bi-award'},
    {title: 'Más de 13 años de experiencia', text: 'Más de una década formando técnicos', icon: 'bi-star-fill'}
  ]

  return (
    <section className="section-padding bg-light">
      <div className="container">
        <div className="row g-4">
          {items.map((it, idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="card h-100 shadow-sm highlight-card">
                <div className="card-body text-center">
                  <div className="high-icon mb-3 mx-auto">
                    <i className={`bi ${it.icon} fs-2 text-white`}></i>
                  </div>
                  <h5 className="card-title">{it.title}</h5>
                  <p className="card-text">{it.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
