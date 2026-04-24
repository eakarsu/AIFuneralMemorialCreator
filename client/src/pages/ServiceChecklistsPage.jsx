import React, { useState, useEffect } from 'react'
import { serviceChecklists } from '../api'
import Modal from '../components/Modal'

const emptyForm = {
  deceased_name: '',
  task_name: '',
  category: 'Other',
  is_completed: false,
  due_date: '',
  assigned_to: '',
  notes: '',
}

const categoryOptions = [
  'Before Service',
  'Day of Service',
  'After Service',
  'Legal',
  'Financial',
  'Notifications',
  'Other',
]

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

export default function ServiceChecklistsPage({ showToast }) {
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
      const data = await serviceChecklists.getAll()
      setItems(data)
    } catch (err) {
      showToast(err.message || 'Failed to load checklists', 'error')
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
      task_name: selected.task_name || '',
      category: selected.category || 'Other',
      is_completed: selected.is_completed || false,
      due_date: selected.due_date ? selected.due_date.slice(0, 10) : '',
      assigned_to: selected.assigned_to || '',
      notes: selected.notes || '',
    })
    setEditing(true)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.deceased_name.trim()) {
      showToast('Deceased name is required', 'error')
      return
    }
    if (!form.task_name.trim()) {
      showToast('Task name is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await serviceChecklists.update(selected.id, form)
        setSelected(updated)
        showToast('Task updated successfully', 'success')
      } else {
        await serviceChecklists.create(form)
        showToast('Task created successfully', 'success')
      }
      setShowModal(false)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${selected.task_name}"?`)) return
    try {
      await serviceChecklists.delete(selected.id)
      showToast('Task deleted', 'success')
      setView('list')
      setSelected(null)
      fetchItems()
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error')
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

  const completedCount = items.filter(i => i.is_completed).length
  const totalCount = items.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // ---------- List View ----------
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Service Checklists</h1>
          <button className="btn-primary" onClick={openCreate}>
            + New Task
          </button>
        </div>

        {!loading && totalCount > 0 && (
          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: '#2c3e50' }}>
                {completedCount} of {totalCount} tasks completed
              </span>
              <span style={{ fontWeight: 600, color: '#2c3e50' }}>{progressPct}%</span>
            </div>
            <div style={{ background: '#e0e0e0', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div
                style={{
                  background: progressPct === 100 ? '#27ae60' : '#3498db',
                  height: '100%',
                  width: `${progressPct}%`,
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading checklists...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Create your first checklist task to stay organized.</p>
            <button className="btn-primary" onClick={openCreate}>
              + New Task
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Deceased</th>
                  <th>Category</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Status</th>
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
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.task_name}</td>
                    <td>{item.deceased_name || '--'}</td>
                    <td>{item.category || '--'}</td>
                    <td>{item.assigned_to || '--'}</td>
                    <td>{formatDateShort(item.due_date) || '--'}</td>
                    <td>
                      {item.is_completed
                        ? <span className="badge badge-success">Completed</span>
                        : <span className="badge badge-warning">Pending</span>
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
            &larr; Back to Service Checklists
          </span>
          <div className="detail-actions">
            <button className="btn-primary btn-sm" onClick={openEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="detail-content">
          <h1 style={{ marginBottom: 8, color: '#2c3e50' }}>{selected.task_name}</h1>

          <div style={{ marginBottom: 20 }}>
            {selected.is_completed
              ? <span className="badge badge-success">Completed</span>
              : <span className="badge badge-warning">Pending</span>
            }
          </div>

          <div className="detail-field">
            <label>Deceased Name</label>
            <p>{selected.deceased_name || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Category</label>
            <p>{selected.category || 'Not specified'}</p>
          </div>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div className="detail-field">
              <label>Due Date</label>
              <p>{formatDate(selected.due_date) || 'No due date'}</p>
            </div>

            <div className="detail-field">
              <label>Assigned To</label>
              <p>{selected.assigned_to || 'Unassigned'}</p>
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
        title={editing ? 'Edit Task' : 'New Task'}
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
          <label>Task Name *</label>
          <input
            type="text"
            value={form.task_name}
            onChange={e => updateField('task_name', e.target.value)}
            placeholder="e.g., Book venue for service"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={form.category}
            onChange={e => updateField('category', e.target.value)}
          >
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.is_completed}
              onChange={e => updateField('is_completed', e.target.checked)}
            />
            Completed
          </label>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={e => updateField('due_date', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Assigned To</label>
            <input
              type="text"
              value={form.assigned_to}
              onChange={e => updateField('assigned_to', e.target.value)}
              placeholder="Name of responsible person"
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
            {saving ? 'Saving...' : editing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
