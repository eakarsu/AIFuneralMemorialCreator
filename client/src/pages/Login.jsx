import React, { useState } from 'react'
import { auth } from '../api'

export default function Login({ onLogin, showToast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = isRegister
        ? await auth.register(email, password, name)
        : await auth.login(email, password)
      onLogin(data.user, data.token)
      showToast('Welcome to Memorial Creator!')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail('admin@memorial.com')
    setPassword('password123')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 40%, #5d6d7e 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 48,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F54A;</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#2c3e50', marginBottom: 8 }}>
            Memorial Creator
          </h1>
          <p style={{ color: '#7f8c8d', fontSize: 14 }}>AI-Powered Funeral & Memorial Services</p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: 20 }}>
          <button onClick={fillDemo} className="btn-gold" style={{ width: '100%', marginBottom: 12 }}>
            Fill Demo Credentials
          </button>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', color: '#8e7cc3', fontSize: 14, padding: 0 }}
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center', padding: '16px 0', borderTop: '1px solid #e8e4df' }}>
          <p style={{ fontSize: 11, color: '#95a5a6', lineHeight: 1.6 }}>
            Compassionate AI technology helping families honor their loved ones with dignity and grace.
          </p>
        </div>
      </div>
    </div>
  )
}
