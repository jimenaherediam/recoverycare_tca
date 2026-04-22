<template>
  <div>
    <!-- Saludo -->
    <div class="mb-6">
      <h2 class="greeting">Hola, {{ firstName }} 👋</h2>
      <p class="greeting-sub">Aquí tienes el resumen de hoy · {{ today }}</p>
    </div>

    <!-- KPIs -->
    <v-row class="mb-6">
      <v-col v-for="card in statCards" :key="card.label" cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon-wrap" :style="{ background: card.bg }">
            <v-icon :color="card.color" size="26">{{ card.icon }}</v-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
          <v-chip
            v-if="card.chip"
            :color="card.chipColor"
            size="x-small"
            variant="tonal"
            class="stat-chip"
          >
            {{ card.chip }}
          </v-chip>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Alertas recientes -->
      <v-col cols="12" lg="7">
        <v-card elevation="0" class="section-card">
          <v-card-title class="section-title d-flex align-center justify-space-between">
            <span>Alertas recientes</span>
            <v-btn size="small" variant="text" color="primary" :to="{ name: 'Alerts' }">
              Ver todas <v-icon end>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pt-0">
            <div v-if="store.loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="recentAlerts.length === 0" class="empty-state">
              <v-icon size="40" color="success">mdi-check-circle-outline</v-icon>
              <p class="mt-2 text-body-2 text-medium-emphasis">No hay alertas pendientes</p>
            </div>
            <template v-else>
              <div
                v-for="alert in recentAlerts"
                :key="alert.id_alerta"
                class="alert-row"
              >
                <div class="d-flex align-center flex-1">
                  <AlertChip :nivel="alert.nivel" variant="flat" />
                  <div class="ml-3">
                    <div class="alert-desc">{{ alert.descripcion }}</div>
                    <div class="alert-meta">{{ formatDate(alert.fecha) }}</div>
                  </div>
                </div>
                <v-btn
                  v-if="!alert.revisada"
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="store.markAlertReviewed(alert.id_alerta)"
                >
                  Revisar
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Columna derecha -->
      <v-col cols="12" lg="5">
        <!-- Citas de hoy -->
        <v-card elevation="0" class="section-card mb-4">
          <v-card-title class="section-title d-flex align-center justify-space-between">
            <span>Citas de hoy</span>
            <v-btn size="small" variant="text" color="primary" :to="{ name: 'Appointments' }">
              Ver todas <v-icon end>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pt-0">
            <div v-if="todayAppointments.length === 0" class="empty-state">
              <v-icon size="40" color="grey-lighten-1">mdi-calendar-blank-outline</v-icon>
              <p class="mt-2 text-body-2 text-medium-emphasis">Sin citas para hoy</p>
            </div>
            <div v-for="cita in todayAppointments" :key="cita.id" class="appt-row">
              <div class="appt-time">{{ formatTime(cita.fecha) }}</div>
              <div class="appt-info">
                <div class="appt-patient">{{ cita.paciente_nombre }}</div>
                <div class="appt-motivo">{{ cita.motivo || 'Sin motivo especificado' }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Pacientes críticos -->
        <v-card elevation="0" class="section-card">
          <v-card-title class="section-title d-flex align-center justify-space-between">
            <span>Pacientes críticos</span>
            <v-btn size="small" variant="text" color="primary" :to="{ name: 'Patients' }">
              Ver todos <v-icon end>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pt-0">
            <div v-if="criticalPatients.length === 0" class="empty-state">
              <v-icon size="40" color="success">mdi-emoticon-happy-outline</v-icon>
              <p class="mt-2 text-body-2 text-medium-emphasis">Todos los pacientes estables</p>
            </div>
            <div
              v-for="p in criticalPatients"
              :key="p.id"
              class="patient-row"
              @click="$router.push(`/pacientes/${p.id}`)"
            >
              <v-avatar color="primary" size="36">
                <span class="text-caption font-weight-bold text-white">{{ initials(p.nombre) }}</span>
              </v-avatar>
              <div class="ml-3 flex-1 overflow-hidden">
                <div class="patient-name text-truncate">{{ p.nombre }}</div>
                <div class="patient-meta">{{ p.alertas_sin_revisar }} alerta(s) sin revisar</div>
              </div>
              <v-chip size="x-small" color="error" variant="flat">
                {{ p.alertas_altas }} alta(s)
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import AlertChip from '@/components/common/AlertChip.vue'

const auth  = useAuthStore()
const store = useDashboardStore()

const firstName = computed(() => auth.user?.nombre?.split(' ')[0] || '')
const today = computed(() => format(new Date(), "EEEE, d 'de' MMMM", { locale: es }))

const statCards = computed(() => [
  {
    label: 'Total pacientes',
    value: store.stats.total_pacientes,
    icon: 'mdi-account-group-outline',
    color: 'primary', bg: '#EDE9FE',
  },
  {
    label: 'Alertas pendientes',
    value: store.stats.alertas_pendientes,
    icon: 'mdi-bell-outline',
    color: 'warning', bg: '#FEF3C7',
    chip: store.stats.alertas_altas > 0 ? `${store.stats.alertas_altas} críticas` : null,
    chipColor: 'error',
  },
  {
    label: 'Alertas críticas',
    value: store.stats.alertas_altas,
    icon: 'mdi-alert-circle-outline',
    color: 'error', bg: '#FEE2E2',
  },
  {
    label: 'Citas hoy',
    value: store.stats.citas_hoy,
    icon: 'mdi-calendar-today-outline',
    color: 'info', bg: '#DBEAFE',
  },
])

const recentAlerts = computed(() =>
  store.allAlerts.filter((a) => !a.revisada).slice(0, 6)
)

const todayAppointments = computed(() => {
  const t = new Date().toDateString()
  return store.appointments.filter((a) => new Date(a.fecha).toDateString() === t)
})

const criticalPatients = computed(() =>
  store.patients
    .filter((p) => p.alertas_altas > 0)
    .sort((a, b) => b.alertas_altas - a.alertas_altas)
    .slice(0, 4)
)

function initials(name) {
  return name?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || '?'
}
function formatDate(d) {
  try { return format(new Date(d), "d MMM, HH:mm", { locale: es }) } catch { return '' }
}
function formatTime(d) {
  try { return format(new Date(d), 'HH:mm') } catch { return '' }
}
</script>

<style scoped>
.greeting { font-size: 24px; font-weight: 700; color: #1F2937; }
.greeting-sub { color: #6B7280; font-size: 14px; margin-top: 2px; text-transform: capitalize; }

.stat-card {
  padding: 20px;
  border-radius: 16px !important;
  background: white;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #EDE9FE;
  position: relative;
  overflow: hidden;
}
.stat-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-value { font-size: 28px; font-weight: 800; color: #1F2937; line-height: 1; }
.stat-label { font-size: 12px; color: #6B7280; margin-top: 4px; }
.stat-chip { position: absolute; top: 12px; right: 12px; }

.section-card { border: 1px solid #EDE9FE; background: white; }
.section-title { font-size: 15px !important; font-weight: 700; color: #1F2937; padding: 16px 16px 12px; }

.alert-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid #F3F4F6;
}
.alert-row:last-child { border-bottom: none; }
.alert-desc { font-size: 13px; font-weight: 500; color: #1F2937; }
.alert-meta { font-size: 11px; color: #9CA3AF; margin-top: 2px; }

.appt-row {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 0; border-bottom: 1px solid #F3F4F6;
}
.appt-row:last-child { border-bottom: none; }
.appt-time {
  min-width: 44px; font-size: 13px; font-weight: 700;
  color: #7C3AED; background: #EDE9FE;
  border-radius: 8px; padding: 4px 8px; text-align: center;
}
.appt-patient { font-size: 13px; font-weight: 600; color: #1F2937; }
.appt-motivo { font-size: 11px; color: #9CA3AF; }

.patient-row {
  display: flex; align-items: center;
  padding: 8px; border-bottom: 1px solid #F3F4F6;
  cursor: pointer; border-radius: 8px; transition: background 0.15s;
}
.patient-row:hover { background: #F5F3FF; }
.patient-row:last-child { border-bottom: none; }
.patient-name { font-size: 13px; font-weight: 600; color: #1F2937; }
.patient-meta { font-size: 11px; color: #9CA3AF; }

.empty-state { text-align: center; padding: 24px 0; }
</style>
