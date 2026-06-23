<script setup lang="ts">
import type { GameCard } from '@/interfaces/allGamesList.interface.ts';

const props = defineProps<GameCard>();
</script>

<template>
  <RouterLink :to="{ name: 'GameDetails', params: { slug: props.slug } }" class="trend-game">
    <img :src="props.icon" :alt="props.title" class="trend-game__img" />
    <span class="trend-game__rating">{{ props.rating }}</span>
    <h4 class="trend-game__title">{{ props.title }}</h4>
  </RouterLink>
</template>

<style scoped>
.trend-game__img {
  width: inherit;
  height: 80%;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  object-fit: cover;
}

.trend-game__rating {
  position: absolute;
  bottom: 25%;
  right: 5%;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px;
  color: var(--color-gold);
  border-radius: 6px;
  font-size: 16px;
}

.trend-game__title {
  font-size: 18px;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding: 0 5px;
}
</style>
