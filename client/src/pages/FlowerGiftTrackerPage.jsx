import React, { useState, useEffect } from 'react';
import { flowerGifts } from '../api';
import Modal from '../components/Modal';

const ITEM_TYPES = [
  'Flowers', 'Fruit Basket', 'Gift Card', 'Memorial Wreath',
  'Plant', 'Donation', 'Food', 'Other',
];

const FlowerGiftTrackerPage = ({ showToast }) => {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    deceased_name: '',
    sender_name: '',
    item_type: 'Flowers',
    description: '',
    received_date: '',
    thank_you_sent: false,
    notes: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await flowerGifts.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load flower & gift records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      sender_name: '',
      item_type: 'Flowers',
      description: '',
      received_date: '',
      thank_you_sent: false,
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
      sender_name: item.sender_name || '',
      item_type: item.item_type || 'Flowers',
      description: item.description || '',
      received_date: item.received_date ? item.received_date.slice(0, 10) : '',
      thank_you_sent: item.thank_you_sent || false,
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
        const updated = await flowerGifts.update(selected.id, formData);
        setSelected(updated);
        showToast('Record updated successfully', 'success');
      } else {
        await flowerGifts.create(formData);
        showToast('Record created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
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
      await flowerGifts.delete(id);
      showToast('Record deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete record', 'error');
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await flowerGifts.getOne(item.id);
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

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Flower & Gift Tracker</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Record</button>
        </div>

        {loading ? (
          <div className="loading">Loading flower & gift records...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No flower & gift records yet</h3>
            <p>Record your first flower or gift to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Record</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Item Type</th>
                  <th>Deceased</th>
                  <th>Received Date</th>
                  <th>Thank You Sent</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.sender_name || '—'}</td>
                    <td>{item.item_type || '—'}</td>
                    <td>{item.deceased_name || '—'}</td>
                    <td>{formatDate(item.received_date)}</td>
                    <td>
                      {item.thank_you_sent ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-draft">No</span>
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
        <a className="back-link" onClick={() => { setView('list'); setSelected(null); }}>
          ← Back to Flower & Gift Tracker
        </a>

        <div className="detail-header">
          <h1>{selected.item_type || 'Gift'} from {selected.sender_name || 'Unknown Sender'}</h1>
        </div>

        <div className="detail-actions">
          <button className="btn-accent btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Sender Name</strong>
            <span>{selected.sender_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Deceased Name</strong>
            <span>{selected.deceased_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Item Type</strong>
            <span>{selected.item_type || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Description</strong>
            <span>{selected.description || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Received Date</strong>
            <span>{formatDate(selected.received_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Thank You Sent</strong>
            {selected.thank_you_sent ? (
              <span className="badge badge-success">Yes</span>
            ) : (
              <span className="badge badge-draft">No</span>
            )}
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
      <Modal title={editing ? 'Edit Record' : 'New Flower / Gift Record'} onClose={() => setModalOpen(false)}>
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
            <label>Sender Name *</label>
            <input
              type="text"
              name="sender_name"
              value={formData.sender_name}
              onChange={handleChange}
              required
              placeholder="Name of the sender"
            />
          </div>

          <div className="form-group">
            <label>Item Type</label>
            <select name="item_type" value={formData.item_type} onChange={handleChange}>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Description of the item"
            />
          </div>

          <div className="form-group">
            <label>Received Date</label>
            <input
              type="date"
              name="received_date"
              value={formData.received_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="thank_you_sent"
                checked={formData.thank_you_sent}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              Thank You Sent
            </label>
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

export default FlowerGiftTrackerPage;
