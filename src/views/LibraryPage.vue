<script setup lang="ts">
import { rawgService } from '@/api';
import IconSearch from '@/components/icons/IconSearch.vue';
import SortDropdown from '@/components/SortDropdown.vue';
import type { Platform } from '@/interfaces/allGamesList.interface';
import type {
  DraftEntry,
  FilterKey,
  LibraryStatus,
  LoadedLibraryGame,
  SortKey,
} from '@/interfaces/library.interface';
import type { SingleGame } from '@/interfaces/singleGame.interface';
import { useLibrary } from '@/stores/library.store';
import { computed, ref, watch } from 'vue';

const statusOrder: LibraryStatus[] = [
  'unmarked',
  'playing',
  'completed',
  'planned',
  'paused',
  'dropped',
];
const statusLabels: Record<LibraryStatus, string> = {
  unmarked: 'Unmarked',
  playing: 'Playing',
  completed: 'Completed',
  planned: 'Planned',
  paused: 'Paused',
  dropped: 'Dropped',
};

const library = useLibrary();
const games = ref<LoadedLibraryGame[]>([]);
const isLoading = ref(false);
const loadError = ref('');
const searchQuery = ref('');
const activeFilter = ref<FilterKey>('all');
const sortKey = ref<SortKey>('recent');
const displayMode = ref<'rows' | 'grid'>('rows');
const editingGameId = ref<number | null>(null);
const drafts = ref<Record<number, DraftEntry>>({});
let requestToken = 0;

const editingGame = computed(
  () => games.value.find((game) => game.id === editingGameId.value) ?? null,
);

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'rating', label: 'Rating' },
  { value: 'playtime', label: 'Playtime' },
  { value: 'name', label: 'Name' },
];

const librarySortOptions = sortOptions.map((option) => ({
  label: option.label,
  key: option.value,
}));

const storageIds = computed(() => library.my_lib.map((item) => item.id));
const platformLabel = (platforms: Platform[], slug: string) => {
  const match = platforms.find((item) => item.platform.slug === slug);
  return match?.platform.name ?? slug.toUpperCase();
};

const activeCount = (status: LibraryStatus) =>
  games.value.filter((game) => game.library.status === status).length;

const tabs = computed(() => [
  { key: 'all' as const, label: `All Games (${games.value.length})` },
  ...statusOrder.map((status) => ({
    key: status,
    label: `${statusLabels[status]} (${activeCount(status)})`,
  })),
]);

const loadLibrary = async () => {
  const currentToken = ++requestToken;
  const entries = [...library.my_lib];
  loadError.value = '';

  if (!entries.length) {
    games.value = [];
    return;
  }

  isLoading.value = true;

  try {
    const results = await Promise.allSettled(entries.map((entry) => rawgService.getById(entry.id)));
    if (currentToken !== requestToken) return;

    const nextGames = results.flatMap((result, index) => {
      const entry = entries[index];
      if (result.status !== 'fulfilled' || !entry) return [];

      return [
        {
          ...(result.value.data as SingleGame),
          library: entry,
        },
      ];
    });

    games.value = nextGames;

    if (!nextGames.length) {
      loadError.value = 'Could not load your library from RAWG.';
    }
  } catch (error) {
    console.error(error);
    games.value = [];
    loadError.value = 'Could not load your library.';
  } finally {
    if (currentToken === requestToken) isLoading.value = false;
  }
};

const filteredGames = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const sorted = [...games.value];

  sorted.sort((a, b) => {
    if (sortKey.value === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortKey.value === 'playtime') return (b.playtime || 0) - (a.playtime || 0);
    if (sortKey.value === 'name') return a.name.localeCompare(b.name);

    return new Date(b.library.updatedAt).getTime() - new Date(a.library.updatedAt).getTime();
  });

  return sorted.filter((game) => {
    if (activeFilter.value !== 'all' && game.library.status !== activeFilter.value) return false;
    if (!query) return true;

    const searchable = [
      game.name,
      game.slug,
      game.released,
      game.platforms?.map((item) => item.platform.name).join(' '),
      game.library.status,
      game.library.platform,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  });
});

const progressWidth = (game: LoadedLibraryGame) =>
  Math.max(0, Math.min(100, Number(game.library.progress || 0)));

const getDraft = (game: LoadedLibraryGame): DraftEntry => ({
  status: drafts.value[game.id]?.status ?? game.library.status,
  platform: drafts.value[game.id]?.platform ?? game.library.platform,
  progress: drafts.value[game.id]?.progress ?? game.library.progress,
});

