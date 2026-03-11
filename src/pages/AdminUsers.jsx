import React from 'react'
import { Link } from 'react-router-dom'
import UserManager from '../components/admin/UserManager'

export default function AdminUsers(){
  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Administrar Usuarios</h3>
        <small className="text-muted">Crear y gestionar administradores</small>
      </div>
      <UserManager />
    </div>
  )
}
