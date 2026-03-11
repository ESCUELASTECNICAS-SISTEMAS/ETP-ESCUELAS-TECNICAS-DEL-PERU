import React from 'react'

export default function PriceSeatsFieldset({ form, handleChange }){
  return (
    <fieldset className="mb-3">
      <legend className="small fw-semibold">Precio y plazas</legend>
      <div className="row g-2 mb-2">
        <div className="col-12 col-md-4">
          <label className="form-label">Precio (S/)</label>
          <input type="number" min="0" step="0.01" className="form-control" value={form.precio} onChange={e=>handleChange('precio', e.target.value)} placeholder="Ej: 350" />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Matrícula (S/)</label>
          <input type="number" min="0" step="0.01" className="form-control" value={form.matricula} onChange={e=>handleChange('matricula', e.target.value)} placeholder="Ej: 50" />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label">Mensualidad (S/)</label>
          <input type="number" min="0" step="0.01" className="form-control" value={form.pension} onChange={e=>handleChange('pension', e.target.value)} placeholder="Ej: 180" />
        </div>
      </div>
      <div className="row g-2 align-items-end">
        <div className="col-8">
          <label className="form-label">Descuento (%)</label>
          <input type="number" min="0" max="100" step="0.01" className="form-control" value={form.descuento} onChange={e=>handleChange('descuento', e.target.value)} placeholder="Ej: 15" />
          <div className="small text-muted mt-1">Introduce porcentaje de descuento que se aplicará sobre el precio.</div>
        </div>
        <div className="col-4 text-end">
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="ofertaSwitch" checked={form.oferta} onChange={e=>handleChange('oferta', e.target.checked)} />
            <label className="form-check-label" htmlFor="ofertaSwitch">En oferta</label>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