const startEditing = (game: LoadedLibraryGame) => {
  drafts.value = {
    ...drafts.value,
    [game.id]: {
      status: game.library.status,
      platform: game.library.platform,
      progress: game.library.progress,
    },
  };
  editingGameId.value = game.id;
};

const cancelEditing = () => {
  if (editingGameId.value === null) return;

  const nextDrafts = { ...drafts.value };
  delete nextDrafts[editingGameId.value];
  drafts.value = nextDrafts;
  editingGameId.value = null;
};

const setDraftStatus = (gameId: number, status: LibraryStatus) => {
  const draft = drafts.value[gameId];
  if (!draft) return;

  drafts.value = {
    ...drafts.value,
    [gameId]: {
      ...draft,
      status,
      progress: status === 'completed' ? 100 : status === 'planned' ? 0 : draft.progress,
    },
  };
};

const setDraftPlatform = (gameId: number, platform: string) => {
  const draft = drafts.value[gameId];
  if (!draft) return;

  drafts.value = {
    ...drafts.value,
    [gameId]: {
      ...draft,
      platform,
    },
  };
};

const setDraftProgress = (gameId: number, progress: number) => {
  const draft = drafts.value[gameId];
  if (!draft) return;

  if (draft.status === 'completed' || draft.status === 'planned') return;

  const nextProgress = Math.max(0, Math.min(100, Math.round(progress)));

  drafts.value = {
    ...drafts.value,
    [gameId]: {
      ...draft,
      progress: nextProgress,
      status: nextProgress === 100 ? 'completed' : draft.status,
    },
  };
};

const saveEditing = (gameId: number) => {
  const draft = drafts.value[gameId];
  if (!draft) return;

  library.updateEntry(gameId, {
    status: draft.status,
    platform: draft.platform,
    progress: draft.progress,
  });

  const nextDrafts = { ...drafts.value };
  delete nextDrafts[gameId];
  drafts.value = nextDrafts;
  editingGameId.value = null;
};

const removeGame = (id: number) => {
  if (editingGameId.value === id) {
    cancelEditing();
  }
  library.removeFromLib(id);
};

const setDisplayMode = (mode: 'rows' | 'grid') => {
  displayMode.value = mode;
};

watch(() => library.my_lib.map((item) => `${item.id}:${item.updatedAt}`).join('|'), loadLibrary, {
  immediate: true,
});
</script>

