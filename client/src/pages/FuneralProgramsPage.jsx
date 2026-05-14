import React, { useState, useEffect } from 'react';
import { funeralPrograms, ai } from '../api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import AIOutput from '../components/AIOutput';

const SERVICE_TYPES = [
  'traditional',
  'military',
  'celebration_of_life',
  'catholic',
  'baptist',
  'islamic',
  'buddhist',
  'secular',
  'episcopal',
];

const TEMPLATES = [
  'classic',
  'modern',
  'religious',
  'military',
  'elegant',
  'garden',
];

const FuneralProgramsPage = ({ showToast }) => {
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
    service_date: '',
    service_type: 'traditional',
    venue: '',
    officiant: '',
    program_content: '',
    music_selections: '',
    template: 'classic',
    status: 'draft',
  });

  useEffect(() => {
    fetchAll(1);
  }, []);

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const data = await funeralPrograms.getAll(page, 20);
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      showToast('Failed to load funeral programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deceased_name: '',
      service_date: '',
      service_type: 'traditional',
      venue: '',
      officiant: '',
      program_content: '',
      music_selections: '',
      template: 'classic',
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
      service_date: item.service_date ? item.service_date.slice(0, 16) : '',
      service_type: item.service_type || 'traditional',
      venue: item.venue || '',
      officiant: item.officiant || '',
      program_content: item.program_content || '',
      music_selections: item.music_selections || '',
      template: item.template || 'classic',
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
        const updated = await funeralPrograms.update(selected.id, formData);
        setSelected(updated);
        showToast('Funeral program updated successfully', 'success');
      } else {
        await funeralPrograms.create(formData);
        showToast('Funeral program created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to save funeral program', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this funeral program? This action cannot be undone.')) {
      return;
    }
    try {
      await funeralPrograms.delete(id);
      showToast('Funeral program deleted successfully', 'success');
      setView('list');
      setSelected(null);
      fetchAll(1);
    } catch (err) {
      showToast('Failed to delete funeral program', 'error');
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
      const result = await ai.generateFuneralProgram({
        deceased_name: formData.deceased_name,
        service_type: formData.service_type,
        venue: formData.venue,
        officiant: formData.officiant,
        details: formData.program_content,
      });
      const generated = result.content || result.text || result;
      const text = typeof generated === 'string' ? generated : JSON.stringify(generated);
      setAiContent(text);
      setFormData((prev) => ({ ...prev, program_content: text }));
      showToast('AI program content generated successfully', 'success');
    } catch (err) {
      showToast('AI generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const selectRow = async (item) => {
    try {
      const full = await funeralPrograms.getOne(item.id);
      setSelected(full);
      setView('detail');
    } catch (err) {
      showToast('Failed to load program details', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatServiceType = (type) => {
    if (!type) return '—';
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatTemplate = (tmpl) => {
    if (!tmpl) return '—';
    return tmpl.charAt(0).toUpperCase() + tmpl.slice(1);
  };

  const renderBadge = (status) => {
    const cls = status === 'published' || status === 'final' || status === 'complete'
      ? 'badge-success'
      : status === 'in_progress'
        ? 'badge-warning'
        : 'badge-draft';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Funeral Programs</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Program</button>
        </div>

        {loading ? (
          <div className="loading">Loading funeral programs...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No funeral programs yet</h3>
            <p>Create your first funeral program to get started.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Program</button>
          </div>
        ) : (
          <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Deceased Name</th>
                  <th>Service Type</th>
                  <th>Venue</th>
                  <th>Service Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => selectRow(item)}>
                    <td>{item.deceased_name}</td>
                    <td>{formatServiceType(item.service_type)}</td>
                    <td>{item.venue || '—'}</td>
                    <td>{formatDate(item.service_date)}</td>
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
          ← Back to Funeral Programs
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
            <strong>Service Type</strong>
            <span>{formatServiceType(selected.service_type)}</span>
          </div>
          <div className="detail-field">
            <strong>Service Date</strong>
            <span>{formatDate(selected.service_date)}</span>
          </div>
          <div className="detail-field">
            <strong>Venue</strong>
            <span>{selected.venue || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Officiant</strong>
            <span>{selected.officiant || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Template</strong>
            <span>{formatTemplate(selected.template)}</span>
          </div>
          <div className="detail-field">
            <strong>Status</strong>
            {renderBadge(selected.status)}
          </div>
        </div>

        <div className="card detail-content">
          <h3>Program Content</h3>
          {selected.program_content ? (
            <AIOutput content={selected.program_content} />
          ) : (
            <p className="empty-state">No program content yet.</p>
          )}
        </div>

        {selected.music_selections && (
          <div className="card detail-content">
            <h3>Music Selections</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{selected.music_selections}</div>
          </div>
        )}

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal (create / edit) ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Funeral Program' : 'New Funeral Program'} onClose={() => setModalOpen(false)}>
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
            <label>Service Date</label>
            <input
              type="datetime-local"
              name="service_date"
              value={formData.service_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Service Type</label>
            <select name="service_type" value={formData.service_type} onChange={handleChange}>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatServiceType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Service location"
            />
          </div>

          <div className="form-group">
            <label>Officiant</label>
            <input
              type="text"
              name="officiant"
              value={formData.officiant}
              onChange={handleChange}
              placeholder="Name of the officiant"
            />
          </div>

          <div className="form-group">
            <label>Template</label>
            <select name="template" value={formData.template} onChange={handleChange}>
              {TEMPLATES.map((tmpl) => (
                <option key={tmpl} value={tmpl}>
                  {formatTemplate(tmpl)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Program Content</label>
            <textarea
              name="program_content"
              rows={8}
              value={formData.program_content}
              onChange={handleChange}
              placeholder="Write the program content or generate it with AI..."
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btn-gold btn-sm"
              onClick={handleGenerateAI}
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating...' : '✦ Generate Program with AI'}
            </button>
          </div>

          <AIOutput content={aiContent} loading={aiLoading} />

          <div className="form-group">
            <label>Music Selections</label>
            <textarea
              name="music_selections"
              rows={4}
              value={formData.music_selections}
              onChange={handleChange}
              placeholder="List hymns, songs, or musical pieces for the service..."
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
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

export default FuneralProgramsPage;
