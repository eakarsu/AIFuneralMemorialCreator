import React, { useState, useEffect } from 'react'
import { estateItems, ai } from '../api'
import Modal from '../components/Modal'
import AIOutput from '../components/AIOutput'
import Pagination from '../components/Pagination';

const emptyForm = {
  deceased_name: '',
  item_type: '',
  title: '',
  description: '',
  status: 'pending',
  due_date: '',
  assigned_to: '',
  priority: 'medium',
  notes: '',
}

const priorityBadge = {
  low: { className: 'badge badge-success', label: 'Low' },
  medium: { className: 'badge badge-warning', label: 'Medium' },
  high: { className: 'badge badge-danger', label: 'High' },
}

const statusBadge = {
  pending: { className: 'badge badge-warning', label: 'Pending' },
  in_progress: { className: 'badge badge-info', label: 'In Progress' },
  completed: { className: 'badge badge-success', label: 'Completed' },
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

export default function EstateItemsPage({ showToast }) {
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
      const data = await estateItems.getAll(page, 20)
      setItems(data.data || data);
      if (data.pagination) setPagination(data.pagination)
    } catch (err) {
      showToast(err.message || 'Failed to load estate items', 'error')
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
      item_type: selected.item_type || '',
      title: selected.title || '',
      description: selected.description || '',
      status: selected.status || 'pending',
      due_date: selected.due_date ? selected.due_date.slice(0, 10) : '',
      assigned_to: selected.assigned_to || '',
      priority: selected.priority || 'medium',
      notes: selected.notes || '',
    })
    setEditing(true)
    setAiContent('')
    setAiDetails('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast('Title is required', 'error')
      return
    }
    if (!form.deceased_name.trim()) {
      showToast('Deceased name is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing && selected) {
        const updated = await estateItems.update(selected.id, form)
        setSelected(updated)
        showToast('Estate item updated successfully', 'success')
      } else {
        await estateItems.create(form)
        showToast('Estate item created successfully', 'success')
      }
      setShowModal(false)
      fetchItems(1)
    } catch (err) {
      showToast(err.message || 'Failed to save estate item', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${selected.title}"?`)) return
    try {
      await estateItems.delete(selected.id)
      showToast('Estate item deleted', 'success')
      setView('list')
      setSelected(null)
      fetchItems(1)
    } catch (err) {
      showToast(err.message || 'Failed to delete estate item', 'error')
    }
  }

  const handleGenerateChecklist = async () => {
    if (!form.deceased_name.trim()) {
      showToast('Please enter the deceased name first', 'error')
      return
    }
    setAiLoading(true)
    setAiContent('')
    try {
      const result = await ai.generateEstateChecklist({
        deceased_name: form.deceased_name,
        details: aiDetails,
      })
      const content = result.content || result.text || result.checklist || ''
      setAiContent(content)
      setForm(prev => ({
        ...prev,
        description: prev.description
          ? prev.description + '\n\n' + content
          : content,
        notes: prev.notes
          ? prev.notes + '\n\n' + content
          : content,
      }))
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

  const getPriorityBadge = (priority) => {
    const badge = priorityBadge[priority] || priorityBadge.medium
    return <span className={badge.className}>{badge.label}</span>
  }

  const getStatusBadge = (status) => {
    const badge = statusBadge[status] || statusBadge.pending
    return <span className={badge.className}>{badge.label}</span>
  }

  // ---------- List View ----------
  if (view === 'list') {
    return (
      <div>
        <div className="page-header">
          <h1>Estate Coordination</h1>
          <button className="btn-primary" onClick={openCreate}>
            + New Estate Item
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading estate items...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No estate items yet</h3>
            <p>Create your first estate coordination item to get organized.</p>
            <button className="btn-primary" onClick={openCreate}>
              + New Estate Item
            </button>
          </div>
        ) : (
          <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Deceased</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
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
                    <td style={{ fontWeight: 600, color: '#2c3e50' }}>{item.title}</td>
                    <td>{item.deceased_name}</td>
                    <td>{item.item_type || '--'}</td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{formatDateShort(item.due_date) || '--'}</td>
                    <td>{item.assigned_to || '--'}</td>
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
            &larr; Back to Estate Items
          </span>
          <div className="detail-actions">
            <button className="btn-primary btn-sm" onClick={openEdit}>Edit</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="detail-content">
          <h1 style={{ marginBottom: 8, color: '#2c3e50' }}>{selected.title}</h1>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {getPriorityBadge(selected.priority)}
            {getStatusBadge(selected.status)}
          </div>

          <div className="detail-field">
            <label>Deceased Name</label>
            <p>{selected.deceased_name || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Item Type</label>
            <p>{selected.item_type || 'Not specified'}</p>
          </div>

          <div className="detail-field">
            <label>Description</label>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selected.description || 'No description provided.'}
            </div>
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
        title={editing ? 'Edit Estate Item' : 'New Estate Item'}
        onClose={() => setShowModal(false)}
      >
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="e.g., Contact insurance company"
          />
        </div>

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
            <label>Item Type</label>
            <input
              type="text"
              value={form.item_type}
              onChange={e => updateField('item_type', e.target.value)}
              placeholder="e.g., Legal, Financial, Property"
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

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={e => updateField('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Status</label>
            <select
              value={form.status}
              onChange={e => updateField('status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            value={form.due_date}
            onChange={e => updateField('due_date', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            placeholder="Describe the task or item..."
          />
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

        <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <h4 style={{ marginBottom: 10, color: '#2c3e50' }}>AI Checklist Generator</h4>
          <div className="form-group">
            <label>Additional Details for AI</label>
            <textarea
              rows={3}
              value={aiDetails}
              onChange={e => setAiDetails(e.target.value)}
              placeholder="Specific estate details, assets, special circumstances..."
            />
          </div>
          <button
            className="btn-accent btn-sm"
            onClick={handleGenerateChecklist}
            disabled={aiLoading}
          >
            {aiLoading ? 'Generating...' : 'Generate Checklist with AI'}
          </button>
          <AIOutput content={aiContent} loading={aiLoading} />
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Estate Item' : 'Create Estate Item'}
          </button>
        </div>
      </Modal>
    )
  }

  return null
}
