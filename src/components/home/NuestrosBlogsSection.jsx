import React, { useEffect, useState } from 'react';
import { endpoints } from '../../utils/apiStatic';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NuestrosBlogsSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(endpoints.BLOGS, { timeout: 10000 });
        const published = res.data.filter(b => b.status === 'published');
        setBlogs(published);
      } catch (err) {
        setError('Error al cargar los blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger text-center m-5">{error}</div>
  );

  return (
    <section className="py-5" style={{ 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
    }}>
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge text-dark px-3 py-2 mb-3" style={{ backgroundColor: '#f97316' }}>
            Blog y Noticias
          </span>
          <h2 className="display-5 fw-bold text-white">Nuestros Blogs</h2>
          <p className="text-white-50">Descubre las últimas noticias y actividades</p>
        </div>

        <div className="row g-4">
          {blogs.map(blog => (
            <div className="col-md-6 col-lg-4" key={blog.id}>
              <div 
                className="card h-100"
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: '#1e40af',
                  border: '3px solid #f97316',
                  boxShadow: '0 15px 30px -10px rgba(0,0,0,0.5)'
                }}
                onClick={() => navigate(`/blog/${blog.slug}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 25px 40px -10px rgba(249,115,22,0.3)';
                  e.currentTarget.style.borderColor = '#fb923c';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(0,0,0,0.5)';
                  e.currentTarget.style.borderColor = '#f97316';
                }}
              >
                {/* Contenedor de imagen 1080x1080 */}
                <div style={{ 
                  width: '100%',
                  paddingBottom: '100%',
                  position: 'relative',
                  backgroundColor: '#0f172a',
                  overflow: 'hidden'
                }}>
                  {blog.featured_media_urls?.[0] ? (
                    <img 
                      src={blog.featured_media_urls[0]} 
                      alt={blog.title}
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div 
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #f97316, #fb923c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="display-1 text-white">📝</span>
                    </div>
                  )}
                  
                  {/* Badge flotante */}
                  <span style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    backgroundColor: '#f97316',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '25px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    zIndex: 2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    {blog.category || 'Artículo'}
                  </span>
                </div>
                
                <div className="card-body text-white p-4">
                  <div className="d-flex justify-content-between mb-3">
                    {blog.author?.name && (
                      <small className="text-white-50">
                        <i className="bi bi-person-circle me-1"></i>
                        {blog.author.name}
                      </small>
                    )}
                    {blog.published_at && (
                      <small className="text-white-50">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(blog.published_at).toLocaleDateString('es-PE')}
                      </small>
                    )}
                  </div>
                  
                  <h5 className="card-title fw-bold mb-3 text-white" style={{ fontSize: '1.2rem' }}>
                    {blog.title}
                  </h5>
                  
                  <p className="card-text text-white-50 mb-0" style={{ fontSize: '0.95rem' }}>
                    {blog.summary?.substring(0, 100)}
                    {blog.summary?.length > 100 ? '...' : ''}
                  </p>
                </div>
                
                <div className="card-footer bg-transparent border-0 pb-4 px-4 pt-0">
                  <button 
                    className="btn w-100 py-2 fw-semibold text-white"
                    style={{ 
                      backgroundColor: '#f97316',
                      border: '2px solid #f97316',
                      borderRadius: '10px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#f97316';
                    }}
                    onMouseLeave={e => {
                      e.target.style.backgroundColor = '#f97316';
                      e.target.style.color = 'white';
                    }}
                  >
                    Leer más <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <button 
            className="btn btn-lg px-5 py-3 fw-semibold"
            style={{ 
              backgroundColor: '#f97316',
              border: '2px solid #f97316',
              color: 'white',
              borderRadius: '50px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#f97316';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = '#f97316';
              e.target.style.color = 'white';
              e.target.style.transform = 'scale(1)';
            }}
            onClick={() => navigate('/blogs')}
          >
            Ver todos los blogs
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </section>
  );
}