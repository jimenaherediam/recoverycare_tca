import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('rc_token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const initials = computed(() => {
    if (!user.value?.nombre) return '?'
    return user.value.nombre
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  })

  async function login(email, password, codigo) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authAPI.loginProfessional(email, password, codigo)
      token.value = data.access_token
      localStorage.setItem('rc_token', data.access_token)
      await fetchMe()
      return true
    } catch (e) {
      error.value = e.response?.data?.detail || 'Error al iniciar sesión'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const { data } = await authAPI.me()
      user.value = data
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('rc_token')
  }

  return { user, token, loading, error, isAuthenticated, initials, login, fetchMe, logout }
})
