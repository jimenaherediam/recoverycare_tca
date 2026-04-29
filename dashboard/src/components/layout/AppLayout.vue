<template>
  <v-app>
    <!-- ── Sidebar ───────────────────────────────────────────────────── -->
    <v-navigation-drawer width="260" permanent class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <v-icon color="white" size="30">mdi-heart-pulse</v-icon>
        <div class="ml-3">
          <div class="logo-title">RecoveryCare</div>
          <div class="logo-sub">Panel Profesional</div>
        </div>
      </div>

      <v-divider class="sidebar-divider" />

      <!-- Nav items -->
      <v-list nav class="px-3 mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          class="nav-item mb-1"
          active-class="nav-item-active"
        >
          <template v-if="item.badge && item.badge > 0" #append>
            <v-chip size="x-small" color="secondary" class="font-weight-bold">
              {{ item.badge > 99 ? '99+' : item.badge }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>

      <!-- User info at bottom -->
      <template #append>
        <!-- Código profesional destacado -->
        <div v-if="auth.user?.codigo_profesional" class="code-banner mx-3 mb-3 pa-3 rounded-lg">
          <div class="code-label mb-1">
            <v-icon size="13" color="secondary" class="mr-1">mdi-identifier</v-icon>
            Tu código de acceso
          </div>
          <div class="code-value">{{ auth.user.codigo_profesional }}</div>
          <div class="code-hint">Compártelo con tus pacientes al registrarse</div>
        </div>
        <v-divider class="sidebar-divider" />
        <div class="sidebar-user">
          <v-avatar color="secondary" size="38">
            <span class="text-body-2 font-weight-bold" style="color:#1C1917">{{ auth.initials }}</span>
          </v-avatar>
          <div class="ml-3 flex-1 overflow-hidden">
            <div class="user-name text-truncate">{{ auth.user?.nombre }}</div>
            <div class="user-role">{{ auth.user?.especialidad }}</div>
            <div v-if="auth.user?.codigo_profesional" class="user-code mt-1">
              <v-icon size="10" color="secondary" class="mr-1">mdi-identifier</v-icon>
              {{ auth.user.codigo_profesional }}
            </div>
          </div>
          <v-btn
            icon
            size="small"
            variant="text"
            color="white"
            @click="doLogout"
          >
            <v-icon size="18">mdi-logout</v-icon>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ── Top bar ────────────────────────────────────────────────────── -->
    <v-app-bar elevation="0" class="app-bar" height="64">
      <v-app-bar-title>
        <span class="page-title">{{ currentTitle }}</span>
      </v-app-bar-title>
      <template #append>
        <v-btn icon class="mr-1" :to="{ name: 'Alerts' }">
          <v-badge
            :content="pendingAlerts"
            color="error"
            :model-value="pendingAlerts > 0"
          >
            <v-icon color="primary">mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        <v-chip color="primary" variant="tonal" class="mr-4 font-weight-medium">
          <v-icon start size="16">mdi-shield-account</v-icon>
          {{ auth.user?.especialidad || 'Profesional' }}
        </v-chip>
      </template>
    </v-app-bar>

    <!-- ── Main ───────────────────────────────────────────────────────── -->
    <v-main class="main-bg">
      <div class="pa-6">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const auth = useAuthStore()
const store = useDashboardStore()
const route = useRoute()
const router = useRouter()

const pageTitles = {
  Dashboard: 'Inicio',
  Patients: 'Pacientes',
  PatientDetail: 'Detalle del Paciente',
  Alerts: 'Alertas',
  Appointments: 'Citas',
  Plans: 'Planes Personalizados',
}

const currentTitle = computed(() => pageTitles[route.name] || 'RecoveryCare')
const pendingAlerts = computed(() => store.stats.alertas_pendientes || 0)

const navItems = computed(() => [
  { to: '/',          icon: 'mdi-view-dashboard-outline',  title: 'Inicio' },
  { to: '/pacientes', icon: 'mdi-account-group-outline',   title: 'Pacientes' },
  { to: '/alertas',   icon: 'mdi-bell-alert-outline',      title: 'Alertas', badge: pendingAlerts.value },
  { to: '/citas',     icon: 'mdi-calendar-clock-outline',  title: 'Citas' },
  { to: '/planes',    icon: 'mdi-clipboard-list-outline',  title: 'Planes' },
])

function doLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => store.loadAll())
</script>

<style scoped>
.sidebar {
  background: linear-gradient(160deg, #3B0764 0%, #6D28D9 60%, #7C3AED 100%) !important;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 20px 20px 16px;
}
.logo-title {
  color: white;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}
.logo-sub {
  color: rgba(255,255,255,0.55);
  font-size: 11px;
}
.sidebar-divider {
  border-color: rgba(255,255,255,0.15) !important;
}
.nav-item {
  color: rgba(255,255,255,0.75) !important;
}
.nav-item:hover {
  background: rgba(255,255,255,0.1) !important;
  color: white !important;
}
.nav-item-active {
  background: rgba(245,158,11,0.25) !important;
  color: #FDE68A !important;
}
.sidebar-user {
  display: flex;
  align-items: center;
  padding: 14px 16px;
}
.user-name {
  color: white;
  font-size: 13px;
  font-weight: 600;
}
.user-role {
  color: rgba(255,255,255,0.55);
  font-size: 11px;
}
.user-code {
  color: #FDE68A;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.code-banner {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(245,158,11,0.4);
}
.code-label {
  color: rgba(255,255,255,0.6);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
}
.code-value {
  color: #FDE68A;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.code-hint {
  color: rgba(255,255,255,0.45);
  font-size: 10px;
  margin-top: 4px;
  line-height: 1.3;
}
.app-bar {
  border-bottom: 1px solid #EDE9FE !important;
  background: white !important;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #4C1D95;
}
.main-bg {
  background: #F5F3FF !important;
}
</style>
