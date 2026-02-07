import React from 'react'
import info from '../../data/informatica.json'

export default function Informatica(){
  if(!info) return null

  return (
    <section id="informatica" className="section-padding">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Cursos Informáticos</h3>
          <a href="#" className="link-primary">Ver todos</a>
        </div>
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Paquete Informática</h5>
                <p className="text-muted">Incluye: {info.cursos.join(', ')}</p>
                <div className="mt-3">
                  <div>Matrícula: <strong>S/ {info.matricula}</strong></div>
                  <div>Pensión: <strong>S/ {info.pension}</strong></div>
                  <div className="text-success">Promoción: Matrícula S/ {info.promocion.matricula_desc} - Pensión S/ {info.promocion.pension_desc}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h6>Temas</h6>
                <ul>
                  {info.cursos.map((c,i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
