import { ref, watch, type Ref } from 'vue';

export function useDebounce<T>(value: Ref<T>, delay = 500) {
  const debouncedValue = ref<T>(value.value);
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(value, (newValue) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}
