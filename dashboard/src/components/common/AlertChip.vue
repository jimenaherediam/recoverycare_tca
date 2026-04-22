<template>
  <v-chip :color="chipColor" size="small" :variant="variant" class="font-weight-bold">
    <v-icon start size="14">{{ chipIcon }}</v-icon>
    {{ label }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nivel:   { type: String, default: 'BAJO' },
  variant: { type: String, default: 'tonal' },
})

const map = {
  ALTO:  { color: 'error',   icon: 'mdi-alert-circle', label: 'Alto' },
  MEDIO: { color: 'warning', icon: 'mdi-alert',         label: 'Medio' },
  BAJO:  { color: 'success', icon: 'mdi-information',   label: 'Bajo' },
}

const chipColor = computed(() => map[props.nivel]?.color || 'grey')
const chipIcon  = computed(() => map[props.nivel]?.icon  || 'mdi-help')
const label     = computed(() => map[props.nivel]?.label || props.nivel)
</script>
