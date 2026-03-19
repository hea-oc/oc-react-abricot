'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import MultiSelect from '@/components/ui/MultiSelect'
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

    // Vider les résultats si la recherche est vide
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Ne pas appeler l'API si moins de 2 caractères
    if (query.trim().length < 2) {
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

        <MultiSelect
          label="Contributeurs"
          placeholder="Choisir un ou plusieurs collaborateurs"
          options={searchResults}
          selectedIds={contributors.map(c => c.user?.id || c.id).filter(Boolean)}
          onSearch={handleSearch}
          onSelect={(id) => {
            const user = searchResults.find(u => u.id === id)
            if (user) addContributorToList(user)
          }}
          onRemove={removeContributorFromList}
          showBadges={false}
        />

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
