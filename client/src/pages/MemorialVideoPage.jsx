import React, { useState, useEffect } from 'react';
import { memorialVideos } from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const MemorialVideoPage = ({ showToast }) => {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    deceased_name: '',
    title: '',
    description: '',
    video_url: '',
    slides_content: '',
    duration: '',
    music_track: '',
    status: 'planning',
  });

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await memorialVideos.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load memorial videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      title: '',
      description: '',
      video_url: '',
      slides_content: '',
      duration: '',
      music_track: '',
      status: 'planning',
    });
  };

  const openCreate = () => {
    resetForm();
    setEditing(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setFormData({
      deceased_name: item.deceased_name || '',
      title: item.title || '',
      description: item.description || '',
      video_url: item.video_url || '',
      slides_content: item.slides_content || '',
      duration: item.duration || '',
      music_track: item.music_track || '',
      status: item.status || 'planning',
    });
    setEditing(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing && selected) {
        const updated = await memorialVideos.update(selected.id, formData);
        setSelected(updated);
        showToast('Memorial video updated successfully', 'success');
      } else {
        await memorialVideos.create(formData);
        showToast('Memorial video created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to save memorial video', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memorial video? This action cannot be undone.')) {
      return;
    }
    try {
      await memorialVideos.delete(id);
      showToast('Memorial video deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete memorial video', 'error');
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await memorialVideos.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load memorial video details', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      planning: 'badge-warning',
      in_progress: 'badge-info',
      completed: 'badge-success',
    };
    const cls = map[status] || 'badge-draft';
    const labels = { planning: 'planning', in_progress: 'in progress', completed: 'completed' };
    return <span className={`badge ${cls}`}>{labels[status] || status}</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Memorial Video Planner</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Video</button>
        </div>

        {loading ? (
          <div className="loading">Loading memorial videos...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No memorial videos yet</h3>
            <p>Plan your first memorial video to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Video</button>
          </div>
        ) : (
          <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Deceased</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.title || '—'}</td>
                    <td>{item.deceased_name || '—'}</td>
                    <td>{item.duration || '—'}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => fetchAll(p)}
            />
          </>
        )}

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Detail View ──
  if (view === 'detail' && selected) {
    return (
      <div className="detail-view">
        <a className="back-link" onClick={() => { setView('list'); setSelected(null); }}>
          ← Back to Memorial Video Planner
        </a>

        <div className="detail-header">
          <h1>{selected.title || 'Untitled Video'}</h1>
          {getStatusBadge(selected.status)}
        </div>

        <div className="detail-actions">
          <button className="btn-accent btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Deceased Name</strong>
            <span>{selected.deceased_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Title</strong>
            <span>{selected.title || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Description</strong>
            <span>{selected.description || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Video URL</strong>
            <span>{selected.video_url || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Duration</strong>
            <span>{selected.duration || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Music Track</strong>
            <span>{selected.music_track || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {getStatusBadge(selected.status)}
          </div>
        </div>

        {selected.slides_content && (
          <div className="card detail-content">
            <h3>Slides Content</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{selected.slides_content}</div>
          </div>
        )}

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create / edit) ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Memorial Video' : 'New Memorial Video'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deceased Name *</label>
            <input
              type="text"
              name="deceased_name"
              value={formData.deceased_name}
              onChange={handleChange}
              required
              placeholder="Name of the deceased"
            />
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Video title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Video description"
            />
          </div>

          <div className="form-group">
            <label>Video URL</label>
            <input
              type="text"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="Video URL or file reference"
            />
          </div>

          <div className="form-group">
            <label>Slides Content</label>
            <textarea
              name="slides_content"
              rows={6}
              value={formData.slides_content}
              onChange={handleChange}
              placeholder="List slides: photo descriptions, captions, order..."
            />
          </div>

          <div className="form-group">
            <label>Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 5 minutes"
            />
          </div>

          <div className="form-group">
            <label>Music Track</label>
            <input
              type="text"
              name="music_track"
              value={formData.music_track}
              onChange={handleChange}
              placeholder="Background music selection"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default MemorialVideoPage;
