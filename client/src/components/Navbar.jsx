import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const location = useLocation()

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
      color: 'white',
      padding: '0 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
        <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>&#x1F54A;</span>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600 }}>Memorial Creator</div>
            <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase' }}>AI-Powered Memorial Services</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/ai-legacy-tools" style={{
            color: location.pathname.startsWith('/ai-legacy-tools') ? '#fff' : 'rgba(255,255,255,0.85)',
            fontSize: 13,
            padding: '6px 12px',
            borderRadius: 4,
            background: location.pathname.startsWith('/ai-legacy-tools') ? 'rgba(255,255,255,0.12)' : 'transparent',
          }}>AI Legacy Tools</Link>
          <span style={{ fontSize: 14, opacity: 0.8 }}>Welcome, {user.name}</span>
          <button onClick={onLogout} className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '6px 16px', fontSize: 13 }}>
            Sign Out
          </button>
        </div>
      </div>
    
        {/* // === Batch 04 Gaps & Frontend Mounts === */}
        <div style={{ borderTop: '1px solid #eee', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
        <a href="/cf-multi-modal-memorial-video-generation-eu" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>Multi-modal memorial video generation (e</a>
        <a href="/cf-legacy-letter-platform-with-posthumous-m" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>Legacy letter platform with posthumous m</a>
        <a href="/cf-grief-support-chatbot-with-grief-stage" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>Grief support chatbot with grief-stage d</a>
        <a href="/cf-family-tree-biography-auto-completion-pu" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>Family tree + biography auto-completion </a>
        <a href="/cf-probate-assistant-adding-state-specific-" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>Probate assistant adding state-specific </a>
        <a href="/cf-legacy-giving-advisor-matching-memorial-" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>Legacy giving advisor matching memorial </a>
        <a href="/gap-no-legacy-interview-guide-endpoint-quest" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No legacy-interview-guide endpoint (ques</a>
        <a href="/gap-no-timeline-narrative-synthesis-weave-li" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No timeline-narrative synthesis (weave l</a>
        <a href="/gap-no-donations-matching-causes-by-deceased" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No donations-matching (causes by decease</a>
        <a href="/gap-no-grief-stage-classifier-exposed-to" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No grief-stage classifier exposed to fam</a>
        <a href="/gap-no-webhook-receivers-for-online-tribute" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No webhook receivers for online tribute </a>
        <a href="/gap-no-real-time-chat-between-family" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No real-time chat between family and fun</a>
        <a href="/gap-no-smsemail-send-infrastructure-notifica" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No SMS/email send infrastructure (notifi</a>
        <a href="/gap-no-payment-processing-for-donations-or" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No payment processing for donations or m</a>
        <a href="/gap-no-multi-tenant-funeral-home-onboarding" style={{ display: "block", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}>No multi-tenant funeral-home onboarding</a>
        </div>
</nav>
  )
}
