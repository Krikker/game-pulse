<script setup lang="ts">
const props = defineProps<{
  mediaShots: string[];
  gameName: string;
  screenshotsCount: number;
  activeShotIndex: number | null;
}>();

const emit = defineEmits<{
  (event: 'open-shot', index: number): void;
  (event: 'close-shot'): void;
  (event: 'step-shot', direction: 1 | -1): void;
}>();
</script>

<template>
  <section class="media-panel panel">
    <div class="panel__head">
      <div>
        <p class="section-eyebrow">Media</p>
        <h2>Screenshots and visuals</h2>
      </div>
      <span class="panel__head-note">{{ props.screenshotsCount }} screenshots available</span>
    </div>

    <div v-if="props.mediaShots.length" class="media-grid">
      <button
        v-for="(shot, index) in props.mediaShots"
        :key="shot"
        type="button"
        class="media-grid__item"
        @click="emit('open-shot', index)"
      >
        <img :src="shot" :alt="`${props.gameName} screenshot`" />
      </button>
    </div>
    <p v-else class="panel__footnote">No screenshots were returned by RAWG for this game.</p>

    <teleport to="body">
      <transition name="lightbox-fade">
        <div
          v-if="props.activeShotIndex !== null && props.mediaShots[props.activeShotIndex]"
          class="media-lightbox"
          @click.self="emit('close-shot')"
        >
          <button type="button" class="media-lightbox__close" @click="emit('close-shot')">
            Close
          </button>
          <button
            v-if="props.mediaShots.length > 1"
            type="button"
            class="media-lightbox__nav media-lightbox__nav--prev"
            @click="emit('step-shot', -1)"
          >
            🠬
          </button>
          <img
            :src="props.mediaShots[props.activeShotIndex]"
            :alt="`${props.gameName} screenshot`"
            class="media-lightbox__image"
          />
          <button
            v-if="props.mediaShots.length > 1"
            type="button"
            class="media-lightbox__nav media-lightbox__nav--next"
            @click="emit('step-shot', 1)"
          >
            🠮
          </button>
        </div>
      </transition>
    </teleport>
  </section>
</template>

<style scoped>
.media-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 150px;
  scroll-margin-top: 24px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel__head h2 {
  font-size: 1.25rem;
}

.panel__head-note,
.panel__footnote {
  color: var(--color-search-text);
}

.panel__head-note {
  padding: 7px 11px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.68);
  font-size: 12px;
}

.panel__footnote {
  font-size: 14px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.55) rgba(15, 23, 42, 0.3);
}

.media-grid::-webkit-scrollbar {
  height: 10px;
}

.media-grid::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 999px;
}

.media-grid::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.55);
  border-radius: 999px;
}

.media-grid__item {
  position: relative;
  padding: 0;
  border: 0;
  width: 100%;
  aspect-ratio: 16 / 10;
  scroll-snap-align: start;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.25);
  background: rgba(15, 23, 42, 0.4);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.media-grid__item:hover {
  transform: translateY(-2px);
  border-color: rgba(148, 163, 184, 0.26);
  box-shadow: 0 24px 42px rgba(0, 0, 0, 0.32);
}

.media-grid__item img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.media-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 24px;
  background: rgba(1, 6, 15, 0.92);
  backdrop-filter: blur(18px);
}

.media-lightbox__image {
  width: min(100%, 1200px);
  max-height: 86vh;
  justify-self: center;
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
}

.media-lightbox__close,
.media-lightbox__nav {
  align-self: center;
  min-width: 92px;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.82);
  color: #fff;
  font-weight: 700;
  font-size: 17px;
}

.media-lightbox__nav {
  min-width: 72px;
  font-size: 30px;
}

.media-lightbox__close {
  position: fixed;
  top: 22px;
  right: 22px;
  z-index: 1001;
}

.media-lightbox__nav--prev {
  justify-self: end;
}

.media-lightbox__nav--next {
  justify-self: start;
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.22s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1100px) {
  .media-panel {
    padding: 0 18px;
  }

  .media-grid {
    grid-auto-columns: minmax(220px, 1fr);
  }

  .media-lightbox {
    grid-template-columns: 1fr;
  }

  .media-lightbox__nav {
    display: none;
  }

  .media-lightbox__close {
    top: 16px;
    right: 16px;
  }
}

@media (max-width: 720px) {
  .media-panel {
    padding: 0 18px;
  }

  .media-grid {
    grid-template-columns: repeat(3, minmax(190px, 84vw));
    grid-auto-flow: column;
    grid-auto-columns: minmax(190px, 84vw);
  }

  .media-lightbox {
    padding: 18px;
  }
}
</style>
