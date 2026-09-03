<script setup lang="ts">
import CorrectSVGIcon from '@/components/CorrectSVGIcon.vue';
import IconCalendar from '@/components/icons/IconCalendar.vue';
import type { DetailItem, SingleGame } from '@/interfaces/singleGame.interface';
import { ref } from 'vue';

const props = defineProps<{
  game: SingleGame;
  heroStats: DetailItem[];
  platformIcons: SingleGame['platforms'];
  ratingSummary: string;
  isInLibrary: boolean;
}>();

const emit = defineEmits<{
  (event: 'toggle-game'): void;
}>();

const isAsideDetailsOpen = ref(false);
</script>

<template>
  <section id="game-hero" class="hero-panel">
    <img
      :src="props.game.background_image_additional || props.game.background_image"
      alt=""
      class="hero-panel__backdrop"
    />

    <div class="hero-panel__content">
      <div class="hero-panel__poster-frame">
        <img :src="props.game.background_image" :alt="props.game.name" class="hero-panel__poster" />
      </div>

      <div class="hero-panel__main">
        <p class="hero-panel__developer">
          <span v-for="dev in props.game.developers" :key="dev.id">{{ dev.name }}</span>
        </p>

        <h1>{{ props.game.name }}</h1>

        <div class="hero-panel__meta">
          <IconCalendar />
          {{ props.game.released }}
        </div>

        <div class="hero-panel__actions">
          <button type="button" class="add-library__button" @click="emit('toggle-game')">
            {{ props.isInLibrary ? 'Remove from Library' : 'Add to Library' }}
          </button>
          <a
            v-if="props.game.website"
            :href="props.game.website"
            target="_blank"
            rel="noreferrer"
            class="secondary-button"
          >
            Official Website
          </a>
        </div>

        <p class="hero-panel__description">{{ props.game.description_raw }}</p>
      </div>

      <aside class="hero-panel__aside">
        <button
          type="button"
          class="hero-aside-toggle"
          @click="isAsideDetailsOpen = !isAsideDetailsOpen"
        >
          {{ isAsideDetailsOpen ? 'Hide rating & stats' : 'Show rating & stats' }}
        </button>

        <div class="hero-aside-details" :class="{ 'hero-aside-details--open': isAsideDetailsOpen }">
          <div class="hero-rating-card">
            <div class="hero-rating-card__score">
              <span>{{ props.game.rating.toFixed(1) }}</span>
              <p>{{ props.ratingSummary }}</p>
            </div>
            <div class="hero-rating-card__meta">
              <p class="additional-info-white">{{ props.ratingSummary }}</p>
              <p class="additional-info--grey-big">{{ props.game.ratings_count }} ratings</p>
              <p class="additional-info--grey-small">Based on RAWG users ratings!</p>
            </div>
          </div>

          <div class="hero-stats">
            <div v-for="item in props.heroStats" :key="item.label" class="hero-stats__row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="hero-stats__row hero-stats__row--platforms">
              <span>Platforms icons</span>
              <div>
                <CorrectSVGIcon :icon_base="props.platformIcons" size="20px" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.hero-panel {
  position: relative;
  min-height: 100svh;
  padding: clamp(24px, 4vw, 48px) clamp(18px, 4vw, 150px) clamp(28px, 6vw, 64px);
  overflow: hidden;
  border: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  align-items: flex-end;
}

.hero-panel__backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.05) contrast(1.02) brightness(0.55);
  transform: scale(1.02);
}

.hero-panel__content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(190px, 240px) minmax(0, 1fr) minmax(280px, 340px);
  gap: 36px;
  align-items: end;
  width: 100%;
}

.hero-panel__poster-frame {
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  align-self: start;
  scroll-margin-top: 24px;
}

.hero-panel__poster {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: 16px;
  display: block;
  box-shadow: none;
  transform: none;
}

.hero-panel__main {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-self: center;
  max-width: 72ch;
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.76), rgba(15, 23, 42, 0.52));
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}

.hero-panel__main h1 {
  font-size: clamp(2.1rem, 4vw, 4rem);
  line-height: 0.95;
}

.hero-panel__developer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #8fa7ff;
  font-size: 1rem;
  font-weight: 600;
}

