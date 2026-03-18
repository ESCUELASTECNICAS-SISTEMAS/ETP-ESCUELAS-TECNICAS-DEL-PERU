import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { endpoints } from '../utils/apiStatic';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        // Buscar el blog por slug
        const res = await axios.get(endpoints.BLOGS);
        const found = res.data.find(b => b.slug === slug);
        if (!found) throw new Error('Blog no encontrado');
        // Si solo tienes el id, haz una petición directa
        if (!found.content && found.id) {
          try {
            const detailRes = await axios.get(`${endpoints.BLOGS}/${found.id}`);
            setBlog({ ...found, ...detailRes.data });
          } catch (e) {
            setBlog(found);
          }
        } else {
          setBlog(found);
        }
        const related = res.data
          .filter(b => b.slug !== slug && 
            (b.category?.id === found.category?.id || b.author?.id === found.author?.id))
          .slice(0, 3);
        setRelatedPosts(related);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  // Función para obtener el contenido
  const getContent = () => {
    if (blog.content_rendered) return blog.content_rendered;
    if (blog.content_html) return blog.content_html;
    if (blog.content) {
      if (typeof blog.content === 'object' && blog.content.rendered) {
        return blog.content.rendered;
      }
      if (typeof blog.content === 'string') return blog.content;
    }
    if (blog.body) return blog.body;
    return '<p>Contenido no disponible</p>';
  };

  if (loading) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <Link to="/" className="btn btn-outline-primary btn-sm mb-4">
                ← Volver
              </Link>
              <div className="placeholder-glow">
                <span className="placeholder col-12" style={{ height: '400px' }}></span>
                <span className="placeholder col-8 mt-4"></span>
                <span className="placeholder col-6"></span>
                <span className="placeholder col-10"></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !blog) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow text-center p-5">
                <div className="display-1 text-danger mb-4">😕</div>
                <h2 className="h3 mb-3">Blog no encontrado</h2>
                <p className="text-muted mb-4">
                  El artículo que buscas no existe o ha sido movido.
                </p>
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary me-2">
                  ← Regresar
                </button>
                <Link to="/" className="btn btn-primary">
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-3 bg-light border-bottom">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <Link to="/" className="btn btn-link text-decoration-none ps-0">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              
              {/* Imágenes destacadas con modal */}
              {blog.featured_media_urls && blog.featured_media_urls.length > 0 && (
                <div className="mb-5 text-center">
                  <div className="row justify-content-center g-3">
                    {blog.featured_media_urls.map((url, idx) => (
                      <div key={idx} className={`col-12${blog.featured_media_urls.length > 1 ? ' col-md-4' : ''}`}>
                        <img
                          src={url}
                          alt={blog.title + ' imagen ' + (idx+1)}
                          className="img-fluid rounded shadow-sm"
                          style={{ maxWidth: '100%', height: 'auto', maxHeight: '260px', objectFit: 'cover', marginBottom: 8, cursor:'pointer' }}
                          onClick={() => setModalImg(url)}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Badge de categoría opcional */}
                  {blog.category?.name && (
                    <div className="mt-3">
                      <span className="badge bg-primary px-3 py-2">
                        {blog.category.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Modal para imagen ampliada */}
              {modalImg && (
                <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setModalImg(null)}>
                  <img src={modalImg} alt="Imagen ampliada" style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}} />
                </div>
              )}

              <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                {blog.author?.avatar ? (
                  <img 
                    src={blog.author.avatar} 
                    alt={blog.author.name}
                    className="rounded-circle me-3"
                    width="50"
                    height="50"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-secondary rounded-circle me-3 d-flex align-items-center justify-content-center" 
                       style={{ width: '50px', height: '50px' }}>
                    <span className="text-white h5 mb-0">
                      {blog.author?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
                <div>
                  {blog.author?.name && (
                    <p className="mb-0 fw-bold">{blog.author.name}</p>
                  )}
                  <div className="text-muted small">
                    {blog.published_at && (
                      <span>
                        {new Date(blog.published_at).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <h1 className="display-5 fw-bold mb-4">{blog.title}</h1>
              
              {/* Contenido - SIN ESTILOS PERSONALIZADOS */}
              <div className="mb-5">
                <div dangerouslySetInnerHTML={{ __html: getContent() }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}