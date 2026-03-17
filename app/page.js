'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    // Si connecté → dashboard, sinon → login
    router.push(token ? '/dashboard' : '/login')
  }, [router])

  return <div className="flex items-center justify-center min-h-screen text-gray-600">Redirection...</div>
}
