import React, { useState, useEffect } from 'react';
import { musicSelections } from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const SERVICE_MOMENTS = [
  'Prelude',
  'Processional',
  'During Service',
  'Reflection',
  'Recessional',
  'Reception',
  'Other',
];

const emptyForm = {
  deceased_name: '',
  song_title: '',
  artist: '',
  service_moment: '',
  order_number: '',
  notes: '',
};

const MusicPlaylistPage = ({ showToast }) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await musicSelections.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load music playlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditing(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      deceased_name: item.deceased_name || '',
      song_title: item.song_title || '',
      artist: item.artist || '',
      service_moment: item.service_moment || '',
      order_number: item.order_number != null ? item.order_number : '',
      notes: item.notes || '',
    });
    setEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.deceased_name.trim()) {
      showToast('Deceased name is required', 'error');
      return;
    }
    if (!form.song_title.trim()) {
      showToast('Song title is required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      order_number: form.order_number !== '' ? parseInt(form.order_number, 10) : null,
    };
    try {
      if (editing && selected) {
        const updated = await musicSelections.update(selected.id, payload);
        setSelected(updated);
        showToast('Music selection updated successfully', 'success');
      } else {
        await musicSelections.create(payload);
        showToast('Music selection created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to save music selection', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this music selection?')) return;
    try {
      await musicSelections.delete(id);
      showToast('Music selection deleted', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete music selection', 'error');
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    setView('detail');
  };

  const sortedItems = [...items].sort((a, b) => {
    const aNum = a.order_number != null ? a.order_number : 9999;
    const bNum = b.order_number != null ? b.order_number : 9999;
    return aNum - bNum;
  });

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Music Playlist</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Song</button>
        </div>

        {loading ? (
          <div className="loading">Loading music playlist...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No music selections yet</h3>
            <p>Add your first song to build the service playlist.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Song</button>
          </div>
        ) : (
          <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Song Title</th>
                  <th>Artist</th>
                  <th>Service Moment</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => openDetail(item)} style={{ cursor: 'pointer' }}>
                    <td>{item.order_number != null ? item.order_number : '—'}</td>
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.song_title || '—'}</td>
                    <td>{item.artist || '—'}</td>
                    <td>{item.service_moment || '—'}</td>
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
        <a className="back-link" onClick={() => { setView('list'); setSelected(null); }} style={{ cursor: 'pointer' }}>
          &larr; Back to Music Playlist
        </a>

        <div className="detail-header">
          <h1>{selected.song_title || 'Music Selection'}</h1>
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
            <strong>Song Title</strong>
            <span>{selected.song_title || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Artist</strong>
            <span>{selected.artist || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Service Moment</strong>
            <span>{selected.service_moment || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Order Number</strong>
            <span>{selected.order_number != null ? selected.order_number : '—'}</span>
          </div>
        </div>

        {selected.notes && (
          <div className="card detail-content">
            <h3>Notes</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{selected.notes}</div>
          </div>
        )}

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Music Selection' : 'New Music Selection'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deceased Name *</label>
            <input
              type="text"
              name="deceased_name"
              value={form.deceased_name}
              onChange={handleChange}
              required
              placeholder="Full name of the deceased"
            />
          </div>

          <div className="form-group">
            <label>Song Title *</label>
            <input
              type="text"
              name="song_title"
              value={form.song_title}
              onChange={handleChange}
              required
              placeholder="Name of the song"
            />
          </div>

          <div className="form-group">
            <label>Artist</label>
            <input
              type="text"
              name="artist"
              value={form.artist}
              onChange={handleChange}
              placeholder="Artist or performer"
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Service Moment</label>
              <select name="service_moment" value={form.service_moment} onChange={handleChange}>
                <option value="">Select moment</option>
                {SERVICE_MOMENTS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Order Number</label>
              <input
                type="number"
                name="order_number"
                value={form.order_number}
                onChange={handleChange}
                placeholder="Sequence #"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Song' : 'Add Song'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default MusicPlaylistPage;
