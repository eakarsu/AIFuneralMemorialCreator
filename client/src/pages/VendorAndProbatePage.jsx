import React, { useEffect, useState } from 'react'

/**
 * Apply pass 5 frontend: Vendor Directory + Probate Timeline.
 * Matches existing styling (page-header, card, btn-primary, form-input).
 * Auth via localStorage token, mirroring AILegacyToolsPage.jsx.
 */

const API = '/api'
function getHeaders() {
  const token = localStorage.getItem('token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}
async function http(method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers: getHeaders(), body: body ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

const TABS = [
  { id: 'vendors', label: 'Vendor Directory' },
  { id: 'probate', label: 'Probate Timeline' },
]

const CATEGORIES = ['florist','caterer','musician','celebrant','photographer','videographer','transportation','casket_supplier','urn_supplier','monument','reception_venue','cleaner','other']

export default function VendorAndProbatePage({ showToast }) {
  const [tab, setTab] = useState('vendors')
  return (
    <div>
      <div className="page-header">
        <h1>Vendors & Probate</h1>
        <p>Track service providers and generate a state-aware probate timeline.</p>
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'btn-primary' : 'btn'} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        {tab === 'vendors' ? <VendorTab showToast={showToast} /> : <ProbateTab showToast={showToast} />}
      </div>
    </div>
  )
}

function VendorTab({ showToast }) {
  const [vendors, setVendors] = useState([])
  const [form, setForm] = useState({ name: '', category: 'florist', phone: '', email: '', notes: '', is_preferred: false })
  const [loading, setLoading] = useState(false)
  const load = async () => {
    try { setVendors(await http('GET', '/vendor-directory')) } catch (err) { showToast?.(err.message, 'error') }
  }
  useEffect(() => { load() }, [])
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await http('POST', '/vendor-directory', form)
      setForm({ name: '', category: 'florist', phone: '', email: '', notes: '', is_preferred: false })
      load()
      showToast?.('Vendor added', 'success')
    } catch (err) { showToast?.(err.message, 'error') } finally { setLoading(false) }
  }
  const remove = async (id) => {
    try { await http('DELETE', `/vendor-directory/${id}`); load() } catch (err) { showToast?.(err.message, 'error') }
  }
  return (
    <>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <input className="form-input" placeholder="Vendor name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required />
        <select className="form-input" value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="form-input" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
        <input className="form-input" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
        <textarea className="form-input" placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} style={{ gridColumn: '1 / -1' }} />
        <label style={{ gridColumn: '1 / -1' }}>
          <input type="checkbox" checked={form.is_preferred} onChange={(e)=>setForm({...form, is_preferred: e.target.checked})} /> Preferred
        </label>
        <button type="submit" className="btn-primary" disabled={loading} style={{ gridColumn: '1 / -1' }}>{loading ? 'Saving…' : 'Add vendor'}</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {vendors.map((v) => (
          <li key={v.id} className="card" style={{ marginBottom: 8 }}>
            <strong>{v.name}</strong> · {v.category}{v.is_preferred ? ' · ★' : ''}
            {v.phone && <> · {v.phone}</>}{v.email && <> · {v.email}</>}
            {v.notes && <div style={{ opacity: 0.8 }}>{v.notes}</div>}
            <button className="btn" onClick={() => remove(v.id)} style={{ marginTop: 8 }}>Remove</button>
          </li>
        ))}
        {vendors.length === 0 && <li style={{ opacity: 0.7 }}>No vendors yet. Add a florist, caterer, or musician above.</li>}
      </ul>
    </>
  )
}

function ProbateTab({ showToast }) {
  const [form, setForm] = useState({ deceased_name: '', death_date: '', state: '', has_will: true, executor_name: '', estate_size_estimate: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setResult(null)
    try {
      const body = { ...form, estate_size_estimate: form.estate_size_estimate ? Number(form.estate_size_estimate) : undefined }
      setResult(await http('POST', '/probate/checklist', body))
    } catch (err) { showToast?.(err.message, 'error') } finally { setLoading(false) }
  }
  return (
    <>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <input className="form-input" placeholder="Deceased name" value={form.deceased_name} onChange={(e)=>setForm({...form, deceased_name: e.target.value})} />
        <input className="form-input" placeholder="State (e.g., CA)" value={form.state} onChange={(e)=>setForm({...form, state: e.target.value})} />
        <input className="form-input" type="date" value={form.death_date} onChange={(e)=>setForm({...form, death_date: e.target.value})} required />
        <input className="form-input" placeholder="Executor name" value={form.executor_name} onChange={(e)=>setForm({...form, executor_name: e.target.value})} />
        <label><input type="checkbox" checked={form.has_will} onChange={(e)=>setForm({...form, has_will: e.target.checked})} /> Has will</label>
        <input className="form-input" placeholder="Estate size (USD, optional)" type="number" value={form.estate_size_estimate} onChange={(e)=>setForm({...form, estate_size_estimate: e.target.value})} />
        <button type="submit" className="btn-primary" disabled={loading} style={{ gridColumn: '1 / -1' }}>{loading ? 'Generating…' : 'Generate timeline'}</button>
      </form>
      {result && (
        <div>
          <p style={{ opacity: 0.85 }}>{result.disclaimer}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th align="left">Day</th><th align="left">Date</th><th align="left">Category</th><th align="left">Task</th></tr></thead>
            <tbody>
              {result.timeline.map((it, i) => (
                <tr key={i}><td>{it.day_offset}</td><td>{it.target_date}</td><td>{it.category}</td><td>{it.task}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
