'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, updateProfile, updatePassword } from '@/lib/api'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentPasswordInput, setCurrentPasswordInput] = useState('')
  const [originalPassword, setOriginalPassword] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile()
        // Backend retourne user.name (un seul champ), il faut splitter
        const nameParts = (profile.name || '').split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        setFormData({
          firstName,
          lastName,
          email: profile.email || '',
          password: '',
        })
        setOriginalPassword('')
      } catch (err) {
        setError('Erreur lors du chargement du profil')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Vérifier que le mot de passe est assez fort
  // 8+ caractères, 1 minuscule, 1 majuscule, 1 chiffre
  const isValidPassword = (password) => {
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasValidLength = password.length >= 8
    const hasValidChars = /^[a-zA-Z\d@$!%*?&]*$/.test(password)

    return hasLowercase && hasUppercase && hasNumber && hasValidLength && hasValidChars
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const passwordChanged = formData.password.trim() !== ''

    // Si le mot de passe a changé, demander le mot de passe actuel
    if (passwordChanged && !currentPasswordInput.trim()) {
      setError('Veuillez entrer votre mot de passe actuel pour changer le mot de passe')
      return
    }

    // Valider le format du nouveau mot de passe
    if (passwordChanged && !isValidPassword(formData.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre')
      return
    }

    setSaving(true)
    try {
      await updateProfile({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      })

      if (passwordChanged) {
        await updatePassword(currentPasswordInput, formData.password)
        setFormData(prev => ({ ...prev, password: '' }))
        setOriginalPassword('')
        setCurrentPasswordInput('')
      }

      setSuccess('Profil mis à jour avec succès')
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-12">
      <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Mon compte</h1>
        <p className="text-sm md:text-base text-gray-900 mb-6 md:mb-8">{formData.firstName} {formData.lastName}</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-bold mb-2 text-gray-900">Nom</label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Prénom"
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-sm md:text-base text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-bold mb-2 text-gray-900">Prénom</label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Nom"
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-sm md:text-base text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-2 text-gray-900">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-sm md:text-base text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-2 text-gray-900">Mot de passe</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••••"
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-sm md:text-base text-gray-900"
          />
          {formData.password && (
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <div className={formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                ✓ Au moins 8 caractères
              </div>
              <div className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                ✓ Une majuscule
              </div>
              <div className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                ✓ Une minuscule
              </div>
              <div className={/\d/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                ✓ Un chiffre
              </div>
            </div>
          )}
        </div>

        {formData.password.trim() !== '' && (
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-bold mb-2 text-gray-900">Mot de passe actuel</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              placeholder="Entrer votre mot de passe actuel"
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 text-sm md:text-base text-gray-900"
              style={{ '--tw-ring-color': 'var(--primary)' }}
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={saving}
          className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 w-full py-2"
        >
          {saving ? 'Enregistrement...' : 'Modifier les informations'}
        </Button>
        </form>
      </div>
    </div>
  )
}
