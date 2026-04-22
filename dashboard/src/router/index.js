import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'pacientes', name: 'Patients', component: () => import('@/views/PatientsView.vue') },
      {
        path: 'pacientes/:id',
        name: 'PatientDetail',
        component: () => import('@/views/PatientDetailView.vue'),
      },
      { path: 'alertas', name: 'Alerts', component: () => import('@/views/AlertsView.vue') },
      {
        path: 'citas',
        name: 'Appointments',
        component: () => import('@/views/AppointmentsView.vue'),
      },
      { path: 'planes', name: 'Plans', component: () => import('@/views/PlansView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.token && !auth.user) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login' }
  }

  if (to.name === 'Login' && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }
})

export default router
