<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="view-title">Planes Personalizados</h2>
        <p class="view-sub">Gestión de planes para todos tus pacientes</p>
      </div>
      <v-btn color="secondary" variant="flat" @click="showDialog = true">
        <v-icon start>mdi-plus</v-icon> Nuevo plan
      </v-btn>
    </div>

    <!-- Filtro por tipo -->
    <div class="d-flex gap-2 mb-5 flex-wrap">
      <v-btn
        v-for="f in typeFilters" :key="f.value"
        size="small" rounded="pill"
        :variant="activeType === f.value ? 'flat' : 'tonal'"
        :color="activeType === f.value ? 'primary' : 'grey'"
        @click="activeType = f.value"
      >
        <v-icon start size="14">{{ f.icon }}</v-icon>{{ f.label }}
      </v-btn>
    </div>

    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <template v-else>
      <div v-if="!filteredPatients.length" class="text-center py-12">
        <v-icon size="52" color="grey-lighten-2">mdi-clipboard-outline</v-icon>
        <p class="mt-4 text-medium-emphasis">No hay planes que mostrar</p>
      </div>

      <v-card
        v-for="entry in filteredPatients"
        :key="entry.patient.id"
        elevation="0" class="section-card mb-4"
      >
        <v-card-title class="section-title d-flex align-center gap-3">
          <v-avatar color="primary" size="32">
            <span class="text-caption font-weight-bold text-white">{{ initials(entry.patient.nombre) }}</span>
          </v-avatar>
          <router-link :to="`/pacientes/${entry.patient.id}`" class="patient-link">
            {{ entry.patient.nombre }}
          </router-link>
          <v-chip size="x-small" color="grey" variant="tonal">{{ entry.plans.length }} plan(es)</v-chip>
        </v-card-title>
        <v-card-text class="pt-0">
          <div v-for="plan in entry.plans" :key="plan.id" class="plan-row">
            <div class="d-flex align-center gap-2 mb-2 flex-wrap">
              <v-chip size="small" :color="planColor(plan.tipo)" variant="tonal">
                <v-icon start size="13">{{ planIcon(plan.tipo) }}</v-icon>
                {{ plan.tipo }}
              </v-chip>
              <v-chip :color="plan.activo ? 'success' : 'grey'" size="x-small" variant="tonal">
                {{ plan.activo ? 'Activo' : 'Finalizado' }}
              </v-chip>
              <span class="plan-date">desde {{ fDate(plan.fecha_inicio) }}</span>
              <v-spacer />
              <v-btn size="x-small" variant="text" color="primary" @click="togglePlan(entry.patient.id, plan)">
                {{ plan.activo ? 'Desactivar' : 'Activar' }}
              </v-btn>
            </div>
            <p class="plan-desc">{{ plan.descripcion }}</p>
            <p class="plan-content">{{ plan.contenido }}</p>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <!-- Dialog -->
    <v-dialog v-model="showDialog" max-width="540">
      <v-card rounded="xl">
        <v-card-title class="pt-5 pb-2 px-6 font-weight-bold">Nuevo plan personalizado</v-card-title>
        <v-card-text class="px-6">
          <v-select v-model="form.patient_id" :items="store.patients"
            item-title="nombre" item-value="id" label="Paciente" class="mb-3" />
          <v-select v-model="form.tipo" :items="['MENU','MEDICAMENTOS','EJERCICIOS','OTROS']"
            label="Tipo de plan" class="mb-3" />
          <v-text-field v-model="form.descripcion" label="Descripción breve" class="mb-3" />
          <v-textarea v-model="form.contenido" label="Contenido detallado" rows="4" />
        </v-card-text>
        <v-card-actions class="pb-4 px-6">
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Cancelar</v-btn>
          <v-btn color="secondary" variant="flat" :loading="saving" @click="createPlan">Crear plan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDashboardStore } from '@/stores/dashboard'
import { professionalAPI } from '@/api'

const store = useDashboardStore()
const loading    = ref(false)
const saving     = ref(false)
const showDialog = ref(false)
const activeType = ref('all')
const allPlans   = ref({})

const form = reactive({ patient_id: null, tipo: 'MENU', descripcion: '', contenido: '' })

const typeFilters = [
  { label: 'Todos',        value: 'all',          icon: 'mdi-view-list' },
  { label: 'Menú',         value: 'MENU',         icon: 'mdi-food' },
  { label: 'Medicamentos', value: 'MEDICAMENTOS',  icon: 'mdi-pill' },
  { label: 'Ejercicios',   value: 'EJERCICIOS',   icon: 'mdi-run' },
  { label: 'Otros',        value: 'OTROS',        icon: 'mdi-dots-horizontal' },
]

const filteredPatients = computed(() =>
  store.patients
    .map((p) => {
      let plans = allPlans.value[p.id] || []
      if (activeType.value !== 'all') plans = plans.filter((pl) => pl.tipo === activeType.value)
      return { patient: p, plans }
    })
    .filter((e) => e.plans.length > 0)
)

function initials(n)    { return n?.split(' ').slice(0,2).map((w)=>w[0]).join('').toUpperCase()||'?' }
function planColor(t)   { return {MENU:'success',MEDICAMENTOS:'info',EJERCICIOS:'secondary',OTROS:'grey'}[t]||'grey' }
function planIcon(t)    { return {MENU:'mdi-food',MEDICAMENTOS:'mdi-pill',EJERCICIOS:'mdi-run',OTROS:'mdi-dots-horizontal'}[t]||'mdi-clipboard' }
function fDate(d)       { try { return format(new Date(d),"d MMM yyyy",{locale:es}) } catch { return '' } }

async function loadAllPlans() {
  loading.value = true
  try {
    const results = await Promise.all(
      store.patients.map((p) =>
        professionalAPI.patientPlans(p.id).then(({ data }) => ({ id: p.id, plans: data }))
      )
    )
    results.forEach(({ id, plans }) => { allPlans.value[id] = plans })
  } finally { loading.value = false }
}

async function togglePlan(patientId, plan) {
  await professionalAPI.togglePlan(patientId, plan.id)
  plan.activo = !plan.activo
}

async function createPlan() {
  saving.value = true
  try {
    await professionalAPI.createPlan(form.patient_id, {
      tipo: form.tipo,
      descripcion: form.descripcion,
      contenido: form.contenido,
    })
    const { data } = await professionalAPI.patientPlans(form.patient_id)
    allPlans.value[form.patient_id] = data
    showDialog.value = false
    Object.assign(form, { patient_id: null, tipo: 'MENU', descripcion: '', contenido: '' })
  } finally { saving.value = false }
}

onMounted(async () => {
  if (!store.patients.length) await store.fetchPatients()
  await loadAllPlans()
})
</script>

<style scoped>
.view-title { font-size: 22px; font-weight: 700; color: #1F2937; }
.view-sub   { font-size: 13px; color: #6B7280; margin-top: 2px; }
.section-card { border: 1px solid #EDE9FE; }
.section-title { font-size:14px !important; font-weight:700; color:#1F2937; padding:14px 16px; }
.patient-link { color:#7C3AED; text-decoration:none; font-weight:700; font-size:15px; }
.patient-link:hover { text-decoration:underline; }
.plan-row { padding:12px 0; border-bottom:1px solid #F3F4F6; }
.plan-row:last-child { border-bottom:none; }
.plan-date    { font-size:11px; color:#9CA3AF; }
.plan-desc    { font-size:13px; font-weight:600; color:#1F2937; margin:0 0 4px; }
.plan-content { font-size:12px; color:#6B7280; margin:0; white-space:pre-wrap; }
</style>
