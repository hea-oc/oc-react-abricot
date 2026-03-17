'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { updateTask, getProject } from '@/lib/api'
import Button from '@/components/ui/Button'

export default function EditTaskModal({ isOpen, onClose, task, projectId, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('TODO')
  const [assignees, setAssignees] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      if (task.dueDate) {
        const date = new Date(task.dueDate)
        const formattedDate = date.toISOString().split('T')[0]
        setDueDate(formattedDate)
      } else {
        setDueDate('')
      }
      setStatus(task.status || 'TODO')
      setError('')

      let assigneeIds = []
      if (task.assignees && Array.isArray(task.assignees)) {
        assigneeIds = task.assignees
          .map(a => a.user?.id || a.userId || a)
          .filter(id => id)
      }
      setAssignees(assigneeIds)
    }
  }, [task, isOpen])

  useEffect(() => {
    if (isOpen && projectId) {
      getProject(projectId)
        .then(project => {
          const members = project.members || []
          const owner = project.owner
          const seenIds = new Set()
          const allAssignees = []

          if (owner?.id) {
            allAssignees.push({ user: owner })
            seenIds.add(owner.id)
          }

          members.forEach(member => {
            const memberId = member.user?.id
            if (memberId && !seenIds.has(memberId)) {
              allAssignees.push(member)
              seenIds.add(memberId)
            }
          })

          setProjectMembers(allAssignees)
        })
        .catch(err => console.error('Erreur chargement projet:', err))
    }
  }, [isOpen, projectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Le titre de la tâche est obligatoire')
      return
    }

    if (!dueDate) {
      setError("L'échéance est obligatoire")
      return
    }

    setLoading(true)
    try {
      // Convertir la date en format ISO complet (YYYY-MM-DDTHH:mm:ss.sssZ)
      const isoDate = dueDate ? new Date(dueDate + 'T00:00:00').toISOString() : null

      await updateTask(projectId, task.id, {
        title,
        description,
        status,
        dueDate: isoDate,
        assigneeIds: assignees,
      })

      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour de la tâche')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la tâche">
      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
        {error && (
          <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs md:text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de la tâche"
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 text-xs md:text-sm text-gray-900"
            style={{ '--tw-ring-color': 'var(--primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la tâche"
            rows="2"
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 text-xs md:text-sm text-gray-900"
            style={{ '--tw-ring-color': 'var(--primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Échéance *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 text-xs md:text-sm text-gray-900"
            style={{ '--tw-ring-color': 'var(--primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Assigné à :</label>
          <select
            multiple
            value={assignees}
            onChange={(e) => setAssignees(Array.from(e.target.selectedOptions, option => option.value))}
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 text-xs md:text-sm text-gray-900"
            style={{ '--tw-ring-color': 'var(--primary)' }}
          >
            {projectMembers.map((member) => (
              <option key={member.user?.id} value={member.user?.id}>
                {member.user?.name || member.user?.email}
              </option>
            ))}
          </select>
          {assignees.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {assignees.map((userId) => {
                const member = projectMembers.find(m => m.user?.id === userId)
                const displayName = member?.user?.name || userId || 'Utilisateur'
                return (
                  <span key={userId} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm text-gray-900">
                    {displayName}
                    <button
                      type="button"
                      onClick={() => setAssignees(assignees.filter(id => id !== userId))}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Statut :</label>
          <div className="flex gap-2">
            {[
              { value: 'TODO', label: 'À faire', bg: '#FCA5A5' },
              { value: 'IN_PROGRESS', label: 'En cours', bg: '#FED7AA' },
              { value: 'DONE', label: 'Terminée', bg: '#86EFAC' }
            ].map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={`px-4 py-2 rounded font-medium transition ${
                  status === s.value
                    ? 'opacity-100 ring-2 ring-gray-900'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: s.bg, color: s.value === 'TODO' ? '#991b1b' : s.value === 'IN_PROGRESS' ? '#92400e' : '#15803d' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !title.trim() || !dueDate}
          className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 py-2"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </form>
    </Modal>
  )
}
