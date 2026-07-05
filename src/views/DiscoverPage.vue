<script setup lang="ts">
import { rawgService } from '@/api';
import IconSearch from '@/components/icons/IconSearch.vue';
import NavigationSearch from '@/components/NavigationSearch.vue';
import PaginationComponent from '@/components/PaginationComponent.vue';
import SortDropdown from '@/components/SortDropdown.vue';
import TrendingGames from '@/components/TrendingGames.vue';
import type { Result } from '@/interfaces/allGamesList.interface';
import type { FilterParams } from '@/interfaces/filter.interface';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const games = ref<Result[]>([]);
const totalGames = ref<number>(0);
const searchQuery = ref<string>(String(route.query.search || ''));
const isLoading = ref<boolean>(false);

watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = String(value || '');
  },
);

const loadData = async () => {
  isLoading.value = true;
  try {
    const { data } = await rawgService.getByFilter({
      genres: route.query.genres as string,
      platforms: route.query.platforms as string,
      tags: route.query.tags as string,
      metacritic: route.query.metacritic as string,
      dates: route.query.dates as string,
      search: route.query.search as string,
      ordering: route.query.ordering as string,
      page: Number(route.query.page) || 1,
      pageSize: 9,
    });

    games.value = data.results;
    totalGames.value = data.count;
  } catch (e) {
    console.error(e);
    games.value = [];
    totalGames.value = 0;
  } finally {
    isLoading.value = false;
  }
};

watch(() => route.query, loadData, { deep: true });

onMounted(loadData);

const handleSubmitSearch = () => {
  const query = searchQuery.value.trim();
  router.push({
    name: 'Discover',
    query: {
      ...route.query,
      search: query || undefined,
      page: 1,
    },
  });
};

const handleFilterUpdate = (newFilters: FilterParams) => {
  router.push({
    name: 'Discover',
    query: {
      ...route.query,
      ...newFilters,
      page: 1,
    },
  });
};

const currentOrdering = computed({
  get: () => (route.query.ordering as string) || '-added',
  set: (value: string) => {
    router.push({
      name: 'Discover',
      query: {
        ...route.query,
        ordering: value,
        page: 1,
      },
    });
  },
});

const subtitle = computed(() => {
  const query = String(route.query.search || '').trim();
  return query ? `Showing results for "${query}"` : 'Find your next favorite game';
});
</script>

<template>
  <main>
    <div class="search-header">
      <h1 class="search-header__title">Discover</h1>
      <p class="additional-info--grey-big">{{ subtitle }}</p>
      <form @submit.prevent="handleSubmitSearch" class="search-header__input">
        <button type="submit" class="search-button"><IconSearch /></button>
        <input
          type="text"
          class="search-input"
          v-model="searchQuery"
          placeholder="Search games..."
        />
        <button type="button" v-if="searchQuery" class="clear-button" @click="searchQuery = ''">
          X
        </button>
      </form>
    </div>

    <div class="search-body">
      <NavigationSearch :initial-filters="route.query" @update="handleFilterUpdate" />
      <div class="search-games">
        <div class="search-body__header">
          <span class="additional-info--grey-big">{{ totalGames }} games found</span>
          <SortDropdown v-model="currentOrdering" />
        </div>
        <div v-if="isLoading" class="spinner"></div>
        <div v-else>
          <div v-if="games.length === 0" class="empty-info">No games found.</div>
          <div v-else class="trending-games-list">
            <TrendingGames
              v-for="game in games"
              :key="game.id"
              :icon="game.background_image"
              :title="game.name"
              :slug="game.slug"
              :rating="game.rating"
              :release-date="game.released"
            />
          </div>
        </div>
        <PaginationComponent
          :total-items="totalGames"
          :page-size="9"
          :current-page="Number(route.query.page) || 1"
          @update="(page) => router.push({ name: 'Discover', query: { ...route.query, page } })"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  margin-bottom: 100px;
}

.search-header {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.search-header__title {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-text);
}

.search-header .additional-info--grey-big {
  margin: -3px 0 25px;
}

.search-header__input {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  background: var(--color-visible-search);
  border: 1px solid var(--color-box-border);
  border-radius: 18px;
  padding: 8px 12px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.45);
}

.search-button {
  width: 48px;
  height: 48px;
  display: flex;
  font-size: 100px;
  justify-content: center;
  align-items: center;
  background: var(--color-gradient);
  border-radius: 15px;
  color: var(--color-text);
}

.search-button:hover svg {
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;
}

.search-button:active svg {
  width: 29px;
  height: 29px;
  transition: all 0.3s ease;
}

.clear-button {
  padding: 0 12px;
  font-size: 1.3rem;
}

.search-input {
  height: 100%;
  width: 92%;
  background-color: transparent;
  color: var(--color-text);
  font-size: 1.3rem;
}

.search-input::placeholder {
  color: var(--color-search-text);
}

.search-body {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 30px;
  align-items: start;
}

.search-games {
  background: var(--color-visible-search);
  border: 1px solid var(--color-box-border);
  border-radius: 30px;
  padding: 15px 20px;
  box-shadow: 0 28px 70px rgba(2, 8, 22, 0.35);
}

.search-body__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trending-games-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px;
  --card-img-height: 350px;
  --title-font-size: 1.5rem;
  --title-rows-length: 1;
  --card-rating-size: 1.3rem;
}

.spinner {
  min-height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner::after {
  content: '';
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 6px solid var(--color-box-border);
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

.empty-info {
  min-height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-search-text);
  font-size: 1.3rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
