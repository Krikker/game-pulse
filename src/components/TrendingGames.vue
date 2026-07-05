<script setup lang="ts">
import type { GameCard } from '@/interfaces/allGamesList.interface.ts';

const props = defineProps<GameCard>();
</script>

<template>
  <RouterLink :to="{ name: 'GameDetails', params: { slug: props.slug } }" class="trend-game">
    <img :src="props.icon" :alt="props.title" class="trend-game__img" />
    <span class="trend-game__rating">{{ props.rating }}</span>
    <div class="trand-game__container-desc">
      <h4 class="trend-game__title">{{ props.title }}</h4>
      <span v-if="props.releaseDate" class="additional-info--grey-big">
        {{ props.releaseDate.split('-')[0] }}
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.trend-game {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: var(--color-visible-search);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.trend-game:hover {
  transform: translateY(-6px);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.35);
}

.trend-game__img {
  width: 100%;
  height: var(--card-img-height, 220px);
  object-fit: cover;
  display: block;
}

.trend-game__rating {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px 10px;
  color: var(--color-gold);
  border-radius: 16px;
  font-size: var(--card-rating-size, 1rem);
  font-weight: 700;
}

.trand-game__container-desc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 5px;
}

.trend-game__title {
  font-size: var(--title-font-size, 1.1rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: var(--title-rows-length, 2);
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.additional-info--grey-big {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
  width: 54px;
}
</style>
