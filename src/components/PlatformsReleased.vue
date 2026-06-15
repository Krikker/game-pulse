<script setup lang="ts">
import type { Platform } from '@/interfaces/allGamesList.interface';
import IconWindows from './icons/platforms/IconWindows.vue';
import IconNintendo from './icons/platforms/IconNintendo.vue';
import IconPlaystation from './icons/platforms/IconPlaystation.vue';
import IconXbox from './icons/platforms/IconXbox.vue';
import IconAndroid from './icons/platforms/IconAndroid.vue';
import IconIos from './icons/platforms/IconIos.vue';

const props = withDefaults(
  defineProps<{
    platforms: Platform[];
    size?: string;
  }>(),
  {
    size: '32px',
  },
);

const getPlatformIcon = (slug: string) => {
  if (slug.startsWith('playstation')) return IconPlaystation;
  if (slug.startsWith('xbox')) return IconXbox;
  if (slug.startsWith('nintendo')) return IconNintendo;
  if (slug === 'pc') return IconWindows;
  if (slug === 'android') return IconAndroid;
  if (slug === 'ios') return IconIos;

  return null;
};
</script>

<template>
  <span
    v-for="platform in props.platforms"
    :key="platform.platform.id"
    class="platform-icon"
    :style="{ width: props.size, height: props.size }"
  >
    <component
      :is="getPlatformIcon(platform.platform.slug)"
      v-if="getPlatformIcon(platform.platform.slug)"
    />
  </span>
</template>

<style scoped>
.platform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.platform-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
