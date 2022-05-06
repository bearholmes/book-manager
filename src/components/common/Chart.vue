<template>
  <canvas :id="props.id"></canvas>
</template>
<script setup>
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { nextTick, onMounted } from 'vue';

const props = defineProps({
  id: {
    type: String,
    default: 'chart',
  },
  type: {
    type: String,
    default: 'line',
  },
  option: {
    type: Object,
    default: () => {
      return {};
    },
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

onMounted(() => {
  nextTick(() => {
    // eslint-disable-next-line
    const chart = new Chart(document.getElementById(props.id), {
      plugins: [ChartDataLabels],
      type: props.type,
      options: props.option,
      data: props.data,
    });
  });
});
</script>