.hero-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-panel__meta {
  width: fit-content;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.82);
  color: var(--color-search-text);
  font-size: 13px;
}

.hero-panel__meta svg {
  width: 30px;
  margin-bottom: 2px;
}

.hero-panel__description {
  color: var(--color-search-text);
  line-height: 1.7;
  font-size: 1.05rem;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  line-clamp: 6;
  -webkit-line-clamp: 6;
}

.hero-panel__aside {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 350px;
  align-self: center;
}

.hero-rating-card,
.hero-stats {
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.68);
}

.hero-rating-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 104px;
}

.hero-rating-card__score {
  min-width: 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.72);
}

.hero-rating-card__score span {
  font-size: 2.15rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-gold);
}

.hero-rating-card__score p {
  color: var(--color-success);
  font-size: 12px;
  font-weight: 700;
}

.hero-rating-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 120%;
}

.hero-stats__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.hero-stats__row--platforms div {
  display: flex;
  gap: 10px;
}

.hero-stats__row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.hero-stats__row span {
  color: var(--color-search-text);
}

.hero-aside-toggle {
  display: none;
}

.hero-aside-details {
  display: contents;
}

@media (max-width: 1600px) {
  .hero-panel__content {
    gap: 10px;
  }
}

@media (max-width: 1420px) {
  .hero-panel__content {
    gap: 10px;
  }

  .hero-panel__main {
    padding: 20px;
    margin-right: 40px;
  }
}

@media (max-width: 1300px) {
  .hero-panel__content {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
    gap: 20px;
    align-items: start;
  }

  .hero-panel__poster-frame {
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
    max-width: 280px;
  }

  .hero-panel__main {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
    width: 90%;
    max-width: none;
  }

  .hero-panel__aside {
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    max-width: 340px;
  }
}

@media (max-width: 1100px) {
  .hero-panel__content {
    grid-template-columns: minmax(0, 1fr) minmax(250px, 290px);
    gap: 16px;
  }

  .hero-panel__aside {
    max-width: 290px;
  }

  .hero-panel__poster-frame {
    max-width: 230px;
  }

  .hero-panel__main {
    padding: 18px;
  }

  .hero-panel__main h1 {
    font-size: clamp(2rem, 4vw, 3.2rem);
  }
}

@media (max-width: 800px) {
  .hero-panel {
    min-height: auto;
    padding: 20px;
    align-items: flex-start;
  }

  .hero-panel__content {
    grid-template-columns: minmax(110px, 34%) minmax(0, 1fr);
    gap: 18px;
  }

  .hero-panel__poster-frame {
    justify-self: center;
    max-width: 190px;
  }

  .hero-panel__main {
    grid-column: 2;
    grid-row: 1;
    padding: 20px;
  }

  .hero-panel__main h1 {
    font-size: 2.35rem;
  }

  .hero-panel__description {
    font-size: 0.95rem;
  }

  .hero-rating-card {
    width: min(100%, 240px);
    min-height: 88px;
    align-self: center;
    justify-self: center;
    padding: 12px;
    align-items: stretch;
    flex-direction: column;
  }

  .hero-rating-card__score {
    min-width: 0;
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
  }

  .hero-panel__aside {
    grid-column: 1 / -1;
    grid-row: 2;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: stretch;
    width: 100%;
    max-width: none;
  }

  .hero-stats {
    width: 100%;
    justify-self: stretch;
  }
}

@media (max-width: 480px) {
  .hero-panel__content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 18px;
  }

  .hero-panel__poster-frame {
    grid-column: 1;
    grid-row: 1;
    justify-self: center;
    width: min(100%, 240px);
    max-width: 240px;
  }

  .hero-panel__main {
    grid-column: 1;
    grid-row: 2;
    width: 100%;
  }

  .hero-panel__aside {
    grid-column: 1;
    grid-row: 3;
    grid-template-columns: 1fr;
  }

  .hero-aside-toggle {
    display: block;
    grid-column: 1;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.72);
    color: var(--color-text);
    font-weight: 700;
  }

  .hero-aside-toggle:hover {
    border-color: #3b82f6;
  }

  .hero-aside-details {
    display: none;
  }

  .hero-aside-details--open {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
