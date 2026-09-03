<script setup lang="ts">
import { rawgService } from '@/api';
import type { SingleGame } from '@/interfaces/singleGame.interface';
import type { LibraryEntry, LibraryStatus } from '@/interfaces/library.interface';
import { useLibrary } from '@/stores/library.store';
import { computed, ref, watch } from 'vue';

type StatsGame = SingleGame & { genres?: Array<{ name: string }> };
type LoadedStatsGame = StatsGame & { library: LibraryEntry };
type Period = 'all' | 'year' | 'month';

const library = useLibrary();
const games = ref<LoadedStatsGame[]>([]);
const isLoading = ref(false);
const loadError = ref('');
const period = ref<Period>('all');
let requestToken = 0;

const statusLabels: Record<LibraryStatus, string> = {
  unmarked: 'Unmarked',
  playing: 'Playing',
  completed: 'Completed',
  planned: 'Planned',
  paused: 'Paused',
  dropped: 'Dropped',
};
const periodLabels: Record<Period, string> = {
  all: 'All time',
  year: 'Last year',
  month: 'Last month',
};

const loadStats = async () => {
  const entries = [...library.my_lib];
  const currentToken = ++requestToken;
  loadError.value = '';
  if (!entries.length) {
    games.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const results = await Promise.allSettled(entries.map((entry) => rawgService.getById(entry.id)));
    if (currentToken !== requestToken) return;
    games.value = results.flatMap((result, index) => {
      const entry = entries[index];
      return result.status === 'fulfilled' && entry
        ? [{ ...(result.value.data as StatsGame), library: entry }]
        : [];
    });
    if (!games.value.length) loadError.value = 'Could not load statistics right now.';
  } catch (error) {
    console.error(error);
    games.value = [];
    loadError.value = 'Could not load statistics right now.';
  } finally {
    if (currentToken === requestToken) isLoading.value = false;
  }
};

const visibleGames = computed(() => {
  if (period.value === 'all') return games.value;
  const now = Date.now();
  const duration = period.value === 'year' ? 365 : 30;
  return games.value.filter(
    (game) => now - new Date(game.library.updatedAt).getTime() <= duration * 86400000,
  );
});

const countByStatus = (status: LibraryStatus) =>
  visibleGames.value.filter((game) => game.library.status === status).length;
const totalGames = computed(() => visibleGames.value.length);
const completedGames = computed(() => countByStatus('completed'));
const averageProgress = computed(() =>
  totalGames.value
    ? Math.round(
        visibleGames.value.reduce((sum, game) => sum + game.library.progress, 0) / totalGames.value,
      )
    : 0,
);
const progressBuckets = computed(() => ({
  notStarted: visibleGames.value.filter((game) => game.library.progress === 0).length,
  inProgress: visibleGames.value.filter(
    (game) => game.library.progress > 0 && game.library.progress < 100,
  ).length,
  completed: visibleGames.value.filter((game) => game.library.progress === 100).length,
}));
const estimatedHours = computed(() =>
  visibleGames.value.reduce((sum, game) => sum + Number(game.playtime || 0), 0),
);
const completionRate = computed(() =>
  totalGames.value ? Math.round((completedGames.value / totalGames.value) * 100) : 0,
);

const genreStats = computed(() => {
  const counts = new Map<string, number>();
  visibleGames.value.forEach((game) =>
    game.genres?.forEach((genre) => counts.set(genre.name, (counts.get(genre.name) || 0) + 1)),
  );
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / Math.max(totalGames.value, 1)) * 100),
    }));
});

const platformStats = computed(() => {
  const counts = new Map<string, number>();
  visibleGames.value.forEach((game) => {
    const name =
      game.platforms?.find((item) => item.platform.slug === game.library.platform)?.platform.name ||
      game.library.platform.toUpperCase();
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / Math.max(totalGames.value, 1)) * 100),
    }));
});

const statusStats = computed(() =>
  (['playing', 'completed', 'planned', 'paused', 'dropped', 'unmarked'] as LibraryStatus[])
    .map((status) => ({ status, label: statusLabels[status], count: countByStatus(status) }))
    .filter((item) => item.count),
);
const mostProgressed = computed(() =>
  [...visibleGames.value].sort((a, b) => b.library.progress - a.library.progress).slice(0, 5),
);

watch(() => library.my_lib.map((item) => `${item.id}:${item.updatedAt}`).join('|'), loadStats, {
  immediate: true,
});
</script>

