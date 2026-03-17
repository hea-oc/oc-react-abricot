'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProjects, getProjectTasks } from '@/lib/api'
import Button from '@/components/ui/Button'
import CreateProjectModal from '@/components/features/CreateProjectModal'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data || [])

      // Charger les tâches pour chaque projet (pour afficher le nombre de tâches)
      const projectsWithTasks = await Promise.all(
        (data || []).map(async (project) => {
          try {
            const tasks = await getProjectTasks(project.id)
            return { ...project, tasks }
          } catch (err) {
            console.error(`Erreur chargement tâches projet ${project.id}:`, err)
            return { ...project, tasks: [] }
          }
        })
      )
      setProjects(projectsWithTasks)
    } catch (err) {
      console.error('Erreur chargement projets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // Extraire les initiales d'un nom pour l'avatar (ex: "John Doe" -> "JD")
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const getProgressPercentage = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const doneCount = project.tasks.filter((t) => t.status === 'DONE').length
    return Math.round((doneCount / project.tasks.length) * 100)
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Mes projets</h1>
          <p className="text-gray-900">Gérez vos projets collaboratifs</p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-black text-white hover:bg-gray-800"
        >
          + Créer un projet
        </Button>
      </div>

      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false)
          loadProjects()
        }}
      />

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun projet pour le moment</p>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Créer votre premier projet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              role="button"
              tabIndex="0"
              aria-label={`Ouvrir le projet ${project.name}`}
              className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
              onClick={() => router.push(`/projects/${project.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push(`/projects/${project.id}`)
                }
              }}
            >
              <h3 className="text-base font-semibold mb-2 text-gray-900">{project.name}</h3>

              <p className="text-sm text-gray-600 mb-4">{project.description}</p>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm text-gray-600">{getProgressPercentage(project)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full transition"
                    style={{ width: `${getProgressPercentage(project)}%`, backgroundColor: 'var(--primary)' }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {(project.tasks || []).filter(t => t.status === 'DONE').length}/{project.tasks?.length || 0} tâches terminées
                </span>
              </div>

              <div className="flex flex-col gap-2 w-fit">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#9ca3af" aria-hidden="true">
                    <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Équipe ({(project.members?.length || 0) + 1})</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-orange-800 bg-orange-100">
                      {getInitials(project.owner?.name)}
                    </div>
                    <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded">Propriétaire</span>
                  </div>

                  {project.members?.slice(0, 2).map((member, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 bg-gray-200"
                      title={member.user?.name}
                    >
                      {getInitials(member.user?.name)}
                    </div>
                  ))}
                  {(project.members?.length || 0) > 2 && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 bg-gray-300">
                      +{project.members.length - 2}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
