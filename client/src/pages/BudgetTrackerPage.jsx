import React, { useState, useEffect } from 'react';
import { budgetItems } from '../api';
import Modal from '../components/Modal';

const CATEGORIES = [
  'Funeral Home',
  'Cemetery',
  'Casket/Urn',
  'Flowers',
  'Catering',
  'Transportation',
  'Obituary/Notices',
  'Music',
  'Clergy/Officiant',
  'Venue',
  'Printing',
  'Other',
];

const emptyForm = {
  deceased_name: '',
  category: '',
  description: '',
  estimated_cost: '',
  actual_cost: '',
  vendor: '',
  paid: false,
  notes: '',
};

const BudgetTrackerPage = ({ showToast }) => {
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
      const data = await budgetItems.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load budget items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val == null || val === '') return '—';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return '—';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalEstimated = items.reduce((sum, item) => {
    const v = typeof item.estimated_cost === 'number' ? item.estimated_cost : parseFloat(item.estimated_cost);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const totalActual = items.reduce((sum, item) => {
    const v = typeof item.actual_cost === 'number' ? item.actual_cost : parseFloat(item.actual_cost);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const remaining = totalEstimated - totalActual;

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
      category: item.category || '',
      description: item.description || '',
      estimated_cost: item.estimated_cost != null ? item.estimated_cost : '',
      actual_cost: item.actual_cost != null ? item.actual_cost : '',
      vendor: item.vendor || '',
      paid: item.paid || false,
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
    if (!form.category) {
      showToast('Category is required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      estimated_cost: form.estimated_cost !== '' ? parseFloat(form.estimated_cost) : null,
      actual_cost: form.actual_cost !== '' ? parseFloat(form.actual_cost) : null,
    };
    try {
      if (editing && selected) {
        const updated = await budgetItems.update(selected.id, payload);
        setSelected(updated);
        showToast('Budget item updated successfully', 'success');
      } else {
        await budgetItems.create(payload);
        showToast('Budget item created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save budget item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget item?')) return;
    try {
      await budgetItems.delete(id);
      showToast('Budget item deleted', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete budget item', 'error');
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    setView('detail');
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Budget Tracker</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Budget Item</button>
        </div>

        {!loading && items.length > 0 && (
          <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <strong style={{ fontSize: 14, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Total Estimated</strong>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2c3e50', marginTop: 4 }}>{formatCurrency(totalEstimated)}</div>
            </div>
            <div>
              <strong style={{ fontSize: 14, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Total Actual</strong>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#e74c3c', marginTop: 4 }}>{formatCurrency(totalActual)}</div>
            </div>
            <div>
              <strong style={{ fontSize: 14, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Remaining</strong>
              <div style={{ fontSize: 24, fontWeight: 700, color: remaining >= 0 ? '#27ae60' : '#e74c3c', marginTop: 4 }}>{formatCurrency(remaining)}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading budget items...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No budget items yet</h3>
            <p>Create your first budget item to start tracking expenses.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Budget Item</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Estimated</th>
                  <th>Actual</th>
                  <th>Vendor</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => openDetail(item)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.category || '—'}</td>
                    <td>{item.description || '—'}</td>
                    <td>{formatCurrency(item.estimated_cost)}</td>
                    <td>{formatCurrency(item.actual_cost)}</td>
                    <td>{item.vendor || '—'}</td>
                    <td>
                      {item.paid ? (
                        <span className="badge badge-success">Paid</span>
                      ) : (
                        <span className="badge badge-draft">Unpaid</span>
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
          &larr; Back to Budget Tracker
        </a>

        <div className="detail-header">
          <h1>{selected.category || 'Budget Item'}</h1>
          {selected.paid ? (
            <span className="badge badge-success">Paid</span>
          ) : (
            <span className="badge badge-draft">Unpaid</span>
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
            <strong>Category</strong>
            <span>{selected.category || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Description</strong>
            <span>{selected.description || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Estimated Cost</strong>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#2c3e50' }}>{formatCurrency(selected.estimated_cost)}</span>
          </div>
          <div className="detail-field">
            <strong>Actual Cost</strong>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#e74c3c' }}>{formatCurrency(selected.actual_cost)}</span>
          </div>
          <div className="detail-field">
            <strong>Vendor</strong>
            <span>{selected.vendor || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Paid</strong>
            {selected.paid ? (
              <span className="badge badge-success">Paid</span>
            ) : (
              <span className="badge badge-draft">Unpaid</span>
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
      <Modal title={editing ? 'Edit Budget Item' : 'New Budget Item'} onClose={() => setModalOpen(false)}>
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
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description"
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Estimated Cost ($)</label>
              <input
                type="number"
                name="estimated_cost"
                value={form.estimated_cost}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Actual Cost ($)</label>
              <input
                type="number"
                name="actual_cost"
                value={form.actual_cost}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Vendor</label>
            <input
              type="text"
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              placeholder="Vendor or provider name"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="paid"
                checked={form.paid}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              Paid
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
              {saving ? 'Saving...' : editing ? 'Update Budget Item' : 'Create Budget Item'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default BudgetTrackerPage;
