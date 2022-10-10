<template>
  <div class="home">
    <circle-chart
      :chart="chart"
      :width="400"
      :height="400"
      :chart-width="60"
    />

    <input
      v-model="newValue"
      type="number"
    />

    <button @click="addValue">Add</button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, Ref } from 'vue';
const CircleChart = defineAsyncComponent(
  () => import('~/components/charts/CircleChart.vue')
);

const chart: Ref<Array<{ value: number; title: string }>> = ref([]);

const newValue = ref(0);

function addValue() {
  chart.value.push({ value: newValue.value, title: '' });

  newValue.value = 0;
}
</script>
