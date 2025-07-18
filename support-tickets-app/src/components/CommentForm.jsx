import { useState } from 'react'
import { apiService } from '../services/apiService'

export const CommentBox = ({ ticketId, onCommentAdded }) => {
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await apiService.addComment(ticketId, content)
      setContent('')
      onCommentAdded?.() // refresh parent or ticket
    } catch (err) {
      console.error('❌ Failed to post comment:', err)
      setError('Failed to post comment. Check console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        className="w-full border rounded p-2 text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Write your comment..."
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}