<template>
  <main class="library-page">
    <div class="library-header">
      <h1>My Library</h1>
    </div>

    <section class="library-card">
      <div class="library-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="library-tab"
          :class="{ 'library-tab--active': activeFilter === tab.key }"
          @click="activeFilter = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="library-toolbar">
        <label class="library-search">
          <IconSearch />
          <input v-model="searchQuery" type="text" placeholder="Search in library..." />
        </label>

        <div class="library-toolbar__actions">
          <SortDropdown
            v-model="sortKey"
            class="library-sort"
            label="Sort by"
            :allow-reverse="false"
            :options="librarySortOptions"
          />

          <div class="library-view-switch" role="group" aria-label="Display mode">
            <button
              type="button"
              class="library-view-switch__button"
              :class="{ 'library-view-switch__button--active': displayMode === 'rows' }"
              @click="setDisplayMode('rows')"
              aria-label="Rows view"
              title="Rows view"
            >
              <span class="library-view-switch__icon library-view-switch__icon--rows"></span>
            </button>
            <button
              type="button"
              class="library-view-switch__button"
              :class="{ 'library-view-switch__button--active': displayMode === 'grid' }"
              @click="setDisplayMode('grid')"
              aria-label="Grid view"
              title="Grid view"
            >
              <span class="library-view-switch__icon library-view-switch__icon--grid"></span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="library-state">
        <div class="library-spinner"></div>
      </div>

      <div v-else-if="loadError" class="library-state library-state--error">
        <p>{{ loadError }}</p>
        <button type="button" class="secondary-button" @click="loadLibrary">Try again</button>
      </div>

      <div v-else-if="!storageIds.length" class="library-state">
        <p>Your library is empty.</p>
      </div>

      <div
        v-else-if="filteredGames.length"
        class="library-list"
        :class="{
          'library-list--grid': displayMode === 'grid',
          'library-list--rows': displayMode === 'rows',
        }"
      >
        <article v-for="game in filteredGames" :key="game.id" class="library-row">
          <RouterLink
            :to="{ name: 'GameDetails', params: { slug: game.slug } }"
            class="library-row__cover"
          >
            <img :src="game.background_image" :alt="game.name" />
          </RouterLink>

          <div class="library-row__body">
            <div class="library-row__topline">
              <div class="library-row__title-wrap">
                <RouterLink
                  :to="{ name: 'GameDetails', params: { slug: game.slug } }"
                  class="library-row__title"
                >
                  {{ game.name }}
                </RouterLink>
                <p class="library-row__subtitle">
                  <span>{{ platformLabel(game.platforms, game.library.platform) }}</span>
                  <span>{{ game.released?.split('-')[0] || 'Unknown' }}</span>
                </p>
              </div>

              <div class="library-row__actions">
                <button
                  v-if="editingGameId !== game.id"
                  type="button"
                  class="library-row__edit"
                  @click="startEditing(game)"
                >
                  Edit
                </button>
                <button type="button" class="library-row__remove" @click="removeGame(game.id)">
                  🗑️
                </button>
              </div>
            </div>

            <div class="library-row__summary">
              <span class="library-platform-badge">{{
                platformLabel(game.platforms, game.library.platform).slice(0, 2).toUpperCase()
              }}</span>
              <span
                class="library-summary-chip library-summary-chip--status"
                :data-status="game.library.status"
                >{{ statusLabels[game.library.status] }}</span
              >
              <span class="library-row__progress library-row__progress--readonly">
                <span class="library-progress"
                  ><span
                    class="library-progress__fill"
                    :style="{ width: `${progressWidth(game)}%` }"
                  ></span
                ></span>
                <small>{{ progressWidth(game) }}%</small>
              </span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="library-state">
        <p>No games match your current filters.</p>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="editingGame && editingGameId !== null"
        class="library-modal"
        @click.self="cancelEditing"
      >
        <section
          class="library-editor"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-title"
        >
          <button
            type="button"
            class="library-editor__close"
            aria-label="Close editor"
            @click="cancelEditing"
          >
            ×
          </button>
          <div class="library-editor__heading">
            <img :src="editingGame.background_image" :alt="editingGame.name" />
            <div>
              <span class="section-eyebrow">Library settings</span>
              <h2 id="editor-title">{{ editingGame.name }}</h2>
              <p>Keep your progress and status up to date.</p>
            </div>
          </div>
          <div class="library-editor__field">
            <span class="library-control__label">Status</span>
            <div class="library-pills">
              <button
                v-for="status in statusOrder"
                :key="status"
                type="button"
                class="library-pill"
                :class="{ 'library-pill--active': getDraft(editingGame).status === status }"
                @click="setDraftStatus(editingGame.id, status)"
              >
                {{ statusLabels[status] }}
              </button>
            </div>
          </div>
          <div class="library-editor__field">
            <span class="library-control__label">Platform</span>
            <div class="library-pills">
              <button
                v-for="platform in editingGame.platforms"
                :key="platform.platform.slug"
                type="button"
                class="library-pill"
                :class="{
                  'library-pill--active': getDraft(editingGame).platform === platform.platform.slug,
                }"
                @click="setDraftPlatform(editingGame.id, platform.platform.slug)"
              >
                {{ platform.platform.name }}
              </button>
            </div>
          </div>
          <div class="library-editor__field">
            <div class="library-editor__label-row">
              <span class="library-control__label">Progress</span
              ><strong>{{ getDraft(editingGame).progress }}%</strong>
            </div>
            <input
              class="library-editor__range"
              type="range"
              min="0"
              max="100"
              :value="getDraft(editingGame).progress"
              :disabled="['completed', 'planned'].includes(getDraft(editingGame).status)"
              @input="
                setDraftProgress(editingGame.id, Number(($event.target as HTMLInputElement).value))
              "
            />
            <div class="library-editor__range-labels">
              <span>Not started</span><span>Completed</span>
            </div>
          </div>
          <div class="library-row__footer">
            <button type="button" class="secondary-button" @click="cancelEditing">Cancel</button
            ><button type="button" class="add-library__button" @click="saveEditing(editingGame.id)">
              Save changes
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.library-page {
  gap: 15px;
  padding-bottom: 60px;
  padding-top: 10px;
  font-size: 1rem;
}

.library-header h1 {
  font-size: clamp(2.2rem, 4vw, 2.8rem);
}

.library-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

.library-tab {
  height: 50px;
  padding: 0 15px;
  border-bottom: 5px solid rgba(148, 163, 184, 0.14);
  color: var(--color-search-text);
}

.library-tab:hover:not(.library-tab--active) {
  border-color: rgba(119, 70, 255, 0.38);
}

.library-tab--active {
  color: var(--color-text);
  border-color: rgba(120, 70, 255, 0.767);
}

