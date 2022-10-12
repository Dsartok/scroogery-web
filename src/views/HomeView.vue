<template>
  <div class="home">
    <circle-chart
      :chart="chart"
      :width="400"
      :height="400"
      :radius="100"
      :chart-width="60"
      is-full-arc
    />
    <circle-chart
      :chart="chart"
      :width="400"
      :height="400"
      :radius="100"
      :chart-width="60"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, Ref } from 'vue';
const CircleChart = defineAsyncComponent(
  () => import('~/components/charts/CircleChart.vue')
);

const chart: Ref<Array<{ value: number; title: string }>> = ref([
  { value: 40000, title: '40k' },
  { value: 20000, title: '20k' },
  { value: 10000, title: '10k' },
  { value: 80000, title: '80k' }
]);
</script>
