import React, { useState, useEffect } from 'react';
import { obituaries, ai } from '../api';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';
import Pagination from '../components/Pagination';

const ObituariesPage = ({ showToast }) => {
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
    deceased_name: '',
    birth_date: '',
    death_date: '',
    city: '',
    content: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await obituaries.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load obituaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      birth_date: '',
      death_date: '',
      city: '',
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
      birth_date: item.birth_date ? item.birth_date.slice(0, 10) : '',
      death_date: item.death_date ? item.death_date.slice(0, 10) : '',
      city: item.city || '',
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
        const updated = await obituaries.update(selected.id, formData);
        setSelected(updated);
        showToast('Obituary updated successfully', 'success');
      } else {
        await obituaries.create(formData);
        showToast('Obituary created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll(pagination.page);
    } catch (err) {
      showToast('Failed to save obituary', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this obituary? This action cannot be undone.')) {
      return;
    }
    try {
      await obituaries.delete(id);
      showToast('Obituary deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete obituary', 'error');
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
      const result = await ai.generateObituary({
        deceased_name: formData.deceased_name,
        birth_date: formData.birth_date,
        death_date: formData.death_date,
        city: formData.city,
        details: formData.content,
      });
      const generated = result.content || result.text || result;
      const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
      setAiContent(text);
      setFormData((prev) => ({ ...prev, content: text }));
      if (result.id) {
        showToast('Obituary saved! View in Obituaries section.', 'success');
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
      const full = await obituaries.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load obituary details', 'error');
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
          <h1>Obituaries</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Obituary</button>
        </div>

        {loading ? (
          <div className="loading">Loading obituaries...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No obituaries yet</h3>
            <p>Create your first obituary to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Obituary</button>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Deceased Name</th>
                    <th>Birth Date</th>
                    <th>Death Date</th>
                    <th>City</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                      <td>{item.deceased_name}</td>
                      <td>{formatDate(item.birth_date)}</td>
                      <td>{formatDate(item.death_date)}</td>
                      <td>{item.city || '—'}</td>
                      <td>{renderBadge(item.status)}</td>
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
          ← Back to Obituaries
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
            <strong>Birth Date</strong>
            <span>{formatDate(selected.birth_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Death Date</strong>
            <span>{formatDate(selected.death_date)}</span>
          </div>
          <div className="detail-field">
            <strong>City</strong>
            <span>{selected.city || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {renderBadge(selected.status)}
          </div>
        </div>

        <div className="card detail-content">
          <h3>Obituary Content</h3>
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
      <Modal title={editing ? 'Edit Obituary' : 'New Obituary'} onClose={() => setModalOpen(false)}>
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
            <label>Birth Date</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Death Date</label>
            <input
              type="date"
              name="death_date"
              value={formData.death_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City of residence"
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the obituary content or generate it with AI..."
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

export default ObituariesPage;
