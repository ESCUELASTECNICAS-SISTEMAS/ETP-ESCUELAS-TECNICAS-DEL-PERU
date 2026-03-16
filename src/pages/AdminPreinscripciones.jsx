import React from 'react'
import { Link } from 'react-router-dom'
import PreinscripcionesManager from '../components/admin/PreinscripcionesManager'

export default function AdminPreinscripciones(){
  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="mb-0">Pre-inscripciones</h3>
          <small className="text-muted">Crear, listar, editar o marcar como eliminadas</small>
        </div>
        <div className="text-muted small">Endpoint: /pre-inscripciones</div>
      </div>
      <PreinscripcionesManager />
    </div>
  )
}
