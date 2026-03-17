'use client'

import { useEffect } from 'react'

// Composant de modale générique
export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-sm md:max-w-lg w-[90%] md:w-full mx-auto max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-sm md:text-lg font-bold text-gray-900 truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl md:text-2xl leading-none shrink-0"
            aria-label="Fermer la modale"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3 md:px-6 md:py-4 space-y-2 md:space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
}
