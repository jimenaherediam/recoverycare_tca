<template>
  <div>
    <v-btn variant="text" color="primary" class="mb-4 px-1" @click="$router.back()">
      <v-icon start>mdi-arrow-left</v-icon> Volver
    </v-btn>

    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <template v-else-if="patient">
      <!-- Cabecera del paciente -->
      <v-card elevation="0" class="patient-header mb-5" style="overflow:hidden">
        <div class="header-gradient" />
        <v-card-text style="position:relative; padding-top:28px">
          <div class="d-flex align-center gap-4 flex-wrap">
            <v-avatar color="white" size="72" style="border:3px solid #EDE9FE">
              <span class="text-h5 font-weight-bold" style="color: #7C3AED">{{ initials(patient.nombre) }}</span>
            </v-avatar>
            <div class="flex-1">
              <h2 class="text-h5 font-weight-bold text-white mb-1">{{ patient.nombre }}</h2>
            </div>
            <AlertChip :nivel="overallStatus" />
          </div>
        </v-card-text>
      </v-card>

      <!-- Tabs -->
      <v-tabs v-model="tab" color="primary" class="mb-4">
        <v-tab value="overview">Resumen</v-tab>
        <v-tab value="meals">Comidas ({{ patient.comidas?.length || 0 }})</v-tab>
        <v-tab value="alerts">Alertas ({{ alerts.length }})</v-tab>
        <v-tab value="plans">Planes</v-tab>
        <v-tab value="appointments">Citas</v-tab>
        <v-tab value ="chat">Chat IA</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- RESUMEN -->
        <v-window-item value="overview">
          <v-row>
            <v-col cols="12" md="7">
              <v-card elevation="0" class="section-card">
                <v-card-title class="section-title">Evolución de ansiedad (30 días)</v-card-title>
                <v-card-text>
                  <AnxietyChart v-if="evolution.length" :data="evolution" :height="230" />
                  <div v-else class="empty-state">Sin datos de evolución</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="5">
              <v-card elevation="0" class="section-card mb-4">
                <v-card-title class="section-title">Tipos de alerta</v-card-title>
                <v-card-text>
                  <AlertsBarChart v-if="alerts.length" :data="alerts" :height="190" />
                  <div v-else class="empty-state">Sin alertas registradas</div>
                </v-card-text>
              </v-card>
              <v-card elevation="0" class="section-card">
                <v-card-title class="section-title">Estadísticas</v-card-title>
                <v-card-text>
                  <div class="stat-row">
                    <span class="stat-key">Comidas registradas</span>
                    <span class="stat-val">{{ patient.comidas?.length || 0 }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-key">Alertas sin revisar</span>
                    <span class="stat-val text-warning">{{ alerts.filter(a => !a.revisada).length }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-key">Alertas críticas</span>
                    <span class="stat-val text-error">{{ alerts.filter(a => a.nivel === 'ALTO').length }}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-key">Ansiedad media</span>
                    <span class="stat-val text-primary">
                      {{ avgAnxiety != null ? avgAnxiety.toFixed(1) + ' / 10' : '—' }}
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- COMIDAS -->
        <v-window-item value="meals">
          <v-card elevation="0" class="section-card">
            <v-card-text>
              <div v-if="!patient.comidas?.length" class="empty-state py-8">Sin registros de comidas</div>
              <div v-for="meal in patient.comidas" :key="meal.id" class="meal-row">
                <div class="meal-header">
                  <div class="d-flex align-center gap-2 flex-wrap">
                    <v-chip size="x-small" color="primary" variant="tonal">{{ meal.analisis?.tipo_ingesta || 'OTRO' }}</v-chip>
                    <span class="meal-date">{{ formatDate(meal.fecha) }}</span>
                    <v-chip v-if="meal.acompanado" size="x-small" color="success" variant="tonal">Acompañado</v-chip>
                    <v-chip v-if="meal.analisis?.camara_oculta" size="x-small" color="error" variant="tonal">
                      <v-icon start size="11">mdi-camera-off</v-icon>Cámara oculta
                    </v-chip>
                  </div>
                  <div v-if="meal.analisis" class="meal-anxiety" :style="`color:${anxColor(meal.analisis.nivel_ansiedad)}`">
                    <v-icon size="14" :color="anxColor(meal.analisis.nivel_ansiedad)">mdi-emoticon-outline</v-icon>
                    Ansiedad: {{ Number(meal.analisis.nivel_ansiedad).toFixed(1) }} / 10
                  </div>
                </div>
                <p class="meal-desc">{{ meal.menu_descripcion || 'Sin descripción' }}</p>
                <p v-if="meal.analisis?.resultado" class="meal-ia">
                  <v-icon size="13" color="primary">mdi-robot-outline</v-icon>
                  {{ meal.analisis.resultado }}
                </p>
                <div v-if="meal.alertas?.length" class="d-flex gap-2 mt-2 flex-wrap">
                  <AlertChip v-for="a in meal.alertas" :key="a.id" :nivel="a.nivel" variant="tonal" />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- ALERTAS -->
        <v-window-item value="alerts">
          <v-card elevation="0" class="section-card">
            <v-card-text>
              <div v-if="!alerts.length" class="empty-state py-8">Sin alertas para este paciente</div>
              <div
                v-for="alert in alerts" :key="alert.id"
                class="alert-row" :class="{ 'op-50': alert.revisada }"
              >
                <AlertChip :nivel="alert.nivel" />
                <div class="ml-3 flex-1">
                  <div class="alert-desc">{{ alert.descripcion }}</div>
                  <div class="alert-meta">{{ tipoLabel(alert.tipo) }} · {{ formatDate(alert.fecha) }}</div>
                </div>
                <v-btn v-if="!alert.revisada" size="small" variant="tonal" color="primary" @click="reviewAlert(alert)">
                  Revisar
                </v-btn>
                <v-chip v-else size="x-small" color="success" variant="tonal">Revisada</v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- PLANES -->
        <v-window-item value="plans">
          <v-card elevation="0" class="section-card mb-4">
            <v-card-title class="section-title d-flex align-center justify-space-between">
              Planes personalizados
              <v-btn size="small" color="secondary" variant="flat" @click="showPlanDialog = true">
                <v-icon start>mdi-plus</v-icon> Nuevo plan
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="!plans.length" class="empty-state py-8">Sin planes asignados</div>
              <div v-for="plan in plans" :key="plan.id" class="plan-row">
                <div class="d-flex align-center gap-2 mb-2 flex-wrap">
                  <v-chip size="small" :color="planColor(plan.tipo)" variant="tonal">{{ plan.tipo }}</v-chip>
                  <span class="plan-date">Desde {{ formatShort(plan.fecha_inicio) }}</span>
                  <v-chip :color="plan.activo ? 'success' : 'grey'" size="x-small" variant="tonal">
                    {{ plan.activo ? 'Activo' : 'Finalizado' }}
                  </v-chip>
                  <v-spacer />
                  <v-btn size="x-small" variant="text" color="primary" @click="togglePlan(plan)">
                    {{ plan.activo ? 'Desactivar' : 'Activar' }}
                  </v-btn>
                </div>
                <p class="plan-desc">{{ plan.descripcion }}</p>
                <p class="plan-content">{{ plan.contenido }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- CITAS -->
        <v-window-item value="appointments">
          <v-card elevation="0" class="section-card">
            <v-card-title class="section-title d-flex align-center justify-space-between">
              Citas
              <v-btn size="small" color="secondary" variant="flat" @click="showApptDialog = true">
                <v-icon start>mdi-plus</v-icon> Nueva cita
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="!appointments.length" class="empty-state py-8">Sin citas registradas</div>
              <div v-for="cita in appointments" :key="cita.id" class="appt-row">
                <div class="appt-time-badge">{{ formatTime(cita.fecha) }}</div>
                <div class="ml-3">
                  <div class="appt-date">{{ formatDate(cita.fecha) }}</div>
                  <div class="appt-motivo">{{ cita.motivo || 'Sin motivo especificado' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>
      
      <!-- CHAT -->
      
      <v-window-item value="chat">
        <v-row>
          <v-col cols="12">
            <v-card elevation="0" class="section-card">
              <v-card-text>
                <div v-if="loadingChat" class="text-center py-4">
                  <v-progress-circular indeterminate color="primary" size="24" />
                </div>
                <div v-else-if="!chatHistory.length" class="empty-state py-8">
                  El paciente no ha interactuado con el asistente aún.
                </div>
                <div v-else class="chat-container">
                  <div 
                    v-for="msg in chatHistory" 
                    :key="msg.id_chatbot" 
                    class="chat-message"
                    :class="{ 'message-user': msg.role === 'user', 'message-ia': msg.role === 'assistant' }"
                  >
                    <div class="message-meta">
                      <strong>{{ msg.role === 'user' ? patient.nombre : 'Asistente IA' }}</strong>
                      <span class="ml-2 text-caption text-grey">{{ formatDate(msg.fecha) }}</span>
                    </div>
                    <div class="message-content">{{ msg.mensaje }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
      </v-window>
    </template>
    

    <!-- Dialog: nuevo plan -->
    <v-dialog v-model="showPlanDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="pt-5 pb-2 px-6 font-weight-bold">Nuevo plan personalizado</v-card-title>
        <v-card-text class="px-6">
          <v-select v-model="planForm.tipo" :items="planTypes" label="Tipo de plan" class="mb-3" />
          <v-text-field v-model="planForm.descripcion" label="Descripción breve" class="mb-3" />
          <v-textarea v-model="planForm.contenido" label="Contenido detallado" rows="4" />
        </v-card-text>
        <v-card-actions class="pb-4 px-6">
          <v-spacer />
          <v-btn variant="text" @click="showPlanDialog = false">Cancelar</v-btn>
          <v-btn color="secondary" variant="flat" :loading="saving" @click="createPlan">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: nueva cita -->
    <v-dialog v-model="showApptDialog" max-width="460">
      <v-card rounded="xl">
        <v-card-title class="pt-5 pb-2 px-6 font-weight-bold">Nueva cita</v-card-title>
        <v-card-text class="px-6">
          <v-text-field v-model="apptForm.fecha" label="Fecha y hora" type="datetime-local" class="mb-3" />
          <v-text-field v-model="apptForm.motivo" label="Motivo (opcional)" />
        </v-card-text>
        <v-card-actions class="pb-4 px-6">
          <v-spacer />
          <v-btn variant="text" @click="showApptDialog = false">Cancelar</v-btn>
          <v-btn color="secondary" variant="flat" :loading="saving" @click="createAppt">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { professionalAPI, alertsAPI } from '@/api'
import AlertChip from '@/components/common/AlertChip.vue'
import AnxietyChart from '@/components/charts/AnxietyChart.vue'
import AlertsBarChart from '@/components/charts/AlertsBarChart.vue'

const route = useRoute()
const patientId = computed(() => Number(route.params.id))

const tab         = ref('overview')
const loading     = ref(true)
const saving      = ref(false)
const patient     = ref(null)
const evolution   = ref([])
const alerts      = ref([])
const plans       = ref([])
const appointments = ref([])
const chatHistory = ref([])
const loadingChat = ref(false)
const showPlanDialog = ref(false)
const showApptDialog = ref(false)

const planForm = reactive({ tipo: 'MENU', descripcion: '', contenido: '' })
const apptForm = reactive({ fecha: '', motivo: '' })
const planTypes = ['MENU', 'MEDICAMENTOS', 'EJERCICIOS', 'OTROS']

const overallStatus = computed(() => {
  if (alerts.value.some((a) => a.nivel === 'ALTO' && !a.revisada)) return 'ALTO'
  if (alerts.value.some((a) => a.nivel === 'MEDIO' && !a.revisada)) return 'MEDIO'
  return 'BAJO'
})

const avgAnxiety = computed(() => {
  const vals = evolution.value.map((e) => e.nivel_ansiedad).filter((v) => v != null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
})

function initials(n) { return n?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?' }
function formatDate(d) { try { return format(new Date(d), "d MMM yyyy, HH:mm", { locale: es }) } catch { return '' } }
function formatShort(d) { try { return format(new Date(d), "d MMM yyyy", { locale: es }) } catch { return '' } }
function formatTime(d)  { try { return format(new Date(d), 'HH:mm') } catch { return '' } }
function anxColor(v)    { return v >= 7 ? '#EF4444' : v >= 4 ? '#F59E0B' : '#10B981' }
function planColor(t)   { return { MENU:'success', MEDICAMENTOS:'info', EJERCICIOS:'secondary', OTROS:'grey' }[t] || 'grey' }
function tipoLabel(t) {
  return { ANSIEDAD_ELEVADA:'Ansiedad elevada', CANTIDAD_INADECUADA:'Cantidad inadecuada',
           DESCONEXION_CAMARA:'Desconexión cámara', OCULTACION_CAMARA:'Ocultación cámara',
           TIEMPO_INADECUADO:'Tiempo inadecuado' }[t] || t
}

async function reviewAlert(alert) {
  await alertsAPI.markReviewed(alert.id)
  alert.revisada = true
}
async function createPlan() {
  saving.value = true
  try {
    await professionalAPI.createPlan(patientId.value, planForm)
    const { data } = await professionalAPI.patientPlans(patientId.value)
    plans.value = data
    showPlanDialog.value = false
    Object.assign(planForm, { tipo: 'MENU', descripcion: '', contenido: '' })
  } finally { saving.value = false }
}
async function togglePlan(plan) {
  await professionalAPI.togglePlan(patientId.value, plan.id)
  plan.activo = !plan.activo
}
async function createAppt() {
  saving.value = true
  try {
    await professionalAPI.createAppointment({
      patient_id: patientId.value,
      fecha: new Date(apptForm.fecha).toISOString(),
      motivo: apptForm.motivo || null,
    })
    const { data } = await professionalAPI.patientAppointments(patientId.value)
    appointments.value = data
    showApptDialog.value = false
    Object.assign(apptForm, { fecha: '', motivo: '' })
  } finally { saving.value = false }
}

onMounted(async () => {
  loading.value = true
  try {
    const [pd, ev, al, pl, ap] = await Promise.all([
      professionalAPI.patient(patientId.value),
      professionalAPI.evolution(patientId.value),
      professionalAPI.patientAlerts(patientId.value),
      professionalAPI.patientPlans(patientId.value),
      professionalAPI.patientAppointments(patientId.value),
    ])
    patient.value     = pd.data
    evolution.value   = ev.data
    alerts.value      = al.data
    plans.value       = pl.data
    appointments.value = ap.data

    loadingChat.value = true;
    try {
        const chatRes = await professionalAPI.patientChatHistory(patientId.value);
        chatHistory.value = chatRes.data;
    } catch (e) {
        console.error("Error cargando el chat", e);
    } finally {
        loadingChat.value = false;
    }
  } finally { loading.value = false }
})
</script>

<style scoped>
.header-gradient {
  height: 116px;
  background: linear-gradient(120deg, #4C1D95 0%, #7C3AED 60%, #C084FC 100%);
  position: absolute; top: 0; left: 0; right: 0;
}

.section-card { border:1px solid #EDE9FE; }
.section-title { font-size:14px !important; font-weight:700; color:#1F2937; padding:14px 16px 10px; }

.meal-row { padding:14px 0; border-bottom:1px solid #F3F4F6; }
.meal-row:last-child { border-bottom:none; }
.meal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; flex-wrap:wrap; gap:8px; }
.meal-date { font-size:12px; color:#6B7280; }
.meal-anxiety { display:flex; align-items:center; gap:4px; font-size:12px; font-weight:600; }
.meal-desc { font-size:13px; color:#374151; margin:0; }
.meal-ia { font-size:12px; color:#6B7280; margin:4px 0 0; font-style:italic; display:flex; align-items:flex-start; gap:4px; }

.alert-row { display:flex; align-items:center; padding:12px 0; border-bottom:1px solid #F3F4F6; }
.alert-row:last-child { border-bottom:none; }
.op-50 { opacity:0.5; }
.alert-desc { font-size:13px; font-weight:500; color:#1F2937; }
.alert-meta { font-size:11px; color:#9CA3AF; margin-top:2px; }

.plan-row { padding:14px 0; border-bottom:1px solid #F3F4F6; }
.plan-row:last-child { border-bottom:none; }
.plan-date { font-size:11px; color:#9CA3AF; }
.plan-desc { font-size:13px; font-weight:600; color:#1F2937; margin:0 0 4px; }
.plan-content { font-size:12px; color:#6B7280; margin:0; white-space:pre-wrap; }

.appt-row { display:flex; align-items:center; padding:12px 0; border-bottom:1px solid #F3F4F6; }
.appt-row:last-child { border-bottom:none; }
.appt-time-badge {
  min-width:48px; background:#EDE9FE; color:#7C3AED;
  font-size:13px; font-weight:700; border-radius:8px;
  padding:5px 8px; text-align:center;
}
.appt-date { font-size:13px; font-weight:600; color:#1F2937; }
.appt-motivo { font-size:12px; color:#9CA3AF; }

.stat-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid #F3F4F6; }
.stat-row:last-child { border-bottom:none; }
.stat-key { font-size:13px; color:#6B7280; }
.stat-val { font-size:15px; font-weight:700; }

.empty-state { text-align:center; color:#9CA3AF; font-size:14px; }

.chat-container { display: flex; flex-direction: column; gap: 16px; }
.chat-message { padding: 12px; border-radius: 8px; max-width: 85%; }
.message-user { align-self: flex-end; background-color: #EDE9FE; border-bottom-right-radius: 0; }
.message-ia { align-self: flex-start; background-color: #F3F4F6; border-bottom-left-radius: 0; }
.message-meta { margin-bottom: 4px; font-size: 13px; }
.message-content { font-size: 14px; color: #374151; white-space: pre-wrap; }
</style>
