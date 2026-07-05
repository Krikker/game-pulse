<script setup lang="ts">
import { computed, ref } from 'vue';
import { useClickOutside } from './UseClickOutside';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref<boolean>(false);
const searchContainerRef = ref<HTMLElement | null>(null);

useClickOutside(searchContainerRef, () => {
  isOpen.value = false;
});

const baseOptions = [
  { label: 'Popularity', key: 'added' },
  { label: 'Release Date', key: 'released' },
  { label: 'Name (A-Z)', key: 'name' },
  { label: 'Rating', key: 'rating' },
  { label: 'Metacritic', key: 'metacritic' },
];

const currentKey = computed(() => props.modelValue.replace('-', ''));
const isReversed = computed(() => props.modelValue.startsWith('-'));

const currentLabel = computed(() => {
  const current = baseOptions.find((o) => o.key === currentKey.value);
  return current ? current.label : 'Popularity';
});

const selectOption = (key: string) => {
  let newValue: string;
  if (key === currentKey.value) {
    newValue = isReversed.value ? key : `-${key}`;
  } else {
    newValue = key;
  }
  emit('update:modelValue', newValue);
  isOpen.value = false;
};
</script>

<template>
  <div class="sort-wrapper" ref="searchContainerRef">
    <span class="text">Sort by</span>
    <button type="button" @click="isOpen = !isOpen" class="sort-trigger">
      <span class="text">{{ currentLabel }}</span>
      <div class="arrow">▼</div>
    </button>
    <ul class="dropdown" v-if="isOpen">
      <li
        v-for="label in baseOptions"
        :key="label.key"
        @click="selectOption(label.key)"
        class="sort-item"
        :class="{ selected: label.key === currentKey }"
      >
        {{ label.label }}
        <span v-if="label.key === currentKey" class="direction">{{ isReversed ? '↓' : '↑' }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sort-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  gap: 8px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  padding: 10px 14px 10px 16px;
  background: rgba(15, 23, 42, 0.9);
}

.sort-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}

.arrow {
  color: #94a3b8;
  font-size: 0.9rem;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: -16px;
  margin-top: 10px;
  min-width: 220px;
  background: rgba(7, 14, 27, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px;
  padding: 10px 0;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
  z-index: 20;
}

.sort-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 1rem;
  transition:
    background 0.2s,
    color 0.2s;
}

.sort-item:hover,
.sort-item.selected {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-text);
}

.direction {
  color: #94a3b8;
}
</style>
