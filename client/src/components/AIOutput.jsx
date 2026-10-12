import React from 'react'
import FormattedAIReport from './FormattedAIReport'

export default function AIOutput({ content, loading }) {
  if (loading) return <div className="ai-loading" role="status">AI is crafting your content</div>
  if (content === null || content === undefined) return null
  return <div className="ai-output"><FormattedAIReport response={content} title="AI content" /></div>
}
