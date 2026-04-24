import React, { useState, useEffect } from 'react';
import { memorialDonations, ai } from '../api';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const STATUSES = [
  { value: 'received', label: 'Received' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'processed', label: 'Processed' },
];

const MemorialDonationsPage = ({ showToast }) => {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [formData, setFormData] = useState({
    deceased_name: '',
    donor_name: '',
    organization: '',
    amount: '',
    message: '',
    status: 'received',
    donation_date: '',
    thank_you_sent: false,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await memorialDonations.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load memorial donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      donor_name: '',
      organization: '',
      amount: '',
      message: '',
      status: 'received',
      donation_date: '',
      thank_you_sent: false,
    });
    setAiContent('');
  };

  const openCreate = () => {
    resetForm();
    setEditing(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setFormData({
      deceased_name: item.deceased_name || '',
      donor_name: item.donor_name || '',
      organization: item.organization || '',
      amount: item.amount != null ? item.amount : '',
      message: item.message || '',
      status: item.status || 'received',
      donation_date: item.donation_date ? item.donation_date.slice(0, 10) : '',
      thank_you_sent: item.thank_you_sent || false,
    });
    setAiContent('');
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
    const payload = {
      ...formData,
      amount: formData.amount !== '' ? parseFloat(formData.amount) : null,
    };
    try {
      if (editing && selected) {
        const updated = await memorialDonations.update(selected.id, payload);
        setSelected(updated);
        showToast('Donation updated successfully', 'success');
      } else {
        await memorialDonations.create(payload);
        showToast('Donation created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save donation', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation record? This action cannot be undone.')) {
      return;
    }
    try {
      await memorialDonations.delete(id);
      showToast('Donation deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete donation', 'error');
    }
  };

  const handleGenerateThankYou = async () => {
    if (!formData.donor_name || !formData.deceased_name) {
      showToast('Please enter donor name and deceased name before generating', 'error');
      return;
    }
    setAiLoading(true);
    setAiContent('');
    try {
      const result = await ai.generateDonationThanks({
        donor_name: formData.donor_name,
        deceased_name: formData.deceased_name,
        organization: formData.organization,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
      });
      const generated = result.content || result.text || result;
      const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
      setAiContent(text);
      showToast('Thank you letter generated successfully', 'success');
    } catch (err) {
      showToast('AI generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await memorialDonations.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load donation details', 'error');
    }
  };

  const formatCurrency = (val) => {
    if (val == null || val === '') return '—';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return '—';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const totalDonations = items.reduce((sum, item) => {
    const amt = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const getStatusBadge = (status) => {
    const map = {
      received: 'badge-info',
      acknowledged: 'badge-warning',
      processed: 'badge-success',
    };
    const cls = map[status] || 'badge-draft';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Memorial Donations</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Donation</button>
        </div>

        {!loading && items.length > 0 && (
          <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: 14, color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: 1 }}>Total Donations</strong>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#27ae60', marginTop: 4 }}>
                {formatCurrency(totalDonations)}
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#7f8c8d' }}>
              {items.length} donation{items.length !== 1 ? 's' : ''} recorded
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading memorial donations...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No memorial donations yet</h3>
            <p>Record your first memorial donation to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Donation</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Deceased</th>
                  <th>Organization</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Thank You Sent</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.donor_name || '—'}</td>
                    <td>{item.deceased_name || '—'}</td>
                    <td>{item.organization || '—'}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{getStatusBadge(item.status)}</td>
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
          ← Back to Memorial Donations
        </a>

        <div className="detail-header">
          <h1>Donation from {selected.donor_name || 'Unknown Donor'}</h1>
          {getStatusBadge(selected.status)}
        </div>

        <div className="detail-actions">
          <button className="btn-accent btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Donor Name</strong>
            <span>{selected.donor_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>In Memory Of</strong>
            <span>{selected.deceased_name || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Organization</strong>
            <span>{selected.organization || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Amount</strong>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#27ae60' }}>{formatCurrency(selected.amount)}</span>
          </div>
          <div className="detail-field">
            <strong>Donation Date</strong>
            <span>{formatDate(selected.donation_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {getStatusBadge(selected.status)}
          </div>
          <div className="detail-field">
            <strong>Thank You Sent</strong>
            {selected.thank_you_sent ? (
              <span className="badge badge-success">Yes</span>
            ) : (
              <span className="badge badge-draft">No</span>
            )}
          </div>
        </div>

        {selected.message && (
          <div className="card detail-content">
            <h3>Donor Message</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{selected.message}</div>
          </div>
        )}

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create / edit) ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Donation' : 'New Donation'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Donor Name *</label>
            <input
              type="text"
              name="donor_name"
              value={formData.donor_name}
              onChange={handleChange}
              required
              placeholder="Name of the donor"
            />
          </div>

          <div className="form-group">
            <label>Deceased Name *</label>
            <input
              type="text"
              name="deceased_name"
              value={formData.deceased_name}
              onChange={handleChange}
              required
              placeholder="In memory of"
            />
          </div>

          <div className="form-group">
            <label>Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Receiving organization or charity"
            />
          </div>

          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Donation Date</label>
            <input
              type="date"
              name="donation_date"
              value={formData.donation_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Optional message from the donor"
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
            <button
              type="button"
              className="btn-gold btn-sm"
              onClick={handleGenerateThankYou}
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating...' : '✦ Generate Thank You'}
            </button>
          </div>

          <AIOutput content={aiContent} loading={aiLoading} />

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default MemorialDonationsPage;
