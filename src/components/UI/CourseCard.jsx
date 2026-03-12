import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function CourseCard({ item, showPrice = true }) {
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [sucursales, setSucursales] = useState([])
  const [defaultSedeId, setDefaultSedeId] = useState(null)

  useEffect(() => {
    if (!showBranchModal) return
    axios.get(endpoints.SUCURSALES)
      .then(r => {
        const list = (Array.isArray(r.data) ? r.data : []).filter(s => s.active !== false)
        setSucursales(list)
        const ica = list.find(s => (s.nombre || s.name || '').toLowerCase().includes('ica'))
        if (ica) setDefaultSedeId(ica.id)
      })
      .catch(() => setSucursales([]))
  }, [showBranchModal])

  const openWhatsApp = (suc) => {
    const nombre = item.titulo || item.title || 'este curso'
    const sucName = suc.nombre || suc.name || ''
    const phoneRaw = (suc.telefono || suc.phone || suc.telefono_whatsapp || '950340502').replace(/\D/g, '')
    const number = phoneRaw.startsWith('51') ? phoneRaw : '51' + phoneRaw
    const rawMod = String(item.modalidad || item.mode || item.modality || '').toLowerCase()
    const esVirtual = rawMod.includes('virtual') || Boolean(item.is_virtual)
    const modalidadTxt = esVirtual ? ' en modalidad VIRTUAL' : ''
    const msg = encodeURIComponent(`Hola, vengo desde la p\u00e1gina y me interesa inscribirme en el curso: ${nombre}${modalidadTxt} y soy de la sucursal ${sucName}`)
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank')
    setShowBranchModal(false)
  }

  const price = item.precio ?? item.price ?? item.pago_unico ?? null
  const matricula = item.matricula ?? item.enrollment ?? null
  const pension = item.pension ?? item.pension_mensual ?? null
  const isOffer = Boolean(item.oferta ?? item.en_oferta)
  const discountPct = item.descuento ?? item.descuento_pct ?? null

  const applyDiscount = (amount) => {
    if (!isOffer || discountPct == null || amount == null) return null
    return Math.round((Number(amount) * (100 - Number(discountPct))) / 100)
  }

  const discountedPrice = applyDiscount(price)
  const discountedPension = applyDiscount(pension)
  const hasMatricula = matricula != null && Number(matricula) > 0
  const hasPension = pension != null && Number(pension) > 0
  const isPackageSinglePayment = showPrice && price != null && !hasMatricula && !hasPension

  const imgSrc = item.image || item.imagen || item.image_url || item.url || (item.thumbnail && item.thumbnail.url) || (item.media && item.media.url) || item.foto || null

  const hoursVal = item.duration || item.hours || item.horas || null
  const subtitle = item.subtitle || item.descripcion || ''
  const detailUrl = item.tipo === 'Programa' ? `/programa/${item.id}` : `/curso/${item.id}`

  return (
    <div className="cc-card card border border-secondary-subtle shadow-sm h-100">
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
          <button type="button" onClick={()=>setShowBranchModal(true)} className="btn btn-sm btn-success cc-overlay-btn" style={{backgroundColor:'#25D366',borderColor:'#25D366'}}><i className="bi bi-whatsapp me-1"></i>Inscribirme</button>
        </div>
        {/* Modal selección de sucursal */}
        {showBranchModal && (
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.6)',borderRadius:'inherit',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',padding:'.8rem'}} onClick={()=>setShowBranchModal(false)}>
            <div style={{background:'#fff',borderRadius:14,padding:'1.4rem',minWidth:240,maxWidth:320,boxShadow:'0 8px 28px rgba(0,0,0,.25)'}} onClick={e=>e.stopPropagation()}>
              <p className="fw-bold text-center mb-2" style={{fontSize:'1.05rem'}}>Selecciona tu sede</p>
              <div style={{background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:10,padding:'.55rem .75rem',marginBottom:'.8rem',fontSize:'.8rem',color:'#2e7d32',display:'flex',alignItems:'center',gap:'.4rem'}}>
                <i className="bi bi-geo-alt-fill"></i>
                <span>Estás en sede <strong>Ica</strong>. Puedes cambiar si deseas.</span>
              </div>
              {sucursales.length === 0 && <p className="text-muted small text-center">Cargando...</p>}
              <div className="d-grid gap-2">
                {sucursales.map(s => {
                  const isDefault = s.id === defaultSedeId
                  return (
                    <button key={s.id}
                      className="btn d-flex align-items-center justify-content-center gap-2"
                      style={{
                        backgroundColor: isDefault ? '#25D366' : 'transparent',
                        borderColor: '#25D366',
                        color: isDefault ? '#fff' : '#25D366',
                        fontSize:'1rem',
                        padding:'.65rem 1rem',
                        fontWeight: isDefault ? 700 : 500,
                        borderWidth:2, borderStyle:'solid', borderRadius:10,
                      }}
                      onClick={()=>openWhatsApp(s)}
                    >
                      <i className={`bi ${isDefault ? 'bi-geo-alt-fill' : 'bi-whatsapp'}`}></i>
                      {s.nombre || s.name}
                      {isDefault && <span style={{fontSize:'.65rem',background:'rgba(255,255,255,.3)',borderRadius:6,padding:'1px 6px',marginLeft:4}}>✓ Sede actual</span>}
                    </button>
                  )
                })}
              </div>
              <button className="btn btn-outline-secondary w-100 mt-2" style={{fontSize:'.9rem',padding:'.5rem',borderRadius:10}} onClick={()=>setShowBranchModal(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
      <div className="cc-body">
        <h5 className="cc-title">{item.titulo || item.title}</h5>
        {subtitle && <p className="cc-subtitle">{subtitle.length > 80 ? subtitle.slice(0,80)+'…' : subtitle}</p>}
        <div className="cc-meta">
          {hoursVal && <span className="cc-meta-item"><i className="bi bi-clock"></i>{String(hoursVal).toUpperCase()} {typeof hoursVal === 'number' ? 'HRS' : ''}</span>}
        </div>

        {showPrice && price != null && (
          <div className="cc-price">
            {discountedPrice ? (
              <>
                <span className="cc-price-old">S/ {price}</span>
                <span className="cc-price-now">S/ {discountedPrice}</span>
                <span className="badge bg-danger ms-2">-{discountPct}%</span>
              </>
            ) : (
              <span className="cc-price-now">S/ {price}</span>
            )}
          </div>
        )}

        {showPrice && (hasMatricula || hasPension) && (
          <div className="cc-fees">
            {hasMatricula && (
              <span>
                Matrícula: 
                <strong className="ms-1">S/ {matricula}</strong>
              </span>
            )}
            {hasPension && (
              <span>
                Mensualidad: 
                {discountedPension != null ? (
                  <>
                    <span className="cc-price-old ms-1">S/ {pension}</span>
                    <strong className="ms-1">S/ {discountedPension}</strong>
                  </>
                ) : (
                  <strong className="ms-1">S/ {pension}</strong>
                )}
              </span>
            )}
            <span
              className="text-muted"
              title="Matrícula única. La mensualidad se paga por unidad, módulo o mes según el curso o carrera."
              aria-label="Información de matrícula y mensualidad"
              style={{ cursor: 'help' }}
            >
              <i className="bi bi-info-circle"></i>
            </span>
          </div>
        )}

        {isPackageSinglePayment && (
          <div className="mt-2">
            <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">
              Paquete completo pago unico
            </span>
          </div>
        )}

        <Link to={detailUrl} className="cc-cta">
          Ver detalles <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  )
}
