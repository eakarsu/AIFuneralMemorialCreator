import React, { useState, useEffect } from 'react';
import { thankYouCards, ai } from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import AIOutput from '../components/AIOutput';

const ThankYouCardsPage = ({ showToast }) => {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [formData, setFormData] = useState({
    recipient_name: '',
    deceased_name: '',
    relationship: '',
    gift_or_gesture: '',
    message: '',
    ai_generated: false,
    sent: false,
  });

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await thankYouCards.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load thank you cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recipient_name: '',
      deceased_name: '',
      relationship: '',
      gift_or_gesture: '',
      message: '',
      ai_generated: false,
      sent: false,
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
      recipient_name: item.recipient_name || '',
      deceased_name: item.deceased_name || '',
      relationship: item.relationship || '',
      gift_or_gesture: item.gift_or_gesture || '',
      message: item.message || '',
      ai_generated: item.ai_generated || false,
      sent: item.sent || false,
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
    try {
      if (editing && selected) {
        const updated = await thankYouCards.update(selected.id, formData);
        setSelected(updated);
        showToast('Thank you card updated successfully', 'success');
      } else {
        await thankYouCards.create(formData);
        showToast('Thank you card created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to save thank you card', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this thank you card? This action cannot be undone.')) {
      return;
    }
    try {
      await thankYouCards.delete(id);
      showToast('Thank you card deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete thank you card', 'error');
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.recipient_name || !formData.deceased_name) {
      showToast('Please enter the recipient and deceased names before generating', 'error');
      return;
    }
    setAiLoading(true);
    setAiContent('');
    try {
      const result = await ai.generateThankYou({
        recipient_name: formData.recipient_name,
        deceased_name: formData.deceased_name,
        gift_or_gesture: formData.gift_or_gesture,
        relationship: formData.relationship,
      });
      const generated = result.content || result.text || result;
      const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
      setAiContent(text);
      setFormData((prev) => ({ ...prev, message: text, ai_generated: true }));
      if (result.id) {
        showToast('Thank you card saved! View in Thank You Cards section.', 'success');
        fetchAll(1);
        setModalOpen(false);
      } else {
        showToast('AI content generated successfully', 'success');
      }
    } catch (err) {
      if (err.status === 429) {
        showToast('AI rate limit reached. Please wait before making more AI requests.', 'error');
      } else {
        showToast('AI generation failed', 'error');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await thankYouCards.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load thank you card details', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderSentBadge = (sent) => {
    if (sent) {
      return <span className="badge badge-success">Sent</span>;
    }
    return <span className="badge badge-warning">Pending</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Thank You Cards</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Thank You Card</button>
        </div>

        {loading ? (
          <div className="loading">Loading thank you cards...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No thank you cards yet</h3>
            <p>Create your first thank you card to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Thank You Card</button>
          </div>
        ) : (
          <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Deceased</th>
                  <th>Relationship</th>
                  <th>Sent</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.recipient_name}</td>
                    <td>{item.deceased_name}</td>
                    <td>{item.relationship || '—'}</td>
                    <td>{renderSentBadge(item.sent)}</td>
                    <td>{formatDate(item.created_at)}</td>
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
          ← Back to Thank You Cards
        </a>

        <div className="detail-header">
          <h1>Thank You Card for {selected.recipient_name}</h1>
          {renderSentBadge(selected.sent)}
        </div>

        <div className="detail-actions">
          <button className="btn-accent btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Recipient</strong>
            <span>{selected.recipient_name}</span>
          </div>
          <div className="detail-field">
            <strong>Deceased</strong>
            <span>{selected.deceased_name}</span>
          </div>
          <div className="detail-field">
            <strong>Relationship</strong>
            <span>{selected.relationship || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Gift / Gesture</strong>
            <span>{selected.gift_or_gesture || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Sent</strong>
            {renderSentBadge(selected.sent)}
          </div>
          <div className="detail-field">
            <strong>AI Generated</strong>
            <span>{selected.ai_generated ? 'Yes' : 'No'}</span>
          </div>
          <div className="detail-field">
            <strong>Date</strong>
            <span>{formatDate(selected.created_at)}</span>
          </div>
        </div>

        <div className="card detail-content">
          <h3>Message</h3>
          {selected.message ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</div>
          ) : (
            <p className="empty-state">No message content yet.</p>
          )}
        </div>

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create / edit) ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Thank You Card' : 'New Thank You Card'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Recipient Name *</label>
            <input
              type="text"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              required
              placeholder="Name of the recipient"
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
              placeholder="Name of the deceased"
            />
          </div>

          <div className="form-group">
            <label>Relationship</label>
            <input
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              placeholder="e.g., Friend, Colleague, Neighbor"
            />
          </div>

          <div className="form-group">
            <label>Gift or Gesture</label>
            <input
              type="text"
              name="gift_or_gesture"
              value={formData.gift_or_gesture}
              onChange={handleChange}
              placeholder="e.g., Flowers, Food, Donation, Attendance"
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              rows={8}
              value={formData.message}
              onChange={handleChange}
              placeholder="Write the thank you message or generate it with AI..."
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btn-gold btn-sm"
              onClick={handleGenerateAI}
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating...' : '✦ Generate with AI'}
            </button>
          </div>

          <AIOutput content={aiContent} loading={aiLoading} />

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="sent"
                checked={formData.sent}
                onChange={handleChange}
              />
              Sent
            </label>
          </div>

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

export default ThankYouCardsPage;
