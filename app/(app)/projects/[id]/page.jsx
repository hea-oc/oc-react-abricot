'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProject, getProjectTasks, deleteTask, deleteProject, getProfile } from '@/lib/api'
import Button from '@/components/ui/Button'
import EditProjectModal from '@/components/features/EditProjectModal'
import EditTaskModal from '@/components/features/EditTaskModal'
import CreateTaskModal from '@/components/features/CreateTaskModal'
import CommentsSection from '@/components/features/CommentsSection'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [taskView, setTaskView] = useState('list') // TODO: implémenter la vue calendrier
  const [openMenuTaskId, setOpenMenuTaskId] = useState(null)

  const loadProject = async () => {
    try {
      // Charger tout en parallèle pour avoir les données plus vite
      const [projectData, tasksData, userProfile] = await Promise.all([
        getProject(projectId),
        getProjectTasks(projectId),
        getProfile(),
      ])
      setProject(projectData)
      setTasks(tasksData || [])
      setUser(userProfile)
    } catch (err) {
      setError('Erreur lors du chargement du projet')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProject()
  }, [projectId])

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(projectId, taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      setConfirmDeleteId(null)
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche')
      console.error(err)
    }
  }

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId)
      router.push('/projects')
    } catch (err) {
      setError('Erreur lors de la suppression du projet')
      console.error(err)
      setConfirmDeleteProject(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = { 'TODO': 'À faire', 'IN_PROGRESS': 'En cours', 'DONE': 'Terminée' }
    return labels[status] || status
  }

  // Couleurs des badges selon le statut
  const getStatusBadgeClass = (status) => {
    const styles = {
      'TODO': 'bg-red-100 text-red-700',
      'IN_PROGRESS': 'bg-amber-100 text-amber-700',
      'DONE': 'bg-green-100 text-green-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  // Filtrer selon la recherche et le statut
  const filteredTasks = tasks.filter((task) => {
    const matchSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = !statusFilter || task.status === statusFilter
    return matchSearch && matchStatus
  })


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

  if (!project) {
    return <div className="p-8 text-center text-red-600">Projet non trouvé</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-12">
      <div className="flex items-start gap-2 md:gap-3 mb-6 md:mb-8">
        <button
          onClick={() => router.back()}
          aria-label="Retour à la liste des projets"
          className="text-xl md:text-2xl text-gray-600 hover:text-gray-900 shrink-0 pt-1"
        >
        ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 overflow-wrap-break-word">{project.name}</h1>
                {user?.id === project?.owner?.id ? (
                  <>
                    <button
                      onClick={() => setEditProjectOpen(true)}
                      aria-label={`Modifier le projet ${project.name}`}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setConfirmDeleteProject(true)}
                      aria-label={`Supprimer le projet ${project.name}`}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-medium text-gray-500 italic">
                    (Propriétaire: {project.owner?.name || 'Propriétaire'})
                  </span>
                )}
              </div>

              {confirmDeleteProject && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 font-medium mb-3">Êtes-vous sûr ? Cette action supprimera le projet et toutes ses tâches.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteProject}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                    >
                      Oui, supprimer
                    </button>
                    <button
                      onClick={() => setConfirmDeleteProject(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 text-sm font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto shrink-0">
              <Button
                onClick={() => setCreateTaskOpen(true)}
                aria-label="Créer une nouvelle tâche"
                className="bg-black text-white hover:bg-gray-800 w-full md:w-auto"
              >
                Créer une tâche
              </Button>
              <Button
                aria-label="Générer des tâches avec l'IA"
                className="bg-orange-600 text-white hover:bg-orange-700 w-full md:w-auto"
              >
                ✨ IA
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditProjectModal
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        project={project}
        tasks={tasks}
        projectId={projectId}
        onSuccess={() => {
          setEditProjectOpen(false)
          loadProject()
        }}
      />

      {(project.owner || project.members?.length > 0) && (
        <div className="mb-6 md:mb-8 bg-gray-100 rounded-lg px-3 md:px-5 py-2 md:py-3.5 flex flex-col md:flex-row justify-between md:items-center gap-2 md:gap-4">
          <div>
            <h3 className="text-xs md:text-sm font-bold text-gray-900">Contributeurs <small className="text-xs font-light text-gray-700">{(project.members?.length || 0) + 1}</small></h3>
          </div>
          <div className="flex gap-2 md:gap-3 items-center flex-wrap">
            {project.owner && (
              <>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-500 font-bold bg-orange-200">
                  {getInitials(project.owner.name)}
                </div>
                <span className="text-xs text-orange-700 font-medium rounded-full px-2 py-1 bg-orange-200">Propriétaire</span>
              </>
            )}
            {project.members?.map((member) => {
              // Ne pas afficher le propriétaire dans la liste des membres (déjà affiché en haut)
              if (project.owner?.id === member.user?.id) {
                return null
              }
              return (
                <div key={member.id} className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-600 font-bold bg-gray-300">
                    {getInitials(member.user?.name)}
                  </div>
                  <span className="text-xs text-gray-500 rounded-full px-2 py-1 bg-gray-300">{member.user?.name}</span>
                  {member.role === 'ADMIN' && (
                    <span className="text-xs text-orange-700 font-medium rounded-full px-2 py-1 bg-orange-200">Admin</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-10 hover:shadow-md transition">
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-1 gap-3 md:gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tâches</h2>
            <p className="text-xs text-gray-600">Par ordre de priorité</p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex gap-2 items-center w-full md:w-auto flex-wrap md:flex-nowrap" role="tablist">
              <button
                onClick={() => setTaskView('list')}
                role="tab"
                aria-selected={taskView === 'list'}
                aria-label="Afficher les tâches en vue liste"
                className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition text-xs md:text-sm ${
                  taskView === 'list'
                    ? 'bg-orange-100 text-orange-600 border border-orange-300'
                    : 'bg-white text-orange-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#F54900" aria-hidden="true"><path d="M200-200v-560 454-85 191Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v320h-80v-320H200v560h280v80H200Zm494 40L552-222l57-56 85 85 170-170 56 57L694-80ZM348.5-451.5Q360-463 360-480t-11.5-28.5Q337-520 320-520t-28.5 11.5Q280-497 280-480t11.5 28.5Q303-440 320-440t28.5-11.5Zm0-160Q360-623 360-640t-11.5-28.5Q337-680 320-680t-28.5 11.5Q280-657 280-640t11.5 28.5Q303-600 320-600t28.5-11.5ZM440-440h240v-80H440v80Zm0-160h240v-80H440v80Z"/></svg> Liste
              </button>
              <button
                onClick={() => setTaskView('calendar')}
                role="tab"
                aria-selected={taskView === 'calendar'}
                aria-label="Afficher les tâches en vue calendrier"
                className={`flex items-center gap-2 px-3 py-2 rounded font-medium transition text-xs md:text-sm ${
                  taskView === 'calendar'
                    ? 'bg-orange-100 text-orange-600 border border-orange-300'
                    : 'bg-white text-orange-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#F54900" aria-hidden="true"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg> Calendrier
              </button>
            </div>

            <label htmlFor="statusFilter" className="sr-only text-gray-900">Filtrer par statut</label>
            <select
              id="statusFilter"
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 bg-white flex-1 md:flex-none"
            >
              <option value="">Statut</option>
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Terminée</option>
            </select>

            <div className="flex items-center border border-gray-300 rounded flex-1 md:flex-none">
              <label htmlFor="searchTasks" className="sr-only text-gray-900">Rechercher une tâche</label>
              <input
                id="searchTasks"
                type="text"
                placeholder="Rechercher une tâche"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 text-xs md:text-sm text-gray-900 focus:outline-none placeholder-gray-500 flex-1 min-w-0"
              />
              <button aria-label="Soumettre la recherche de tâche" className="px-3 py-2 text-gray-600 hover:text-gray-900 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3" aria-hidden="true"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></button>
            </div>
          </div>
        </div>

      
        <div className="mb-6 mt-4"></div>

        <CreateTaskModal
          isOpen={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          projectId={projectId}
          onSuccess={() => {
            setCreateTaskOpen(false)
            loadProject()
          }}
        />

        <EditTaskModal
          isOpen={editTaskOpen}
          onClose={() => setEditTaskOpen(false)}
          task={selectedTask}
          projectId={projectId}
          onSuccess={() => {
            setEditTaskOpen(false)
            setSelectedTask(null)
            loadProject()
          }}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Aucune tâche correspondant aux critères</p>
        ) : (
          <>
            {filteredTasks.map((task) => (
              <div key={task.id} className="relative mb-4">
                <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 flex-1">{task.title} <span></span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      </h3>
                    <div className="flex items-center gap-2 shrink-0">
                     
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuTaskId(openMenuTaskId === task.id ? null : task.id)}
                          aria-label={`Plus d'options pour la tâche ${task.title}`}
                          aria-expanded={openMenuTaskId === task.id}
                          aria-haspopup="menu"
                          className="text-gray-500 hover:text-gray-700 transition border border-gray-300 rounded-sm p-1"
                          title="Plus d'options"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor" aria-hidden="true">
                            <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/>
                          </svg>
                        </button>
                        {openMenuTaskId === task.id && (
                          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20" role="menu">
                            <button
                              onClick={() => {
                                setSelectedTask(task)
                                setEditTaskOpen(true)
                                setOpenMenuTaskId(null)
                              }}
                              role="menuitem"
                              aria-label={`Modifier la tâche ${task.title}`}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                            >
                            Modifier
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(task.id)
                                setOpenMenuTaskId(null)
                              }}
                              role="menuitem"
                              aria-label={`Supprimer la tâche ${task.title}`}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                            Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs mb-2">{task.description}</p>

                  {task.dueDate && (
                    <div className="flex items-center gap-1 mb-2 text-xs text-gray-600">
                      <span>Échéance:</span> <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="grey" aria-hidden="true"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
                      <span className="text-gray-900">{formatDateShort(task.dueDate)}</span>
                    </div>
                  )}

                  {task.assignees && task.assignees.length > 0 && (
                    <div className="flex gap-3 items-center flex-wrap mb-2">
                      <span className="text-xs text-gray-600">Assigné à:</span>
                      {task.assignees.map((assignee) => (
                        <div key={assignee.user.id} className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-300"
                            title={assignee.user.name}
                          >
                            {getInitials(assignee.user.name)}
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-300 rounded-full px-2 py-1">{assignee.user.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <hr className="border-t border-gray-200 my-3" />
                  <CommentsSection
                    taskId={task.id}
                    projectId={projectId}
                    comments={task.comments || []}
                    currentUserId={user?.id}
                    onCommentAdded={() => loadProject()}
                  />
                </div>

                {confirmDeleteId === task.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <p className="text-gray-900 mb-4 font-medium">Confirmer la suppression de cette tâche?</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteTask(task.id)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Supprimer
                        </Button>
                        <Button
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-gray-200 text-gray-900 hover:bg-gray-300"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  </div>
  )
}
