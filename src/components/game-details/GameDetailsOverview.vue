<script setup lang="ts">
import type { ActivityCard, DetailItem, StatusBucket } from '@/interfaces/singleGame.interface';

const props = defineProps<{
  ratingBuckets: StatusBucket[];
  ratingSummary: string;
  ratingsCount: number;
  addedByStatus: StatusBucket[];
  statusRingStyle: Record<string, string>;
  activityCards: ActivityCard[];
  playerRatingDisplay: string;
  playerRating: number;
  metacriticScore: number;
  scoreGap: number;
  detailsItems: DetailItem[];
  developerNames: string[];
  publisherNames: string[];
  websiteAvailable: boolean;
}>();
</script>

<template>
  <div class="game-details-overview">
    <section class="charts-grid">
      <article class="panel panel--wide">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">RAWG breakdown</p>
            <h2>Rating distribution</h2>
          </div>
          <span class="panel__head-note">{{ props.ratingsCount }} ratings</span>
        </div>

        <div class="rating-bars">
          <div v-for="item in props.ratingBuckets" :key="item.key" class="rating-bars__row">
            <div class="rating-bars__topline">
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
            </div>
            <div class="rating-bars__track">
              <div
                class="rating-bars__fill"
                :style="{ width: `${item.percent}%`, background: item.color }"
              ></div>
            </div>
          </div>
        </div>

        <p class="panel__footnote">Top rating: {{ props.ratingSummary }}</p>
      </article>

      <article class="panel panel--ring">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Community</p>
            <h2>Added by status</h2>
          </div>
          <span class="panel__head-note">Live library mix</span>
        </div>

        <div class="ring-chart">
          <div class="ring-chart__ring" :style="props.statusRingStyle">
            <div class="ring-chart__center">
              <strong>{{ props.addedByStatus.reduce((sum, item) => sum + item.count, 0) }}</strong>
              <span>added</span>
            </div>
          </div>

          <div class="ring-chart__legend">
            <div v-for="item in props.addedByStatus" :key="item.key" class="ring-chart__legend-row">
              <span class="ring-chart__legend-dot" :style="{ background: item.color }"></span>
              <div class="ring-chart__legend-copy">
                <p>{{ item.label }}</p>
                <span>{{ item.count }} · {{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="metrics-grid">
      <article v-for="card in props.activityCards" :key="card.label" class="metric-card">
        <p class="metric-card__value">{{ card.value }}</p>
        <h3>{{ card.label }}</h3>
        <span>{{ card.hint }}</span>
      </article>
    </section>

    <section class="compare-grid">
      <article class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Player vs critic</p>
            <h2>Player score comparison</h2>
          </div>
          <span class="panel__head-note"
            >{{ props.scoreGap > 0 ? '+' : '' }}{{ props.scoreGap }} gap</span
          >
        </div>

        <div class="compare-card">
          <div class="compare-card__row">
            <div class="compare-card__label">
              <span>Players</span>
              <strong>{{ props.playerRatingDisplay }}/5</strong>
            </div>
            <div class="compare-card__bar">
              <span
                class="compare-card__fill compare-card__fill--players"
                :style="{ width: `${props.playerRating}%` }"
              ></span>
            </div>
          </div>

          <div class="compare-card__row">
            <div class="compare-card__label">
              <span>Metacritic</span>
              <strong>{{ props.metacriticScore }}/100</strong>
            </div>
            <div class="compare-card__bar">
              <span
                class="compare-card__fill compare-card__fill--critic"
                :style="{ width: `${props.metacriticScore}%` }"
              ></span>
            </div>
          </div>
        </div>

        <p class="panel__footnote">
          RAWG player sentiment and critic score side by side, scaled to the same 100-point line.
        </p>
      </article>

      <article class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Game timeline</p>
            <h2>Key facts</h2>
          </div>
          <span class="panel__head-note">{{
            props.websiteAvailable ? 'Website available' : 'No website'
          }}</span>
        </div>

        <div class="details-list">
          <div v-for="item in props.detailsItems" :key="item.label" class="details-list__row">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
          <div class="details-list__row">
            <span>Developers</span>
            <strong>
              <template v-if="props.developerNames.length">{{
                props.developerNames.join(', ')
              }}</template>
              <template v-else>Не указано</template>
            </strong>
          </div>
          <div class="details-list__row">
            <span>Publishers</span>
            <strong>
              <template v-if="props.publisherNames.length">{{
                props.publisherNames.join(', ')
              }}</template>
              <template v-else>Не указано</template>
            </strong>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.game-details-overview {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.charts-grid,
.compare-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 70px;
  padding: 0 150px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  padding: 0 150px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel--wide {
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

.panel__head h2,
.metric-card h3 {
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

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rating-bars__row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bars__topline,
.details-list__row,
.ring-chart__legend-row,
.compare-card__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rating-bars__topline span,
.details-list__row span,
.ring-chart__legend-copy span,
.metric-card span,
.compare-card__label span {
  color: var(--color-search-text);
}

.rating-bars__track,
.compare-card__bar {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  overflow: hidden;
}

.rating-bars__fill,
.compare-card__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.ring-chart {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}

.ring-chart__ring {
  position: relative;
  width: min(280px, 100%);
  aspect-ratio: 1;
  border-radius: 50%;
  margin-inline: auto;
}

.ring-chart__ring::after {
  content: '';
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  background: rgba(14, 20, 31, 0.95);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
}

.ring-chart__center {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  text-align: center;
}

.ring-chart__center strong {
  font-size: clamp(2rem, 4vw, 3rem);
}

.ring-chart__center span {
  color: var(--color-search-text);
}

.ring-chart__legend {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ring-chart__legend-row {
  justify-content: flex-start;
}

.ring-chart__legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.ring-chart__legend-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-card {
  padding: 22px;
  border: 1px solid var(--color-box-border);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.65)), rgba(14, 20, 31, 0.88);
}

.metric-card__value {
  margin-bottom: 8px;
  font-size: 2rem;
  font-weight: 800;
}

.compare-grid {
  align-items: stretch;
}

.compare-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.compare-card__row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compare-card__fill--players {
  background: linear-gradient(90deg, #34d399, #60a5fa);
}

.compare-card__fill--critic {
  background: linear-gradient(90deg, #fbbf24, #fb7185);
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.details-list__row {
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.45);
}

.details-list__row strong {
  text-align: right;
}

@media (max-width: 1100px) {
  .charts-grid,
  .compare-grid,
  .metrics-grid {
    grid-template-columns: 1fr;
    padding: 0 48px;
  }

  .ring-chart {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .charts-grid,
  .compare-grid,
  .metrics-grid {
    padding: 0 18px;
  }

  .panel__head {
    flex-direction: column;
    gap: 10px;
  }

  .details-list__row {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .details-list__row strong {
    max-width: 100%;
    text-align: left;
    overflow-wrap: anywhere;
  }
}
</style>
