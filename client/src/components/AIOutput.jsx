import React from 'react'

export default function AIOutput({ content, loading }) {
  if (loading) {
    return (
      <div className="ai-loading">
        <span>AI is crafting your content</span>
      </div>
    )
  }

  if (!content) return null

  // Format the AI content beautifully
  const formatContent = (text) => {
    // Split into paragraphs
    const paragraphs = text.split('\n\n')
    return paragraphs.map((para, i) => {
      // Check for headers (lines starting with # or **)
      if (para.startsWith('# ')) {
        return <h3 key={i} style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12, marginTop: 16, color: '#2c3e50', fontSize: 20 }}>{para.replace('# ', '')}</h3>
      }
      if (para.startsWith('## ')) {
        return <h4 key={i} style={{ fontFamily: 'Playfair Display, serif', marginBottom: 10, marginTop: 14, color: '#34495e', fontSize: 17 }}>{para.replace('## ', '')}</h4>
      }
      if (para.startsWith('### ')) {
        return <h5 key={i} style={{ fontWeight: 600, marginBottom: 8, marginTop: 12, color: '#5d6d7e', fontSize: 15 }}>{para.replace('### ', '')}</h5>
      }

      // Check for lists
      const lines = para.split('\n')
      const isList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\./.test(l.trim()) || l.trim() === '')

      if (isList) {
        return (
          <ul key={i} style={{ marginBottom: 12, paddingLeft: 20 }}>
            {lines.filter(l => l.trim()).map((line, j) => (
              <li key={j} style={{ marginBottom: 6, lineHeight: 1.6 }}>
                {line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '')}
              </li>
            ))}
          </ul>
        )
      }

      // Bold text
      const formatted = para.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>
        }
        return part
      })

      // Regular paragraphs
      return (
        <p key={i} style={{ marginBottom: 14, lineHeight: 1.8, textAlign: 'justify' }}>
          {formatted}
        </p>
      )
    })
  }

  return (
    <div className="ai-output">
      <div className="ai-output-content">
        {formatContent(content)}
      </div>
    </div>
  )
}
