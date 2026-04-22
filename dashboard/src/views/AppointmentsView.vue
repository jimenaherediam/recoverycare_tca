<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="view-title">Citas</h2>
        <p class="view-sub">Gestión de citas con pacientes</p>
      </div>
      <v-btn color="secondary" variant="flat" @click="showDialog = true">
        <v-icon start>mdi-plus</v-icon> Nueva cita
      </v-btn>
    </div>

    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="today">Hoy ({{ todayList.length }})</v-tab>
      <v-tab value="upcoming">Próximas ({{ upcomingList.length }})</v-tab>
      <v-tab value="past">Pasadas ({{ pastList.length }})</v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item v-for="(list, key) in { today: todayList, upcoming: upcomingList, past: pastList }"
        :key="key" :value="key">
        <v-card elevation="0" class="section-card">
          <v-card-text class="pa-0">
            <div v-if="!list.length" class="empty-state py-10">
              <v-icon size="44" color="grey-lighten-2">mdi-calendar-blank-outline</v-icon>
              <p class="mt-3 text-medium-emphasis">No hay citas en esta sección</p>
            </div>
            <div v-for="cita in list" :key="cita.id" class="cita-row">
              <div class="cita-date-block">
                <div class="cita-day">{{ fDay(cita.fecha) }}</div>
                <div class="cita-month">{{ fMonth(cita.fecha) }}</div>
              </div>
              <div class="cita-info">
                <div class="cita-time">
                  <v-icon size="14" color="primary">mdi-clock-outline</v-icon>
                  {{ fTime(cita.fecha) }}
                </div>
                <div class="cita-patient">
                  <v-icon size="14" color="grey">mdi-account</v-icon>
                  <router-link :to="`/pacientes/${cita.paciente_id}`" class="patient-link">
                    {{ cita.paciente_nombre }}
                  </router-link>
                </div>
                <div v-if="cita.motivo" class="cita-motivo">{{ cita.motivo }}</div>
              </div>
              <v-chip :color="isPast(cita.fecha) ? 'grey' : 'primary'" size="x-small" variant="tonal">
                {{ isPast(cita.fecha) ? 'Realizada' : 'Próxima' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Dialog nueva cita -->
    <v-dialog v-model="showDialog" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="pt-5 pb-2 px-6 font-weight-bold">Nueva cita</v-card-title>
        <v-card-text class="px-6">
          <v-select v-model="form.patient_id" :items="store.patients"
            item-title="nombre" item-value="id" label="Paciente" class="mb-3" />
          <v-text-field v-model="form.fecha" label="Fecha y hora" type="datetime-local" class="mb-3" />
          <v-text-field v-model="form.motivo" label="Motivo (opcional)" />
        </v-card-text>
        <v-card-actions class="pb-4 px-6">
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Cancelar</v-btn>
          <v-btn color="secondary" variant="flat" :loading="saving" @click="createAppt">Crear cita</v-btn>
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
const tab = ref('today')
const showDialog = ref(false)
const saving = ref(false)
const form = reactive({ patient_id: null, fecha: '', motivo: '' })

const now = new Date()

const todayList    = computed(() => store.appointments.filter((a) => new Date(a.fecha).toDateString() === now.toDateString()))
const upcomingList = computed(() => store.appointments.filter((a) => new Date(a.fecha) > now && new Date(a.fecha).toDateString() !== now.toDateString()).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)))
const pastList     = computed(() => store.appointments.filter((a) => new Date(a.fecha) < now && new Date(a.fecha).toDateString() !== now.toDateString()).sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)))

function isPast(d) { return new Date(d) < now }
function fDay(d)   { try { return format(new Date(d), 'd') } catch { return '' } }
function fMonth(d) { try { return format(new Date(d), 'MMM', { locale: es }).toUpperCase() } catch { return '' } }
function fTime(d)  { try { return format(new Date(d), 'HH:mm') } catch { return '' } }

async function createAppt() {
  saving.value = true
  try {
    await professionalAPI.createAppointment({
      patient_id: form.patient_id,
      fecha: new Date(form.fecha).toISOString(),
      motivo: form.motivo || null,
    })
    await store.fetchAppointments()
    await store.fetchStats()
    showDialog.value = false
    Object.assign(form, { patient_id: null, fecha: '', motivo: '' })
  } finally { saving.value = false }
}

onMounted(() => { if (!store.appointments.length) store.fetchAppointments() })
</script>

<style scoped>
.view-title { font-size: 22px; font-weight: 700; color: #1F2937; }
.view-sub   { font-size: 13px; color: #6B7280; margin-top: 2px; }
.section-card { border: 1px solid #EDE9FE; }

.cita-row { display:flex; align-items:center; gap:16px; padding:14px 16px; border-bottom:1px solid #F3F4F6; }
.cita-row:last-child { border-bottom:none; }
.cita-date-block { min-width:48px; text-align:center; background:linear-gradient(135deg,#EDE9FE,#DDD6FE); border-radius:12px; padding:8px 4px; }
.cita-day   { font-size:22px; font-weight:800; color:#7C3AED; line-height:1; }
.cita-month { font-size:10px; font-weight:600; color:#7C3AED; letter-spacing:.5px; }
.cita-info  { flex:1; display:flex; flex-direction:column; gap:3px; }
.cita-time  { font-size:13px; font-weight:700; color:#1F2937; display:flex; align-items:center; gap:4px; }
.cita-patient { font-size:12px; color:#6B7280; display:flex; align-items:center; gap:4px; }
.patient-link { color:#7C3AED; text-decoration:none; font-weight:600; }
.patient-link:hover { text-decoration:underline; }
.cita-motivo { font-size:12px; color:#9CA3AF; }
.empty-state { text-align:center; }
</style>
