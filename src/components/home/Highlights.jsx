import React from 'react'

export default function Highlights(){
  const items = [
    {title: 'Modalidades', text: 'Presencial y Virtual para tu comodidad', icon: 'bi-laptop', color: 'var(--primary)'},
    {title: 'Certificación', text: 'Cursos con certificación oficial reconocida', icon: 'bi-award', color: 'var(--accent)'},
    {title: '+13 Años', text: 'De experiencia formando profesionales técnicos', icon: 'bi-star-fill', color: 'var(--primary)'}
  ]

  return (
    <section className="hl-section">
      <div className="container">
        <div className="row g-4 hl-row">
          {items.map((it, idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="hl-card">
                <div className="hl-icon" style={{'--hl-color': it.color}}>
                  <i className={`bi ${it.icon}`}></i>
                </div>
                <div className="hl-text">
                  <h5 className="hl-title">{it.title}</h5>
                  <p className="hl-desc">{it.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
