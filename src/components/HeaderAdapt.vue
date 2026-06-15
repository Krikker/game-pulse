<script setup lang="ts">
import { ref, watch } from 'vue';
import IconLogo from './icons/IconLogo.vue';
import IconSearch from './icons/IconSearch.vue';
import { useDebounce } from './UseDebounce.ts';
import { rawgService } from '@/api.ts';
import type { Result } from '@/interfaces/allGamesList.interface.ts';
import SuggestedGame from './SuggestedGame.vue';
import { useRouter } from 'vue-router';
import { useClickOutside } from './UseClickOutside.ts';

const searchQuery = ref<string>('');
const results = ref<Result[]>([]);
const isLoading = ref(false);

const isDropdownOpen = ref(false);
const searchContainerRef = ref<HTMLElement | null>(null);

useClickOutside(searchContainerRef, () => {
  isDropdownOpen.value = false;
});

const router = useRouter();
const debouncedQuery = useDebounce(searchQuery);

watch(debouncedQuery, async (newQuery) => {
  if (!newQuery) {
    results.value = [];
    isDropdownOpen.value = false;
    return;
  }
  isLoading.value = true;
  results.value = [];
  try {
    const response = await rawgService.getAll(searchQuery.value, 5);
    results.value = response.data.results;
    isDropdownOpen.value = true;
  } catch (e) {
    console.error(e);
    results.value = [];
    isDropdownOpen.value = false;
  } finally {
    isLoading.value = false;
  }
});

const handleSubmitSearch = async () => {
  const query = searchQuery.value.trim();
  if (query) {
    results.value = [];
    isDropdownOpen.value = false;
    router.push({
      name: 'Search',
      params: { query: query },
    });
  }
};
</script>

<template>
  <header>
    <div class="logo-name">
      <RouterLink to="/">
        <IconLogo />
      </RouterLink>
      <h1 class="project-name">GamePulse</h1>
    </div>
    <div ref="searchContainerRef" class="search-container">
      <form @submit.prevent="handleSubmitSearch">
        <button type="submit" class="search-button"><IconSearch /></button>
        <input
          type="text"
          class="search-input"
          v-model="searchQuery"
          @focus="isDropdownOpen = results.length > 0"
          @keydown.esc="isDropdownOpen = false"
          placeholder="Search games, genres, platforms..."
        />
      </form>
      <ul v-if="results.length > 0 && isDropdownOpen" class="search-result-dropdown">
        <li v-for="game in results" :key="game.id">
          <SuggestedGame
            :icon="game.background_image"
            :title="game.name"
            :release-date="game.released"
            :rating="game.metacritic"
          />
        </li>
      </ul>
      <div v-if="isLoading && isDropdownOpen" class="loading-indicator-wrap">
        <span>Searching...</span>
        <div class="loading-indicator"></div>
      </div>
    </div>
    <nav>
      <ul class="router-links">
        <li><RouterLink :to="'/'">Home</RouterLink></li>
        <li><RouterLink :to="'/trending'">Trending</RouterLink></li>
        <li><RouterLink :to="'/discover'">Discover</RouterLink></li>
        <li><RouterLink :to="'/compare'">Compare</RouterLink></li>
        <li><RouterLink :to="'/stats'">Stats</RouterLink></li>
        <li><RouterLink :to="'/lib'">Library</RouterLink></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
header {
  display: grid;
  grid-template-columns: 25% 1fr 45%;
  grid-template-rows: 90px;
  align-items: center;
  justify-items: center;
}

.project-name {
  padding-bottom: 5px;
}

.logo-name {
  display: flex;
  height: 100px;
  align-items: center;
}

.search-container {
  position: relative;
  width: 360px;
}

form {
  background-color: var(--color-visible-search);
  padding: 5px 15px 5px 7px;
  border: 1px solid var(--color-visible-search);
  border-radius: 10px;
  display: flex;
  gap: 5px;
}

form:focus-within {
  border-color: var(--color-visible-search);
  background-color: var(--color-background);
}

.search-input {
  height: 35px;
  width: 100%;
  background-color: var(--color-visible-search);
  border: none;
  color: var(--color-text);
}

.search-input:focus-within {
  background-color: var(--color-background);
}

.search-input::placeholder {
  color: var(--color-search-text);
  font-size: 14px;
  opacity: 1;
}

.search-button {
  position: relative;
  padding: 3px 5px 0;
  color: var(--color-search-text);
  z-index: 1;
  transition: color 0.3s ease;
}

.search-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-gradient);
  border-radius: 8px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.search-button:hover::before {
  opacity: 1;
}

.search-button:hover {
  color: var(--color-text);
}

.router-links {
  display: flex;
  gap: 50px;
}

.router-links li {
  font-size: 19px;
}

.search-result-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 6px;
  border-radius: 8px;
  overflow: hidden;
}

.loading-indicator {
  width: 30px;
  height: 30px;
  background: transparent;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1f5bbb;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-indicator-wrap {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 130%;
  left: 40%;
  align-items: center;
  gap: 8px;
  color: var(--color-search-text);
  font-size: 17px;
  opacity: 0.9;
}
</style>
