import React, { useState, useEffect } from 'react';
import { thankYouTracker, ai } from '../api';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const FILTERS = ['all', 'pending', 'sent'];

export default function ThankYouTrackerPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTarget, setAiTarget] = useState(null);
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const result = await thankYouTracker.getPending();
      setItems(result.data || result);
    } catch (err) {
      showToast('Failed to load thank-you tracker', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return !item.thank_you_sent;
    if (filter === 'sent') return item.thank_you_sent;
    return true;
  });

  // Items from pending endpoint are always unsent (thank_you_sent=false)
  // For "sent" filter, we'd need a separate endpoint — for now show empty
  // The pending endpoint only returns unsent items
  const displayItems = filter === 'sent' ? [] : filteredItems;

  const openAiModal = (item) => {
    setAiTarget(item);
    setAiContent('');
    setAiModalOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!aiTarget) return;
    setAiLoading(true);
    setAiContent('');
    try {
      let result;
      if (aiTarget.source_type === 'donation') {
        result = await ai.generateDonationThanks({
          donor_name: aiTarget.contact_name,
          deceased_name: aiTarget.deceased_name,
          organization: aiTarget.detail,
        });
      } else {
        result = await ai.generateThankYou({
          recipient_name: aiTarget.contact_name,
          deceased_name: aiTarget.deceased_name,
          gift_or_gesture: aiTarget.detail,
        });
      }
      const content = result.content || result.text || '';
      setAiContent(content);
      showToast('Thank you message generated', 'success');
    } catch (err) {
      if (err.status === 429) {
        showToast('AI rate limit reached. Please wait before making more AI requests.', 'error');
      } else {
        showToast('AI generation failed', 'error');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleMarkSent = async (item) => {
    const key = `${item.source_type}-${item.id}`;
    setMarkingId(key);
    try {
      await thankYouTracker.markSent(item.source_type, item.id);
      showToast('Marked as sent!', 'success');
      setAiModalOpen(false);
      setAiTarget(null);
      fetchPending();
    } catch (err) {
      showToast('Failed to mark as sent', 'error');
    } finally {
      setMarkingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Thank You Tracker</h1>
        <button className="btn-outline btn-sm" onClick={fetchPending}>Refresh</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={filter === f ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            onClick={() => setFilter(f)}
            style={{ textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading thank-you tracker...</div>
      ) : filter === 'sent' ? (
        <div className="empty-state">
          <h3>Sent items</h3>
          <p>This view shows items already marked as sent. Use the flower &amp; gift tracker or donations pages to see all records.</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="empty-state">
          <h3>No pending thank-you items</h3>
          <p>All flowers and donations have been acknowledged.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>For</th>
                <th>Detail</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item) => (
                <tr key={`${item.source_type}-${item.id}`}>
                  <td>
                    <span className={`badge ${item.source_type === 'donation' ? 'badge-success' : 'badge-draft'}`}>
                      {item.source_type === 'donation' ? 'Donation' : 'Flower/Gift'}
                    </span>
                  </td>
                  <td>{item.contact_name || '—'}</td>
                  <td>{item.deceased_name || '—'}</td>
                  <td>{item.detail || '—'}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-gold btn-sm"
                        onClick={() => openAiModal(item)}
                        style={{ fontSize: 12 }}
                      >
                        ✦ AI Generate
                      </button>
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => handleMarkSent(item)}
                        disabled={markingId === `${item.source_type}-${item.id}`}
                        style={{ fontSize: 12 }}
                      >
                        Mark Sent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Modal */}
      {aiModalOpen && aiTarget && (
        <Modal
          title={`Generate Thank You — ${aiTarget.contact_name}`}
          onClose={() => { setAiModalOpen(false); setAiTarget(null); setAiContent(''); }}
        >
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: '#7f8c8d', fontSize: 14 }}>
              <strong>Recipient:</strong> {aiTarget.contact_name}<br />
              <strong>For:</strong> {aiTarget.deceased_name}<br />
              <strong>Detail:</strong> {aiTarget.detail || 'N/A'}
            </p>
          </div>

          <button
            className="btn-gold btn-sm"
            onClick={handleGenerateAI}
            disabled={aiLoading}
            style={{ marginBottom: 16 }}
          >
            {aiLoading ? 'Generating...' : '✦ Generate Thank You Message'}
          </button>

          <AIOutput content={aiContent} loading={aiLoading} />

          {aiContent && (
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button
                className="btn-outline"
                onClick={() => { setAiModalOpen(false); setAiTarget(null); setAiContent(''); }}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => handleMarkSent(aiTarget)}
                disabled={markingId === `${aiTarget.source_type}-${aiTarget.id}`}
              >
                {markingId ? 'Marking...' : 'Mark as Sent'}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
