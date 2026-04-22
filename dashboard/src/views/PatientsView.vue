<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="view-title">Mis Pacientes</h2>
        <p class="view-sub">{{ store.patients.length }} pacientes asignados</p>
      </div>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Buscar paciente..."
        hide-details density="compact"
        style="max-width:260px" bg-color="white"
      />
    </div>

    <!-- Filtros rápidos -->
    <div class="d-flex gap-2 mb-5 flex-wrap">
      <v-btn
        v-for="f in filters" :key="f.value"
        size="small" rounded="pill"
        :variant="activeFilter === f.value ? 'flat' : 'tonal'"
        :color="activeFilter === f.value ? 'primary' : 'grey'"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </v-btn>
    </div>

    <div v-if="store.loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <v-row v-else>
      <v-col
        v-for="patient in filteredPatients"
        :key="patient.id"
        cols="12" sm="6" lg="4"
      >
        <v-card
          elevation="0" class="patient-card"
          @click="$router.push(`/pacientes/${patient.id}`)"
        >
          <div class="status-bar" :class="`status-bar--${statusClass(patient)}`" />
          <v-card-text class="pt-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="46" class="mr-3">
                <span class="text-body-1 font-weight-bold text-white">{{ initials(patient.nombre) }}</span>
              </v-avatar>
              <div class="flex-1 overflow-hidden">
                <div class="patient-name text-truncate">{{ patient.nombre }}</div>
                <div class="patient-info">{{ patient.edad }} años · {{ patient.localidad || 'Sin localidad' }}</div>
              </div>
              <AlertChip v-if="patient.alertas_altas > 0" nivel="ALTO" />
              <AlertChip v-else-if="patient.alertas_sin_revisar > 0" nivel="MEDIO" />
              <AlertChip v-else nivel="BAJO" />
            </div>

            <v-divider class="mb-3" />

            <div class="d-flex justify-space-between text-center">
              <div>
                <div class="metric-val text-error">{{ patient.alertas_altas }}</div>
                <div class="metric-label">Críticas</div>
              </div>
              <div>
                <div class="metric-val text-warning">{{ patient.alertas_sin_revisar }}</div>
                <div class="metric-label">Pendientes</div>
              </div>
              <div>
                <div class="metric-val text-primary">
                  {{ patient.ansiedad_media_semana != null ? patient.ansiedad_media_semana : '—' }}
                </div>
                <div class="metric-label">Ansiedad media</div>
              </div>
            </div>

            <div class="mt-3 d-flex align-center">
              <v-icon size="13" color="grey" class="mr-1">mdi-clock-outline</v-icon>
              <span class="last-meal">
                Última comida: {{ patient.ultima_comida ? formatDate(patient.ultima_comida) : 'Sin registro' }}
              </span>
            </div>

            <div v-if="patient.estancia_hospitalaria" class="mt-2">
              <v-chip size="x-small" color="info" variant="tonal" prepend-icon="mdi-hospital-building">
                Estancia hospitalaria
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="filteredPatients.length === 0" cols="12">
        <v-card elevation="0" class="text-center py-12">
          <v-icon size="56" color="grey-lighten-2">mdi-account-search-outline</v-icon>
          <p class="mt-4 text-medium-emphasis">No se encontraron pacientes</p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDashboardStore } from '@/stores/dashboard'
import AlertChip from '@/components/common/AlertChip.vue'

const store = useDashboardStore()
const search = ref('')
const activeFilter = ref('all')

const filters = [
  { label: 'Todos',            value: 'all' },
  { label: 'Con alertas críticas', value: 'critical' },
  { label: 'Pendientes',       value: 'pending' },
  { label: 'Hospitalizados',   value: 'hospital' },
]

const filteredPatients = computed(() => {
  let list = store.patients
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.localidad?.toLowerCase().includes(q)
    )
  }
  if (activeFilter.value === 'critical') list = list.filter((p) => p.alertas_altas > 0)
  else if (activeFilter.value === 'pending') list = list.filter((p) => p.alertas_sin_revisar > 0)
  else if (activeFilter.value === 'hospital') list = list.filter((p) => p.estancia_hospitalaria)
  return list.sort((a, b) => b.alertas_altas - a.alertas_altas)
})

function initials(n) {
  return n?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
}
function statusClass(p) {
  if (p.alertas_altas > 0) return 'error'
  if (p.alertas_sin_revisar > 0) return 'warning'
  return 'success'
}
function formatDate(d) {
  try { return format(new Date(d), 'd MMM yyyy', { locale: es }) } catch { return '' }
}
</script>

<style scoped>
.view-title { font-size: 22px; font-weight: 700; color: #1F2937; }
.view-sub { font-size: 13px; color: #6B7280; margin-top: 2px; }

.patient-card {
  border: 1px solid #EDE9FE; cursor: pointer; overflow: hidden;
  transition: box-shadow 0.2s, transform 0.15s;
}
.patient-card:hover {
  box-shadow: 0 4px 20px rgba(124,58,237,0.15) !important;
  transform: translateY(-2px);
}
.status-bar { height: 4px; width: 100%; }
.status-bar--error   { background: linear-gradient(90deg,#EF4444,#FCA5A5); }
.status-bar--warning { background: linear-gradient(90deg,#F59E0B,#FDE68A); }
.status-bar--success { background: linear-gradient(90deg,#10B981,#6EE7B7); }

.patient-name { font-size: 15px; font-weight: 700; color: #1F2937; }
.patient-info { font-size: 12px; color: #9CA3AF; margin-top: 2px; }
.metric-val   { font-size: 20px; font-weight: 800; }
.metric-label { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
.last-meal    { font-size: 11px; color: #9CA3AF; }
</style>
