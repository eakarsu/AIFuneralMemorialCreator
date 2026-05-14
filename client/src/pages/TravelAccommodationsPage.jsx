import React, { useState, useEffect } from 'react';
import { travelAccommodations } from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TravelAccommodationsPage = ({ showToast }) => {
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
    guest_name: '',
    arrival_date: '',
    departure_date: '',
    accommodation_name: '',
    accommodation_address: '',
    transport_notes: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await travelAccommodations.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load travel & accommodation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      guest_name: '',
      arrival_date: '',
      departure_date: '',
      accommodation_name: '',
      accommodation_address: '',
      transport_notes: '',
      status: 'pending',
      notes: '',
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
      guest_name: item.guest_name || '',
      arrival_date: item.arrival_date ? item.arrival_date.slice(0, 10) : '',
      departure_date: item.departure_date ? item.departure_date.slice(0, 10) : '',
      accommodation_name: item.accommodation_name || '',
      accommodation_address: item.accommodation_address || '',
      transport_notes: item.transport_notes || '',
      status: item.status || 'pending',
      notes: item.notes || '',
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
        const updated = await travelAccommodations.update(selected.id, formData);
        setSelected(updated);
        showToast('Record updated successfully', 'success');
      } else {
        await travelAccommodations.create(formData);
        showToast('Record created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to save record', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    try {
      await travelAccommodations.delete(id);
      showToast('Record deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete record', 'error');
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await travelAccommodations.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load record details', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      cancelled: 'badge-danger',
    };
    const cls = map[status] || 'badge-draft';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Travel & Accommodations</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Record</button>
        </div>

        {loading ? (
          <div className="loading">Loading travel & accommodation records...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No travel & accommodation records yet</h3>
            <p>Add your first guest travel record to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Record</button>
          </div>
        ) : (
          <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Deceased</th>
                  <th>Arrival</th>
                  <th>Departure</th>
                  <th>Accommodation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.guest_name || '—'}</td>
                    <td>{item.deceased_name || '—'}</td>
                    <td>{formatDate(item.arrival_date)}</td>
                    <td>{formatDate(item.departure_date)}</td>
                    <td>{item.accommodation_name || '—'}</td>
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
          ← Back to Travel & Accommodations
        </a>

        <div className="detail-header">
          <h1>{selected.guest_name || 'Unknown Guest'}</h1>
          {getStatusBadge(selected.status)}
        </div>

        <div className="detail-actions">
          <button className="btn-accent btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Guest Name</strong>
            <span>{selected.guest_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Deceased Name</strong>
            <span>{selected.deceased_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Arrival Date</strong>
            <span>{formatDate(selected.arrival_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Departure Date</strong>
            <span>{formatDate(selected.departure_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Accommodation</strong>
            <span>{selected.accommodation_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Accommodation Address</strong>
            <span>{selected.accommodation_address || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Transport Notes</strong>
            <span>{selected.transport_notes || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {getStatusBadge(selected.status)}
          </div>
          {selected.notes && (
            <div className="detail-field">
              <strong>Notes</strong>
              <span>{selected.notes}</span>
            </div>
          )}
        </div>

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create / edit) ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Record' : 'New Travel & Accommodation'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deceased Name</label>
            <input
              type="text"
              name="deceased_name"
              value={formData.deceased_name}
              onChange={handleChange}
              placeholder="Name of the deceased"
            />
          </div>

          <div className="form-group">
            <label>Guest Name *</label>
            <input
              type="text"
              name="guest_name"
              value={formData.guest_name}
              onChange={handleChange}
              required
              placeholder="Name of the guest"
            />
          </div>

          <div className="form-group">
            <label>Arrival Date</label>
            <input
              type="date"
              name="arrival_date"
              value={formData.arrival_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Departure Date</label>
            <input
              type="date"
              name="departure_date"
              value={formData.departure_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Accommodation Name</label>
            <input
              type="text"
              name="accommodation_name"
              value={formData.accommodation_name}
              onChange={handleChange}
              placeholder="Hotel or host name"
            />
          </div>

          <div className="form-group">
            <label>Accommodation Address</label>
            <textarea
              name="accommodation_address"
              rows={3}
              value={formData.accommodation_address}
              onChange={handleChange}
              placeholder="Full address"
            />
          </div>

          <div className="form-group">
            <label>Transport Notes</label>
            <textarea
              name="transport_notes"
              rows={3}
              value={formData.transport_notes}
              onChange={handleChange}
              placeholder="Flight details, car rental, etc."
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
            <label>Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes"
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

export default TravelAccommodationsPage;
