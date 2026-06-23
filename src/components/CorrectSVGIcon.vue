<script setup lang="ts">
import type { GenresPlatformsTagsBase, PlatformByApi } from '@/interfaces/filter.interface';
import type { Platform } from '@/interfaces/allGamesList.interface.ts';
import IconWindows from './icons/platforms/IconWindows.vue';
import IconNintendo from './icons/platforms/IconNintendo.vue';
import IconPlaystation from './icons/platforms/IconPlaystation.vue';
import IconXbox from './icons/platforms/IconXbox.vue';
import IconAndroid from './icons/platforms/IconAndroid.vue';
import IconIos from './icons/platforms/IconIos.vue';
import IconAction from './icons/genres/IconAction.vue';
import IconIndie from './icons/genres/IconIndie.vue';
import IconAdventure from './icons/genres/IconAdventure.vue';
import IconRPG from './icons/genres/IconRPG.vue';
import IconStrategy from './icons/genres/IconStrategy.vue';

const props = withDefaults(
  defineProps<{
    icon_base: Platform[] | PlatformByApi[] | GenresPlatformsTagsBase[];
    size?: string;
  }>(),
  {
    size: '32px',
  },
);

const getSlug = (item: Platform | PlatformByApi | GenresPlatformsTagsBase): string => {
  if ('platform' in item && typeof item.platform === 'object' && 'slug' in item.platform) {
    return (item as Platform).platform.slug;
  }
  if ('slug' in item) {
    return (item as PlatformByApi | GenresPlatformsTagsBase).slug;
  }
  return '';
};

const getIcon = (slug: string) => {
  // Платформы
  if (slug.startsWith('playstation')) return IconPlaystation;
  if (slug.startsWith('xbox')) return IconXbox;
  if (slug.startsWith('nintendo')) return IconNintendo;
  if (slug === 'pc') return IconWindows;
  if (slug === 'android') return IconAndroid;
  if (slug === 'ios') return IconIos;

  // Жанры
  if (slug === 'action') return IconAction;
  if (slug === 'indie') return IconIndie;
  if (slug === 'adventure') return IconAdventure;
  if (slug === 'role-playing-games-rpg') return IconRPG;
  if (slug === 'strategy') return IconStrategy;

  return null;
};
</script>

<template>
  <span
    v-for="base in props.icon_base"
    :key="'icon-' + getSlug(base)"
    class="icon-svg"
    :style="{ width: props.size, height: props.size }"
  >
    <component :is="getIcon(getSlug(base))" v-if="getIcon(getSlug(base))" />
  </span>
</template>

<style scoped>
.icon-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-svg :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
