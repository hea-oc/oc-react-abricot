'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDashboard, getProfile, getToken } from '@/lib/api'
import Button from '@/components/ui/Button'
import CreateProjectModal from '@/components/features/CreateProjectModal'

export default function DashboardPage() {
  const router = useRouter()
  const [view, setView] = useState('list') // 'list' ou 'kanban'
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)

  // Charger le dashboard (tâches + profil)
  const loadDashboard = async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const [dashboardData, profileData] = await Promise.all([
        getDashboard(),
        getProfile(),
      ])
      setTasks(dashboardData.tasks || [])
      setUser(profileData || {})
    } catch (err) {
      console.error('Erreur chargement dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Filtrer les tâches selon la recherche
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Grouper les tâches par statut pour la vue kanban
  const tasksByStatus = {
    'À faire': filteredTasks.filter((t) => t.status === 'TODO'),
    'En cours': filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
    'Terminées': filteredTasks.filter((t) => t.status === 'DONE'),
  }

  // Convertir les statuts backend en labels lisibles
  const getStatusLabel = (status) => {
    const labels = { 'TODO': 'À faire', 'IN_PROGRESS': 'En cours', 'DONE': 'Terminée' }
    return labels[status] || status
  }

  // Classes de badge selon le statut
  const getStatusBadgeClass = (status) => {
    const styles = {
      'TODO': 'bg-red-100 text-red-700',
      'IN_PROGRESS': 'bg-amber-100 text-amber-700',
      'DONE': 'bg-green-100 text-green-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  // Formater une date au format jour mois
  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    const month = monthNames[date.getMonth()]
    return `${day} ${month}`
  }
  
  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-12">
      <div className="mb-6 md:mb-12">
        <h1 className="text-xl md:text-4xl font-bold mb-2 text-gray-900">Tableau de bord</h1>
        <p className="text-sm md:text-base text-gray-900">
          Bonjour {user?.name || 'utilisateur'}, voici un aperçu de vos projets et tâches
        </p>
      </div>
      {/* Contrôles de vue et création de projet */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 gap-3 md:gap-0">
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${
              view === 'list'
                ? 'bg-orange-100 text-orange-600'
                : 'text-orange-700 hover:bg-orange-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#F54900" aria-hidden="true"><path d="M200-200v-560 454-85 191Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v320h-80v-320H200v560h280v80H200Zm494 40L552-222l57-56 85 85 170-170 56 57L694-80ZM348.5-451.5Q360-463 360-480t-11.5-28.5Q337-520 320-520t-28.5 11.5Q280-497 280-480t11.5 28.5Q303-440 320-440t28.5-11.5Zm0-160Q360-623 360-640t-11.5-28.5Q337-680 320-680t-28.5 11.5Q280-657 280-640t11.5 28.5Q303-600 320-600t28.5-11.5ZM440-440h240v-80H440v80Zm0-160h240v-80H440v80Z"/></svg>
            Liste
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${
              view === 'kanban'
                ? 'bg-orange-100 text-orange-600'
                : 'text-orange-700 hover:bg-orange-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#F54900"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
            Kanban
          </button>
        </div>

        <Button
          onClick={() => setCreateProjectModalOpen(true)}
          className="bg-black text-white hover:bg-gray-800 w-full md:w-auto"
        >
          + Créer un projet
        </Button>
      </div>

      <CreateProjectModal
        isOpen={createProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onSuccess={() => {
          setCreateProjectModalOpen(false)
          // Rafraîchir les tâches
          loadDashboard()
        }}
      />
      {/* Vue liste des tâches assignées à l'utilisateur */}
      {view === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between md:items-start mb-6 gap-4 md:gap-0">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Mes tâches assignées</h2>
              <p className="text-xs text-gray-600">Par ordre de priorité</p>
            </div>

            <div className="flex items-center border border-gray-300 rounded flex-1 md:flex-none">
              <label htmlFor="searchTasksDashboard" className="sr-only text-gray-900">Rechercher une tâche</label>
              <input
                id="searchTasksDashboard"
                type="text"
                placeholder="Rechercher une tâche"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 text-xs md:text-sm text-gray-900 focus:outline-none placeholder-gray-500 flex-1 min-w-0"
              />
              <button aria-label="Rechercher une tâche" className="px-3 py-2 text-gray-600 hover:text-gray-900 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune tâche à afficher</p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-3 md:p-6 rounded border border-gray-200 hover:shadow-md transition flex flex-col md:flex-row justify-between md:items-stretch gap-3 md:gap-6"
                >
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-auto">
                      <span className="flex items-center gap-1 min-w-0">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z"/></svg>
                        <span className="truncate">{task.projectName || task.project?.name || 'Projet'}</span>
                      </span>
                      <span className="text-gray-400 hidden md:inline">|</span>
                      {task.dueDate && (
                        <>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
                            {formatDateShort(task.dueDate)}
                          </span>
                          <span className="text-gray-400 hidden md:inline">|</span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/></svg>
                        {task.comments ? task.comments.length : task.commentsCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-col items-start md:items-end justify-between shrink-0 gap-2 w-full md:w-auto">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                    <button
                      onClick={() => router.push(`/projects/${task.projectId}`)}
                      className="bg-black text-white px-6 py-2 rounded text-xs md:text-sm font-medium hover:bg-gray-800 transition w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
                    >
                      Voir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Vue kanban des tâches assignées à l'utilisateur et groupés par statut */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className="bg-white rounded p-6 border border-gray-200">
              <h3 className="font-bold mb-4 text-sm md:text-base text-gray-900">
                {status} <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs font-normal ml-2">{statusTasks.length}</span>
              </h3>
              <div className="space-y-4">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded border border-gray-200 hover:shadow-md transition"
                  >
                    {/* Titre + Status Badge */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-sm text-gray-900 flex-1">{task.title}</h4>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1 min-w-0">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z"/></svg>
                        <span className="truncate">{task.projectName || task.project?.name || 'Projet'}</span>
                      </span>

                      {task.dueDate && (
                        <>
                          <span className="text-gray-400">|</span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
                            {formatDateShort(task.dueDate)}
                          </span>
                        </>
                      )}

                      <span className="text-gray-400">|</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/></svg>
                        {task.comments ? task.comments.length : task.commentsCount || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/projects/${task.projectId}`)}
                      className="bg-black text-white px-6 py-1.5 rounded text-xs font-medium hover:bg-gray-800 transition w-auto focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
                    >
                      Voir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
