import React, { useState, useEffect } from 'react'
import { memorialPages, ai } from '../api'
import Modal from '../components/Modal'
import AIOutput from '../components/AIOutput'
import Pagination from '../components/Pagination';

const emptyForm = {
  deceased_name: '',
  birth_date: '',
  death_date: '',
  biography: '',
  photo_url: '',
  theme: 'classic',
  is_public: false,
  status: 'draft',
}

const themeOptions = ['classic', 'elegant', 'modern', 'garden']

const themeBadgeClass = {
  classic: 'badge badge-primary',
  elegant: 'badge badge-success',
  modern: 'badge badge-info',
  garden: 'badge badge-warning',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function truncate(text, max = 100) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}

export default function MemorialPagesPage({ showToast }) {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [aiContent, setAiContent] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDetails, setAiDetails] = useState('')

  const fetchItems = async (page = 1) => {
    setLoading(true)
    try {
      const data = await memorialPages.getAll(page, 20)
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination)
    } catch (err) {
      showToast(err.message || 'Failed to load memorial pages', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems(1)
  }, [])

  const openCreate = () => {
    setForm({ ...emptyForm })
    setEditing(false)
    setAiContent('')
    setAiDetails('')
    setShowModal(true)
  }

  const openEdit = () => {
    setForm({
      deceased_name: selected.deceased_name || '',
      birth_date: selected.birth_date ? selected.birth_date.slice(0, 10) : '',
      death_date: selected.death_date ? selected.death_date.slice(0, 10) : '',
      biography: selected.biography || '',
      photo_url: selected.photo_url || '',
      theme: selected.theme || 'classic',
      is_public: selected.is_public || false,
      status: selected.status || 'draft',
    })
    setEditing(true)
    setAiContent('')
    setAiDetails('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.deceased_name.trim()) {
      showToast('Deceased name is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await memorialPages.update(selected.id, form)
        setSelected(updated)
        showToast('Memorial page updated successfully', 'success')
      } else {
        await memorialPages.create(form)
        showToast('Memorial page created successfully', 'success')
      }
      setShowModal(false)
      fetchItems(1)
    } catch (err) {
      showToast(err.message || 'Failed to save memorial page', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the memorial page for ${selected.deceased_name}?`)) return
    try {
      await memorialPages.delete(selected.id)
      showToast('Memorial page deleted', 'success')
      setView('list')
      setSelected(null)
      fetchItems(1)
    } catch (err) {
      showToast(err.message || 'Failed to delete memorial page', 'error')
    }
  }

  const handleGenerateBio = async () => {
    if (!form.deceased_name.trim()) {
      showToast('Please enter the deceased name first', 'error')
      return
    }
    setAiLoading(true)
    setAiContent('')
    try {
      const result = await ai.generateMemorialBio({
        deceased_name: form.deceased_name,
        birth_date: form.birth_date,
        death_date: form.death_date,
        details: aiDetails,
      })
      const content = result.content || result.text || result.biography || ''
      setAiContent(content)
      setForm(prev => ({ ...prev, biography: content }))
    } catch (err) {
      showToast(err.message || 'AI generation failed', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setView('detail')
  }

  const backToList = () => {
    setView('list')
    setSelected(null)
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ---------- List View ----------
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Memorial Pages</h1>
          <button className="btn-primary" onClick={openCreate}>
            + Create Memorial Page
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading memorial pages...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No memorial pages yet</h3>
            <p>Create your first memorial page to honor a loved one.</p>
            <button className="btn-primary" onClick={openCreate}>
              + Create Memorial Page
            </button>
          </div>
        ) : (
          <>
          <div className="grid-3">
            {items.map(item => (
              <div
                key={item.id}
                className="card clickable-row"
                onClick={() => openDetail(item)}
                style={{ cursor: 'pointer' }}
              >
                {item.photo_url && (
                  <div style={{ marginBottom: 12 }}>
                    <img
                      src={item.photo_url}
                      alt={item.deceased_name}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </div>
                )}
                <h3 style={{ marginBottom: 8, color: '#2c3e50' }}>{item.deceased_name}</h3>
                <p style={{ fontSize: 13, color: '#7f8c8d', marginBottom: 8 }}>
                  {formatDate(item.birth_date)} &mdash; {formatDate(item.death_date)}
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className={themeBadgeClass[item.theme] || 'badge badge-primary'}>
                    {item.theme}
                  </span>
                  {item.is_public && (
                    <span className="badge badge-success">Public</span>
                  )}
                  {item.status && (
                    <span className={item.status === 'published' ? 'badge badge-success' : 'badge badge-draft'}>
                      {item.status}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#7f8c8d', lineHeight: 1.5 }}>
                  {truncate(item.biography, 120)}
                </p>
              </div>
            ))}
          </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => fetchItems(p)}
            />
          </>
        )}

        {showModal && renderModal()}
      </div>
    )
  }

  // ---------- Detail View ----------
  if (view === 'detail' && selected) {
    return (
      <div className="detail-view">
        <div className="detail-header">
          <span className="back-link" onClick={backToList} style={{ cursor: 'pointer' }}>
            &larr; Back to Memorial Pages
          </span>
          <div className="detail-actions">
            <button className="btn-primary btn-sm" onClick={openEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="detail-content">
          {selected.photo_url && (
            <div style={{ marginBottom: 20 }}>
              <img
                src={selected.photo_url}
                alt={selected.deceased_name}
                style={{ maxWidth: 300, borderRadius: 12 }}
              />
            </div>
          )}

          <h1 style={{ marginBottom: 8, color: '#2c3e50' }}>{selected.deceased_name}</h1>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className={themeBadgeClass[selected.theme] || 'badge badge-primary'}>
              {selected.theme}
            </span>
            {selected.is_public && (
              <span className="badge badge-success">Public</span>
            )}
            {selected.status && (
              <span className={selected.status === 'published' ? 'badge badge-success' : 'badge badge-draft'}>
                {selected.status}
              </span>
            )}
          </div>

          <div className="detail-field">
            <label>Born</label>
            <p>{formatDate(selected.birth_date) || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Passed</label>
            <p>{formatDate(selected.death_date) || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Biography</label>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selected.biography || 'No biography provided.'}
            </div>
          </div>

          {selected.photo_url && (
            <div className="detail-field">
              <label>Photo URL</label>
              <p>{selected.photo_url}</p>
            </div>
          )}
        </div>

        {showModal && renderModal()}
      </div>
    )
  }

  // ---------- Modal ----------
  function renderModal() {
    return (
      <Modal
        title={editing ? 'Edit Memorial Page' : 'Create Memorial Page'}
        onClose={() => setShowModal(false)}
      >
        <div className="form-group">
          <label>Deceased Name *</label>
          <input
            type="text"
            value={form.deceased_name}
            onChange={e => updateField('deceased_name', e.target.value)}
            placeholder="Full name of the deceased"
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Date of Birth</label>
            <input
              type="date"
              value={form.birth_date}
              onChange={e => updateField('birth_date', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Date of Passing</label>
            <input
              type="date"
              value={form.death_date}
              onChange={e => updateField('death_date', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Photo URL</label>
          <input
            type="text"
            value={form.photo_url}
            onChange={e => updateField('photo_url', e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Theme</label>
            <select
              value={form.theme}
              onChange={e => updateField('theme', e.target.value)}
            >
              {themeOptions.map(t => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Status</label>
            <select
              value={form.status}
              onChange={e => updateField('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={e => updateField('is_public', e.target.checked)}
            />
            Make this memorial page public
          </label>
        </div>

        <div className="form-group">
          <label>Biography</label>
          <textarea
            rows={6}
            value={form.biography}
            onChange={e => updateField('biography', e.target.value)}
            placeholder="Write a biography or use AI to generate one..."
          />
        </div>

        <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <h4 style={{ marginBottom: 10, color: '#2c3e50' }}>AI Biography Generator</h4>
          <div className="form-group">
            <label>Additional Details for AI</label>
            <textarea
              rows={3}
              value={aiDetails}
              onChange={e => setAiDetails(e.target.value)}
              placeholder="Hobbies, career, family details, personality traits, accomplishments..."
            />
          </div>
          <button
            className="btn-accent btn-sm"
            onClick={handleGenerateBio}
            disabled={aiLoading}
          >
            {aiLoading ? 'Generating...' : 'Generate Bio with AI'}
          </button>
          <AIOutput content={aiContent} loading={aiLoading} />
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Memorial Page' : 'Create Memorial Page'}
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
