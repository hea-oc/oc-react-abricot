'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import MultiSelect from '@/components/ui/MultiSelect'
import { createTask, getProject } from '@/lib/api'
import Button from '@/components/ui/Button'

export default function CreateTaskModal({ isOpen, onClose, projectId, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('TODO')
  const [assignees, setAssignees] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && projectId) {
      // Charger les membres du projet pour le dropdown d'assignation
      getProject(projectId)
        .then(project => {
          const members = project.members || []
          const owner = project.owner
          const seenIds = new Set()
          const allAssignees = []

          // Ajouter le propriétaire en premier
          if (owner?.id) {
            allAssignees.push({ user: owner })
            seenIds.add(owner.id)
          }

          // Puis les autres membres (éviter les doublons)
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
      const isoDate = dueDate ? new Date(dueDate + 'T00:00:00').toISOString() : null

      await createTask(projectId, {
        title,
        description,
        dueDate: isoDate,
        assigneeIds: assignees
      })

      setTitle('')
      setDescription('')
      setDueDate('')
      setStatus('TODO')
      setAssignees([])
      setLoading(false)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la tâche')
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une tâche">
      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
        {error && (
          <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs md:text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="taskTitle" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Titre *</label>
          <input
            id="taskTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de la tâche"
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-xs md:text-sm text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="taskDescription" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Description *</label>
          <textarea
            id="taskDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la tâche"
            rows="2"
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-xs md:text-sm text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="taskDueDate" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Échéance *</label>
          <input
            id="taskDueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-xs md:text-sm text-gray-900"
          />
        </div>

        <MultiSelect
          label="Assigné à :"
          placeholder="Choisir un ou plusieurs collaborateurs"
          options={projectMembers.map(m => m.user)}
          selectedIds={assignees}
          onSelect={(id) => setAssignees([...assignees, id])}
          onRemove={(id) => setAssignees(assignees.filter(a => a !== id))}
        />

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Statut :</label>
          <div className="flex gap-2">
            {[
              { value: 'TODO', label: 'À faire', bg: '#fecaca', text: '#7f1d1d' },
              { value: 'IN_PROGRESS', label: 'En cours', bg: '#fef3c7', text: '#78350f' },
              { value: 'DONE', label: 'Terminée', bg: '#bbf7d0', text: '#065f46' }
            ].map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={`px-4 py-2 rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${
                  status === s.value
                    ? 'ring-2 ring-gray-900'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: s.bg, color: s.text }}
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
          {loading ? 'Création...' : '+ Ajouter une tâche'}
        </Button>
      </form>
    </Modal>
  )
}
