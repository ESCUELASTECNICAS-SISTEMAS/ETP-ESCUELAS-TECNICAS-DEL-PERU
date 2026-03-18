import React, { useEffect, useState } from 'react';
import { endpoints } from '../utils/apiStatic';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(endpoints.BLOGS);
        setBlogs(res.data.filter(b => b.status === 'published'));
      } catch (err) {
        setError('No se pudieron cargar los blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <div className="container py-5">Cargando blogs...</div>;
  if (error) return <div className="container py-5 text-danger">{error}</div>;

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="mb-4">Todos los Blogs</h2>
        <div className="row g-4">
          {blogs.length === 0 && <div className="col-12 text-muted">No hay blogs publicados.</div>}
          {blogs.map(blog => (
            <div className="col-md-6 col-lg-4" key={blog.id}>
              <div className="card h-100" style={{ cursor: 'pointer', borderRadius: 18 }} onClick={() => navigate(`/blog/${blog.slug}`)}>
                {blog.featured_media_urls?.[0] && (
                  <img src={blog.featured_media_urls[0]} alt={blog.title} className="card-img-top" style={{ height: 180, objectFit: 'cover', borderRadius: '18px 18px 0 0' }} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{blog.title}</h5>
                  <p className="card-text text-muted" style={{ fontSize: 13 }}>{blog.summary}</p>
                  <div className="text-muted small">
                    {blog.author?.name && <span>Por {blog.author.name}</span>}
                    {blog.published_at && <span> · {new Date(blog.published_at).toLocaleDateString('es-PE')}</span>}
                  </div>
                  <button className="btn btn-sm btn-primary mt-2" onClick={e => { e.stopPropagation(); navigate(`/blog/${blog.slug}`); }}>Ver blog</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
