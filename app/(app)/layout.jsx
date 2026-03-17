'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getToken } from '@/lib/api'

export default function AppLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    const token = getToken()
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
