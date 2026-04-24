import React, { useState, useEffect } from 'react';
import { eulogies, ai } from '../api';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const EulogiesPage = ({ showToast }) => {
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
    relationship: '',
    tone: '',
    key_memories: '',
    content: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await eulogies.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load eulogies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      relationship: '',
      tone: '',
      key_memories: '',
      content: '',
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
      deceased_name: item.deceased_name || '',
      relationship: item.relationship || '',
      tone: item.tone || '',
      key_memories: item.key_memories || '',
      content: item.content || '',
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
        const updated = await eulogies.update(selected.id, formData);
        setSelected(updated);
        showToast('Eulogy updated successfully', 'success');
      } else {
        await eulogies.create(formData);
        showToast('Eulogy created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save eulogy', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this eulogy? This action cannot be undone.')) {
      return;
    }
    try {
      await eulogies.delete(id);
      showToast('Eulogy deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete eulogy', 'error');
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.deceased_name) {
      showToast('Please enter the deceased name before generating', 'error');
      return;
    }
    setAiLoading(true);
    setAiContent('');
    try {
      const result = await ai.generateEulogy({
        deceased_name: formData.deceased_name,
        relationship: formData.relationship,
        tone: formData.tone,
        key_memories: formData.key_memories,
      });
      const generated = result.content || result.text || result;
      const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
      setAiContent(text);
      setFormData((prev) => ({ ...prev, content: text }));
      showToast('AI content generated successfully', 'success');
    } catch (err) {
      showToast('AI generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await eulogies.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load eulogy details', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderBadge = (status) => {
    const cls = status === 'published' || status === 'final' ? 'badge-success' : 'badge-draft';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Eulogies</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Eulogy</button>
        </div>

        {loading ? (
          <div className="loading">Loading eulogies...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No eulogies yet</h3>
            <p>Create your first eulogy to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Eulogy</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Deceased Name</th>
                  <th>Relationship</th>
                  <th>Tone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.deceased_name}</td>
                    <td>{item.relationship || '—'}</td>
                    <td>{item.tone || '—'}</td>
                    <td>{renderBadge(item.status)}</td>
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
          ← Back to Eulogies
        </a>

        <div className="detail-header">
          <h1>{selected.deceased_name}</h1>
          {renderBadge(selected.status)}
        </div>

        <div className="detail-actions">
          <button className="btn-accent btn-sm" onClick={() => openEdit(selected)}>Edit</button>
          <button className="btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
        </div>

        <div className="card">
          <div className="detail-field">
            <strong>Relationship</strong>
            <span>{selected.relationship || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Tone</strong>
            <span>{selected.tone || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Key Memories</strong>
            <span>{selected.key_memories || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {renderBadge(selected.status)}
          </div>
        </div>

        <div className="card detail-content">
          <h3>Eulogy Content</h3>
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
      <Modal title={editing ? 'Edit Eulogy' : 'New Eulogy'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deceased Name *</label>
            <input
              type="text"
              name="deceased_name"
              value={formData.deceased_name}
              onChange={handleChange}
              required
              placeholder="Full name of the deceased"
            />
          </div>

          <div className="form-group">
            <label>Relationship</label>
            <input
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              placeholder="e.g. Father, Friend, Colleague"
            />
          </div>

          <div className="form-group">
            <label>Tone</label>
            <select name="tone" value={formData.tone} onChange={handleChange}>
              <option value="">Select a tone...</option>
              <option value="warm">Warm</option>
              <option value="formal">Formal</option>
              <option value="celebratory">Celebratory</option>
              <option value="reflective">Reflective</option>
              <option value="religious">Religious</option>
              <option value="humorous">Humorous</option>
            </select>
          </div>

          <div className="form-group">
            <label>Key Memories</label>
            <textarea
              name="key_memories"
              rows={4}
              value={formData.key_memories}
              onChange={handleChange}
              placeholder="Share key memories, stories, or traits you'd like included..."
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the eulogy content or generate it with AI..."
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
              <option value="final">Final</option>
              <option value="published">Published</option>
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

export default EulogiesPage;
