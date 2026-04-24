import React, { useState, useEffect } from 'react'
import { timelineEvents } from '../api'
import Modal from '../components/Modal'

const emptyForm = {
  deceased_name: '',
  title: '',
  event_date: '',
  description: '',
  event_type: 'Other',
  location: '',
}

const eventTypeOptions = [
  'Birth',
  'Education',
  'Career',
  'Marriage',
  'Achievement',
  'Travel',
  'Milestone',
  'Other',
]

const eventTypeColors = {
  Birth: '#27ae60',
  Education: '#2980b9',
  Career: '#8e44ad',
  Marriage: '#e74c3c',
  Achievement: '#f39c12',
  Travel: '#1abc9c',
  Milestone: '#e67e22',
  Other: '#95a5a6',
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

export default function TimelineEventsPage({ showToast }) {
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
      const data = await timelineEvents.getAll()
      setItems(data)
    } catch (err) {
      showToast(err.message || 'Failed to load timeline events', 'error')
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
      title: selected.title || '',
      event_date: selected.event_date ? selected.event_date.slice(0, 10) : '',
      description: selected.description || '',
      event_type: selected.event_type || 'Other',
      location: selected.location || '',
    })
    setEditing(true)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.deceased_name.trim()) {
      showToast('Deceased name is required', 'error')
      return
    }
    if (!form.title.trim()) {
      showToast('Title is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await timelineEvents.update(selected.id, form)
        setSelected(updated)
        showToast('Timeline event updated successfully', 'success')
      } else {
        await timelineEvents.create(form)
        showToast('Timeline event created successfully', 'success')
      }
      setShowModal(false)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to save timeline event', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${selected.title}"?`)) return
    try {
      await timelineEvents.delete(selected.id)
      showToast('Timeline event deleted', 'success')
      setView('list')
      setSelected(null)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to delete timeline event', 'error')
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

  const sortedItems = [...items].sort((a, b) => {
    if (!a.event_date) return 1
    if (!b.event_date) return -1
    return new Date(a.event_date) - new Date(b.event_date)
  })

  // ---------- List View ----------
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Memorial Timeline</h1>
          <button className="btn-primary" onClick={openCreate}>
            + New Event
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading timeline events...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No timeline events yet</h3>
            <p>Add the first event to build a memorial timeline.</p>
            <button className="btn-primary" onClick={openCreate}>
              + New Event
            </button>
          </div>
        ) : (
          <>
            {/* Visual Timeline */}
            <div style={{ marginBottom: 32, padding: '0 16px' }}>
              <h3 style={{ color: '#2c3e50', marginBottom: 16 }}>Timeline</h3>
              <div style={{ position: 'relative', paddingLeft: 32 }}>
                <div style={{
                  position: 'absolute',
                  left: 11,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: '#ddd',
                  borderRadius: 2,
                }} />
                {sortedItems.map(item => {
                  const color = eventTypeColors[item.event_type] || eventTypeColors.Other
                  return (
                    <div
                      key={item.id}
                      onClick={() => openDetail(item)}
                      style={{
                        position: 'relative',
                        marginBottom: 20,
                        cursor: 'pointer',
                        paddingLeft: 16,
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        left: -26,
                        top: 4,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: color,
                        border: '3px solid #fff',
                        boxShadow: '0 0 0 2px ' + color,
                      }} />
                      <div style={{ fontWeight: 600, color: '#2c3e50' }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: '#7f8c8d' }}>
                        {formatDateShort(item.event_date) || 'No date'}
                        {item.event_type ? ` - ${item.event_type}` : ''}
                        {item.location ? ` - ${item.location}` : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Deceased</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map(item => (
                    <tr
                      key={item.id}
                      className="clickable-row"
                      onClick={() => openDetail(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.title}</td>
                      <td>{item.deceased_name || '--'}</td>
                      <td>{formatDateShort(item.event_date) || '--'}</td>
                      <td>{item.event_type || '--'}</td>
                      <td>{item.location || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            &larr; Back to Memorial Timeline
          </span>
          <div className="detail-actions">
            <button className="btn-primary btn-sm" onClick={openEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="detail-content">
          <h1 style={{ marginBottom: 8, color: '#2c3e50' }}>{selected.title}</h1>

          <div className="detail-field">
            <label>Deceased Name</label>
            <p>{selected.deceased_name || 'Not specified'}</p>
          </div>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div className="detail-field">
              <label>Event Date</label>
              <p>{formatDate(selected.event_date) || 'No date'}</p>
            </div>

            <div className="detail-field">
              <label>Event Type</label>
              <p>{selected.event_type || 'Not specified'}</p>
            </div>
          </div>

          <div className="detail-field">
            <label>Location</label>
            <p>{selected.location || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Description</label>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selected.description || 'No description provided.'}
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
        title={editing ? 'Edit Timeline Event' : 'New Timeline Event'}
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
          <label>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="e.g., Graduated from University"
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Event Date</label>
            <input
              type="date"
              value={form.event_date}
              onChange={e => updateField('event_date', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Event Type</label>
            <select
              value={form.event_type}
              onChange={e => updateField('event_type', e.target.value)}
            >
              {eventTypeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={e => updateField('location', e.target.value)}
            placeholder="Event location"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            placeholder="Describe this life event..."
          />
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
