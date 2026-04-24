import React, { useState, useEffect } from 'react';
import { documents } from '../api';
import Modal from '../components/Modal';

const DOCUMENT_TYPES = [
  'Death Certificate',
  'Will',
  'Insurance Policy',
  'Property Deed',
  'Bank Statement',
  'Legal Document',
  'Medical Record',
  'Photo ID',
  'Other',
];

const emptyForm = {
  deceased_name: '',
  title: '',
  document_type: '',
  file_reference: '',
  description: '',
  uploaded_date: '',
};

const DocumentVaultPage = ({ showToast }) => {
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
      const data = await documents.getAll();
      setItems(data);
    } catch (err) {
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditing(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      deceased_name: item.deceased_name || '',
      title: item.title || '',
      document_type: item.document_type || '',
      file_reference: item.file_reference || '',
      description: item.description || '',
      uploaded_date: item.uploaded_date ? item.uploaded_date.slice(0, 10) : '',
    });
    setEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing && selected) {
        const updated = await documents.update(selected.id, form);
        setSelected(updated);
        showToast('Document updated successfully', 'success');
      } else {
        await documents.create(form);
        showToast('Document created successfully', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast('Failed to save document', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documents.delete(id);
      showToast('Document deleted', 'success');
      setView('list');
      setSelected(null);
      fetchAll();
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    setView('detail');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Document Vault</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Document</button>
        </div>

        {loading ? (
          <div className="loading">Loading documents...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No documents yet</h3>
            <p>Add your first document to start organizing important records.</p>
            <button className="btn-primary" onClick={openCreate}>+ New Document</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Deceased</th>
                  <th>Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="clickable-row" onClick={() => openDetail(item)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.title || '—'}</td>
                    <td>{item.document_type || '—'}</td>
                    <td>{item.deceased_name || '—'}</td>
                    <td>{formatDateShort(item.uploaded_date)}</td>
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
          &larr; Back to Document Vault
        </a>

        <div className="detail-header">
          <h1>{selected.title || 'Document'}</h1>
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
            <strong>Title</strong>
            <span>{selected.title || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Document Type</strong>
            <span>{selected.document_type || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>File Reference</strong>
            <span>{selected.file_reference || '—'}</span>
          </div>
          <div className="detail-field">
            <strong>Upload Date</strong>
            <span>{formatDate(selected.uploaded_date)}</span>
          </div>
        </div>

        {selected.description && (
          <div className="card detail-content">
            <h3>Description</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{selected.description}</div>
          </div>
        )}

        {modalOpen && renderModal()}
      </div>
    );
  }

  // ── Modal ──
  function renderModal() {
    return (
      <Modal title={editing ? 'Edit Document' : 'New Document'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deceased Name</label>
            <input
              type="text"
              name="deceased_name"
              value={form.deceased_name}
              onChange={handleChange}
              placeholder="Full name of the deceased"
            />
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Document title"
            />
          </div>

          <div className="form-group">
            <label>Document Type</label>
            <select name="document_type" value={form.document_type} onChange={handleChange}>
              <option value="">Select type</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>File Reference</label>
            <input
              type="text"
              name="file_reference"
              value={form.file_reference}
              onChange={handleChange}
              placeholder="File path or reference number"
            />
          </div>

          <div className="form-group">
            <label>Upload Date</label>
            <input
              type="date"
              name="uploaded_date"
              value={form.uploaded_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Document description..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Document' : 'Create Document'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default DocumentVaultPage;
