import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicMemorial } from '../api';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function PublicMemorial() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestForm, setGuestForm] = useState({ visitor_name: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await publicMemorial.get(slug);
        setData(result);
      } catch (err) {
        setError(err.message || 'Memorial page not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestForm.visitor_name || !guestForm.message) {
      setSubmitError('Name and message are required.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await publicMemorial.submitGuestBook(slug, guestForm);
      setSubmitted(true);
      setGuestForm({ visitor_name: '', message: '' });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#7f8c8d' }}>Loading memorial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', color: '#2c3e50', marginBottom: 16 }}>Memorial Not Found</h2>
          <p style={{ color: '#7f8c8d' }}>{error}</p>
        </div>
      </div>
    );
  }

  const { memorial_page: page, timeline_events: timeline, photo_gallery: photos, guest_book_entries: guestBook } = data;

  return (
    <div style={{ background: '#f8f6f3', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', color: 'white', padding: '60px 24px', textAlign: 'center' }}>
        {page.photo_url && (
          <img
            src={page.photo_url}
            alt={page.deceased_name}
            style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)', marginBottom: 24 }}
          />
        )}
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 38, marginBottom: 12, fontWeight: 600 }}>
          {page.deceased_name}
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 }}>
          {formatDate(page.birth_date)} &mdash; {formatDate(page.death_date)}
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        {/* Biography */}
        {page.biography && (
          <section style={{ background: 'white', borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#2c3e50', marginBottom: 20, fontSize: 24 }}>Life Story</h2>
            <div style={{ lineHeight: 1.9, color: '#444', whiteSpace: 'pre-wrap', fontSize: 15 }}>
              {page.biography}
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {photos && photos.length > 0 && (
          <section style={{ background: 'white', borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#2c3e50', marginBottom: 20, fontSize: 24 }}>Photo Gallery</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' }}>
                  {photo.photo_url && (
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'Photo'}
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  {photo.caption && (
                    <p style={{ padding: '8px 12px', fontSize: 13, color: '#666', margin: 0 }}>{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <section style={{ background: 'white', borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#2c3e50', marginBottom: 24, fontSize: 24 }}>Life Timeline</h2>
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: '#e0d5a0' }} />
              {timeline.map((event) => (
                <div key={event.id} style={{ position: 'relative', marginBottom: 24, paddingLeft: 16 }}>
                  <div style={{
                    position: 'absolute', left: -26, top: 4,
                    width: 14, height: 14, borderRadius: '50%',
                    background: '#c9a959', border: '3px solid white',
                    boxShadow: '0 0 0 2px #c9a959'
                  }} />
                  <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: 4 }}>{event.title}</div>
                  <div style={{ fontSize: 13, color: '#7f8c8d' }}>
                    {formatDate(event.event_date)}
                    {event.location ? ` — ${event.location}` : ''}
                  </div>
                  {event.description && (
                    <p style={{ fontSize: 14, color: '#555', marginTop: 6, lineHeight: 1.6 }}>{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Guest Book */}
        <section style={{ background: 'white', borderRadius: 12, padding: 32, marginBottom: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', color: '#2c3e50', marginBottom: 24, fontSize: 24 }}>Guest Book</h2>

          {guestBook && guestBook.length > 0 ? (
            <div style={{ marginBottom: 32 }}>
              {guestBook.map((entry) => (
                <div key={entry.id} style={{ borderLeft: '3px solid #e0d5a0', paddingLeft: 16, marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: 4 }}>{entry.visitor_name}</div>
                  <p style={{ color: '#555', lineHeight: 1.7, margin: 0 }}>{entry.message}</p>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>{formatDate(entry.created_at)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#aaa', marginBottom: 24, fontStyle: 'italic' }}>
              No messages yet. Be the first to leave a memory.
            </p>
          )}

          {/* Submit form */}
          <div style={{ borderTop: '1px solid #f0ede8', paddingTop: 24 }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#2c3e50', marginBottom: 16, fontSize: 18 }}>Leave a Memory</h3>

            {submitted ? (
              <div style={{ background: '#f0faf4', border: '1px solid #27ae60', borderRadius: 8, padding: 16, color: '#27ae60' }}>
                Thank you for your message. It will appear after approval.
              </div>
            ) : (
              <form onSubmit={handleGuestSubmit}>
                {submitError && (
                  <div style={{ background: '#fdf2f2', border: '1px solid #e74c3c', borderRadius: 8, padding: 12, color: '#e74c3c', marginBottom: 16, fontSize: 14 }}>
                    {submitError}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#2c3e50', marginBottom: 6, fontSize: 14 }}>Your Name *</label>
                  <input
                    type="text"
                    value={guestForm.visitor_name}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, visitor_name: e.target.value }))}
                    placeholder="Enter your name"
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e8e4df', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#2c3e50', marginBottom: 6, fontSize: 14 }}>Your Message *</label>
                  <textarea
                    value={guestForm.message}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Share a memory, thought, or message..."
                    rows={4}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #e8e4df', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#2c3e50', color: 'white', border: 'none',
                    borderRadius: 8, padding: '12px 24px', fontSize: 14,
                    fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Leave a Memory'}
                </button>
              </form>
            )}
          </div>
        </section>

        <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, paddingBottom: 40 }}>
          In loving memory of {page.deceased_name}
        </div>
      </div>
    </div>
  );
}
