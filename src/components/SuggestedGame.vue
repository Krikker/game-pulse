<script setup lang="ts">
import IconArrow from './icons/IconArrow.vue';
import IconCalendar from './icons/IconCalendar.vue';
import IconMetacritic from './icons/IconMetacritic.vue';
import type { GameCard } from '@/interfaces/allGamesList.interface.ts';

const props = defineProps<GameCard>();
</script>

<template>
  <div class="suggested-game">
    <img :src="props.icon" :alt="props.title" class="suggested-game__img" />
    <div class="suggested-game__content">
      <p class="suggested-game__title">{{ props.title }}</p>
      <div class="suggested-game__meta">
        <span v-if="props.releaseDate" class="meta-item">
          <IconCalendar class="icon" /> {{ props.releaseDate }}
        </span>
        <span v-if="props.rating" class="meta-item">
          <IconMetacritic class="icon" /> {{ props.rating }}
        </span>
      </div>
    </div>
    <IconArrow class="arrow-svg" />
  </div>
</template>

<style scoped>
.suggested-game {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid var(--color-search-text);
  cursor: pointer;
  transition: background 0.2s;
}

.suggested-game:hover {
  background-color: var(--color-visible-search);
}

.suggested-game__img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.suggested-game__content {
  flex: 1;
  max-width: 67%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.suggested-game__title {
  font-weight: 600;
  font-size: 17px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggested-game__meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--color-search-text);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon {
  width: 15px;
  height: 15px;
  margin-bottom: 2px;
}

.arrow-svg {
  width: 20px;
  height: 20px;
  color: #475569;
  flex-shrink: 0;
  transition:
    transform 0.2s,
    color 0.2s;
}

.suggested-game:hover .arrow-svg {
  color: white;
  transform: translateX(4px);
}
</style>
