import React from 'react'
import { Link } from 'react-router-dom'
import LoginEvents from '../components/admin/LoginEvents'
import VisitStats from '../components/admin/VisitStats'

export default function AdminLoginEvents(){
  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Eventos de acceso</h3>
        <small className="text-muted">Registros, estadísticas de login y visitantes</small>
      </div>
      <VisitStats />
      <LoginEvents />
    </div>
  )
}
