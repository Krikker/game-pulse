<script setup lang="ts">
import { rawgService } from '@/api';
import type { Result } from '@/interfaces/allGamesList.interface';
import type { SingleGame } from '@/interfaces/singleGame.interface';
import { computed, ref } from 'vue';

type CompareGame = SingleGame & { genres?: Array<{ name: string }> };

const selectedGames = ref<Array<CompareGame | null>>([null, null]);
const searchQueries = ref(['', '']);
const searchResults = ref<Result[][]>([[], []]);
const searching = ref([false, false]);
const activeSlot = ref<number | null>(null);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const searchGames = (slot: number) => {
  activeSlot.value = slot;
  searchResults.value[slot] = [];
  if (searchTimer) clearTimeout(searchTimer);
  const query = searchQueries.value[slot]?.trim();
  if (!query) return;

  searching.value[slot] = true;
  searchTimer = setTimeout(async () => {
    try {
      const response = await rawgService.getAll(query, 6);
      searchResults.value[slot] = response.data?.results ?? [];
    } catch (error) {
      console.error(error);
      searchResults.value[slot] = [];
    } finally {
      searching.value[slot] = false;
    }
  }, 350);
};

const chooseGame = async (slot: number, result: Result) => {
  searchResults.value[slot] = [];
  searchQueries.value[slot] = '';
  activeSlot.value = null;
  try {
    const response = await rawgService.getById(result.id);
    selectedGames.value[slot] = response.data as CompareGame;
  } catch (error) {
    console.error(error);
    selectedGames.value[slot] = result as unknown as CompareGame;
  }
};

const removeGame = (slot: number) => {
  selectedGames.value[slot] = null;
  searchQueries.value[slot] = '';
  searchResults.value[slot] = [];
};

const games = computed(() =>
  selectedGames.value.filter((game): game is CompareGame => Boolean(game)),
);
const formatDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
        new Date(date),
      )
    : '—';
const platformNames = (game: SingleGame) =>
  game.platforms?.map((item) => item.platform.name).join(' · ') || '—';
const developerName = (game: SingleGame) => game.developers?.[0]?.name || '—';
const publisherName = (game: SingleGame) => game.publishers?.[0]?.name || '—';

const comparisonRows = computed(() => [
  {
    label: 'Metacritic score',
    values: games.value.map((game) => (game.metacritic ? `${game.metacritic}/100` : '—')),
  },
  {
    label: 'User rating',
    values: games.value.map((game) => (game.rating ? `${game.rating.toFixed(1)}/5` : '—')),
  },
  { label: 'Release date', values: games.value.map((game) => formatDate(game.released)) },
  { label: 'Developer', values: games.value.map(developerName) },
  { label: 'Publisher', values: games.value.map(publisherName) },
  {
    label: 'Avg. playtime',
    values: games.value.map((game) => (game.playtime ? `${game.playtime}h` : '—')),
  },
  { label: 'Platforms', values: games.value.map(platformNames) },
]);

const radarAxes = ['Score', 'Rating', 'Playtime', 'Variety', 'Popularity'];
const radarAngles = radarAxes.map(
  (_, index) => -Math.PI / 2 + (index * Math.PI * 2) / radarAxes.length,
);
const radarPoint = (index: number, value: number) => {
  const radius = (105 * Math.max(0, Math.min(100, value))) / 100;
  return `${150 + Math.cos(radarAngles[index] || 0) * radius},${140 + Math.sin(radarAngles[index] || 0) * radius}`;
};
const radarPoints = (game: CompareGame) => {
  const values = [
    game.metacritic || 0,
    ((game.rating || 0) / 5) * 100,
    Math.min(((game.playtime || 0) / 100) * 100, 100),
    Math.min((game.platforms?.length || 0) * 20 + (game.genres?.length || 0) * 12, 100),
    Math.min(Math.log10((game.ratings_count || 1) + 1) * 20, 100),
  ];
  return values.map((value, index) => radarPoint(index, value)).join(' ');
};
const radarLabelPoint = (index: number) => {
  const radius = 128;
  return {
    x: 150 + Math.cos(radarAngles[index] || 0) * radius,
    y: 140 + Math.sin(radarAngles[index] || 0) * radius,
  };
};
</script>

