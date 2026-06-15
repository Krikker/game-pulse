import { onMounted, onUnmounted, type Ref } from 'vue';

export function useClickOutside(elementRef: Ref<HTMLElement | null>, onOutsideClick: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (elementRef.value && !elementRef.value.contains(event.target as Node)) {
      onOutsideClick();
    }
  };

  onMounted(() => {
    document.addEventListener('mousedown', handleClick);
  });

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClick);
  });
}
