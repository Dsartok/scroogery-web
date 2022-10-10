<template>
  <div>
    <canvas
      ref="canva"
      :width="width"
      :height="height"
    >
      Here is no droids
    </canvas>

    <h3>Current Value is: {{ value }}</h3>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, onMounted, ref, Ref, watch } from 'vue';
import { EmptyFunction } from '~/types/global';
import colors from '~/utils/colors';

/** PROPS */
const props = defineProps({
  chart: {
    type: Array as PropType<Array<any>>,
    required: true
  },

  titleProp: {
    type: String,
    default: 'title'
  },

  valueProp: {
    type: String,
    default: 'value'
  },

  width: {
    type: Number,
    default: 200
  },

  height: {
    type: Number,
    default: 200
  },

  chartWidth: {
    type: Number,
    default: 45
  }
});

const canva: Ref<HTMLCanvasElement | undefined> = ref(undefined);

watch(props.chart, () => drawCircle());

onMounted(() => {
  drawCircle();
});

const drawCircle: EmptyFunction = () => {
  if (canva.value === undefined) return;

  let offset;

  const ctx = canva.value.getContext('2d');

  if (ctx === null) return;

  const sumOfValues: number = props.chart.reduce((acc: number, prop: any) => {
    acc += prop[props.valueProp];
    return acc;
  }, 0);

  for (let i = 0; i < props.chart.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = colors[Math.floor(Math.random() * (colors.length - 1))];

    const degrees = (props.chart[i][props.valueProp] * 360) / sumOfValues;

    const radians = (Math.PI / 180) * degrees;
    const startAngle: number = offset || 0;
    const endAngle: number = radians + (offset || 0);

    ctx.arc(
      props.width / 2,
      props.width / 2,
      props.width / 4,
      startAngle,
      endAngle
    );
    ctx.lineWidth = props.chartWidth;
    ctx.stroke();

    offset = endAngle;
  }
};
</script>
