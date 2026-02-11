import React from 'react'
import { Link } from 'react-router-dom'

export default function CourseCard({ item, showPrice = true }) {
  const price = item.precio ?? item.pago_unico ?? null
  const matricula = item.matricula ?? item.matricula
  const pension = item.pension ?? item.pension_mensual ?? null

  const discountedPrice = item.descuento_pct
    ? Math.round((price * (100 - item.descuento_pct)) / 100)
    : null

  const imgSrc = item.image || item.imagen || item.image_url || item.url || (item.thumbnail && item.thumbnail.url) || (item.media && item.media.url) || item.foto || null

  const modalidad = item.modalidad || item.mode || item.modality || item.modalidad_tipo || ''
  const hoursVal = item.duration || item.hours || item.horas || null
  const grado = item.grado || null
  const subtitle = item.subtitle || item.descripcion || ''
  const detailUrl = item.tipo === 'Programa' ? `/programa/${item.id}` : `/curso/${item.id}`

  return (
    <div className="cc-card">
      <div className="cc-img-wrap">
        {imgSrc ? (
          <img src={imgSrc} className="cc-img" alt={item.titulo || item.title || ''} />
        ) : (
          <div className="cc-img-placeholder">
            <i className="bi bi-mortarboard fs-1"></i>
          </div>
        )}
        <div className="cc-img-overlay">
          <Link to={detailUrl} className="btn btn-sm btn-light cc-overlay-btn"><i className="bi bi-eye me-1"></i>Ver más</Link>
          <Link to="/contacto" className="btn btn-sm btn-accent cc-overlay-btn"><i className="bi bi-send me-1"></i>Inscribirme</Link>
        </div>
        {grado && <span className="cc-badge-grado">{grado}</span>}
      </div>
      <div className="cc-body">
        <h5 className="cc-title">{item.titulo || item.title}</h5>
        {subtitle && <p className="cc-subtitle">{subtitle.length > 80 ? subtitle.slice(0,80)+'…' : subtitle}</p>}
        <div className="cc-meta">
          {modalidad && <span className="cc-meta-item"><i className="bi bi-laptop"></i>{modalidad}</span>}
          {hoursVal && <span className="cc-meta-item"><i className="bi bi-clock"></i>{hoursVal} {typeof hoursVal === 'number' ? 'hrs' : ''}</span>}
        </div>

        {showPrice && price != null && (
          <div className="cc-price">
            {discountedPrice ? (
              <>
                <span className="cc-price-old">S/ {price}</span>
                <span className="cc-price-now">S/ {discountedPrice}</span>
              </>
            ) : (
              <span className="cc-price-now">S/ {price}</span>
            )}
          </div>
        )}

        {showPrice && matricula != null && pension != null && (
          <div className="cc-fees">
            <span>Matrícula: <strong>S/ {matricula}</strong></span>
            <span>Pensión: <strong>S/ {pension}</strong></span>
          </div>
        )}

        <Link to={detailUrl} className="cc-cta">
          Ver detalles <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  )
}
