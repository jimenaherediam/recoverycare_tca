<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="view-title">Alertas</h2>
        <p class="view-sub">{{ pendingCount }} pendientes · {{ store.allAlerts.length }} total</p>
      </div>
      <v-btn color="primary" variant="tonal" :loading="reviewing" @click="reviewAll">
        <v-icon start>mdi-check-all</v-icon> Marcar todas revisadas
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card elevation="0" class="filters-card mb-4">
      <v-card-text class="d-flex gap-3 flex-wrap align-center">
        <v-select v-model="filterNivel" :items="nivelOpts" label="Nivel" hide-details density="compact"
          style="max-width:150px" clearable />
        <v-select v-model="filterTipo" :items="tipoOpts" label="Tipo" hide-details density="compact"
          style="max-width:220px" clearable />
        <v-select v-model="filterEstado" :items="estadoOpts" label="Estado" hide-details density="compact"
          style="max-width:150px" />
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" placeholder="Buscar..."
          hide-details density="compact" style="max-width:220px" />
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card elevation="0" class="section-card">
      <v-data-table
        :headers="headers"
        :items="filteredAlerts"
        :loading="store.loading"
        items-per-page="15"
        class="alerts-table"
        hover
      >
        <template #item.nivel="{ item }">
          <AlertChip :nivel="item.nivel" />
        </template>
        <template #item.tipo_alerta="{ item }">
          <span class="tipo-label">{{ tipoLabel(item.tipo_alerta) }}</span>
        </template>
        <template #item.fecha="{ item }">
          <span class="date-text">{{ formatDate(item.fecha) }}</span>
        </template>
        <template #item.revisada="{ item }">
          <v-chip :color="item.revisada ? 'success' : 'warning'" size="x-small" variant="tonal">
            {{ item.revisada ? 'Revisada' : 'Pendiente' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn v-if="!item.revisada" size="small" variant="tonal" color="primary"
            @click="markReviewed(item)">
            Revisar
          </v-btn>
        </template>
        <template #no-data>
          <div class="text-center py-8 text-medium-emphasis">
            <v-icon size="40" class="mb-2">mdi-bell-check-outline</v-icon>
            <p>No hay alertas que mostrar</p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDashboardStore } from '@/stores/dashboard'
import AlertChip from '@/components/common/AlertChip.vue'

const store = useDashboardStore()
const reviewing   = ref(false)
const filterNivel  = ref(null)
const filterTipo   = ref(null)
const filterEstado = ref('pendiente')
const search       = ref('')

const nivelOpts = ['ALTO', 'MEDIO', 'BAJO']
const tipoOpts  = ['ANSIEDAD_ELEVADA','CANTIDAD_INADECUADA','DESCONEXION_CAMARA','OCULTACION_CAMARA','TIEMPO_INADECUADO']
const estadoOpts = [
  { title: 'Todas',     value: 'all' },
  { title: 'Pendientes', value: 'pendiente' },
  { title: 'Revisadas',  value: 'revisada' },
]

const headers = [
  { title: 'Nivel',       key: 'nivel',       width: 110 },
  { title: 'Tipo',        key: 'tipo_alerta' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Fecha',       key: 'fecha',       width: 160 },
  { title: 'Estado',      key: 'revisada',    width: 120 },
  { title: '',            key: 'actions',     width: 100, sortable: false },
]

const pendingCount = computed(() => store.allAlerts.filter((a) => !a.revisada).length)

const filteredAlerts = computed(() => {
  let list = store.allAlerts
  if (filterNivel.value)  list = list.filter((a) => a.nivel === filterNivel.value)
  if (filterTipo.value)   list = list.filter((a) => a.tipo_alerta === filterTipo.value)
  if (filterEstado.value === 'pendiente') list = list.filter((a) => !a.revisada)
  else if (filterEstado.value === 'revisada') list = list.filter((a) => a.revisada)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((a) => a.descripcion?.toLowerCase().includes(q))
  }
  const p = { ALTO: 0, MEDIO: 1, BAJO: 2 }
  return [...list].sort((a, b) => (p[a.nivel] ?? 3) - (p[b.nivel] ?? 3))
})

function tipoLabel(t) {
  return { ANSIEDAD_ELEVADA:'Ansiedad elevada', CANTIDAD_INADECUADA:'Cantidad inadecuada',
           DESCONEXION_CAMARA:'Desconexión cámara', OCULTACION_CAMARA:'Ocultación cámara',
           TIEMPO_INADECUADO:'Tiempo inadecuado' }[t] || t
}
function formatDate(d) { try { return format(new Date(d), "d MMM yyyy, HH:mm", { locale: es }) } catch { return '' } }

async function markReviewed(alert) {
  await store.markAlertReviewed(alert.id_alerta)
}
async function reviewAll() {
  reviewing.value = true
  try {
    const pending = store.allAlerts.filter((a) => !a.revisada)
    await Promise.all(pending.map((a) => store.markAlertReviewed(a.id_alerta)))
  } finally { reviewing.value = false }
}
</script>

<style scoped>
.view-title { font-size: 22px; font-weight: 700; color: #1F2937; }
.view-sub   { font-size: 13px; color: #6B7280; margin-top: 2px; }
.filters-card { border: 1px solid #EDE9FE; }
.section-card { border: 1px solid #EDE9FE; overflow: hidden; }
.tipo-label { font-size: 12px; color: #4B5563; }
.date-text  { font-size: 12px; color: #9CA3AF; }
</style>
