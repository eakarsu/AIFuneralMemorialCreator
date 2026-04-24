import React, { useState, useEffect } from 'react';
import { announcements } from '../api';
import Modal from '../components/Modal';

const ANNOUNCEMENT_TYPES = [
  'Death Notice', 'Funeral Announcement', 'Memorial Service',
  'Celebration of Life', 'Graveside Service', 'Reception', 'Other',
];

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'sent', label: 'Sent' },
];

const AnnouncementsPage = ({ showToast }) => {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    deceased_name: '',
    title: '',
    content: '',
    announcement_type: 'Death Notice',
    publish_date: '',
    status: 'draft',
    recipients: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await announcements.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      title: '',
      content: '',
      announcement_type: 'Death Notice',
      publish_date: '',
      status: 'draft',
      recipients: '',
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
      content: item.content || '',
      announcement_type: item.announcement_type || 'Death Notice',
      publish_date: item.publish_date ? item.publish_date.slice(0, 10) : '',
      status: item.status || 'draft',
      recipients: item.recipients || '',
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
        const updated = await announcements.update(selected.id, formData);
        setSelected(updated);
        showToast('Announcement updated successfully', 'success');
      } else {
        await announcements.create(formData);
        showToast('Announcement created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save announcement', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }
    try {
      await announcements.delete(id);
      showToast('Announcement deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete announcement', 'error');
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await announcements.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load announcement details', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: 'badge-warning',
      published: 'badge-success',
      sent: 'badge-info',
    };
    const cls = map[status] || 'badge-draft';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Announcements</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Announcement</button>
        </div>

        {loading ? (
          <div className="loading">Loading announcements...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No announcements yet</h3>
            <p>Create your first announcement to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Announcement</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Deceased</th>
                  <th>Type</th>
                  <th>Publish Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.title || '—'}</td>
                    <td>{item.deceased_name || '—'}</td>
                    <td>{item.announcement_type || '—'}</td>
                    <td>{formatDate(item.publish_date)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          ← Back to Announcements
        </a>

        <div className="detail-header">
          <h1>{selected.title || 'Untitled Announcement'}</h1>
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
            <strong>Type</strong>
            <span>{selected.announcement_type || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Publish Date</strong>
            <span>{formatDate(selected.publish_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {getStatusBadge(selected.status)}
          </div>
          <div className="detail-field">
            <strong>Recipients</strong>
            <span>{selected.recipients || '—'}</span>
          </div>
        </div>

        {selected.content && (
          <div className="card detail-content">
            <h3>Content</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{selected.content}</div>
          </div>
        )}

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create / edit) ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Announcement' : 'New Announcement'} onClose={() => setModalOpen(false)}>
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
              placeholder="Announcement title"
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              rows={6}
              value={formData.content}
              onChange={handleChange}
              placeholder="Announcement content"
            />
          </div>

          <div className="form-group">
            <label>Announcement Type</label>
            <select name="announcement_type" value={formData.announcement_type} onChange={handleChange}>
              {ANNOUNCEMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Publish Date</label>
            <input
              type="date"
              name="publish_date"
              value={formData.publish_date}
              onChange={handleChange}
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

          <div className="form-group">
            <label>Recipients</label>
            <textarea
              name="recipients"
              rows={3}
              value={formData.recipients}
              onChange={handleChange}
              placeholder="Email addresses or distribution list"
            />
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

export default AnnouncementsPage;
