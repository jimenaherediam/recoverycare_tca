<template>
  <apexchart type="area" :height="height" :options="options" :series="series" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:   { type: Array, default: () => [] },
  height: { type: Number, default: 220 },
})

const series = computed(() => [
  {
    name: 'Nivel de ansiedad',
    data: props.data.map((d) => ({
      x: new Date(d.fecha).getTime(),
      y: d.nivel_ansiedad != null ? +Number(d.nivel_ansiedad).toFixed(1) : null,
    })),
  },
])

const options = {
  chart: { type: 'area', toolbar: { show: false }, animations: { speed: 400 } },
  colors: ['#7C3AED'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] },
  },
  stroke: { curve: 'smooth', width: 2.5 },
  xaxis: {
    type: 'datetime',
    labels: { style: { colors: '#9CA3AF', fontSize: '11px' }, datetimeUTC: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0, max: 10, tickAmount: 5,
    labels: { style: { colors: '#9CA3AF', fontSize: '11px' } },
  },
  tooltip: { x: { format: 'dd MMM HH:mm' }, y: { formatter: (v) => `${v} / 10` } },
  grid: { borderColor: '#F3F4F6', padding: { left: 4, right: 4 } },
  markers: { size: 4, colors: ['#7C3AED'], strokeWidth: 0 },
  annotations: {
    yaxis: [{
      y: 7, borderColor: '#EF4444', borderWidth: 1, strokeDashArray: 4,
      label: { text: 'Umbral alto', style: { color: '#EF4444', fontSize: '10px', background: 'transparent' } },
    }],
  },
}
</script>
