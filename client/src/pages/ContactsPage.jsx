import React, { useState, useEffect } from 'react'
import { contacts } from '../api'
import Modal from '../components/Modal'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  relationship: 'Other',
  address: '',
  city: '',
  state: '',
  zip: '',
  notes: '',
}

const relationshipOptions = [
  'Family',
  'Friend',
  'Colleague',
  'Clergy',
  'Funeral Home',
  'Attorney',
  'Other',
]

export default function ContactsPage({ showToast }) {
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
      const data = await contacts.getAll()
      setItems(data)
    } catch (err) {
      showToast(err.message || 'Failed to load contacts', 'error')
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
      name: selected.name || '',
      email: selected.email || '',
      phone: selected.phone || '',
      relationship: selected.relationship || 'Other',
      address: selected.address || '',
      city: selected.city || '',
      state: selected.state || '',
      zip: selected.zip || '',
      notes: selected.notes || '',
    })
    setEditing(true)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Name is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await contacts.update(selected.id, form)
        setSelected(updated)
        showToast('Contact updated successfully', 'success')
      } else {
        await contacts.create(form)
        showToast('Contact created successfully', 'success')
      }
      setShowModal(false)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to save contact', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${selected.name}"?`)) return
    try {
      await contacts.delete(selected.id)
      showToast('Contact deleted', 'success')
      setView('list')
      setSelected(null)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to delete contact', 'error')
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
          <h1>Contact Management</h1>
          <button className="btn-primary" onClick={openCreate}>
            + New Contact
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading contacts...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No contacts yet</h3>
            <p>Add your first contact to get started.</p>
            <button className="btn-primary" onClick={openCreate}>
              + New Contact
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Relationship</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
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
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.name}</td>
                    <td>{item.relationship || '--'}</td>
                    <td>{item.email || '--'}</td>
                    <td>{item.phone || '--'}</td>
                    <td>{item.city || '--'}</td>
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
            &larr; Back to Contacts
          </span>
          <div className="detail-actions">
            <button className="btn-primary btn-sm" onClick={openEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="detail-content">
          <h1 style={{ marginBottom: 8, color: '#2c3e50' }}>{selected.name}</h1>

          <div className="detail-field">
            <label>Relationship</label>
            <p>{selected.relationship || 'Not specified'}</p>
          </div>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div className="detail-field">
              <label>Email</label>
              <p>{selected.email || 'Not specified'}</p>
            </div>

            <div className="detail-field">
              <label>Phone</label>
              <p>{selected.phone || 'Not specified'}</p>
            </div>
          </div>

          <div className="detail-field">
            <label>Address</label>
            <p>{selected.address || 'Not specified'}</p>
          </div>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div className="detail-field">
              <label>City</label>
              <p>{selected.city || 'Not specified'}</p>
            </div>

            <div className="detail-field">
              <label>State</label>
              <p>{selected.state || 'Not specified'}</p>
            </div>

            <div className="detail-field">
              <label>ZIP</label>
              <p>{selected.zip || 'Not specified'}</p>
            </div>
          </div>

          <div className="detail-field">
            <label>Notes</label>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selected.notes || 'No notes.'}
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
        title={editing ? 'Edit Contact' : 'New Contact'}
        onClose={() => setShowModal(false)}
      >
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => updateField('name', e.target.value)}
            placeholder="Full name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="text"
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
            placeholder="Email address"
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={e => updateField('phone', e.target.value)}
            placeholder="Phone number"
          />
        </div>

        <div className="form-group">
          <label>Relationship</label>
          <select
            value={form.relationship}
            onChange={e => updateField('relationship', e.target.value)}
          >
            {relationshipOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={e => updateField('address', e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label>City</label>
            <input
              type="text"
              value={form.city}
              onChange={e => updateField('city', e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>State</label>
            <input
              type="text"
              value={form.state}
              onChange={e => updateField('state', e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>ZIP</label>
            <input
              type="text"
              value={form.zip}
              onChange={e => updateField('zip', e.target.value)}
              placeholder="ZIP code"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => updateField('notes', e.target.value)}
            placeholder="Additional notes..."
          />
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Contact' : 'Create Contact'}
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
