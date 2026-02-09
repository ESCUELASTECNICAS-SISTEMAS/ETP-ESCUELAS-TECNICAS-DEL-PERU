import React from 'react'

export default function CourseCard({ item, showPrice = true }) {
  const price = item.precio ?? item.pago_unico ?? null
  const matricula = item.matricula ?? item.matricula
  const pension = item.pension ?? item.pension_mensual ?? null

  const discountedPrice = item.descuento_pct
    ? Math.round((price * (100 - item.descuento_pct)) / 100)
    : null

  // resolve image from multiple possible shapes (static data, API with thumbnail/media, different keys)
  const imgSrc = item.image || item.imagen || item.image_url || item.url || (item.thumbnail && item.thumbnail.url) || (item.media && item.media.url) || item.foto || null

  const modalidad = item.modalidad || item.mode || item.modality || item.modalidad_tipo || ''
  const hoursVal = item.duration || item.hours || item.horas || null
  const durationDays = item.duration_days || item.duracion_dias || (hoursVal ? Math.ceil(Number(hoursVal) / 8) : null)

  return (
    <div className="card h-100">
      <div className="card-img-wrapper">
        {imgSrc ? (
          <img src={imgSrc} className="card-img-top" alt={item.titulo || item.titulo} />
        ) : (
          <div className="card-image-placeholder d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div className="fs-4 fw-bold">Imagen</div>
              <div className="text-muted">{item.titulo}</div>
            </div>
          </div>
        )}

        <div className="card-hover-overlay">
          <div className="overlay-ctas">
            <a href={item.tipo === 'Programa' ? `/programa/${item.id}` : `/curso/${item.id}`} className="btn btn-sm btn-light me-2">Ver temario</a>
            <a href="#contacto" className="btn btn-sm btn-accent">Inscribirme</a>
          </div>
        </div>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{item.titulo}</h5>
        <p className="text-muted">{modalidad ? `• ${modalidad}` : ''} {durationDays ? `• ${durationDays} días` : ''}</p>

        {showPrice ? (
          <>
            {price != null && (
              <p className="mt-2">
                <strong>Precio:</strong>{' '}
                {discountedPrice ? (
                  <span>
                    <span className="text-decoration-line-through me-2">S/ {price}</span>
                    <span className="text-danger">S/ {discountedPrice}</span>
                  </span>
                ) : (
                  <span>S/ {price}</span>
                )}
              </p>
            )}

            {matricula != null && pension != null && (
              <div className="mt-2">
                <div>Matrícula: <strong>S/ {matricula}</strong></div>
                <div>Pensión: <strong>S/ {pension}</strong></div>
                {item.descuento_pct && <div className="text-success">Descuento: {item.descuento_pct}%</div>}
              </div>
            )}
          </>
        ) : null}

        <div className="mt-auto">
          <a href={item.tipo === 'Programa' ? `/programa/${item.id}` : `/curso/${item.id}`} className="btn btn-primary">Temario</a>
        </div>
      </div>
    </div>
  )
}
