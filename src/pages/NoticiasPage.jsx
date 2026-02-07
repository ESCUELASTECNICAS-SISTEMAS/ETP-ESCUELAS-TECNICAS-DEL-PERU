import React from 'react'

const sample = [
  {
    id: 1,
    titulo: 'Seminario: Nuevas tecnologías en automatización',
    fecha: '2026-03-12',
    resumen: 'Charlas y talleres prácticos sobre automatización industrial y PLCs. Dirigido a estudiantes y profesionales que desean actualizar sus habilidades.'
  },
  {
    id: 2,
    titulo: 'Jornada: Empleabilidad y habilidades técnicas',
    fecha: '2026-04-02',
    resumen: 'Panel de empleadores y taller de preparación de CV enfocado en perfiles técnicos. Actividades de networking.'
  },
  {
    id: 3,
    titulo: 'Curso corto: Diseño y edición de video',
    fecha: '2026-05-10',
    resumen: 'Curso intensivo de 30 horas sobre técnicas básicas y avanzadas de edición para redes sociales.'
  }
]

export default function NoticiasPage(){
  return (
    <section id="noticias-page" className="section-padding">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Noticias y Seminarios</h2>
          <p className="text-muted">Mantente informado sobre eventos, cursos y convocatorias.</p>
        </div>

        <div className="row g-4">
          {sample.map((n) => (
            <div className="col-12 col-md-6" key={n.id}>
              <div className="card h-100">
                <div className="row g-0">
                  <div className="col-4 d-none d-sm-block">
                    <div style={{height: '100%', background: 'linear-gradient(90deg,#0b67d0,#ff7a00)'}}></div>
                  </div>
                  <div className="col">
                    <div className="card-body">
                      <h5 className="card-title">{n.titulo}</h5>
                      <p className="text-muted small">Fecha: {n.fecha}</p>
                      <p>{n.resumen}</p>
                      <a href="#" className="btn btn-outline-primary btn-sm">Leer más</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="my-5" />

        <h3 className="mb-3">Próximos seminarios</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam.</p>

        <ul className="list-group mt-3">
          <li className="list-group-item">Seminario: Introducción a la energía renovable — 2026-06-01</li>
          <li className="list-group-item">Seminario: Herramientas digitales para docentes — 2026-06-15</li>
          <li className="list-group-item">Seminario: Taller de emprendimiento técnico — 2026-07-05</li>
        </ul>
      </div>
    </section>
  )
}
