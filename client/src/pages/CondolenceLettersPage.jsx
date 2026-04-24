import React, { useState, useEffect } from 'react';
import { condolenceLetters, ai } from '../api';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const TONE_OPTIONS = [
  'warm',
  'respectful',
  'heartfelt',
  'spiritual',
  'grateful',
  'powerful',
  'professional',
  'reflective',
  'emotional',
  'distinguished',
];

const CondolenceLettersPage = ({ showToast }) => {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
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
    tone: 'heartfelt',
    content: '',
    ai_generated: false,
    status: 'draft',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await condolenceLetters.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load condolence letters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recipient_name: '',
      deceased_name: '',
      relationship: '',
      tone: 'heartfelt',
      content: '',
      ai_generated: false,
      status: 'draft',
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
      tone: item.tone || 'heartfelt',
      content: item.content || '',
      ai_generated: item.ai_generated || false,
      status: item.status || 'draft',
    });
    setAiContent('');
    setEditing(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing && selected) {
        const updated = await condolenceLetters.update(selected.id, formData);
        setSelected(updated);
        showToast('Condolence letter updated successfully', 'success');
      } else {
        await condolenceLetters.create(formData);
        showToast('Condolence letter created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save condolence letter', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this condolence letter? This action cannot be undone.')) {
      return;
    }
    try {
      await condolenceLetters.delete(id);
      showToast('Condolence letter deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete condolence letter', 'error');
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
      const result = await ai.generateCondolence({
        recipient_name: formData.recipient_name,
        deceased_name: formData.deceased_name,
        relationship: formData.relationship,
        tone: formData.tone,
      });
      const generated = result.content || result.text || result;
      const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
      setAiContent(text);
      setFormData((prev) => ({ ...prev, content: text, ai_generated: true }));
      showToast('AI content generated successfully', 'success');
    } catch (err) {
      showToast('AI generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await condolenceLetters.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load condolence letter details', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderStatusBadge = (status) => {
    const cls = status === 'sent' ? 'badge-success' : 'badge-draft';
    const label = status === 'sent' ? 'Sent' : 'Draft';
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const renderToneBadge = (tone) => {
    return <span className="badge badge-info">{tone}</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Condolence Letters</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Condolence Letter</button>
        </div>

        {loading ? (
          <div className="loading">Loading condolence letters...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No condolence letters yet</h3>
            <p>Create your first condolence letter to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Condolence Letter</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Deceased</th>
                  <th>Relationship</th>
                  <th>Tone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.recipient_name}</td>
                    <td>{item.deceased_name}</td>
                    <td>{item.relationship || '—'}</td>
                    <td>{renderToneBadge(item.tone)}</td>
                    <td>{renderStatusBadge(item.status)}</td>
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
          ← Back to Condolence Letters
        </a>

        <div className="detail-header">
          <h1>Condolence Letter to {selected.recipient_name}</h1>
          {renderStatusBadge(selected.status)}
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
            <strong>Tone</strong>
            {renderToneBadge(selected.tone)}
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {renderStatusBadge(selected.status)}
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
          <h3>Letter Content</h3>
          {selected.content ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{selected.content}</div>
          ) : (
            <p className="empty-state">No content yet.</p>
          )}
        </div>

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create / edit) ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Condolence Letter' : 'New Condolence Letter'} onClose={() => setModalOpen(false)}>
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
              placeholder="e.g., Friend, Colleague, Family member"
            />
          </div>

          <div className="form-group">
            <label>Tone</label>
            <select name="tone" value={formData.tone} onChange={handleChange}>
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the condolence letter or generate it with AI..."
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
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
            </select>
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

export default CondolenceLettersPage;
