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
          <span style={{ fontSize: 14, opacity: 0.8 }}>Welcome, {user.name}</span>
          <button onClick={onLogout} className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '6px 16px', fontSize: 13 }}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}
