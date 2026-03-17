'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/api'
import Button from '@/components/ui/Button'

export default function NewProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Le titre est obligatoire')
      return
    }

    setLoading(true)
    try {
      await createProject(formData)
      router.push('/projects')
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du projet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Créer un projet</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Titre *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nom du projet"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 text-gray-900"
            style={{ '--tw-ring-color': 'var(--primary)' }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description du projet"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 text-gray-900"
            style={{ '--tw-ring-color': 'var(--primary)' }}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer le projet'}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-900 hover:bg-gray-300"
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
