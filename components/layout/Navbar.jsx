'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { getProfile, logout as apiLogout, getToken } from '@/lib/api'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)

  useEffect(() => {
    async function loadProfile() {
      const token = getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const profile = await getProfile()
        setUser(profile)
      } catch (err) {
        console.error('Erreur chargement profil:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleLogout = () => {
    apiLogout()
    router.push('/login')
  }

  // Initiales de l'utilisateur
  const getInitials = () => {
    if (!user || !user.name) return '?'
    const parts = user.name.split(' ')
    return parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2)
  }

  const isDashboard = pathname === '/dashboard'
  const isProjects = pathname?.startsWith('/projects')

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo.png"
            alt="ABRICOT"
            width={150}
            height={150}
            priority
          />
        </Link>

        {/* Navigation Desktop */}
        <div className="hidden md:flex gap-8">
          <Link
            href="/dashboard"
            className={`font-medium px-4 py-2 rounded transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${
              isDashboard
                ? 'bg-black text-white'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" aria-hidden="true"><path d="M120-440v-320q0-33 23.5-56.5T200-840h240v400H120Zm240-80Zm160-320h240q33 0 56.5 23.5T840-760v160H520v-240Zm0 720v-400h320v320q0 33-23.5 56.5T760-120H520ZM120-360h320v240H200q-33 0-56.5-23.5T120-200v-160Zm240 80Zm240-400Zm0 240Zm-400-80h160v-240H200v240Zm400-160h160v-80H600v80Zm0 240v240h160v-240H600ZM200-280v80h160v-80H200Z"/></svg>
            Tableau de bord
          </Link>
          <Link
            href="/projects"
            className={`font-medium px-4 py-2 rounded transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${
              isProjects
                ? 'bg-black text-white'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" aria-hidden="true"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z"/></svg>
            Projets
          </Link>
        </div>

        {/* Profil + Menu Burger */}
        <div className="flex items-center gap-4">
          {/* Profil Desktop */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Ouvrir le menu de profil"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              className="w-12 h-12 rounded-full flex items-center justify-center text-gray-800 font-bold transition hover:opacity-90 bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
              title={user?.name || 'Profil'}
            >
              {getInitials()}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg" role="menu">
                <Link
                  href="/profile"
                  role="menuitem"
                  className="block px-4 py-2 text-gray-900 hover:bg-gray-100 border-b focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-inset"
                  onClick={() => setDropdownOpen(false)}
                >
                  Mon compte
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    handleLogout()
                  }}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-inset"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>

          {/* Menu Burger Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
            aria-haspopup="menu"
            className="md:hidden flex items-center justify-center w-10 h-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 rounded"
            title="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" aria-hidden="true"><path d="M120-240v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z"/></svg>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <Link
            href="/dashboard"
            className="flex px-6 py-3 text-gray-900 hover:bg-gray-100 border-b items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-inset"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" aria-hidden="true"><path d="M120-440v-320q0-33 23.5-56.5T200-840h240v400H120Zm240-80Zm160-320h240q33 0 56.5 23.5T840-760v160H520v-240Zm0 720v-400h320v320q0 33-23.5 56.5T760-120H520ZM120-360h320v240H200q-33 0-56.5-23.5T120-200v-160Zm240 80Zm240-400Zm0 240Zm-400-80h160v-240H200v240Zm400-160h160v-80H600v80Zm0 240v240h160v-240H600ZM200-280v80h160v-80H200Z"/></svg>
            Tableau de bord
          </Link>
          <Link
            href="/projects"
            className="flex px-6 py-3 text-gray-900 hover:bg-gray-100 border-b items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-inset"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" aria-hidden="true"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z"/></svg>
            Projets
          </Link>
          <Link
            href="/profile"
            className="block px-6 py-3 text-gray-900 hover:bg-gray-100 border-b focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-inset"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mon compte
          </Link>
          <button
            onClick={() => {
              handleLogout()
              setMobileMenuOpen(false)
            }}
            className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 font-medium focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-inset"
          >
            Déconnexion
          </button>
        </div>
      )}
    </nav>
  )
}
