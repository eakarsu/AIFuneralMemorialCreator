import React, { useState, useEffect } from 'react';
import { griefSupport, ai } from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import AIOutput from '../components/AIOutput';

const SESSION_TYPES = [
  'general',
  'crisis',
  'seasonal',
  'family',
  'emotional',
  'practical',
  'health',
  'milestone',
  'clinical',
  'existential',
  'pet_loss',
  'supporting_others',
  'trauma',
];

const MOOD_BADGES = {
  devastated: 'badge-danger',
  sad: 'badge-warning',
  stressed: 'badge-info',
  anxious: 'badge-info',
  angry: 'badge-danger',
  numb: 'badge-draft',
  hopeful: 'badge-success',
  peaceful: 'badge-success',
  grateful: 'badge-success',
  confused: 'badge-warning',
  lonely: 'badge-warning',
  overwhelmed: 'badge-danger',
};

const GriefSupportPage = ({ showToast }) => {
  const [view, setView] = useState('list');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [formData, setFormData] = useState({
    topic: '',
    message: '',
    ai_response: '',
    mood: '',
    session_type: 'general',
  });

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await griefSupport.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load grief support sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      message: '',
      ai_response: '',
      mood: '',
      session_type: 'general',
    });
    setAiContent('');
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await griefSupport.create(formData);
      showToast('Grief support session created successfully', 'success');
      setModalOpen(false);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to create session', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }
    try {
      await griefSupport.delete(id);
      showToast('Session deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete session', 'error');
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.topic) {
      showToast('Please enter a topic before generating AI support', 'error');
      return;
    }
    setAiLoading(true);
    setAiContent('');
    try {
      const result = await ai.generateGriefSupport({
        topic: formData.topic,
        mood: formData.mood,
        message: formData.message,
      });
      const generated = result.content || result.text || result;
      const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
      setAiContent(text);
      setFormData((prev) => ({ ...prev, ai_response: text }));
      showToast('AI support response generated successfully', 'success');
    } catch (err) {
      showToast('AI generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const selectCard = async (item) => {
    try {
      const full = await griefSupport.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load session details', 'error');
    }
  };

  const getMoodBadgeClass = (mood) => {
    if (!mood) return 'badge-draft';
    return MOOD_BADGES[mood.toLowerCase()] || 'badge-draft';
  };

  const formatSessionType = (type) => {
    if (!type) return '—';
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const truncate = (text, maxLen = 120) => {
    if (!text) return '—';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Grief Support</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Session</button>
        </div>

        {loading ? (
          <div className="loading">Loading grief support sessions...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No grief support sessions yet</h3>
            <p>Start a new session to receive compassionate AI-guided support.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Session</button>
          </div>
        ) : (
          <div className="grid-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="card clickable-row"
                onClick={() => selectCard(item)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#2c3e50', flex: 1 }}>
                    {item.topic || 'Untitled Session'}
                  </h3>
                  {item.mood && (
                    <span className={`badge ${getMoodBadgeClass(item.mood)}`}>
                      {item.mood}
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>
                    {formatSessionType(item.session_type)}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#7f8c8d', lineHeight: 1.6, margin: 0 }}>
                  {truncate(item.message)}
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
          ← Back to Grief Support
        </a>

        <div className="detail-header">
          <h1>{selected.topic || 'Untitled Session'}</h1>
          {selected.mood && (
            <span className={`badge ${getMoodBadgeClass(selected.mood)}`}>
              {selected.mood}
            </span>
          )}
        </div>

        <div className="detail-actions">
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Session Type</strong>
            <span>{formatSessionType(selected.session_type)}</span>
          </div>
          <div className="detail-field">
            <strong>Mood</strong>
            <span>{selected.mood || '—'}</span>
          </div>
        </div>

        <div className="card detail-content">
          <h3>Your Message</h3>
          {selected.message ? (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{selected.message}</div>
          ) : (
            <p className="empty-state">No message provided.</p>
          )}
        </div>

        <div className="card detail-content">
          <h3>AI Support Response</h3>
          {selected.ai_response ? (
            <AIOutput content={selected.ai_response} />
          ) : (
            <p className="empty-state">No AI response yet.</p>
          )}
        </div>

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create) ──
  function renderModal() {
    return (
      <Modal title="New Session" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Topic *</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              placeholder="What would you like to talk about?"
            />
          </div>

          <div className="form-group">
            <label>Mood</label>
            <select name="mood" value={formData.mood} onChange={handleChange}>
              <option value="">Select your current mood</option>
              {Object.keys(MOOD_BADGES).map((mood) => (
                <option key={mood} value={mood}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Session Type</label>
            <select name="session_type" value={formData.session_type} onChange={handleChange}>
              {SESSION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatSessionType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Your Message</label>
            <textarea
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              placeholder="Share what's on your mind... The AI will respond with compassionate, personalized support."
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btn-gold btn-sm"
              onClick={handleGenerateAI}
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating...' : '✦ Get AI Support'}
            </button>
          </div>

          <AIOutput content={aiContent} loading={aiLoading} />

          {aiContent && (
            <div className="form-group">
              <label>AI Response</label>
              <textarea
                name="ai_response"
                rows={6}
                value={formData.ai_response}
                onChange={handleChange}
                placeholder="AI-generated response will appear here..."
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create Session</button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default GriefSupportPage;
