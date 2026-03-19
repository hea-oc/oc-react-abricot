'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { login } from '@/lib/api'
import signinImage from '../../../public/signin.jpg'

// Page de connexion
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Email ou mot de passe incorrect')
      } else if (err.message.includes('404') || err.message.includes('Not found')) {
        setError('Compte non trouvé')
      } else if (err.message.includes('Failed to fetch')) {
        setError('Erreur de connexion au serveur')
      } else {
        setError(err.message || 'Erreur lors de la connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      <div className="w-full md:w-1/2 flex flex-col items-center px-8 md:px-16 py-12 bg-white">
        <div className="mb-12 w-full text-center">
          <img src="/logo.png" alt="ABRICOT Logo" className="h-10 inline-block" />
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md">
          <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: 'var(--primary)' }}>
            Connexion
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-900">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-gray-900 placeholder-gray-500"
                placeholder="alice@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-900">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-gray-900 placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 py-3 text-base font-medium"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <div className="mt-8 space-y-4 text-center w-full max-w-md">
          <Link href="#" className="text-orange-700 block text-sm font-bold underline focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 rounded px-2 py-1">
            Mot de passe oublié ?
          </Link>
          <p className="text-sm text-gray-900">
            Pas encore inscrit ?{' '}
            <Link href="/signup" className="text-orange-700 font-bold underline focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 rounded px-1 py-0.5">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:block w-1/2 bg-linear-to-br from-orange-100 to-orange-50">
        <img
          src={signinImage.src}
          alt="Workspace"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
