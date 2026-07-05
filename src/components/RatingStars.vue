<script setup lang="ts">
import { ref, watch } from 'vue';
import IconStar from './icons/IconStar.vue';

const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const hoverRating = ref<number>(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    hoverRating.value = value;
  },
);

const setRating = (value: number) => {
  emit('update:modelValue', value);
};

const resetHover = () => {
  hoverRating.value = props.modelValue;
};

const getStarFill = (index: number) => {
  if (hoverRating.value >= index) {
    return 100;
  }
  if (hoverRating.value >= index - 0.5) {
    return 50;
  }
  return 0;
};
</script>

<template>
  <div class="stars-wrapper" @mouseleave="resetHover">
    <div class="star-container" v-for="i in 5" :key="i">
      <IconStar class="star-icon empty" />
      <div class="star-fill" :style="{ '--fill': `${getStarFill(i)}%` }">
        <IconStar class="star-icon filled" />
      </div>
      <button
        class="hit-area left"
        type="button"
        :aria-label="`Set rating to ${i - 0.5}`"
        @mouseenter="hoverRating = i - 0.5"
        @click="setRating(i - 0.5)"
      />
      <button
        class="hit-area right"
        type="button"
        :aria-label="`Set rating to ${i}`"
        @mouseenter="hoverRating = i"
        @click="setRating(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.stars-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-container {
  position: relative;
  width: 40px;
  height: 40px;
}

.star-icon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: #475569;
}

.star-icon.filled {
  color: #fcd34d;
}

.star-fill {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  clip-path: inset(0 calc(100% - var(--fill)) 0 0);
}

.star-fill .star-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hit-area {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.hit-area.left {
  left: 0;
}

.hit-area.right {
  right: 0;
}
</style>
