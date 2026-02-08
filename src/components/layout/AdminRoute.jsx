import React from 'react'
import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }){
  try{
    const raw = localStorage.getItem('etp_user')
    if(!raw) return <Navigate to="/login" replace />
    const user = JSON.parse(raw)
    const role = user?.role || (user?.roles && (Array.isArray(user.roles) ? user.roles[0] : null))
    if(role === 'administrador' || (Array.isArray(user?.roles) && user.roles.includes('administrador')) ){
      return children
    }
    return <Navigate to="/login" replace />
  }catch(e){
    return <Navigate to="/login" replace />
  }
}