<template>
  <main class="compare-page">
    <header class="compare-header">
      <div>
        <h1>Compare Games</h1>
        <p>Choose two games to compare their stats and insights.</p>
      </div>
    </header>

    <section class="compare-picker">
      <div v-for="slot in 2" :key="slot" class="compare-slot">
        <div v-if="selectedGames[slot - 1]" class="compare-selected">
          <img
            :src="selectedGames[slot - 1]?.background_image"
            :alt="selectedGames[slot - 1]?.name"
          />
          <div>
            <strong>{{ selectedGames[slot - 1]?.name }}</strong
            ><span>{{ selectedGames[slot - 1]?.released?.slice(0, 4) || 'Unknown' }}</span>
          </div>
          <button type="button" aria-label="Remove game" @click="removeGame(slot - 1)">×</button>
        </div>
        <div v-else class="compare-search-wrap">
          <span class="compare-search-icon">+</span>
          <input
            v-model="searchQueries[slot - 1]"
            type="search"
            :placeholder="`Add game ${slot}`"
            @input="searchGames(slot - 1)"
            @focus="activeSlot = slot - 1"
          />
          <div
            v-if="
              activeSlot === slot - 1 && (searchResults[slot - 1]?.length || searching[slot - 1])
            "
            class="compare-results"
          >
            <div v-if="searching[slot - 1]" class="compare-results__loading">Searching...</div>
            <button
              v-for="result in searchResults[slot - 1]"
              v-else
              :key="result.id"
              type="button"
              @click="chooseGame(slot - 1, result)"
            >
              <img :src="result.background_image" :alt="result.name" /><span
                ><strong>{{ result.name }}</strong
                ><small>{{ result.released?.slice(0, 4) || 'Unknown' }}</small></span
              >
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="games.length < 2" class="compare-empty">
      <div class="compare-empty__mark">↔</div>
      <h2>Ready when you are</h2>
      <p>Select two games above to see their differences, strengths and stats side by side.</p>
    </div>
    <template v-else>
      <section id="overview" class="compare-overview">
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Overview</th>
                <th v-for="game in games" :key="game.id">
                  <img :src="game.background_image" :alt="game.name" /><span>{{ game.name }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparisonRows" :key="row.label">
                <th>{{ row.label }}</th>
                <td v-for="value in row.values" :key="value">{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <section class="compare-panel compare-chart-panel">
          <div class="compare-panel__heading">
            <div>
              <span class="section-eyebrow">Five dimensions</span>
              <h2>Game profile</h2>
            </div>
            <span class="compare-panel__hint">Higher is stronger</span>
          </div>
          <svg
            class="radar-chart"
            viewBox="0 0 300 280"
            role="img"
            aria-label="Comparison radar chart"
          >
            <g class="radar-grid">
              <polygon
                v-for="level in [25, 50, 75, 100]"
                :key="level"
                :points="radarAxes.map((_, index) => radarPoint(index, level)).join(' ')"
              />
            </g>
            <line
              v-for="(angle, index) in radarAngles"
              :key="`axis-${index}`"
              x1="150"
              y1="140"
              :x2="radarLabelPoint(index).x"
              :y2="radarLabelPoint(index).y"
            />
            <text
              v-for="(axis, index) in radarAxes"
              :key="axis"
              :x="radarLabelPoint(index).x"
              :y="radarLabelPoint(index).y"
              text-anchor="middle"
            >
              {{ axis }}
            </text>
            <polygon
              v-for="(game, index) in games"
              :key="game.id"
              :points="radarPoints(game)"
              class="radar-shape"
              :class="`radar-shape--${index}`"
            />
          </svg>
          <div class="radar-legend">
            <span v-for="(game, index) in games" :key="game.id"
              ><i :class="`legend-color legend-color--${index}`"></i>{{ game.name }}</span
            >
          </div>
        </section>
      </section>
    </template>
  </main>
</template>

<style scoped>
.compare-page {
  gap: 22px;
  padding-top: 10px;
  padding-bottom: 60px;
}
.compare-header h1 {
  margin-top: 6px;
  font-size: clamp(2.2rem, 4vw, 2.8rem);
}
.compare-header p {
  margin-top: 7px;
  color: var(--color-search-text);
}
.compare-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-width: 760px;
}
.compare-slot {
  min-width: 0;
}
.compare-search-wrap,
.compare-selected {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 10px 14px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 13px;
  background: linear-gradient(145deg, rgba(15, 24, 40, 0.96), rgba(8, 14, 24, 0.9));
}
.compare-search-wrap:focus-within {
  border-color: rgba(124, 92, 255, 0.5);
}
.compare-search-icon {
  color: #a896ff;
  font-size: 20px;
}
.compare-search-wrap input {
  width: 100%;
  background: transparent;
  color: var(--color-text);
  outline: none;
}
.compare-search-wrap input::placeholder {
  color: var(--color-search-text);
}
.compare-selected img {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border-radius: 8px;
  object-fit: cover;
}
.compare-selected div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.compare-selected strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.compare-selected span {
  color: var(--color-search-text);
  font-size: 12px;
}
.compare-selected button {
  margin-left: auto;
  color: var(--color-search-text);
  font-size: 22px;
}
.compare-results {
  position: absolute;
  z-index: 5;
  top: calc(100% + 7px);
  left: 0;
  right: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: #101a2a;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.5);
}
.compare-results button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  text-align: left;
}
.compare-results button:hover {
  background: rgba(124, 92, 255, 0.14);
}
.compare-results img {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  object-fit: cover;
}
.compare-results span {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}
.compare-results strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.compare-results small {
  color: var(--color-search-text);
}
.compare-results__loading {
  padding: 14px;
  color: var(--color-search-text);
  font-size: 13px;
}
.compare-empty {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(15, 24, 40, 0.82), rgba(8, 14, 24, 0.75));
}
.compare-empty__mark {
  width: 65px;
  height: 65px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  border: 1px solid rgba(124, 92, 255, 0.4);
  border-radius: 50%;
  color: #a99aff;
  background: rgba(124, 92, 255, 0.12);
  font-size: 27px;
}
.compare-empty h2 {
  font-size: 1.35rem;
}
.compare-empty p {
  max-width: 370px;
  margin-top: 9px;
  color: var(--color-search-text);
  line-height: 1.5;
}
.compare-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
.compare-tabs a {
  padding: 12px 4px;
  color: var(--color-search-text);
  font-size: 13px;
}
.compare-tabs__active {
  color: var(--color-text) !important;
  border-bottom: 2px solid #8065ff;
}
.compare-overview {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(330px, 0.9fr);
  gap: 14px;
  align-items: stretch;
}
.compare-table-wrap,
.compare-panel {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(15, 24, 40, 0.95), rgba(8, 14, 24, 0.9));
}
.compare-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.compare-table th,
.compare-table td {
  padding: 14px 13px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.09);
  text-align: left;
  font-size: 13px;
}
.compare-table tr:last-child th,
.compare-table tr:last-child td {
  border-bottom: 0;
}
.compare-table thead th {
  height: 78px;
  color: var(--color-text);
  font-size: 13px;
}
.compare-table thead th:first-child {
  width: 32%;
  color: var(--color-search-text);
}
.compare-table thead th:not(:first-child) {
  display: table-cell;
}
.compare-table thead img {
  width: 30px;
  height: 30px;
  margin-right: 8px;
  vertical-align: middle;
  border-radius: 6px;
  object-fit: cover;
}
.compare-table thead span {
  display: inline-block;
  max-width: calc(100% - 44px);
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.compare-table tbody th {
  color: var(--color-search-text);
  font-weight: 500;
}
.compare-table td {
  color: var(--color-text);
  font-weight: 600;
}
.compare-panel {
  padding: 20px;
}
.compare-panel__heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.compare-panel__heading h2 {
  margin-top: 5px;
  font-size: 1.1rem;
}
.compare-panel__hint {
  color: var(--color-search-text);
  font-size: 11px;
}
.radar-chart {
  display: block;
  width: min(100%, 350px);
  height: auto;
  margin: 12px auto 0;
  overflow: visible;
}
.radar-grid polygon {
  fill: rgba(85, 101, 130, 0.06);
  stroke: rgba(148, 163, 184, 0.2);
  stroke-width: 1;
}
.radar-chart line {
  stroke: rgba(148, 163, 184, 0.13);
  stroke-width: 1;
}
.radar-chart text {
  fill: var(--color-search-text);
  font-size: 10px;
}
.radar-shape {
  stroke-width: 2;
  fill-opacity: 0.16;
}
.radar-shape--0 {
  fill: #a06cff;
  stroke: #a06cff;
}
.radar-shape--1 {
  fill: #4e9dff;
  stroke: #4e9dff;
}
.radar-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--color-search-text);
  font-size: 12px;
}
.legend-color {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
}
.legend-color--0 {
  background: #a06cff;
}
.legend-color--1 {
  background: #4e9dff;
}
@media (max-width: 950px) {
  .compare-overview {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .compare-page {
    padding-top: 0;
  }
  .compare-picker {
    grid-template-columns: 1fr;
  }
  .compare-tabs {
    gap: 14px;
  }
  .compare-table-wrap {
    overflow-x: auto;
  }
  .compare-table {
    min-width: 560px;
  }
  .compare-empty {
    min-height: 300px;
    padding: 30px 20px;
  }
}
</style>
