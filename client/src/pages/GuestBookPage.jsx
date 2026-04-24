import React, { useState, useEffect } from 'react'
import { guestBook } from '../api'
import Modal from '../components/Modal'

const emptyForm = {
  deceased_name: '',
  visitor_name: '',
  visitor_email: '',
  message: '',
  is_approved: false,
}

export default function GuestBookPage({ showToast }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const data = await guestBook.getAll()
      setItems(data)
    } catch (err) {
      showToast(err.message || 'Failed to load guest book entries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openCreate = () => {
    setForm({ ...emptyForm })
    setEditing(false)
    setShowModal(true)
  }

  const openEdit = () => {
    setForm({
      deceased_name: selected.deceased_name || '',
      visitor_name: selected.visitor_name || '',
      visitor_email: selected.visitor_email || '',
      message: selected.message || '',
      is_approved: selected.is_approved || false,
    })
    setEditing(true)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.deceased_name.trim()) {
      showToast('Deceased name is required', 'error')
      return
    }
    if (!form.visitor_name.trim()) {
      showToast('Visitor name is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await guestBook.update(selected.id, form)
        setSelected(updated)
        showToast('Guest book entry updated successfully', 'success')
      } else {
        await guestBook.create(form)
        showToast('Guest book entry created successfully', 'success')
      }
      setShowModal(false)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to save guest book entry', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this entry from ${selected.visitor_name}?`)) return
    try {
      await guestBook.delete(selected.id)
      showToast('Guest book entry deleted', 'success')
      setView('list')
      setSelected(null)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to delete guest book entry', 'error')
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
          <h1>Guest Book</h1>
          <button className="btn-primary" onClick={openCreate}>
            + New Entry
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading guest book entries...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No guest book entries yet</h3>
            <p>Add the first guest book entry.</p>
            <button className="btn-primary" onClick={openCreate}>
              + New Entry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Deceased</th>
                  <th>Email</th>
                  <th>Approved</th>
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
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.visitor_name}</td>
                    <td>{item.deceased_name || '--'}</td>
                    <td>{item.visitor_email || '--'}</td>
                    <td>
                      {item.is_approved
                        ? <span className="badge badge-success">Yes</span>
                        : <span className="badge badge-danger">No</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            &larr; Back to Guest Book
          </span>
          <div className="detail-actions">
            <button className="btn-primary btn-sm" onClick={openEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="detail-content">
          <h1 style={{ marginBottom: 8, color: '#2c3e50' }}>Entry from {selected.visitor_name}</h1>

          <div style={{ marginBottom: 20 }}>
            {selected.is_approved
              ? <span className="badge badge-success">Approved</span>
              : <span className="badge badge-danger">Not Approved</span>
            }
          </div>

          <div className="detail-field">
            <label>Deceased Name</label>
            <p>{selected.deceased_name || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Visitor Name</label>
            <p>{selected.visitor_name || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Visitor Email</label>
            <p>{selected.visitor_email || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Message</label>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selected.message || 'No message.'}
            </div>
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
        title={editing ? 'Edit Guest Book Entry' : 'New Guest Book Entry'}
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

        <div className="form-group">
          <label>Visitor Name *</label>
          <input
            type="text"
            value={form.visitor_name}
            onChange={e => updateField('visitor_name', e.target.value)}
            placeholder="Visitor's full name"
          />
        </div>

        <div className="form-group">
          <label>Visitor Email</label>
          <input
            type="text"
            value={form.visitor_email}
            onChange={e => updateField('visitor_email', e.target.value)}
            placeholder="Visitor's email address"
          />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={e => updateField('message', e.target.value)}
            placeholder="Guest book message..."
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.is_approved}
              onChange={e => updateField('is_approved', e.target.checked)}
            />
            Approved
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
