import React, { useState, useEffect } from 'react';
import { rsvpEntries } from '../api';
import Modal from '../components/Modal';

const RSVP_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'attending', label: 'Attending' },
  { value: 'declined', label: 'Declined' },
  { value: 'maybe', label: 'Maybe' },
];

const emptyForm = {
  deceased_name: '',
  service_name: '',
  guest_name: '',
  email: '',
  phone: '',
  rsvp_status: 'pending',
  guests_count: 1,
  dietary_needs: '',
  notes: '',
};

const RSVPPage = ({ showToast }) => {
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
      const data = await rsvpEntries.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load RSVP entries', 'error');
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
      service_name: item.service_name || '',
      guest_name: item.guest_name || '',
      email: item.email || '',
      phone: item.phone || '',
      rsvp_status: item.rsvp_status || 'pending',
      guests_count: item.guests_count != null ? item.guests_count : 1,
      dietary_needs: item.dietary_needs || '',
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
    if (!form.guest_name.trim()) {
      showToast('Guest name is required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      guests_count: form.guests_count !== '' ? parseInt(form.guests_count, 10) : 1,
    };
    try {
      if (editing && selected) {
        const updated = await rsvpEntries.update(selected.id, payload);
        setSelected(updated);
        showToast('RSVP entry updated successfully', 'success');
      } else {
        await rsvpEntries.create(payload);
        showToast('RSVP entry created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save RSVP entry', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RSVP entry?')) return;
    try {
      await rsvpEntries.delete(id);
      showToast('RSVP entry deleted', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete RSVP entry', 'error');
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    setView('detail');
  };

  const getStatusBadge = (status) => {
    const map = {
      attending: 'badge-success',
      declined: 'badge-danger',
      pending: 'badge-warning',
      maybe: 'badge-info',
    };
    const cls = map[status] || 'badge-draft';
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const totalAttending = items
    .filter((i) => i.rsvp_status === 'attending')
    .reduce((sum, i) => {
      const c = typeof i.guests_count === 'number' ? i.guests_count : parseInt(i.guests_count, 10);
      return sum + (isNaN(c) ? 0 : c);
    }, 0);

  const totalPending = items.filter((i) => i.rsvp_status === 'pending').length;
  const totalDeclined = items.filter((i) => i.rsvp_status === 'declined').length;

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>RSVP &amp; Attendance</h1>
          <button className="btn-primary" onClick={openCreate}>+ New RSVP</button>
        </div>

        {!loading && items.length > 0 && (
          <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <strong style={{ fontSize: 14, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Total Attending</strong>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#27ae60', marginTop: 4 }}>{totalAttending}</div>
            </div>
            <div>
              <strong style={{ fontSize: 14, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Pending</strong>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f39c12', marginTop: 4 }}>{totalPending}</div>
            </div>
            <div>
              <strong style={{ fontSize: 14, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Declined</strong>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#e74c3c', marginTop: 4 }}>{totalDeclined}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading RSVP entries...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No RSVP entries yet</h3>
            <p>Add your first guest to start tracking attendance.</p>
            <button className="btn-primary" onClick={openCreate}>+ New RSVP</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Guests</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => openDetail(item)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.guest_name || '—'}</td>
                    <td>{item.service_name || '—'}</td>
                    <td>{getStatusBadge(item.rsvp_status)}</td>
                    <td>{item.guests_count != null ? item.guests_count : '—'}</td>
                    <td>{item.email || '—'}</td>
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
          &larr; Back to RSVP &amp; Attendance
        </a>

        <div className="detail-header">
          <h1>{selected.guest_name || 'Guest'}</h1>
          {getStatusBadge(selected.rsvp_status)}
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
            <strong>Service</strong>
            <span>{selected.service_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Guest Name</strong>
            <span>{selected.guest_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Email</strong>
            <span>{selected.email || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Phone</strong>
            <span>{selected.phone || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>RSVP Status</strong>
            {getStatusBadge(selected.rsvp_status)}
          </div>
          <div className="detail-field">
            <strong>Number of Guests</strong>
            <span>{selected.guests_count != null ? selected.guests_count : '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Dietary Needs</strong>
            <span>{selected.dietary_needs || '—'}</span>
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
      <Modal title={editing ? 'Edit RSVP' : 'New RSVP'} onClose={() => setModalOpen(false)}>
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
            <label>Service Name</label>
            <input
              type="text"
              name="service_name"
              value={form.service_name}
              onChange={handleChange}
              placeholder="e.g., Memorial Service"
            />
          </div>

          <div className="form-group">
            <label>Guest Name *</label>
            <input
              type="text"
              name="guest_name"
              value={form.guest_name}
              onChange={handleChange}
              required
              placeholder="Full name of the guest"
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
              />
            </div>
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
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>RSVP Status</label>
              <select name="rsvp_status" value={form.rsvp_status} onChange={handleChange}>
                {RSVP_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Number of Guests</label>
              <input
                type="number"
                name="guests_count"
                value={form.guests_count}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dietary Needs</label>
            <textarea
              name="dietary_needs"
              rows={2}
              value={form.dietary_needs}
              onChange={handleChange}
              placeholder="Any dietary restrictions or preferences"
            />
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
              {saving ? 'Saving...' : editing ? 'Update RSVP' : 'Create RSVP'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default RSVPPage;
