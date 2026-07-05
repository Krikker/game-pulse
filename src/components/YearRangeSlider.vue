<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: [number, number];
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: [number, number]): void;
}>();

const minYear = computed(() => props.min ?? 1980);
const maxYear = computed(() => props.max ?? 2026);

const draftRange = ref<[number, number]>([...props.modelValue]);
const trackRef = ref<HTMLElement | null>(null);
const suppressTrackClick = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    draftRange.value = [...value];
  },
  { deep: true },
);

const commit = () => {
  emit('update:modelValue', [...draftRange.value]);
};

const startThumbInteraction = () => {
  suppressTrackClick.value = true;
};

const endThumbInteraction = () => {
  window.setTimeout(() => {
    suppressTrackClick.value = false;
  }, 0);
};

const setYearFrom = (value: number) => {
  const nextFrom = Math.min(Math.max(minYear.value, value), draftRange.value[1]);
  draftRange.value = [nextFrom, draftRange.value[1]];
};

const setYearTo = (value: number) => {
  const nextTo = Math.max(Math.min(maxYear.value, value), draftRange.value[0]);
  draftRange.value = [draftRange.value[0], nextTo];
};

const rangeStyle = computed(() => ({
  '--from': `${((draftRange.value[0] - minYear.value) / (maxYear.value - minYear.value)) * 100}%`,
  '--to': `${((draftRange.value[1] - minYear.value) / (maxYear.value - minYear.value)) * 100}%`,
}));

const onTrackClick = (event: MouseEvent) => {
  if (suppressTrackClick.value) {
    return;
  }

  const track = trackRef.value;
  if (!track) return;

  const rect = track.getBoundingClientRect();
  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const clickedYear = Math.round(minYear.value + ratio * (maxYear.value - minYear.value));
  const distanceToFrom = Math.abs(clickedYear - draftRange.value[0]);
  const distanceToTo = Math.abs(clickedYear - draftRange.value[1]);

  if (distanceToFrom <= distanceToTo) {
    setYearFrom(clickedYear);
  } else {
    setYearTo(clickedYear);
  }

  commit();
};
</script>

<template>
  <div class="year-slider">
    <div ref="trackRef" class="year-slider__track" :style="rangeStyle" @click="onTrackClick">
      <input
        class="year-slider__input year-slider__input--from"
        type="range"
        :min="minYear"
        :max="maxYear"
        :step="1"
        :value="draftRange[0]"
        @input="setYearFrom(Number(($event.target as HTMLInputElement).value))"
        @pointerdown="startThumbInteraction"
        @pointerup="endThumbInteraction"
        @pointercancel="endThumbInteraction"
        @change="commit"
        aria-label="Release year from"
      />
      <input
        class="year-slider__input year-slider__input--to"
        type="range"
        :min="minYear"
        :max="maxYear"
        :step="1"
        :value="draftRange[1]"
        @input="setYearTo(Number(($event.target as HTMLInputElement).value))"
        @pointerdown="startThumbInteraction"
        @pointerup="endThumbInteraction"
        @pointercancel="endThumbInteraction"
        @change="commit"
        aria-label="Release year to"
      />
    </div>
    <div class="year-slider__labels">
      <span>{{ draftRange[0] }}</span>
      <span>{{ draftRange[1] }}</span>
    </div>
  </div>
</template>

<style scoped>
.year-slider {
  display: grid;
  gap: 10px;
}

.year-slider__track {
  position: relative;
  height: 28px;
  display: flex;
  align-items: center;
}

.year-slider__track::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
}

.year-slider__track::after {
  content: '';
  position: absolute;
  left: var(--from);
  right: calc(100% - var(--to));
  height: 6px;
  border-radius: 999px;
  background: var(--color-gradient);
}

.year-slider__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 28px;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
}

.year-slider__input::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
}

.year-slider__input::-moz-range-track {
  height: 6px;
  background: transparent;
}

.year-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #3b82f6;
  background: #ffffff;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.25);
  cursor: pointer;
  pointer-events: auto;
  margin-top: -6px;
}

.year-slider__input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #3b82f6;
  background: #ffffff;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.25);
  cursor: pointer;
  pointer-events: auto;
}

.year-slider__input--from {
  z-index: 2;
}

.year-slider__input--to {
  z-index: 3;
}

.year-slider__labels {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.95rem;
}
</style>
