
import FullAIExamples, { useFullAIExamples } from "../components/FullAIExamples.jsx";
import NativeAIControls from "../components/NativeAIControls";
import useNativeAIRequest from "../components/useNativeAIRequest";
import FormattedAIReport from "../components/FormattedAIReport";
import React, { useState } from 'react'
import { ai as aiBase } from '../api'

/**
 * Frontend for the 3 new AI endpoints in server/routes/ai.js:
 *   POST /api/ai/legacy-interview-guide
 *   POST /api/ai/timeline-narrative
 *   POST /api/ai/donations-matching
 *
 * Mirrors styling of existing pages (btn-primary, page-header, card classes
 * commonly used through the app's index.css).
 */

// Re-use the same headers + handler pattern as src/api.js, since these
// endpoints aren't in the exported `ai` object yet.
const API = '/api'
function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
async function callAI(path, body, nativeRequestOptions = {}) {
  const res = await fetch(`${API}${path}`, { ...({
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body || {}),
  }), ...(nativeRequestOptions) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

const TABS = [
  { id: 'legacy-interview-guide', label: 'Legacy Interview Guide' },
  { id: 'timeline-narrative', label: 'Timeline Narrative' },
  { id: 'donations-matching', label: 'Donations Matching' },
]

function ResultDisplay({ result, error }) {
  if (error) {
    return (
      <div className="card" style={{ borderColor: '#c0392b', padding: 16, marginTop: 16 }}>
        <strong style={{ color: '#c0392b' }}>Error: </strong>
        <span>{error}</span>
      </div>
    )
  }
  if (!result) return null

  return (
    <div className="card" style={{ padding: 20, marginTop: 16 }}>
      <FormattedAIReport response={result.guide ?? result.narrative ?? result.recommendations ?? result.content ?? result.text ?? result.markdown ?? result} title="AI result" />
    </div>
  )
}

export default function AILegacyToolsPage({ showToast }) {
  const fullAIExamples = useFullAIExamples();

  const nativeAIRequest = useNativeAIRequest();

  const [tab, setTab] = useState('legacy-interview-guide')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Legacy interview guide
  const [legacyForm, setLegacyForm] = useState({
    subject_name: '',
    relationship: 'parent',
    interview_length_minutes: 60,
    sensitivity_notes: '',
  })

  // Timeline narrative
  const [eventsText, setEventsText] = useState(
    '1942-04-12: Born in Trenton, NJ\n1960: Graduated high school\n1962-1966: US Navy service\n1968: Married Eleanor\n1970, 1972, 1975: Children born',
  )

  // Donations matching
  const [donationsForm, setDonationsForm] = useState({
    values: '',
    causes: '',
    deceased_name: '',
    geographic_focus: '',
  })

  // Mention `aiBase` so eslint doesn't complain about unused import; we
  // intentionally use a local helper instead of adding new methods.
  void aiBase

  const submit = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      let body = {}
      let path = ''
      if (tab === 'legacy-interview-guide') {
        path = '/ai/legacy-interview-guide'
        body = {
          subject_name: legacyForm.subject_name,
          relationship: legacyForm.relationship,
          interview_length_minutes: Number(legacyForm.interview_length_minutes) || 60,
          sensitivity_notes: legacyForm.sensitivity_notes,
        }
      } else if (tab === 'timeline-narrative') {
        path = '/ai/timeline-narrative'
        body = {
          events: eventsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        }
      } else {
        path = '/ai/donations-matching'
        body = {
          values: donationsForm.values,
          causes: donationsForm.causes
            ? donationsForm.causes.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          deceased_name: donationsForm.deceased_name,
          geographic_focus: donationsForm.geographic_focus,
        }
      }
      const r = await nativeAIRequest.run((signal) => callAI(path, body, { signal }))
      setResult(r)
      showToast?.('AI response generated', 'success')
    } catch (e) {
      setError(e.message)
      showToast?.(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <NativeAIControls busy={nativeAIRequest.busy} onCancel={nativeAIRequest.cancel} context="Funeral Memorial Creator"><div data-full-ai-workspace="AILegacyToolsPage"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} /><div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', margin: 0 }}>AI Legacy Tools</h1>
        <p style={{ color: '#7f8c8d', marginTop: 4 }}>
          Interview guides, biographical narratives, and charitable donation suggestions in honor of a loved one.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'btn-primary' : 'btn-outline'}
            onClick={() => {
              setTab(t.id)
              setResult(null)
              setError('')
            }}
            style={{ padding: '8px 16px' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        {tab === 'legacy-interview-guide' && (
          <>
            <h2 style={{ fontFamily: 'Playfair Display, serif', marginTop: 0 }}>Legacy Interview Guide</h2>
            <p style={{ color: '#7f8c8d' }}>Generate a sensitive interview script for capturing a loved one's life story.</p>
            <div className="form-row" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
              <div>
                <label>Subject name</label>
                <input data-ai-field="subject_name" value={legacyForm.subject_name} onChange={(e) => setLegacyForm({ ...legacyForm, subject_name: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: legacyForm.subject_name, change: (e) => setLegacyForm({ ...legacyForm, subject_name: e.target.value }), label: "legacyForm.subject_name", manual: false, json: false, sample: '' }, "p1-6389", undefined)} />
              </div>
              <div>
                <label>Relationship</label>
                <select data-ai-field="relationship" value={legacyForm.relationship} onChange={(e) => setLegacyForm({ ...legacyForm, relationship: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: legacyForm.relationship, change: (e) => setLegacyForm({ ...legacyForm, relationship: e.target.value }), label: "legacyForm.relationship", manual: false, json: false, sample: 'parent' }, "p1-6642", undefined)}>
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="sibling">Sibling</option>
                  <option value="spouse">Spouse / Partner</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label>Interview length (minutes)</label>
                <input data-ai-field="interview_length_minutes" type="number" min="15" value={legacyForm.interview_length_minutes}
                  onChange={(e) => setLegacyForm({ ...legacyForm, interview_length_minutes: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: legacyForm.interview_length_minutes, change: (e) => setLegacyForm({ ...legacyForm, interview_length_minutes: e.target.value }), label: "legacyForm.interview_length_minutes", manual: false, json: false, sample: 60 }, "p1-7296", undefined)} />
              </div>
            </div>
            <div>
              <label>Sensitivity notes (optional)</label>
              <textarea data-ai-field="sensitivity_notes" rows={3}
                value={legacyForm.sensitivity_notes}
                placeholder="Topics to handle gently, recent losses, language preferences..."
                onChange={(e) => setLegacyForm({ ...legacyForm, sensitivity_notes: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: legacyForm.sensitivity_notes, change: (e) => setLegacyForm({ ...legacyForm, sensitivity_notes: e.target.value }), label: "legacyForm.sensitivity_notes", manual: false, json: false, sample: '' }, "p1-7655", undefined)}
              />
            </div>
          </>
        )}

        {tab === 'timeline-narrative' && (
          <>
            <h2 style={{ fontFamily: 'Playfair Display, serif', marginTop: 0 }}>Timeline Narrative</h2>
            <p style={{ color: '#7f8c8d' }}>One event per line — date or year first, then a short description.</p>
            <textarea data-ai-field="eventsText"
              rows={10}
              value={eventsText}
              onChange={(e) => setEventsText(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: 13 }} data-full-ai-field={fullAIExamples.bind({ current: eventsText, change: (e) => setEventsText(e.target.value), label: "eventsText", manual: false, json: false, sample: '1942-04-12: Born in Trenton, NJ\n1960: Graduated high school\n1962-1966: US Navy service\n1968: Married Eleanor\n1970, 1972, 1975: Children born' }, "p1-8306", undefined)}
            />
          </>
        )}

        {tab === 'donations-matching' && (
          <>
            <h2 style={{ fontFamily: 'Playfair Display, serif', marginTop: 0 }}>Donations Matching</h2>
            <p style={{ color: '#7f8c8d' }}>Suggest charitable causes that match a loved one's values.</p>
            <div className="form-row" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
              <div>
                <label>Deceased / honoree name</label>
                <input data-ai-field="deceased_name" value={donationsForm.deceased_name} onChange={(e) => setDonationsForm({ ...donationsForm, deceased_name: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: donationsForm.deceased_name, change: (e) => setDonationsForm({ ...donationsForm, deceased_name: e.target.value }), label: "donationsForm.deceased_name", manual: false, json: false, sample: '' }, "p1-9051", undefined)} />
              </div>
              <div>
                <label>Geographic focus (optional)</label>
                <input data-ai-field="geographic_focus" value={donationsForm.geographic_focus} onChange={(e) => setDonationsForm({ ...donationsForm, geographic_focus: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: donationsForm.geographic_focus, change: (e) => setDonationsForm({ ...donationsForm, geographic_focus: e.target.value }), label: "donationsForm.geographic_focus", manual: false, json: false, sample: '' }, "p1-9331", undefined)} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Values</label>
              <textarea data-ai-field="values" rows={3} value={donationsForm.values} placeholder="What did they care about? E.g., literacy, equal opportunity, animal welfare..."
                onChange={(e) => setDonationsForm({ ...donationsForm, values: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: donationsForm.values, change: (e) => setDonationsForm({ ...donationsForm, values: e.target.value }), label: "donationsForm.values", manual: false, json: false, sample: '' }, "p1-9641", undefined)} />
            </div>
            <div>
              <label>Causes (comma-separated)</label>
              <input data-ai-field="causes" value={donationsForm.causes} placeholder="e.g., education, veterans, conservation"
                onChange={(e) => setDonationsForm({ ...donationsForm, causes: e.target.value })} data-full-ai-field={fullAIExamples.bind({ current: donationsForm.causes, change: (e) => setDonationsForm({ ...donationsForm, causes: e.target.value }), label: "donationsForm.causes", manual: false, json: false, sample: '' }, "p1-10010", undefined)} />
            </div>
          </>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="btn-primary" disabled={loading} onClick={submit} style={{ padding: '10px 20px' }}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      <ResultDisplay result={result} error={error} />
    </div></div></NativeAIControls>
  )
}
