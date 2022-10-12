<template>
  <div>
    <canvas
      ref="canva"
      :width="width"
      :height="height"
      @mousemove="logPosition($event)"
    >
      Here is no droids
    </canvas>

    <h3>Current circle is: {{ value }}</h3>
  </div>
</template>

<script setup lang="ts">
import {
  defineProps,
  PropType,
  onMounted,
  ref,
  Ref,
  watch,
  computed
} from 'vue';
import { v4 as uuidGen } from 'uuid';
import { EmptyFunction } from '~/types/global';
import { DiagramArc } from '~/types/diagarams';
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
  },

  radius: {
    type: Number,
    default: 50
  },

  isFullArc: {
    type: Boolean,
    default: false
  }
});

const canva: Ref<HTMLCanvasElement | undefined> = ref(undefined);
const arcs: Ref<{ [key: string]: DiagramArc }> = ref({});

const selectedArc: Ref<string> = ref('');

const sumOfValues = computed(() =>
  props.chart.reduce((acc: number, prop: any) => {
    acc += prop[props.valueProp];
    return acc;
  }, 0)
);

const coordinate = computed(() => props.width / 2);

const value = computed(() =>
  selectedArc.value ? arcs.value[selectedArc.value].name : ''
);

watch(props.chart, () => calculateCircle());

onMounted(() => {
  calculateCircle();
  drawCircle();
});

const calculateCircle: EmptyFunction = () => {
  console.log(uuidGen);

  let offset: number;

  props.chart.forEach((chart) => {
    const degrees = (chart[props.valueProp] * 360) / sumOfValues.value;

    const radians = (Math.PI / 180) * degrees;
    const startAngle: number = offset || 0;
    const endAngle: number = radians + (offset || 0);

    arcs.value[uuidGen()] = {
      name: chart[props.titleProp],
      x: coordinate.value,
      y: coordinate.value,
      radius: props.radius,
      startAngle,
      endAngle,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
      isFull: props.isFullArc
    };

    offset = endAngle;
  });
};

const drawCircle: EmptyFunction = () => {
  if (canva.value === undefined) return;

  const ctx = canva.value.getContext('2d');

  if (ctx === null) return;

  ctx.clearRect(0, 0, props.width, props.height);

  Object.values(arcs.value).forEach((arc) => {
    ctx.beginPath();

    ctx.moveTo(arc.x, arc.y);
    ctx.arc(arc.x, arc.y, arc.radius, arc.startAngle, arc.endAngle);
    ctx.lineTo(arc.x, arc.y);
    ctx.fillStyle = arc.color;
    ctx.fill();
  });
};

const logPosition: EmptyFunction = (e: MouseEvent) => {
  /**
   * Canvas has inverted axis
   */
  const legX = (coordinate.value - e.offsetX) * -1;
  const legY = (coordinate.value - e.offsetY) * -1;

  const hypothenuse = Math.sqrt(Math.pow(legX, 2) + Math.pow(legY, 2));

  const isInCircle = hypothenuse <= props.radius;

  if (!isInCircle && selectedArc.value !== '') {
    resetArcValue(props.radius);
    resetSelectedArcValue('');
    drawCircle();
  }

  if (!isInCircle) {
    return;
  }

  const polarPhi = solvePhi(legX, legY);

  Object.entries(arcs.value).some(([key, arc]) => {
    const isInSector = polarPhi >= arc.startAngle && polarPhi < arc.endAngle;

    if (!isInSector) {
      return false;
    }

    if (isInSector && key === selectedArc.value) {
      return true;
    }

    if (selectedArc.value !== '') {
      resetArcValue(props.radius);
      resetSelectedArcValue('');
    }

    selectedArc.value = key;
    arcs.value[selectedArc.value] = {
      ...arcs.value[selectedArc.value],
      radius: 105
    };
    drawCircle();

    return true;
  });
};

const resetArcValue: (newRadius: number) => void = (newRadius) => {
  arcs.value[selectedArc.value] = {
    ...arcs.value[selectedArc.value],
    radius: newRadius
  };
};

const resetSelectedArcValue: (newValue: string) => void = (newValue) => {
  selectedArc.value = newValue;
};

const solvePhi: (x: number, y: number) => number = (x, y) => {
  if (x > 0 && y >= 0) {
    return Math.atan(y / x);
  }

  if (x > 0 && y < 0) {
    return Math.atan(y / x) + 2 * Math.PI;
  }

  if (x < 0) {
    return Math.atan(y / x) + Math.PI;
  }

  if (x === 0 && y > 0) {
    return Math.PI / 2;
  }

  if (x === 0 && y < 0) {
    return (Math.PI / 2) * 3;
  }

  return 0;
};
</script>
