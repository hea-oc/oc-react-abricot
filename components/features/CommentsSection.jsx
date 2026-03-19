'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { createComment, deleteComment } from '@/lib/api'

export default function CommentsSection({
  taskId,
  projectId,
  comments = [],
  currentUserId,
  onCommentAdded,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setLoading(true)
    setError('')

    try {
      await createComment(projectId, taskId, newComment.trim())
      setNewComment('')
      onCommentAdded?.()
    } catch (err) {
      setError('Erreur lors de l\'ajout du commentaire')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    setDeletingId(commentId)
    setError('')

    try {
      await deleteComment(projectId, taskId, commentId)
      onCommentAdded?.()
    } catch (err) {
      setError('Erreur lors de la suppression du commentaire')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Bouton pour afficher/masquer */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={`${isExpanded ? 'Masquer' : 'Afficher'} les commentaires (${comments.length} commentaires)`}
        aria-expanded={isExpanded}
        className="flex items-center justify-between w-full text-xs font-medium text-gray-600 hover:text-gray-900 transition pt-2"
      >
        <span>Commentaires ({comments.length})</span>
        <span
          className={`transition-transform text-xs ${isExpanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="grey"
          >
            <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
          </svg>
        </span>
      </button>

      {/* Section commentaires */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          {/* Erreur */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Input pour ajouter un commentaire */}
          <div className="space-y-2">
            <label htmlFor={`comment-input-${taskId}`} className="block text-xs font-medium text-gray-900 mb-1">
              Ajouter un commentaire
            </label>
            <textarea
              id={`comment-input-${taskId}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrivez votre commentaire ici..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
              rows="2"
            />
            <Button
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              className="bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 text-xs py-2"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </div>

          <hr className="border-t border-gray-200" />

          {/* Commentaires existants */}
          {comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {comment.author?.name || comment.authorName || 'Utilisateur'}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {comment.author?.id === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingId === comment.id}
                        aria-label={`Supprimer le commentaire de ${comment.author?.name || 'Utilisateur'}`}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 transition text-xs font-medium"
                      >
                        {deletingId === comment.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap overflow-wrap-break-word">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">Aucun commentaire pour le moment</p>
          )}
        </div>
      )}
    </div>
  )
}
