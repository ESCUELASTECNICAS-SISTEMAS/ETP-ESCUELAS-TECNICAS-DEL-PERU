import React from 'react';
import { Link } from 'react-router-dom';
import BlogManager from '../components/admin/BlogManager';

export default function AdminBlog() {
  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Blog / Noticias</h3>
        <small className="text-muted">Crear, editar y gestionar posts del blog</small>
      </div>
      <BlogManager />
    </div>
  );
}
