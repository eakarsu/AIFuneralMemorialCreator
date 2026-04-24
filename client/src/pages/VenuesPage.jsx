import React, { useState, useEffect } from 'react';
import { venues } from '../api';
import Modal from '../components/Modal';

const VENUE_TYPES = [
  'Funeral Home',
  'Church',
  'Cemetery',
  'Reception Hall',
  'Crematorium',
  'Other',
];

const emptyForm = {
  deceased_name: '',
  name: '',
  address: '',
  phone: '',
  contact_person: '',
  venue_type: '',
  capacity: '',
  notes: '',
  booked: false,
  event_date: '',
};

const VenuesPage = ({ showToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await venues.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load venues', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditing(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      deceased_name: item.deceased_name || '',
      name: item.name || '',
      address: item.address || '',
      phone: item.phone || '',
      contact_person: item.contact_person || '',
      venue_type: item.venue_type || '',
      capacity: item.capacity != null ? item.capacity : '',
      notes: item.notes || '',
      booked: item.booked || false,
      event_date: item.event_date ? item.event_date.slice(0, 16) : '',
    });
    setEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Venue name is required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      capacity: form.capacity !== '' ? parseInt(form.capacity, 10) : null,
    };
    try {
      if (editing && selected) {
        const updated = await venues.update(selected.id, payload);
        setSelected(updated);
        showToast('Venue updated successfully', 'success');
      } else {
        await venues.create(payload);
        showToast('Venue created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save venue', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await venues.delete(id);
      showToast('Venue deleted', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete venue', 'error');
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    setView('detail');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const truncate = (str, len = 40) => {
    if (!str) return '—';
    return str.length > len ? str.slice(0, len) + '...' : str;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Venue Management</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Venue</button>
        </div>

        {loading ? (
          <div className="loading">Loading venues...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No venues yet</h3>
            <p>Add your first venue to start managing locations.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Venue</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Address</th>
                  <th>Capacity</th>
                  <th>Booked</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => openDetail(item)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.name || '—'}</td>
                    <td>{item.venue_type || '—'}</td>
                    <td>{truncate(item.address)}</td>
                    <td>{item.capacity != null ? item.capacity : '—'}</td>
                    <td>
                      {item.booked ? (
                        <span className="badge badge-success">Booked</span>
                      ) : (
                        <span className="badge badge-draft">Not Booked</span>
                      )}
                    </td>
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
        <a className="back-link" onClick={() => { setView('list'); setSelected(null); }} style={{ cursor: 'pointer' }}>
          &larr; Back to Venue Management
        </a>

        <div className="detail-header">
          <h1>{selected.name || 'Venue'}</h1>
          {selected.booked ? (
            <span className="badge badge-success">Booked</span>
          ) : (
            <span className="badge badge-draft">Not Booked</span>
          )}
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
            <strong>Venue Name</strong>
            <span>{selected.name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Venue Type</strong>
            <span>{selected.venue_type || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Address</strong>
            <span style={{ whiteSpace: 'pre-wrap' }}>{selected.address || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Phone</strong>
            <span>{selected.phone || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Contact Person</strong>
            <span>{selected.contact_person || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Capacity</strong>
            <span>{selected.capacity != null ? selected.capacity : '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Event Date</strong>
            <span>{formatDateTime(selected.event_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Booked</strong>
            {selected.booked ? (
              <span className="badge badge-success">Booked</span>
            ) : (
              <span className="badge badge-draft">Not Booked</span>
            )}
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
      <Modal title={editing ? 'Edit Venue' : 'New Venue'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deceased Name</label>
            <input
              type="text"
              name="deceased_name"
              value={form.deceased_name}
              onChange={handleChange}
              placeholder="Full name of the deceased"
            />
          </div>

          <div className="form-group">
            <label>Venue Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Name of the venue"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              rows={2}
              value={form.address}
              onChange={handleChange}
              placeholder="Full address"
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Contact Person</label>
              <input
                type="text"
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                placeholder="Contact person name"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Venue Type</label>
              <select name="venue_type" value={form.venue_type} onChange={handleChange}>
                <option value="">Select type</option>
                {VENUE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder="Max capacity"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Event Date</label>
            <input
              type="datetime-local"
              name="event_date"
              value={form.event_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="booked"
                checked={form.booked}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              Booked
            </label>
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
              {saving ? 'Saving...' : editing ? 'Update Venue' : 'Create Venue'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default VenuesPage;
