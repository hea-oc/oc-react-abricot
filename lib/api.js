const API_URL = 'http://localhost:8000'

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `Erreur ${res.status}`)
  }

  // Stocker le token en localStorage
  const token = data.token || data.accessToken || data.access_token || data.jwt || (data.data && data.data.token) 
  if (token) {
    localStorage.setItem('token', token)
  }

  return data
}

export async function signup(email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Signup failed')
  }

  return data
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

// HELPERS

function getAuthHeader() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// AUTH ROUTES

export async function getProfile() {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile')
  return data.data.user
}

export async function updateProfile(userData) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(userData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update profile')
  return data
}

export async function updatePassword(currentPassword, newPassword) {
  const res = await fetch(`${API_URL}/auth/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update password')
  return data
}

// DASHBOARD

export async function getDashboard() {
  const res = await fetch(`${API_URL}/dashboard/assigned-tasks`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch dashboard')

  return {
    tasks: (data.data && data.data.tasks) || [],
    user: null,
  }
}

// PROJECTS 

export async function getProjects() {
  const res = await fetch(`${API_URL}/projects`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch projects')
  return data.data.projects
}

export async function getProject(id) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch project')
  return data.data.project
}

export async function createProject(projectData) {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(projectData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create project')
  return data.data.project
}

export async function addContributor(projectId, email, role = 'CONTRIBUTOR') {
  const res = await fetch(`${API_URL}/projects/${projectId}/contributors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ email, role }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to add contributor')
  return data.data
}

export async function removeContributor(projectId, userId) {
  const res = await fetch(`${API_URL}/projects/${projectId}/contributors/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to remove contributor')
  }

  return { success: true }
}

export async function updateProject(id, projectData) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(projectData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update project')
  return data
}

export async function deleteProject(id) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to delete project')
  }

  return { success: true }
}

// TASKS

export async function getProjectTasks(projectId) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks')
  return data.data.tasks
}

export async function createTask(projectId, taskData) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(taskData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create task')
  return data
}

export async function updateTask(projectId, taskId, taskData) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(taskData),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update task')
  return data
}

export async function deleteTask(projectId, taskId) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to delete task')
  }

  return { success: true }
}

// COMMENTS

export async function getComments(projectId, taskId) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/comments`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch comments')
  return data.data.comments
}

export async function createComment(projectId, taskId, content) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ content }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create comment')
  return data.data.comment
}

export async function deleteComment(projectId, taskId, commentId) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Failed to delete comment')
  }

  return { success: true }
}

// USERS

export async function searchUsers(query) {
  const res = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to search users')
  return data.data || data
}
