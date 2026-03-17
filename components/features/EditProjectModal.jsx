'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { updateProject, addContributor, removeContributor, searchUsers, updateTask } from '@/lib/api'
import Button from '@/components/ui/Button'

export default function EditProjectModal({ isOpen, onClose, project, tasks = [], projectId, onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contributors, setContributors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name || '')
      setDescription(project.description || '')
      setContributors(project.members || [])
      setError('')
    }
  }, [project, isOpen])

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = await searchUsers(query)
      const resultArray = Array.isArray(results)
        ? results
        : (results.data || results.users || results.results || [])
      setSearchResults(resultArray)
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err)
    }
  }

  const addContributorToList = (user) => {
    if (project.owner?.id === user.id) {
      setError('Le propriétaire ne peut pas être ajouté comme contributeur')
      return
    }
    if (!contributors.find(c => c.user?.id === user.id)) {
      setContributors([...contributors, { user }])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const removeContributorFromList = (userId) => {
    setContributors(contributors.filter(c => c.user?.id !== userId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Le titre du projet est obligatoire')
      return
    }

    setLoading(true)
    try {
      await updateProject(project.id, { name, description })

      const originalContributorEmails = (project.members || []).map(m => m.user?.email)
      const newContributorEmails = contributors.map(c => c.user?.email || c.email)

      for (const contributor of contributors) {
        const email = contributor.user?.email || contributor.email
        const userId = contributor.user?.id || contributor.id
        if (!originalContributorEmails.includes(email)) {
          try {
            await addContributor(project.id, email, 'CONTRIBUTOR')
          } catch (err) {
            console.error(`Erreur ajout contributeur:`, err)
          }
        }
      }

      for (const originalEmail of originalContributorEmails) {
        if (!newContributorEmails.includes(originalEmail)) {
          try {
            const memberToRemove = (project.members || []).find(m => m.user?.email === originalEmail)
            if (memberToRemove) {
              const removedUserId = memberToRemove.user?.id

              // Important: retirer l'utilisateur de ses tâches sinon il va avoir des erreurs 403
              for (const task of (tasks || [])) {
                if (task.assignees && task.assignees.length > 0) {
                  const newAssignees = task.assignees
                    .map(a => a.user?.id || a.userId || a)
                    .filter(id => id !== removedUserId)

                  if (newAssignees.length !== task.assignees.length) {
                    try {
                      await updateTask(projectId, task.id, {
                        assigneeIds: newAssignees
                      })
                    } catch (err) {
                      console.error(`Erreur retrait assignation tâche ${task.id}:`, err)
                    }
                  }
                }
              }

              await removeContributor(project.id, removedUserId)
            }
          } catch (err) {
            console.error(`Erreur retrait contributeur:`, err)
          }
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du projet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le projet">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="projectTitle" className="block text-sm font-medium mb-2 text-gray-900">Titre *</label>
          <input
            id="projectTitle"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du projet"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="projectDescription" className="block text-sm font-medium mb-2 text-gray-900">Description *</label>
          <textarea
            id="projectDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du projet"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="contributorSearch" className="block text-sm font-medium mb-2 text-gray-900">Contributeurs</label>
          <input
            id="contributorSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un utilisateur"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-gray-900 mb-2"
          />

          {searchResults.length > 0 && (
            <div className="border border-gray-300 rounded bg-white max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => addContributorToList(user)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900"
                >
                  {user.name || user.email}
                </button>
              ))}
            </div>
          )}

          {contributors.length > 0 && (
            <div className="mt-3 space-y-2">
              {contributors.map((contributor) => (
                <div key={contributor.user?.id || contributor.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm text-gray-900">{contributor.user?.name || contributor.name}</span>
                  <button
                    type="button"
                    onClick={() => removeContributorFromList(contributor.user?.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 py-2"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </form>
    </Modal>
  )
}
