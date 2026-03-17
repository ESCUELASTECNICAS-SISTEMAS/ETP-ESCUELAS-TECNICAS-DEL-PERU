import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { endpoints } from '../../utils/apiStatic';
import MediaPicker from './MediaPicker';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('etp_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${endpoints.NEWS}`, { headers });
        setPosts(res.data || []);
      } catch (err) {
        setError('No se pudieron cargar los posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const token = localStorage.getItem('etp_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(endpoints.MEDIA, { headers });
      setMediaList(res.data || []);
    } catch (err) {
      // ignore
    } finally {
      setLoadingMedia(false);
    }
  };

  // CRUD form state
  // Obtener usuario logueado
  const getLoggedUserId = () => {
    try {
      const raw = localStorage.getItem('etp_user');
      if (!raw) return '';
      const user = JSON.parse(raw);
      return user?.id || user?._id || '';
    } catch (e) { return ''; }
  };

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    published_at: '',
    status: 'draft',
    featured_media_urls: '',
    tags: '',
    allow_comments: true,
    meta_title: '',
    meta_description: '',
    canonical_url: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleEdit = post => {
    setEditingId(post._id);
    setForm({
      title: post.title || '',
      summary: post.summary || '',
      content: post.content || '',
      published_at: post.published_at ? post.published_at.split('T')[0] : '',
      status: post.status || 'draft',
      featured_media_urls: Array.isArray(post.featured_media_urls) ? post.featured_media_urls.join(',') : '',
      tags: Array.isArray(post.tags) ? post.tags.join(',') : '',
      allow_comments: post.allow_comments !== undefined ? !!post.allow_comments : true,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      canonical_url: post.canonical_url || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      title: '',
      summary: '',
      content: '',
      published_at: '',
      status: 'draft',
      featured_media_urls: '',
      tags: '',
      allow_comments: true,
      meta_title: '',
      meta_description: '',
      canonical_url: ''
    });
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar este post?')) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('etp_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${endpoints.NEWS}/${id}`, { headers });
      setPosts(posts => posts.filter(p => p._id !== id));
      handleCancel();
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('etp_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Parse tags and featured_media_urls
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        featured_media_urls: form.featured_media_urls ? form.featured_media_urls.split(',').map(u => u.trim()) : [],
        allow_comments: !!form.allow_comments,
        status: form.status === 'published' ? 'published' : form.status,
      };
      console.log('BlogManager - datos enviados:', data);
      let res;
      if (editingId) {
        res = await axios.put(`${endpoints.BLOGS}/${editingId}`, data, { headers });
        setPosts(posts => posts.map(p => p._id === editingId ? res.data : p));
      } else {
        res = await axios.post(`${endpoints.BLOGS}`, data, { headers });
        setPosts(posts => [res.data, ...posts]);
      }
      handleCancel();
    } catch (err) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-4">
      <h2 className="fw-bold mb-3">Gestión de Blog / Noticias</h2>
      <form className="mb-4" onSubmit={handleSubmit}>
        {/* ...existing code... */}
      </form>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-danger">{error}</div>}
      {/* ...existing code... */}
    </section>
  );
}
