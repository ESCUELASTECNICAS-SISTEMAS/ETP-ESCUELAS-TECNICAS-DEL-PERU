import React, { useEffect, useRef, useState } from 'react'

// Props: mediaList (array), loading (bool), selectedId, onSelect(id), label
export default function MediaPicker({ mediaList = [], loading = false, selectedId, onSelect = () => {}, label = 'Seleccionar media' }){
  const [open, setOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const ref = useRef(null)

  useEffect(()=>{
    if(!open) return
    const onDoc = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = (mediaList || []).find(m => String(m.id) === String(selectedId))

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button type="button" className="form-select d-flex align-items-center justify-content-between" onClick={()=>setOpen(v=>!v)}>
        <span>{selected ? (selected.alt_text || `ID ${selected.id}`) : `-- ${label} --`}</span>
        <span className="text-muted">▾</span>
      </button>

      <div style={{width:90,height:60,flex:'0 0 90px',position:'absolute',right:0,top:6,borderRadius:6,overflow:'hidden',border:'1px solid #e9ecef',background:'#fff'}}>
        {selected ? (
          <img src={selected.url} alt={selected.alt_text||'preview'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        ) : (
          <div style={{display:'grid',placeItems:'center',height:'100%'}}><small className="text-muted">Sin media</small></div>
        )}
      </div>

      {open && (
        <div style={{position:'absolute',zIndex:30,top:'48px',left:0,right:0,maxHeight:320,overflowY:'auto',border:'1px solid #e9ecef',background:'#fff',padding:8,borderRadius:6,boxShadow:'0 6px 18px rgba(0,0,0,0.08)'}}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <small className="text-muted">Medias</small>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id={`showInactive-${label}`} checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} />
              <label className="form-check-label small text-muted" htmlFor={`showInactive-${label}`}>Mostrar desactivados</label>
            </div>
          </div>
          <div className="row g-2">
            {loading && <div className="col-12 text-center text-muted">Cargando medias...</div>}
            {!loading && (mediaList || []).filter(m=> (showInactive ? true : m.active)).length === 0 && <div className="col-12 text-muted">No hay medias.</div>}
            {(mediaList || []).filter(m=> (showInactive ? true : m.active)).map(m => (
              <div key={m.id} className="col-4">
                <button type="button" className="btn p-0 border-0" style={{width:'100%'}} onClick={()=>{ onSelect(m.id); setOpen(false) }}>
                  <div style={{width:'100%',height:64,overflow:'hidden',borderRadius:6}}>
                    <img src={m.url} alt={m.alt_text||''} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  </div>
                  <div className="small text-truncate mt-1">{m.alt_text || m.id}{m.active === false ? ' (desactivado)' : ''}</div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