<template>
  <main class="stats-page">
    <div class="stats-header">
      <div>
        <h1>Gaming Statistics</h1>
        <p>See how your collection is growing and where your progress is heading.</p>
      </div>
      <label class="stats-period"
        ><span>Period</span
        ><select v-model="period">
          <option v-for="(label, key) in periodLabels" :key="key" :value="key">{{ label }}</option>
        </select></label
      >
    </div>

    <div v-if="isLoading" class="stats-state"><div class="library-spinner"></div></div>
    <div v-else-if="loadError" class="stats-state stats-state--error">
      <p>{{ loadError }}</p>
      <button type="button" class="secondary-button" @click="loadStats">Try again</button>
    </div>
    <section v-else-if="!library.my_lib.length" class="stats-empty">
      <div class="stats-empty__orb">✦</div>
      <span class="section-eyebrow">Your story starts here</span>
      <h2>No games to analyze yet</h2>
      <p>
        Add a few games to your library and this page will turn your collection into a personal
        gaming dashboard.
      </p>
      <RouterLink to="/discover" class="add-library__button">Explore games</RouterLink>
    </section>
    <div v-else class="stats-content">
      <div class="stats-kpis">
        <article class="stats-kpi">
          <span>Games collected</span><strong>{{ totalGames }}</strong
          ><small>{{ periodLabels[period].toLowerCase() }}</small>
        </article>
        <article class="stats-kpi stats-kpi--purple">
          <span>Average progress</span><strong>{{ averageProgress }}%</strong
          ><small>{{ completedGames }} completed</small>
        </article>
        <article class="stats-kpi stats-kpi--green">
          <span>Completion rate</span><strong>{{ completionRate }}%</strong
          ><small>of your collection</small>
        </article>
        <article class="stats-kpi stats-kpi--blue">
          <span>Estimated playtime</span><strong>{{ estimatedHours }}h</strong
          ><small>based on RAWG data</small>
        </article>
      </div>

      <div v-if="!visibleGames.length" class="stats-empty stats-empty--small">
        <h2>No activity in this period</h2>
        <p>Try changing the period or update a game in your library.</p>
      </div>
      <template v-else>
        <div class="stats-grid stats-grid--top">
          <section class="stats-panel stats-progress-panel">
            <div class="stats-panel__heading">
              <div>
                <span class="section-eyebrow">Your momentum</span>
                <h2>Average library progress</h2>
              </div>
              <strong>{{ averageProgress }}%</strong>
            </div>
            <div class="progress-snapshot">
              <div class="progress-snapshot__track">
                <i :style="{ width: `${averageProgress}%` }"></i>
              </div>
              <div class="progress-snapshot__caption">
                <span>Your overall progress</span><b>{{ averageProgress }}%</b>
              </div>
              <div class="progress-snapshot__legend">
                <span
                  ><i class="legend-dot legend-dot--muted"></i
                  ><b>{{ progressBuckets.notStarted }}</b> Not started</span
                >
                <span
                  ><i class="legend-dot legend-dot--purple"></i
                  ><b>{{ progressBuckets.inProgress }}</b> In progress</span
                >
                <span
                  ><i class="legend-dot legend-dot--green"></i
                  ><b>{{ progressBuckets.completed }}</b> Completed</span
                >
              </div>
            </div>
            <div class="stats-progress-caption">
              <span>{{ totalGames - completedGames }} games left to finish</span
              ><span>{{ completedGames }}/{{ totalGames }} complete</span>
            </div>
          </section>
          <section class="stats-panel">
            <div class="stats-panel__heading">
              <div>
                <span class="section-eyebrow">Collection shape</span>
                <h2>By status</h2>
              </div>
            </div>
            <div class="status-bars">
              <div v-for="item in statusStats" :key="item.status" class="status-bar">
                <div>
                  <span>{{ item.label }}</span
                  ><b>{{ item.count }}</b>
                </div>
                <div class="status-bar__track">
                  <i
                    :data-status="item.status"
                    :style="{ width: `${(item.count / totalGames) * 100}%` }"
                  ></i>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="stats-grid">
          <section class="stats-panel">
            <div class="stats-panel__heading">
              <div>
                <span class="section-eyebrow">Your taste</span>
                <h2>Favorite genres</h2>
              </div>
            </div>
            <div class="stat-list">
              <div v-for="item in genreStats" :key="item.name" class="stat-list__item">
                <span class="stat-dot stat-dot--purple"></span><span>{{ item.name }}</span>
                <div class="stat-list__track"><i :style="{ width: `${item.percent}%` }"></i></div>
                <b>{{ item.percent }}%</b>
              </div>
              <p v-if="!genreStats.length" class="stats-muted">Genre data is not available yet.</p>
            </div>
          </section>
          <section class="stats-panel">
            <div class="stats-panel__heading">
              <div>
                <span class="section-eyebrow">Your setup</span>
                <h2>Platform breakdown</h2>
              </div>
            </div>
            <div class="stat-list">
              <div v-for="item in platformStats" :key="item.name" class="stat-list__item">
                <span class="stat-dot stat-dot--blue"></span><span>{{ item.name }}</span>
                <div class="stat-list__track">
                  <i class="stat-list__track--blue" :style="{ width: `${item.percent}%` }"></i>
                </div>
                <b>{{ item.percent }}%</b>
              </div>
            </div>
          </section>
        </div>
        <section class="stats-panel stats-games-panel">
          <div class="stats-panel__heading">
            <div>
              <span class="section-eyebrow">Next milestones</span>
              <h2>Games in progress</h2>
            </div>
            <RouterLink to="/lib">View library →</RouterLink>
          </div>
          <div class="milestone-list">
            <RouterLink
              v-for="game in mostProgressed"
              :key="game.id"
              :to="{ name: 'GameDetails', params: { slug: game.slug } }"
              class="milestone"
              ><img :src="game.background_image" :alt="game.name" />
              <div class="milestone__body">
                <div>
                  <strong>{{ game.name }}</strong
                  ><span>{{ statusLabels[game.library.status] }}</span>
                </div>
                <div class="milestone__track">
                  <i :style="{ width: `${game.library.progress}%` }"></i>
                </div>
              </div>
              <b>{{ game.library.progress }}%</b></RouterLink
            >
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.stats-page {
  padding-top: 10px;
  padding-bottom: 60px;
  gap: 24px;
}
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}
.stats-header h1 {
  margin-top: 6px;
  font-size: clamp(2.2rem, 4vw, 2.8rem);
}
.stats-header p {
  margin-top: 7px;
  color: var(--color-search-text);
}
.stats-period {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-search-text);
  font-size: 12px;
}
.stats-period select {
  min-width: 130px;
  padding: 10px 13px;
  border: 1px solid var(--color-box-border);
  border-radius: 10px;
  background: var(--color-visible-search);
  color: var(--color-text);
  outline: none;
}
.stats-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.stats-kpis,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.stats-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.stats-kpi,
.stats-panel,
.stats-empty {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(15, 24, 40, 0.95), rgba(8, 14, 24, 0.9));
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
}
.stats-kpi {
  min-height: 132px;
  padding: 19px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.stats-kpi::after {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  right: -32px;
  bottom: -42px;
  border-radius: 50%;
  background: rgba(43, 187, 134, 0.18);
  filter: blur(4px);
}
.stats-kpi--purple::after {
  background: rgba(124, 92, 255, 0.2);
}
.stats-kpi--blue::after {
  background: rgba(96, 165, 250, 0.18);
}
.stats-kpi span,
.stats-kpi small,
.stats-muted {
  color: var(--color-search-text);
}
.stats-kpi strong {
  font-size: 2rem;
  letter-spacing: -0.04em;
}
.stats-kpi small {
  font-size: 12px;
}
.stats-panel {
  padding: 20px;
  min-width: 0;
}
.stats-panel__heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  margin-bottom: 20px;
}
.stats-panel__heading h2 {
  margin-top: 5px;
  font-size: 1.1rem;
}
.stats-panel__heading strong {
  color: #9d8cff;
  font-size: 1.8rem;
}
.stats-panel__heading a {
  color: #a99aff;
  font-size: 13px;
}
.stats-progress-panel {
  display: grid;
  grid-template-columns: 1fr 145px;
  align-items: center;
}
.stats-progress-panel .stats-panel__heading {
  margin-bottom: 0;
}
.progress-snapshot {
  grid-column: 1 / -1;
  width: 100%;
  margin-top: 5px;
}
.progress-snapshot__track {
  display: flex;
  width: 100%;
  height: 18px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.1);
}
.progress-snapshot__track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6855ed, #a477ff);
  transition: width 0.3s ease;
}
.progress-snapshot__caption {
  display: flex;
  justify-content: space-between;
  margin-top: 9px;
  color: var(--color-search-text);
  font-size: 12px;
}
.progress-snapshot__caption b {
  color: var(--color-text);
}
.progress-snapshot__legend {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 16px;
}
.progress-snapshot__legend span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--color-search-text);
  font-size: 12px;
}
.progress-snapshot__legend b {
  color: var(--color-text);
}
.legend-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
}
.legend-dot--muted {
  background: #64748b;
}
.legend-dot--purple {
  background: #9574ff;
}
.legend-dot--green {
  background: #43ce96;
}
.stats-progress-caption {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  color: var(--color-search-text);
  font-size: 12px;
}
.status-bars,
.stat-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.status-bar > div:first-child {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  font-size: 13px;
}
.status-bar b {
  color: var(--color-search-text);
}
.status-bar__track,
.stat-list__track,
.milestone__track {
  height: 7px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(148, 163, 184, 0.12);
}
.status-bar__track i,
.stat-list__track i,
.milestone__track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6f5bff, #9a78ff);
}
.status-bar__track i[data-status='completed'] {
  background: linear-gradient(90deg, #25aa78, #5ee0ae);
}
.status-bar__track i[data-status='dropped'] {
  background: #ef718b;
}
.status-bar__track i[data-status='playing'] {
  background: #60a5fa;
}
.stat-list__item {
  display: grid;
  grid-template-columns: 9px minmax(80px, 0.7fr) 1fr 36px;
  align-items: center;
  gap: 9px;
  font-size: 13px;
}
.stat-list__item b {
  color: var(--color-search-text);
  text-align: right;
  font-size: 12px;
}
.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9a78ff;
}
.stat-dot--blue {
  background: #60a5fa;
}
.stat-list__track {
  height: 6px;
}
.stat-list__track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #9a78ff;
}
.stat-list__track--blue {
  background: #60a5fa !important;
}
.stats-games-panel {
  padding-bottom: 12px;
}
.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.milestone {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 42px;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  transition: background 0.2s ease;
}
.milestone:hover {
  background: rgba(148, 163, 184, 0.07);
}
.milestone img {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
}
.milestone__body > div:first-child {
  display: flex;
  justify-content: space-between;
  min-width: 0;
  gap: 8px;
  margin-bottom: 7px;
}
.milestone strong {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}
.milestone span {
  flex: 0 0 auto;
  overflow: hidden;
  color: var(--color-search-text);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.milestone > b {
  color: #a99aff;
  text-align: right;
  font-size: 13px;
}
.milestone__track i {
  background: linear-gradient(90deg, #536dff, #ad75ff);
}
.stats-state {
  min-height: 350px;
  display: grid;
  place-items: center;
}
.stats-state--error {
  align-content: center;
  gap: 12px;
  color: var(--color-search-text);
}
.stats-empty {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}
.stats-empty__orb {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border: 1px solid rgba(124, 92, 255, 0.4);
  border-radius: 50%;
  color: #b09fff;
  background: radial-gradient(circle, rgba(124, 92, 255, 0.32), rgba(124, 92, 255, 0.05));
  font-size: 28px;
}
.stats-empty h2 {
  margin-top: 9px;
  font-size: 1.5rem;
}
.stats-empty p {
  max-width: 420px;
  margin: 10px 0 22px;
  color: var(--color-search-text);
  line-height: 1.6;
}
.stats-empty--small {
  min-height: 230px;
}
.stats-empty--small p {
  margin-bottom: 0;
}
.stats-empty--small h2 {
  margin-top: 0;
}
@media (max-width: 900px) {
  .stats-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 680px) {
  .stats-page {
    padding-top: 0;
  }
  .stats-header {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-kpis {
    grid-template-columns: 1fr;
  }
  .stats-period {
    align-self: flex-start;
  }
  .stats-grid,
  .stats-progress-panel {
    grid-template-columns: 1fr;
  }
  .stats-progress-panel .stats-panel__heading {
    margin-bottom: 20px;
  }
  .progress-snapshot__legend {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .stats-progress-caption {
    gap: 12px;
    flex-direction: column;
  }
  .stat-list__item {
    grid-template-columns: 9px minmax(70px, 0.8fr) 1fr 34px;
  }
  .stats-empty {
    min-height: 360px;
    padding: 25px 18px;
  }
}
</style>
