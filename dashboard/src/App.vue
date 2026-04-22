<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
onMounted(() => {
  if (auth.token && !auth.user) auth.fetchMe()
})
</script>

<style>
* { font-family: 'Inter', sans-serif; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #F5F3FF; }
::-webkit-scrollbar-thumb { background: #C084FC; border-radius: 4px; }
</style>
