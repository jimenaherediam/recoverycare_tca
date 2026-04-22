<template>
  <apexchart type="bar" :height="height" :options="chartOptions" :series="series" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:   { type: Array, default: () => [] },
  height: { type: Number, default: 180 },
})

const tipoLabels = {
  ANSIEDAD_ELEVADA:   'Ansiedad elevada',
  CANTIDAD_INADECUADA:'Cantidad inadecuada',
  DESCONEXION_CAMARA: 'Desconexión cámara',
  OCULTACION_CAMARA:  'Ocultación cámara',
  TIEMPO_INADECUADO:  'Tiempo inadecuado',
}

const counts = computed(() => {
  const c = {}
  props.data.forEach((a) => {
    const k = tipoLabels[a.tipo] || a.tipo
    c[k] = (c[k] || 0) + 1
  })
  return c
})

const series = computed(() => [{ name: 'Alertas', data: Object.values(counts.value) }])

const chartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  colors: ['#F59E0B'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%', distributed: true } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: Object.keys(counts.value),
    labels: { style: { colors: '#9CA3AF', fontSize: '10px' }, rotate: -20 },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#9CA3AF', fontSize: '11px' } } },
  grid: { borderColor: '#F3F4F6' },
  legend: { show: false },
  tooltip: { y: { formatter: (v) => `${v} alerta(s)` } },
}))
</script>
