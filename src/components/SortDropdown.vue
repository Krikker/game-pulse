<script setup lang="ts">
import { computed, ref } from 'vue';
import { useClickOutside } from './UseClickOutside';

type SortOption = {
  label: string;
  key: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: SortOption[];
    allowReverse?: boolean;
    label?: string;
  }>(),
  {
    allowReverse: true,
    label: 'Sort by',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

useClickOutside(containerRef, () => {
  isOpen.value = false;
});

const baseOptions = computed(() => props.options);

const currentKey = computed(() => props.modelValue.replace('-', ''));
const isReversed = computed(() => props.modelValue.startsWith('-'));

const currentLabel = computed(() => {
  const current = baseOptions.value.find((option) => option.key === currentKey.value);
  return current?.label ?? baseOptions.value[0]?.label ?? 'Sort';
});

const selectOption = (key: string) => {
  let nextValue = key;

  if (props.allowReverse) {
    nextValue = key === currentKey.value && !isReversed.value ? `-${key}` : key;
  }

  emit('update:modelValue', nextValue);
  isOpen.value = false;
};
</script>

<template>
  <div ref="containerRef" class="sort-wrapper" @click="isOpen = !isOpen">
    <span class="text sort-label">{{ props.label }}</span>
    <button type="button" class="sort-trigger" @click.stop="isOpen = !isOpen">
      <span class="text">{{ currentLabel }}</span>
      <div class="arrow">▼</div>
    </button>
    <ul v-if="isOpen" class="dropdown" @click.stop>
      <li
        v-for="option in baseOptions"
        :key="option.key"
        class="sort-item"
        :class="{ selected: option.key === currentKey }"
        @click="selectOption(option.key)"
      >
        {{ option.label }}
        <span v-if="option.key === currentKey && props.allowReverse" class="direction">
          {{ isReversed ? '↓' : '↑' }}
        </span>
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
  border-radius: 16px;
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
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  min-width: 230px;
  background: rgba(7, 14, 27, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 13px 0;
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

@media (max-width: 720px) {
  .sort-wrapper {
    min-width: 0;
    padding: 8px 10px;
  }

  .sort-wrapper > .text {
    display: none;
  }

  .sort-trigger {
    min-width: 0;
    max-width: 100%;
    font-size: 0.9rem;
  }

  .sort-trigger .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown {
    right: 0;
    left: auto;
    transform: none;
    min-width: min(230px, calc(100vw - 32px));
  }
}
</style>
