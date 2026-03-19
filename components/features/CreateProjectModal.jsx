'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import MultiSelect from '@/components/ui/MultiSelect'
import { createProject, addContributor, searchUsers, getProfile } from '@/lib/api'
import Button from '@/components/ui/Button'

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contributors, setContributors] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    if (isOpen) {
      getProfile().then(setCurrentUser).catch(err => console.error('Erreur chargement profil:', err))
    }
  }, [isOpen])

  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDescriptionChange = (e) => setDescription(e.target.value)

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
      const filtered = resultArray.filter(user =>
        user.id !== currentUser?.id && !contributors.find(c => c.id === user.id)
      )
      setSearchResults(filtered)
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err)
    }
  }

  const addContributorToList = (user) => {
    // Vérifier si pas déjà ajouté
    if (!contributors.find(c => c.id === user.id)) {
      setContributors([...contributors, user])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const removeContributor = (userId) => {
    setContributors(contributors.filter(c => c.id !== userId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Le titre du projet est obligatoire')
      return
    }

    setLoading(true)
    try {
      // Créer le projet
      const project = await createProject({ name: title, description })

      // Ajouter le propriétaire (utilisateur courant) comme contributeur ADMIN
      if (currentUser?.email) {
        try {
          await addContributor(project.id, currentUser.email, 'ADMIN')
        } catch (err) {
          console.error('Erreur ajout propriétaire comme contributeur:', err)
        }
      }

      // Ajouter les autres contributeurs
      for (const contributor of contributors) {
        try {
          await addContributor(project.id, contributor.email, 'CONTRIBUTOR')
        } catch (err) {
          console.error(`Erreur ajout contributeur ${contributor.name}:`, err)
        }
      }

      setTitle('')
      setDescription('')
      setContributors([])
      setLoading(false)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du projet')
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un projet">
      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
        {error && (
          <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs md:text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="createProjectTitle" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Titre *</label>
          <input
            id="createProjectTitle"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Nom du projet"
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-xs md:text-sm text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="createProjectDescription" className="block text-xs md:text-sm font-medium mb-1 md:mb-2 text-gray-900">Description *</label>
          <textarea
            id="createProjectDescription"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Description du projet"
            rows="2"
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-xs md:text-sm text-gray-900"
          />
        </div>

        <MultiSelect
          label="Contributeurs"
          placeholder="Choisir un ou plusieurs collaborateurs"
          options={searchResults}
          selectedIds={contributors.map(c => c.id)}
          onSearch={handleSearch}
          onSelect={(id) => {
            const user = searchResults.find(u => u.id === id)
            if (user) addContributorToList(user)
          }}
          onRemove={removeContributor}
          showBadges={false}
        />

        <Button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 py-1.5 md:py-2 text-xs md:text-sm"
        >
          {loading ? 'Création...' : 'Ajouter un projet'}
        </Button>
      </form>
    </Modal>
  )
}
