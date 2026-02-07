import React from 'react'

export default function Highlights(){
  const items = [
    {title: 'Modalidades', text: 'Presencial • Virtual • Semipresencial', icon: 'bi-laptop'},
    {title: 'Especialidades', text: 'Mecatrónica, Electricidad, Informática, Automotriz', icon: 'bi-gear'},
    {title: 'Carreras', text: 'Técnico en 2 años, certificados reconocidos', icon: 'bi-mortarboard'}
  ]

  return (
    <section className="section-padding bg-light">
      <div className="container">
        <div className="row g-4">
          {items.map((it, idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div className="highlight-dot mb-3 mx-auto" />
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