.library-toolbar {
  height: 50px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.library-toolbar__actions {
  display: flex;
  gap: 10px;
}

.library-sort {
  background: var(--color-visible-search);
}

.library-sort :deep(.selected) {
  background: rgba(34, 28, 76, 0.9);
}

.library-search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 15px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 15px;
  background: var(--color-visible-search);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 10px 24px rgba(0, 0, 0, 0.18);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  flex: 1 1 290px;
}

.library-search:focus-within {
  border-color: rgba(112, 97, 255, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 16px 28px rgba(0, 0, 0, 0.24);
  transform: translateY(-1px);
}

.library-search input {
  width: 100%;
  background: transparent;
  color: var(--color-text);
}

.library-view-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 15px;
  background: var(--color-visible-search);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 10px 24px rgba(0, 0, 0, 0.18);
}

.library-view-switch__button {
  width: 40px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: var(--color-search-text);
  background: transparent;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.library-view-switch__button:hover {
  transform: translateY(-1px);
}

.library-view-switch__button--active {
  color: var(--color-text);
  background: rgba(34, 28, 76, 0.9);
}

.library-view-switch__icon {
  position: relative;
  display: block;
}

.library-view-switch__icon--rows {
  width: 16px;
  height: 12px;
}

.library-view-switch__icon--rows::before,
.library-view-switch__icon--rows::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 3px;
  background: currentColor;
  box-shadow: 0 8px 0 currentColor;
}

.library-view-switch__icon--rows::after {
  display: none;
}

.library-view-switch__icon--grid {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background:
    linear-gradient(currentColor, currentColor) left top / 6px 6px no-repeat,
    linear-gradient(currentColor, currentColor) right top / 6px 6px no-repeat,
    linear-gradient(currentColor, currentColor) left bottom / 6px 6px no-repeat,
    linear-gradient(currentColor, currentColor) right bottom / 6px 6px no-repeat;
}

.library-control__label,
.library-row__subtitle {
  color: var(--color-search-text);
}

.library-state {
  min-height: 250px;
  display: grid;
  place-items: center;
  color: var(--color-search-text);
}

.library-state--error {
  gap: 12px;
}

.library-spinner {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 5px solid rgba(148, 163, 184, 0.16);
  border-top-color: #7c5cff;
  animation: spin 0.9s linear infinite;
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.library-list--grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.library-list--grid .library-row {
  grid-template-columns: 100px minmax(0, 1fr);
  align-items: start;
}

.library-list--grid .library-row__cover {
  width: 100px;
  aspect-ratio: 1 / 1;
}

.library-list--grid .library-row__controls {
  gap: 14px;
}

.library-list--grid .library-row__progress {
  margin-top: 4px;
}

.library-row {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 16px;
  padding: 9px;
  border-radius: 12px;
  background: linear-gradient(110deg, rgba(12, 20, 33, 0.96), rgba(7, 13, 23, 0.86));
  border: 1px solid rgba(148, 163, 184, 0.08);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.library-row:hover {
  border-color: rgba(124, 92, 255, 0.32);
  transform: translateY(-1px);
}

.library-row__cover {
  width: 58px;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.9);
}

.library-row__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.library-row__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.library-row__topline {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.library-row__title-wrap {
  min-width: 0;
}

.library-row__title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-text);
}

.library-row__subtitle {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
}

.library-row__subtitle span + span::before {
  content: '•';
  margin-right: 8px;
}

.library-row__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.library-row__edit,
.library-row__remove {
  min-width: 35px;
  min-height: 30px;
  border-radius: 10px;
  color: var(--color-search-text);
  background: rgba(148, 163, 184, 0.08);
}

.library-row__remove {
  font-size: 0;
}

.library-row__remove::before {
  content: '×';
  font-size: 21px;
  line-height: 1;
}

.library-row__edit {
  min-width: 45px;
}

.library-row__edit:hover,
.library-row__remove:hover {
  color: var(--color-text);
  background: rgba(124, 92, 255, 0.22);
}

.library-row__controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.library-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.library-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.library-pill {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.72);
  color: var(--color-search-text);
  font-size: 12px;
}

.library-pill--active {
  color: var(--color-text);
  background: rgba(34, 28, 76, 0.9);
  border-color: rgba(112, 97, 255, 0.35);
}

.library-row__summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.library-platform-badge {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 22px;
  border-radius: 6px;
  color: #dbeafe;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.28);
  font-size: 10px;
  font-weight: 800;
}

.library-summary-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: var(--color-text);
  font-size: 12px;
}

.library-summary-chip--status[data-status='completed'] {
  color: #5ee0ae;
  background: rgba(43, 187, 134, 0.12);
  border-color: rgba(43, 187, 134, 0.24);
}

