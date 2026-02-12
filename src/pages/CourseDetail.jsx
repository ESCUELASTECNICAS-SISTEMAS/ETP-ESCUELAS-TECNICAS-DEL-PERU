import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

/* ── helpers ── */
const resolveImage = (c) => {
  if (!c) return null
  if (c.thumbnail && c.thumbnail.url) return c.thumbnail.url
  if (c.media && c.media.url) return c.media.url
  return c.image || c.imagen || c.image_url || c.url || c.foto || null
}

const parseJsonField = (v) => {
  if (!v) return null
  if (Array.isArray(v)) return v
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : [p] } catch(e){} }
  return null
}

const renderSections = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return null
  return arr.map((el, i) => {
    if (typeof el === 'string') return <li key={i} className="cd-list-item">{el}</li>
    if (el && el.title) return (
      <div key={i} className="cd-section-block">
        <h6 className="cd-section-title"><i className="bi bi-journal-bookmark-fill me-2"></i>{el.title}</h6>
        {Array.isArray(el.items) && el.items.length > 0 && (
          <ul className="cd-section-items">
            {el.items.map((it, ii) => <li key={ii}>{it}</li>)}
          </ul>
        )}
      </div>
    )
    return null
  })
}

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('temario')

  useEffect(() => {
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const res = await axios.get(`${endpoints.COURSES}/${id}`)
        setCourse(res.data)
      } catch (err) {
        console.error(err)
        try {
          const all = await axios.get(endpoints.COURSES)
          const found = (all.data || []).find(c => String(c.id) === String(id) || c.slug === id)
          if (found) setCourse(found)
          else setError('Curso no encontrado')
        } catch { setError('No se pudo cargar el curso') }
      } finally { setLoading(false) }
    })()
  }, [id])

  if (loading) return (
    <div className="section-padding">
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    </div>
  )

  if (error || !course) return (
    <div className="section-padding">
      <div className="container text-center py-5">
        <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
        <h4 className="mt-3">{error || 'Curso no encontrado'}</h4>
        <button onClick={() => navigate(-1)} className="btn-back mt-3"><i className="bi bi-arrow-left"></i> Volver</button>
      </div>
    </div>
  )

  const img = resolveImage(course)
  const temario = parseJsonField(course.temario)
  const modulos = parseJsonField(course.modulos)

  return (
    <div className="cd-page">
      {/* ═══ HERO ═══ */}
      <div className="cd-hero">
        <div className="bubble-1"></div>
        <div className="bubble-2"></div>
        <div className="bubble-3"></div>
        <div className="bubble-4"></div>
        <div className="bubble-5"></div>
        <div className="cd-hero-overlay">
          <div className="container">
            <button onClick={() => navigate(-1)} className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver</button>
            <div className="cd-hero-content">
              {course.grado && <span className="cd-badge-grado">{course.grado}</span>}
              <h1 className="cd-hero-title">{course.title}</h1>
              {course.subtitle && <p className="cd-hero-subtitle">{course.subtitle}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ INFO BADGES ═══ */}
      <div className="container">
        <div className="cd-info-strip">
          {course.hours && (
            <div className="cd-info-badge">
              <i className="bi bi-clock"></i>
              <div><small>Horas</small><strong>{course.hours}</strong></div>
            </div>
          )}
          {course.duration && (
            <div className="cd-info-badge">
              <i className="bi bi-calendar3"></i>
              <div><small>Duración</small><strong>{course.duration}</strong></div>
            </div>
          )}
          {course.registro && (
            <div className="cd-info-badge">
              <i className="bi bi-award"></i>
              <div><small>Registro</small><strong>{course.registro}</strong></div>
            </div>
          )}
          {course.modalidad && (
            <div className="cd-info-badge">
              <i className="bi bi-laptop"></i>
              <div><small>Modalidad</small><strong>{course.modalidad}</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="container cd-body">
        <div className="row g-4">
          {/* LEFT COLUMN — main content */}
          <div className="col-12 col-lg-8">
            {/* Descripción */}
            {course.description && (
              <div className="cd-card">
                <h4 className="cd-card-title"><i className="bi bi-info-circle-fill me-2"></i>Descripción</h4>
                <p className="cd-description">{course.description}</p>
              </div>
            )}

            {/* Tabs: Temario / Módulos */}
            {(temario || modulos) && (
              <div className="cd-card">
                <div className="cd-tabs">
                  {temario && (
                    <button className={`cd-tab ${activeTab === 'temario' ? 'active' : ''}`} onClick={() => setActiveTab('temario')}>
                      <i className="bi bi-list-check me-1"></i>Temario
                    </button>
                  )}
                  {modulos && (
                    <button className={`cd-tab ${activeTab === 'modulos' ? 'active' : ''}`} onClick={() => setActiveTab('modulos')}>
                      <i className="bi bi-diagram-3 me-1"></i>Módulos
                    </button>
                  )}
                </div>
                <div className="cd-tab-content">
                  {activeTab === 'temario' && temario && renderSections(temario)}
                  {activeTab === 'modulos' && modulos && renderSections(modulos)}
                </div>
              </div>
            )}

            {/* Misión / Visión */}
            {(course.mision || course.vision) && (
              <div className="cd-card">
                <h4 className="cd-card-title"><i className="bi bi-bullseye me-2"></i>Misión y Visión</h4>
                <div className="row g-3">
                  {course.mision && (
                    <div className="col-12 col-md-6">
                      <div className="cd-mv-box cd-mision">
                        <h6><i className="bi bi-flag-fill me-2"></i>Misión</h6>
                        <p>{course.mision}</p>
                      </div>
                    </div>
                  )}
                  {course.vision && (
                    <div className="col-12 col-md-6">
                      <div className="cd-mv-box cd-vision">
                        <h6><i className="bi bi-eye-fill me-2"></i>Visión</h6>
                        <p>{course.vision}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — sidebar */}
          <div className="col-12 col-lg-4">
            {/* Thumbnail card */}
            {img && (
              <div className="cd-sidebar-card">
                <img src={img} alt={course.thumbnail?.alt_text || course.title} className="cd-sidebar-img" />
              </div>
            )}

            {/* Perfil egresado */}
            {course.perfil_egresado && (
              <div className="cd-sidebar-card">
                <h5 className="cd-sidebar-title"><i className="bi bi-person-check-fill me-2"></i>Perfil del Egresado</h5>
                <p className="cd-sidebar-text">{course.perfil_egresado}</p>
              </div>
            )}

            {/* Convenios */}
            {course.convenios && course.convenios.length > 0 && (
              <div className="cd-sidebar-card">
                <h5 className="cd-sidebar-title"><i className="bi bi-handshake me-2"></i>Convenios</h5>
                {course.convenios.map(conv => (
                  <div key={conv.id} className="cd-convenio">
                    {conv.logo && <img src={conv.logo} alt={conv.institucion} className="cd-convenio-logo" />}
                    <div>
                      <strong>{conv.institucion}</strong>
                      {conv.descripcion && <p className="mb-1 small text-muted">{conv.descripcion}</p>}
                      {conv.url && <a href={conv.url} target="_blank" rel="noopener noreferrer" className="small">Visitar <i className="bi bi-box-arrow-up-right"></i></a>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Docentes */}
            {course.docentes && course.docentes.length > 0 && (
              <div className="cd-sidebar-card">
                <h5 className="cd-sidebar-title"><i className="bi bi-people-fill me-2"></i>Docentes</h5>
                {course.docentes.map((d, i) => (
                  <div key={i} className="cd-docente">
                    {d.foto && <img src={d.foto} alt={d.nombre} className="cd-docente-foto" />}
                    <div>
                      <strong>{d.nombre}</strong>
                      {d.especialidad && <div className="small text-muted">{d.especialidad}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Seminarios */}
            {course.seminarios && course.seminarios.length > 0 && (
              <div className="cd-sidebar-card">
                <h5 className="cd-sidebar-title"><i className="bi bi-mic-fill me-2"></i>Seminarios</h5>
                {course.seminarios.map((s, i) => (
                  <div key={i} className="mb-2">
                    <strong>{s.titulo || s.title}</strong>
                    {s.fecha && <div className="small text-muted">{s.fecha}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Certificados */}
            {course.certificados && course.certificados.length > 0 && (
              <div className="cd-sidebar-card">
                <h5 className="cd-sidebar-title"><i className="bi bi-patch-check-fill me-2"></i>Certificados</h5>
                {course.certificados.map((cert, i) => (
                  <div key={i} className="mb-2">
                    <strong>{cert.nombre || cert.title}</strong>
                    {cert.descripcion && <div className="small text-muted">{cert.descripcion}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="cd-sidebar-card cd-cta-card">
              <h5>¿Interesado?</h5>
              <p className="small mb-3">Contáctanos para más información sobre matrícula y horarios.</p>
              <Link to="/contacto" className="btn btn-accent w-100"><i className="bi bi-envelope me-2"></i>Contactar</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
