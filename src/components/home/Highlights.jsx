import React from 'react'

export default function Highlights(){
  const items = [
    {title: 'Modalidades', text: 'Presencial y Virtual para tu comodidad', icon: 'bi-laptop', iconBg: 'bg-primary'},
    {title: 'Certificacion', text: 'Cursos con certificacion oficial reconocida', icon: 'bi-award', iconBg: 'bg-warning'},
    {title: '+14 años', text: 'De experiencia formando profesionales tecnicos', icon: 'bi-star-fill', iconBg: 'bg-primary'}
  ]

  return (
    <section className="py-4">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {items.map((it, idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="card h-100 border shadow-sm rounded-3">
                <div className="card-body d-flex align-items-center gap-3 p-4">
                  <div className={`rounded-3 d-inline-flex align-items-center justify-content-center text-white ${it.iconBg} p-3`}>
                    <i className={`bi ${it.icon} fs-5`}></i>
                  </div>
                  <div>
                    <h5 className="h6 fw-bold mb-1">{it.title}</h5>
                    <p className="small text-secondary mb-0">{it.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