.library-summary-chip--status[data-status='playing'] {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.12);
  border-color: rgba(96, 165, 250, 0.24);
}

.library-row__progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.library-row__progress--readonly {
  flex: 1;
  min-width: 120px;
  margin-left: auto;
}

.library-row__progress--readonly small {
  min-width: 34px;
  color: var(--color-search-text);
  text-align: right;
}

.library-progress {
  position: relative;
  flex: 1 1 auto;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  overflow: hidden;
}

.library-progress__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7c5cff, #60a5fa);
}

.library-row__progress-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 72px;
  justify-content: flex-end;
}

.library-row__progress-meta small {
  color: var(--color-search-text);
}

.library-row__quick {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.08);
  color: var(--color-text);
  font-size: 12px;
}

.library-row__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.library-modal {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(1, 5, 14, 0.78);
  backdrop-filter: blur(9px);
}

.library-editor {
  position: relative;
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: linear-gradient(145deg, #111a2b, #090f1b);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
}

.library-editor__close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--color-search-text);
  background: rgba(148, 163, 184, 0.1);
  font-size: 24px;
  line-height: 1;
}

.library-editor__heading {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 40px;
}
.library-editor__heading img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}
.library-editor__heading h2 {
  margin-top: 4px;
  font-size: 1.45rem;
}
.library-editor__heading p {
  margin-top: 4px;
  color: var(--color-search-text);
  font-size: 13px;
}
.library-editor__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.library-editor__label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.library-editor__label-row strong {
  color: #9b8cff;
  font-size: 1.15rem;
}
.library-editor__range {
  width: 100%;
  accent-color: #7c5cff;
  cursor: pointer;
}

.library-editor__range:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.library-editor__range-labels {
  display: flex;
  justify-content: space-between;
  color: var(--color-search-text);
  font-size: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .library-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 16px;
  }

  .library-tab {
    width: 100%;
    min-width: 0;
    min-height: 42px;
    height: auto;
    padding: 8px 6px;
    font-size: 13px;
    line-height: 1.15;
  }

  .library-tab:nth-child(4) {
    grid-column: 2;
    grid-row: 2;
  }

  .library-tab:nth-child(5) {
    grid-column: 1;
    grid-row: 3;
  }

  .library-tab:nth-child(6) {
    grid-column: 2;
    grid-row: 3;
  }

  .library-tab:nth-child(7) {
    grid-column: 3;
    grid-row: 3;
  }

  .library-toolbar {
    height: auto;
    align-items: stretch;
  }

  .library-toolbar__actions {
    width: 100%;
    justify-content: space-between;
    gap: 14px;
  }

  .library-sort {
    flex: 0 0 auto;
    width: min(240px, 100%);
    max-width: 100%;
    justify-content: center;
  }

  .library-sort :deep(.sort-label) {
    display: none;
  }

  .library-sort :deep(.sort-trigger) {
    width: 100%;
    justify-content: center;
    position: relative;
  }

  .library-sort :deep(.sort-trigger .arrow) {
    position: absolute;
    right: 0;
  }

  .library-row {
    grid-template-columns: 82px minmax(0, 1fr);
    gap: 12px;
    padding: 10px;
  }

  .library-list--grid .library-row {
    grid-template-columns: 82px minmax(0, 1fr);
  }

  .library-row__cover {
    width: 82px;
    aspect-ratio: 3 / 4;
  }

  .library-row__topline {
    align-items: flex-start;
    gap: 8px;
  }

  .library-row__actions {
    align-self: flex-end;
  }

  .library-row__title {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .library-row__subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .library-row__progress {
    flex-direction: column;
    align-items: stretch;
  }

  .library-row__summary {
    flex-wrap: wrap;
  }
  .library-row__progress--readonly {
    flex-basis: 100%;
    margin-left: 0;
  }

  .library-row__summary {
    min-width: 0;
  }

  .library-row__progress-meta {
    justify-content: space-between;
  }

  .library-row__footer {
    justify-content: stretch;
  }

  .library-row__footer :deep(button) {
    flex: 1 1 0;
  }

  .library-editor {
    max-height: calc(100svh - 32px);
    overflow-y: auto;
    padding: 21px 18px;
    border-radius: 18px;
  }
}

@media (max-width: 480px) {
  .library-row {
    grid-template-columns: 68px minmax(0, 1fr);
    gap: 10px;
    padding: 8px;
  }

  .library-row__cover,
  .library-list--grid .library-row__cover {
    width: 68px;
  }

  .library-row__subtitle {
    font-size: 11px;
  }

  .library-row__edit,
  .library-row__remove {
    min-height: 28px;
  }
}
</style>
