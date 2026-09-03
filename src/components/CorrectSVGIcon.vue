<script setup lang="ts">
import { computed } from 'vue';
import type { GenresPlatformsTagsBase, PlatformByApi } from '@/interfaces/filter.interface';
import type { Platform } from '@/interfaces/allGamesList.interface.ts';
import IconWindows from './icons/platforms/IconWindows.vue';
import IconNintendo from './icons/platforms/IconNintendo.vue';
import IconPlaystation from './icons/platforms/IconPlaystation.vue';
import IconXbox from './icons/platforms/IconXbox.vue';
import IconAndroid from './icons/platforms/IconAndroid.vue';
import IconIos from './icons/platforms/IconIos.vue';
import IconLinux from './icons/platforms/IconLinux.vue';
import IconAtari from './icons/platforms/IconAtari.vue';
import IconCommadore from './icons/platforms/IconCommadore.vue';

const genreIcons = import.meta.glob<string>('./icons/genres/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const genreFileBySlug: Record<string, string> = {
  'role-playing-games-rpg': 'rpg',
  'massively-multiplayer': 'multiplayer',
  'board-games': 'board',
};

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

const getIconKey = (slug: string): string => {
  if (slug.startsWith('playstation')) return 'playstation';
  if (slug.startsWith('xbox')) return 'xbox';
  if (slug.startsWith('nintendo')) return 'nintendo';
  if (slug === 'pc') return 'pc';
  if (slug === 'android') return 'android';
  if (slug === 'ios') return 'ios';
  return slug;
};

const getIcon = (slug: string) => {
  if (slug.startsWith('playstation')) return IconPlaystation;
  if (slug.startsWith('xbox')) return IconXbox;
  if (slug.startsWith('nintendo')) return IconNintendo;
  if (slug === 'pc') return IconWindows;
  if (slug === 'android') return IconAndroid;
  if (slug === 'ios') return IconIos;
  if (slug === 'mac') return IconIos;
  if (slug === 'linux') return IconLinux;
  if (slug === 'atari') return IconAtari;
  if (slug === 'commodore-amiga') return IconCommadore;

  const genreFileName = genreFileBySlug[slug] || slug;
  return genreIcons[`./icons/genres/${genreFileName}.svg`];
};

const uniqueIcons = computed(() => {
  const seen = new Set<string>();

  return props.icon_base.flatMap((base) => {
    const slug = getSlug(base);
    const iconKey = getIconKey(slug);
    const icon = getIcon(slug);

    if (!icon || seen.has(iconKey)) return [];

    seen.add(iconKey);
    return [{ key: iconKey, icon }];
  });
});
</script>

<template>
  <span
    v-for="item in uniqueIcons"
    :key="'icon-' + item.key"
    class="icon-svg"
    :style="{ width: props.size, height: props.size }"
  >
    <span v-if="typeof item.icon === 'string'" class="icon-svg__content" v-html="item.icon"></span>
    <component v-else :is="item.icon" />
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

.icon-svg__content {
  display: contents;
}

.icon-svg__content :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
