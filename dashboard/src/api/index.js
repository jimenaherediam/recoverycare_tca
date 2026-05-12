import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('rc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rc_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

//  Auth 
export const authAPI = {
  loginProfessional: (email, password) =>
    http.post('/auth/professional/login', { email, password }),
  registerProfessional: (data) =>
    http.post('/auth/professional/register', data),
  me: () => http.get('/auth/me'),
}

//  Professional 
export const professionalAPI = {
  stats: () => http.get('/professional/stats'),
  patients: () => http.get('/professional/patients'),
  patient: (id) => http.get(`/professional/patients/${id}`),
  evolution: (id, days = 30) =>
    http.get(`/professional/patients/${id}/evolution`, { params: { days } }),
  patientAlerts: (id) => http.get(`/professional/patients/${id}/alerts`),
  patientPlans: (id) => http.get(`/professional/patients/${id}/plans`),
  createPlan: (id, data) => http.post(`/professional/patients/${id}/plans`, data),
  togglePlan: (patientId, planId) =>
    http.patch(`/professional/patients/${patientId}/plans/${planId}/toggle`),
  patientAppointments: (id) => http.get(`/professional/patients/${id}/appointments`),
  appointments: () => http.get('/professional/appointments'),
  createAppointment: (data) => http.post('/professional/appointments', data),
  patientChatHistory: (id) => http.get(`/professional/patients/${id}/chat`),
}

//  Alerts 
export const alertsAPI = {
  list: () => http.get('/alerts'),
  markReviewed: (id) => http.patch(`/alerts/${id}`, { revisada: true }),
}

export default http
