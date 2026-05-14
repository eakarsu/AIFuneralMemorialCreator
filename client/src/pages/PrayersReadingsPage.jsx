import React, { useState, useEffect } from 'react';
import { prayersReadings, ai } from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import AIOutput from '../components/AIOutput';

const CATEGORIES = [
  { value: 'prayer', label: 'Prayer' },
  { value: 'psalm', label: 'Psalm' },
  { value: 'poem', label: 'Poem' },
  { value: 'sutra', label: 'Sutra' },
  { value: 'mantra', label: 'Mantra' },
  { value: 'blessing', label: 'Blessing' },
  { value: 'sermon', label: 'Sermon' },
];

const TRADITIONS = [
  { value: 'Christian', label: 'Christian' },
  { value: 'Islamic', label: 'Islamic' },
  { value: 'Jewish', label: 'Jewish' },
  { value: 'Buddhist', label: 'Buddhist' },
  { value: 'Hindu', label: 'Hindu' },
  { value: 'Sikh', label: 'Sikh' },
  { value: 'Catholic', label: 'Catholic' },
  { value: 'Celtic', label: 'Celtic' },
  { value: 'Native American', label: 'Native American' },
  { value: 'Secular', label: 'Secular' },
];

const OCCASIONS = [
  { value: 'funeral', label: 'Funeral' },
  { value: 'memorial', label: 'Memorial' },
  { value: 'celebration_of_life', label: 'Celebration of Life' },
];

const PrayersReadingsPage = ({ showToast }) => {
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
    title: '',
    category: 'prayer',
    tradition: 'Christian',
    content: '',
    source: '',
    occasion: 'funeral',
    ai_generated: false,
  });

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await prayersReadings.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load prayers and readings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'prayer',
      tradition: 'Christian',
      content: '',
      source: '',
      occasion: 'funeral',
      ai_generated: false,
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
      title: item.title || '',
      category: item.category || 'prayer',
      tradition: item.tradition || 'Christian',
      content: item.content || '',
      source: item.source || '',
      occasion: item.occasion || 'funeral',
      ai_generated: item.ai_generated || false,
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
        const updated = await prayersReadings.update(selected.id, formData);
        setSelected(updated);
        showToast('Prayer/reading updated successfully', 'success');
      } else {
        await prayersReadings.create(formData);
        showToast('Prayer/reading created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to save prayer/reading', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prayer/reading? This action cannot be undone.')) {
      return;
    }
    try {
      await prayersReadings.delete(id);
      showToast('Prayer/reading deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete prayer/reading', 'error');
    }
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiContent('');
    try {
      const result = await ai.generatePrayer({
        tradition: formData.tradition,
        occasion: formData.occasion,
        deceased_name: '',
        category: formData.category,
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

  const selectCard = async (item) => {
    try {
      const full = await prayersReadings.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load prayer/reading details', 'error');
    }
  };

  const truncate = (text, maxLen = 120) => {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
  };

  const getCategoryLabel = (val) => {
    const found = CATEGORIES.find((c) => c.value === val);
    return found ? found.label : val;
  };

  const getTraditionBadgeClass = (tradition) => {
    const map = {
      Christian: 'badge-primary',
      Islamic: 'badge-success',
      Jewish: 'badge-info',
      Buddhist: 'badge-warning',
      Hindu: 'badge-warning',
      Sikh: 'badge-info',
      Catholic: 'badge-primary',
      Celtic: 'badge-success',
      'Native American': 'badge-draft',
      Secular: 'badge-draft',
    };
    return map[tradition] || 'badge-draft';
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Prayers & Readings</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Prayer/Reading</button>
        </div>

        {loading ? (
          <div className="loading">Loading prayers and readings...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No prayers or readings yet</h3>
            <p>Create your first prayer or reading to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Prayer/Reading</button>
          </div>
        ) : (
          <div className="grid-3">
            {items.map((item) => (
              <div key={item.id} className="card clickable-row" onClick={() => selectCard(item)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 17 }}>{item.title || 'Untitled'}</h3>
                  <span className={`badge ${getTraditionBadgeClass(item.tradition)}`}>{item.tradition}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>{getCategoryLabel(item.category)}</span>
                  {item.ai_generated && (
                    <span className="badge badge-warning" style={{ fontSize: 11, marginLeft: 6 }}>AI</span>
                  )}
                </div>
                <p style={{ color: '#7f8c8d', lineHeight: 1.6, margin: 0, fontSize: 14 }}>
                  {truncate(item.content)}
                </p>
              </div>
            ))}
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
          ← Back to Prayers & Readings
        </a>

        <div className="detail-header">
          <h1>{selected.title || 'Untitled'}</h1>
          <span className={`badge ${getTraditionBadgeClass(selected.tradition)}`}>{selected.tradition}</span>
          {selected.ai_generated && <span className="badge badge-warning" style={{ marginLeft: 8 }}>AI Generated</span>}
        </div>

        <div className="detail-actions">
          <button className="btn-accent btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Category</strong>
            <span>{getCategoryLabel(selected.category)}</span>
          </div>
          <div className="detail-field">
            <strong>Tradition</strong>
            <span>{selected.tradition || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Occasion</strong>
            <span>{selected.occasion ? selected.occasion.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Source</strong>
            <span>{selected.source || '—'}</span>
          </div>
        </div>

        <div className="card detail-content">
          <h3>Full Text</h3>
          {selected.content ? (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, fontFamily: 'Georgia, "Playfair Display", serif', fontSize: 16 }}>
              {selected.content}
            </div>
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
      <Modal title={editing ? 'Edit Prayer/Reading' : 'New Prayer/Reading'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Title of the prayer or reading"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tradition</label>
            <select name="tradition" value={formData.tradition} onChange={handleChange}>
              {TRADITIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Occasion</label>
            <select name="occasion" value={formData.occasion} onChange={handleChange}>
              {OCCASIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="e.g., Book of Psalms, Quran, Original"
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter the prayer or reading text, or generate it with AI..."
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="ai_generated"
                checked={formData.ai_generated}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              AI Generated
            </label>
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

export default PrayersReadingsPage;
