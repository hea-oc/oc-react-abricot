'use client'

import { useState, useRef, useEffect } from 'react'

export default function MultiSelect({
  label,
  placeholder = 'Choisir un ou plusieurs collaborateurs',
  options = [],
  selectedIds = [],
  onSelect,
  onRemove,
  onSearch,
  error = '',
  showBadges = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const dropdownRef = useRef(null)

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCount = selectedIds.length
  const displayText = selectedCount > 0
    ? `${selectedCount} collaborateur${selectedCount > 1 ? 's' : ''}`
    : placeholder

  const isSelected = (id) => selectedIds.includes(id)

  const handleToggle = (option) => {
    if (isSelected(option.id)) {
      onRemove(option.id)
    } else {
      onSelect(option.id, option)
    }
  }

  return (
    <div ref={dropdownRef} className="relative z-10">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-900">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white
          text-gray-900 text-sm text-left
          flex items-center justify-between
          hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
      >
        <span>{displayText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#6b7280"
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m256-424-56-56 280-280 280 280-56 56-224-223-224 223Z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded bg-white
          shadow-lg z-50 max-h-48 overflow-y-auto">
          {/* Input de recherche (si onSearch est fourni) */}
          {onSearch && (
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                onSearch(e.target.value)
              }}
              placeholder="Rechercher..."
              className="w-full px-4 py-2 border-b border-gray-300 text-sm text-gray-900 focus:outline-none"
            />
          )}

          {/* Liste des options */}
          {options.length > 0 ? (
            options.map((option) => (
              <label
                key={option.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer
                  border-b border-gray-200 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={isSelected(option.id)}
                  onChange={() => handleToggle(option)}
                  className="w-4 h-4 text-orange-600 rounded
                    focus:ring-2 focus:ring-orange-600"
                />
                <span className="ml-3 text-sm text-gray-900">
                  {option.name || option.email}
                </span>
              </label>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Aucun utilisateur disponible
            </div>
          )}
        </div>
      )}

      {/* Selected Items (badges) - seulement si showBadges = true */}
      {showBadges && selectedIds.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedIds.map((id) => {
            const selectedOption = options.find(opt => opt.id === id)
            return (
              <div
                key={id}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <span className="text-sm text-gray-900">
                  {selectedOption?.name || selectedOption?.email}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(id)}
                  className="text-red-600 hover:text-red-800 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
