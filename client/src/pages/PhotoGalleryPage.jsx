import React, { useState, useEffect } from 'react'
import { photoGallery } from '../api'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination';

const emptyForm = {
  deceased_name: '',
  album_name: '',
  photo_url: '',
  caption: '',
  upload_date: '',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PhotoGalleryPage({ showToast }) {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const fetchItems = async (page = 1) => {
    setLoading(true)
    try {
      const data = await photoGallery.getAll(page, 20)
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination)
    } catch (err) {
      showToast(err.message || 'Failed to load photos', 'error')
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
    setShowModal(true)
  }

  const openEdit = () => {
    setForm({
      deceased_name: selected.deceased_name || '',
      album_name: selected.album_name || '',
      photo_url: selected.photo_url || '',
      caption: selected.caption || '',
      upload_date: selected.upload_date ? selected.upload_date.slice(0, 10) : '',
    })
    setEditing(true)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await photoGallery.update(selected.id, form)
        setSelected(updated)
        showToast('Photo updated successfully', 'success')
      } else {
        await photoGallery.create(form)
        showToast('Photo added successfully', 'success')
      }
      setShowModal(false)
      fetchItems(1)
    } catch (err) {
      showToast(err.message || 'Failed to save photo', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this photo?`)) return
    try {
      await photoGallery.delete(selected.id)
      showToast('Photo deleted', 'success')
      setView('list')
      setSelected(null)
      fetchItems(1)
    } catch (err) {
      showToast(err.message || 'Failed to delete photo', 'error')
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
          <h1>Photo Gallery</h1>
          <button className="btn-primary" onClick={openCreate}>
            + New Photo
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading photos...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No photos yet</h3>
            <p>Add your first photo to the gallery.</p>
            <button className="btn-primary" onClick={openCreate}>
              + New Photo
            </button>
          </div>
        ) : (
          <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Caption</th>
                  <th>Deceased</th>
                  <th>Album</th>
                  <th>Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id}
                    className="clickable-row"
                    onClick={() => openDetail(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.caption || '--'}</td>
                    <td>{item.deceased_name || '--'}</td>
                    <td>{item.album_name || '--'}</td>
                    <td>{formatDateShort(item.upload_date) || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            &larr; Back to Photo Gallery
          </span>
          <div className="detail-actions">
            <button className="btn-primary btn-sm" onClick={openEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="detail-content">
          <h1 style={{ marginBottom: 8, color: '#2c3e50' }}>{selected.caption || 'Untitled Photo'}</h1>

          {selected.photo_url && (
            <div style={{ marginBottom: 20 }}>
              <img
                src={selected.photo_url}
                alt={selected.caption || 'Photo'}
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, objectFit: 'contain' }}
              />
            </div>
          )}

          <div className="detail-field">
            <label>Deceased Name</label>
            <p>{selected.deceased_name || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Album</label>
            <p>{selected.album_name || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Photo URL</label>
            <p>{selected.photo_url || 'No URL'}</p>
          </div>

          <div className="detail-field">
            <label>Caption</label>
            <p>{selected.caption || 'No caption'}</p>
          </div>

          <div className="detail-field">
            <label>Upload Date</label>
            <p>{formatDate(selected.upload_date) || 'No date'}</p>
          </div>
        </div>

        {showModal && renderModal()}
      </div>
    )
  }

  // ---------- Modal ----------
  function renderModal() {
    return (
      <Modal
        title={editing ? 'Edit Photo' : 'New Photo'}
        onClose={() => setShowModal(false)}
      >
        <div className="form-group">
          <label>Deceased Name</label>
          <input
            type="text"
            value={form.deceased_name}
            onChange={e => updateField('deceased_name', e.target.value)}
            placeholder="Full name of the deceased"
          />
        </div>

        <div className="form-group">
          <label>Album Name</label>
          <input
            type="text"
            value={form.album_name}
            onChange={e => updateField('album_name', e.target.value)}
            placeholder="Album name"
          />
        </div>

        <div className="form-group">
          <label>Photo URL</label>
          <input
            type="text"
            value={form.photo_url}
            onChange={e => updateField('photo_url', e.target.value)}
            placeholder="Image URL"
          />
        </div>

        <div className="form-group">
          <label>Caption</label>
          <textarea
            rows={3}
            value={form.caption}
            onChange={e => updateField('caption', e.target.value)}
            placeholder="Photo caption..."
          />
        </div>

        <div className="form-group">
          <label>Upload Date</label>
          <input
            type="date"
            value={form.upload_date}
            onChange={e => updateField('upload_date', e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Photo' : 'Add Photo'}
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
