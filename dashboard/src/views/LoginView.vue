<template>
  <v-app>
    <div class="login-bg">
      <!-- Panel izquierdo -->
      <div class="login-left">
        <div class="brand">
          <v-icon size="52" color="white" class="mb-4">mdi-heart-pulse</v-icon>
          <h1 class="brand-title">RecoveryCare</h1>
          <p class="brand-sub">Panel de Monitorización para Profesionales</p>
        </div>
        <div class="features">
          <div v-for="f in features" :key="f.text" class="feature-item">
            <v-icon :icon="f.icon" color="secondary" size="20" class="mr-3" />
            <span>{{ f.text }}</span>
          </div>
        </div>
      </div>

      <!-- Panel derecho -->
      <div class="login-right">
        <v-card class="login-card" elevation="0">
          <div class="text-center mb-8">
            <h2 class="login-title">Bienvenido</h2>
            <p class="login-sub">Accede con tus credenciales profesionales</p>
          </div>

          <v-form @submit.prevent="handleLogin" :disabled="auth.loading">
            <v-text-field
              v-model="form.email"
              label="Correo electrónico"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              class="mb-3"
            />
            <v-text-field
              v-model="form.password"
              label="Contraseña"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPwd ? 'mdi-eye-off' : 'mdi-eye'"
              :type="showPwd ? 'text' : 'password'"
              @click:append-inner="showPwd = !showPwd"
              class="mb-3"
            />
            <v-text-field
              v-model="form.codigo"
              label="Código profesional (opcional)"
              prepend-inner-icon="mdi-badge-account-outline"
              class="mb-4"
            />

            <v-alert v-if="auth.error" type="error" variant="tonal" class="mb-4" rounded="lg">
              {{ auth.error }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="auth.loading"
              class="login-btn"
            >
              Iniciar sesión
            </v-btn>
          </v-form>
        </v-card>
      </div>
    </div>
  </v-app>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const showPwd = ref(false)
const form = reactive({ email: '', password: '', codigo: '' })

const features = [
  { icon: 'mdi-account-group',   text: 'Gestión centralizada de pacientes' },
  { icon: 'mdi-bell-alert',      text: 'Alertas en tiempo real por severidad' },
  { icon: 'mdi-chart-line',      text: 'Evolución y gráficas clínicas' },
  { icon: 'mdi-clipboard-check', text: 'Planes y citas personalizadas' },
]

async function handleLogin() {
  const ok = await auth.login(form.email, form.password, form.codigo || undefined)
  if (ok) router.push('/')
}
</script>

<style scoped>
.login-bg { min-height: 100vh; display: flex; }

.login-left {
  flex: 1;
  background: linear-gradient(145deg, #3B0764 0%, #6D28D9 55%, #7C3AED 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 56px;
}
.brand { margin-bottom: 56px; }
.brand-title {
  color: white;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}
.brand-sub { color: rgba(255,255,255,0.65); font-size: 16px; }
.features { display: flex; flex-direction: column; gap: 20px; }
.feature-item {
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.85);
  font-size: 15px;
}

.login-right {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F3FF;
  padding: 40px 32px;
}
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  border-radius: 20px !important;
  background: white;
}
.login-title { font-size: 26px; font-weight: 700; color: #4C1D95; }
.login-sub { color: #6B7280; font-size: 14px; margin-top: 4px; }
.login-btn { border-radius: 10px !important; height: 48px !important; font-size: 15px !important; }

@media (max-width: 768px) {
  .login-left { display: none; }
  .login-right { width: 100%; }
}
</style>
