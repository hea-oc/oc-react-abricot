'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { signup } from '@/lib/api'
import signinImage from '../../../public/create.jpg'
import logo from '../../../public/logo.png'

// Page d'inscription
export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      await signup(email, password)
      router.push('/login')
    } catch (err) {
      if (err.message.includes('409') || err.message.includes('existe')) {
        setError('Cet email est déjà utilisé')
      } else if (err.message.includes('Failed to fetch')) {
        setError('Erreur de connexion au serveur')
      } else {
        setError(err.message || 'Erreur lors de l\'inscription')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex flex-col items-center px-8 md:px-16 py-12 bg-white">

        <div className="mb-12 w-full text-center">
          <img src={logo.src} alt="ABRICOT Logo" className="h-10 inline-block" />
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md">
          <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: 'var(--primary)' }}>
            Inscription
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

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

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-2 text-gray-900">Confirmer le mot de passe</label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
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
              {loading ? 'Inscription en cours...' : "S'inscrire"}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-900 w-full max-w-md">
          Déjà inscrit ?{' '}
          <Link href="/login" className=" text-orange-700 font-bold underline focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 rounded px-1 py-0.5" >
            Se connecter
          </Link>
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
