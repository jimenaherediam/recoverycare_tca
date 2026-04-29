import { defineStore } from 'pinia'
import { ref } from 'vue'
import { professionalAPI, alertsAPI } from '@/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref({ total_pacientes: 0, alertas_pendientes: 0, alertas_altas: 0, citas_hoy: 0 })
  const patients = ref([])
  const allAlerts = ref([])
  const appointments = ref([])
  const loading = ref(false)

  async function fetchStats() {
    const { data } = await professionalAPI.stats()
    stats.value = data
  }

  async function fetchPatients() {
    const { data } = await professionalAPI.patients()
    patients.value = data
  }

  async function fetchAllAlerts() {
    const { data } = await alertsAPI.list()
    allAlerts.value = data
  }

  async function fetchAppointments() {
    const { data } = await professionalAPI.appointments()
    appointments.value = data
  }

  async function markAlertReviewed(id) {
    await alertsAPI.markReviewed(id)
    allAlerts.value = allAlerts.value.map((a) =>
      a.id_alerta === id ? { ...a, revisada: true } : a
    )
    stats.value.alertas_pendientes = Math.max(0, stats.value.alertas_pendientes - 1)
  }

  async function loadAll() {
    loading.value = true
    try {
      await Promise.allSettled([fetchStats(), fetchPatients(), fetchAllAlerts(), fetchAppointments()])
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    patients,
    allAlerts,
    appointments,
    loading,
    fetchStats,
    fetchPatients,
    fetchAllAlerts,
    fetchAppointments,
    markAlertReviewed,
    loadAll,
  }
})
