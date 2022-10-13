<template>
  <div>
    <canvas
      ref="canva"
      :width="width"
      :height="height"
      @mousemove="checkMousePosition($event)"
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
  /**
   * Array of items to be charted
   */
  chart: {
    type: Array as PropType<Array<any>>,
    required: true
  },

  /**
   * Title property of chart item
   */
  titleProp: {
    type: String,
    default: 'title'
  },

  /**
   * Value property of chart item
   */
  valueProp: {
    type: String,
    default: 'value'
  },

  /**
   * Chart width
   */
  width: {
    type: Number,
    default: 200
  },

  /**
   * Chart height
   */
  height: {
    type: Number,
    default: 200
  },

  /**
   * Circle radius
   */
  radius: {
    type: Number,
    default: 100
  },

  /**
   * Is arcs must be full or with empty sector near center
   */
  isFullArc: {
    type: Boolean,
    default: false
  }
});

/**
 * Canvas item to work with
 */
const canva: Ref<HTMLCanvasElement | undefined> = ref(undefined);

/**
 * List of arcs computed for rendering
 */
const arcs: Ref<{ [key: string]: DiagramArc }> = ref({});

/**
 * Current selected arc via hover action
 */
const selectedArc: Ref<string> = ref('');

/**
 * Colors array to not duplicate
 */
const reservedColors: Ref<Array<string>> = ref([]);

/**
 * Return chart sum of values to calculate arc percentage
 */
const sumOfValues = computed(() =>
  props.chart.reduce((acc: number, prop: any) => {
    acc += prop[props.valueProp];
    return acc;
  }, 0)
);

/**
 * Coordinates of circle center
 */
const coordinate = computed(() => props.width / 2);

/**
 * Hovered arc name
 */
const value = computed(() =>
  selectedArc.value ? arcs.value[selectedArc.value].name : ''
);

watch(props.chart, () => {
  calculateCircle();
  drawCircle();
});

onMounted(() => {
  calculateCircle();
  drawCircle();
});

/**
 * Calculate circle arcs
 * @return void
 */
const calculateCircle: EmptyFunction = () => {
  resetColors();

  let offset: number;

  props.chart.forEach((chart) => {
    const degrees = (chart[props.valueProp] * 360) / sumOfValues.value;

    const radians = (Math.PI / 180) * degrees;
    const startAngle: number = offset || 0;
    const endAngle: number = radians + (offset || 0);
    const color = getColor();
    addColorToReserved(color);

    arcs.value[uuidGen()] = {
      name: chart[props.titleProp],
      radius: props.radius,
      startAngle,
      endAngle,
      color
    };

    offset = endAngle;
  });
};

/**
 * Draw canvas circle
 * @return void
 */
const drawCircle: EmptyFunction = () => {
  if (canva.value === undefined) return;

  const ctx = canva.value.getContext('2d');

  if (ctx === null) return;

  ctx.clearRect(0, 0, props.width, props.height);

  Object.values(arcs.value).forEach((arc) => {
    ctx.beginPath();

    ctx.moveTo(coordinate.value, coordinate.value);
    ctx.arc(
      coordinate.value,
      coordinate.value,
      arc.radius,
      arc.startAngle,
      arc.endAngle
    );

    ctx.fillStyle = arc.color;
    ctx.fill();
  });
};

/**
 * Check mouse position and detect is arc hovered
 * @param e - Standart mouse event
 */
const checkMousePosition: EmptyFunction = (e: MouseEvent) => {
  // Canvas has inverted axis
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

    resetSelectedArcValue(key);
    resetArcValue(props.radius + props.radius * 0.1);
    drawCircle();

    return true;
  });
};

/**
 * Reset selected arc radius value
 * @param newRadius - new arc radius
 * @return void
 */
const resetArcValue: (newRadius: number) => void = (newRadius) => {
  arcs.value[selectedArc.value] = {
    ...arcs.value[selectedArc.value],
    radius: newRadius
  };
};

/**
 * Reset select arc uuid
 * @param newValue - New uuid
 * @return void
 */
const resetSelectedArcValue: (newValue: string) => void = (newValue) => {
  selectedArc.value = newValue;
};

/**
 * Translate selected coordinate to polar sistem angle
 * @param x - X coordinate
 * @param y - Y coordinate
 * @return - Polar sistem angle in rads
 */
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

const getColor: () => string = () => {
  const color = colors[Math.floor(Math.random() * (colors.length - 1))];

  return reservedColors.value.includes(color) ? getColor() : color;
};

const addColorToReserved: (color: string) => void = (color) => {
  reservedColors.value.push(color);
};

const resetColors: EmptyFunction = () => {
  reservedColors.value = [];
};
</script>
