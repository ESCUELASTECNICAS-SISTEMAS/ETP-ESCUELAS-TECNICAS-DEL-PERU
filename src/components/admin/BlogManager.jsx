import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints } from '../../utils/apiStatic';


export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // Form
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    published_at: '',
    status: 'draft',
    featured_media_urls: [],
    tags: '',
    allow_comments: true,
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    media: [],
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const getLoggedUserId = () => {
    try {
      const raw = localStorage.getItem('etp_user');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return user?.id || user?._id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('etp_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // Solo cargar posts
        const postsRes = await axios.get(endpoints.BLOGS, { headers });
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(
          err.response?.status === 404
            ? 'No se encuentra el endpoint /blogs. Verifica el backend y endpoints.js'
            : 'No se pudieron cargar los datos'
        );
      } finally {
        setLoading(false);
        setLoadingMedia(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEdit = (post) => {
    setEditingId(post.id);

    setForm({
      title: post.title || '',
      slug: post.slug || '',
      summary: post.summary || '',
      content: post.content || '',
      published_at: post.published_at ? post.published_at.split('T')[0] : '',
      status: post.status || 'draft',
      featured_media_urls: Array.isArray(post.featured_media_urls) ? [...post.featured_media_urls] : [],
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      allow_comments: !!post.allow_comments,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      canonical_url: post.canonical_url || '',
      media: [], // Eliminado, ya no se usa
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      summary: '',
      content: '',
      published_at: '',
      status: 'draft',
      featured_media_urls: [],
      tags: '',
      allow_comments: true,
      meta_title: '',
      meta_description: '',
      canonical_url: '',
      media: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    setSaving(true);

    const token = localStorage.getItem('etp_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      summary: form.summary.trim() || undefined,
      content: form.content.trim() || undefined,
      author_id: getLoggedUserId(),
      status: form.status,
      published_at: form.published_at || null,
      featured_media_urls: form.featured_media_urls.length ? form.featured_media_urls : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      allow_comments: form.allow_comments,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      canonical_url: form.canonical_url.trim() || null,
      media: form.media.length ? form.media : undefined,
    };

    try {
      let res;
      if (editingId) {
        res = await axios.put(`${endpoints.BLOGS}/${editingId}`, payload, { headers });
        setPosts(prev =>
          prev.map(p => (p.id === editingId ? { ...p, ...res.data } : p))
        );
      } else {
        res = await axios.post(endpoints.BLOGS, payload, { headers });
        setPosts(prev => [{ ...res.data, author: { name: 'Tú' } }, ...prev]); // autor aproximado
      }

      handleCancel();
    } catch (err) {
      console.error('Error al guardar:', err);
      alert(err.response?.data?.message || 'Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Mover a archivados este artículo?')) return;

    setSaving(true);
    const token = localStorage.getItem('etp_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      await axios.delete(`${endpoints.BLOGS}/${id}`, { headers });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error al archivar:', err);
      alert('No se pudo archivar el artículo');
    } finally {
      setSaving(false);
    }
  };

  // Render
  if (loading) return <div className="text-center py-5">Cargando...</div>;

  return (
    <section className="py-4 container">
      <h2 className="fw-bold mb-4">Gestión de Blog / Noticias</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card p-4 mb-5 shadow-sm">
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label fw-bold">Título *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="form-control"
              placeholder="se-genera-automatico-si-vacio"
            />
          </div>

          <div className="col-12">
            <label className="form-label">Resumen</label>
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              className="form-control"
              rows={3}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">Contenido</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className="form-control"
              rows={10}
              placeholder="Aquí irá tu editor WYSIWYG en el futuro..."
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Fecha de publicación</label>
            <input
              type="date"
              name="published_at"
              value={form.published_at}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-select">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div className="col-md-3 d-flex align-items-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="allow_comments"
                id="allow_comments"
                checked={form.allow_comments}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="allow_comments">
                Permitir comentarios
              </label>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label fw-bold">Imágenes destacadas (máx. 3 URLs)</label>
            {[0,1,2].map(idx => (
              <input
                key={idx}
                type="url"
                className="form-control mb-2"
                placeholder={`URL de imagen #${idx+1}`}
                value={form.featured_media_urls[idx] || ''}
                onChange={e => {
                  const urls = [...form.featured_media_urls];
                  urls[idx] = e.target.value;
                  setForm(f => ({ ...f, featured_media_urls: urls.filter(u => !!u) }));
                }}
              />
            ))}
          </div>

          {/* Galería adicional eliminada */}

          <div className="col-12">
            <label className="form-label">Etiquetas (separadas por coma)</label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="form-control"
              placeholder="noticias, tecnologia, peru, ..."
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Meta título</label>
            <input
              type="text"
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Meta descripción</label>
            <input
              type="text"
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-12">
            <label className="form-label">URL Canónica</label>
            <input
              type="url"
              name="canonical_url"
              value={form.canonical_url}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={saving || !form.title.trim()}
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar artículo' : 'Crear artículo'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Listado */}
      <h3 className="mb-3">Artículos existentes</h3>

      {posts.length === 0 ? (
        <p className="text-muted">Aún no hay artículos creados.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Fecha pub.</th>
                <th>Autor</th>
                <th>Imágenes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>
                    <span className={`badge ${post.status === 'published' ? 'bg-success' : post.status === 'archived' ? 'bg-dark' : 'bg-secondary'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.published_at ? new Date(post.published_at).toLocaleDateString('es-PE') : '—'}</td>
                  <td>{post.author?.name || '—'}</td>
                  <td>
                    {Array.isArray(post.featured_media_urls) && post.featured_media_urls.length > 0 ? (
                      <div style={{display:'flex',gap:'4px'}}>
                        {post.featured_media_urls.map((url, idx) => (
                          <img key={idx} src={url} alt={`img${idx+1}`} style={{width:40,height:40,objectFit:'cover',borderRadius:'4px'}} />
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(post)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(post.id)}
                      disabled={post.status === 'archived'}
                    >
                      Archivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}