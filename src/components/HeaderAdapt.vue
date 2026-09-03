<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import IconLogo from './icons/IconLogo.vue';
import IconSearch from './icons/IconSearch.vue';
import { useDebounce } from './UseDebounce.ts';
import { rawgService } from '@/api.ts';
import type { Result } from '@/interfaces/allGamesList.interface.ts';
import SuggestedGame from './SuggestedGame.vue';
import { useRouter, useRoute } from 'vue-router';
import { useClickOutside } from './UseClickOutside.ts';

const searchQuery = ref<string>('');
const results = ref<Result[]>([]);
const isLoading = ref(false);
const isMobileSearchOpen = ref(false);
const isMenuOpen = ref(false);

const isDropdownOpen = ref(false);
const searchContainerRef = ref<HTMLElement | null>(null);
const navRef = ref<HTMLElement | null>(null);

useClickOutside(searchContainerRef, () => {
  isDropdownOpen.value = false;
  isMobileSearchOpen.value = false;
});

useClickOutside(navRef, () => {
  isMenuOpen.value = false;
});

const router = useRouter();
const route = useRoute();
const isDiscover = computed(() => route.name === 'Discover');
const searchText = computed(() => String(route.query.search || '').trim());
const debouncedQuery = useDebounce(searchQuery);

watch(
  () => route.query.search,
  (value) => {
    if (!isDiscover.value) {
      searchQuery.value = String(value || '');
    }
  },
);

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
    isMobileSearchOpen.value = false;
    router.push({
      name: 'Discover',
      query: { search: query },
    });
  }
};
</script>

<template>
  <header>
    <div class="logo-name">
      <RouterLink to="/">
        <IconLogo />
        <h1 class="project-name">GamePulse</h1>
      </RouterLink>
    </div>
    <div
      class="header-center"
      :class="{
        'header-center--mobile-open': isMobileSearchOpen && !isDiscover,
        'header-center--discover': isDiscover,
      }"
    >
      <template v-if="isDiscover">
        <div class="discover-context">
          <RouterLink to="/" class="discover-context__back" aria-label="Back to home">←</RouterLink>
          <div class="discover-context__copy">
            <span>Discover</span>
            <strong v-if="searchText">Results for “{{ searchText }}”</strong>
            <strong v-else>Find your next game</strong>
          </div>
        </div>
      </template>
      <template v-else>
        <button
          type="button"
          class="mobile-search-trigger"
          aria-label="Open search"
          @click="isMobileSearchOpen = !isMobileSearchOpen"
        >
          <IconSearch />
        </button>
        <div
          ref="searchContainerRef"
          class="search-container"
          :class="{ 'search-container--mobile-open': isMobileSearchOpen }"
        >
          <form @submit.prevent="handleSubmitSearch">
            <button type="submit" class="search-button"><IconSearch /></button>
            <input
              type="text"
              class="search-input"
              v-model="searchQuery"
              @focus="isDropdownOpen = results.length > 0"
              @keydown.esc="isMobileSearchOpen = false"
              placeholder="Search games, genres, platforms..."
            />
          </form>
          <ul v-if="results.length > 0 && isDropdownOpen" class="search-result-dropdown">
            <li v-for="game in results" :key="game.id">
              <SuggestedGame
                :icon="game.background_image"
                :title="game.name"
                :slug="game.slug"
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
      </template>
    </div>
    <nav ref="navRef">
      <button
        type="button"
        class="menu-toggle"
        :class="{ 'menu-toggle--open': isMenuOpen }"
        aria-label="Toggle navigation menu"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="router-links" :class="{ 'router-links--open': isMenuOpen }">
        <li><RouterLink :to="'/'">Home</RouterLink></li>
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

.logo-name a {
  display: flex;
  height: 100px;
  align-items: center;
}

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 360px;
  text-align: center;
}

.discover-context {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.discover-context__back {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  color: var(--color-search-text);
  background: rgba(148, 163, 184, 0.08);
  font-size: 18px;
  transition: 0.2s ease;
}

.discover-context__back:hover {
  color: var(--color-text);
  border-color: rgba(124, 92, 255, 0.45);
  background: rgba(124, 92, 255, 0.16);
}

.discover-context__copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.discover-context__copy span {
  color: #9c89ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.discover-context__copy strong {
  max-width: 300px;
  overflow: hidden;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.discover-info {
  font-size: 13px;
  color: var(--color-search-text);
  line-height: 1.4;
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
  border: 1px solid var(--color-box-border);
}

form:focus-within {
  border-color: var(--color-visible-search);
  background-color: var(--color-background);
}

.search-input {
  height: 35px;
  width: 100%;
  background-color: var(--color-visible-search);
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

nav {
  justify-self: center;
}

.project-name {
  font-size: 2rem;
}

.menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: var(--color-visible-search);
}

.menu-toggle span {
  width: 19px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-text);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.menu-toggle--open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.menu-toggle--open span:nth-child(2) {
  opacity: 0;
}
.menu-toggle--open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
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
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #101a2a;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.48);
  text-align: left;
}

.search-result-dropdown li {
  display: block;
  width: 100%;
  background: transparent;
}

.search-result-dropdown :deep(.suggested-game) {
  width: 100%;
  text-align: left;
}

.search-result-dropdown :deep(.suggested-game__content) {
  text-align: left;
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

.mobile-search-trigger {
  display: none;
}

@media (max-width: 1100px) {
  header {
    grid-template-columns: auto minmax(220px, 1fr) auto;
    column-gap: 20px;
  }

  .router-links {
    display: none;
  }

  .header-center,
  .search-container {
    width: 300px;
    max-width: 100%;
  }

  .header-center {
    justify-self: end;
  }

  .search-container {
    margin-left: auto;
  }

  nav {
    position: relative;
    justify-self: end;
  }

  .menu-toggle {
    display: flex;
  }

  .router-links--open {
    position: absolute;
    top: 52px;
    right: 0;
    z-index: 20;
    display: flex;
    width: 220px;
    flex-direction: column;
    gap: 0;
    padding: 8px;
    border: 1px solid var(--color-box-border);
    border-radius: 12px;
    background: #101a2a;
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.48);
  }

  .router-links--open li {
    padding: 10px 12px;
  }

  .header-center--discover .discover-context {
    display: none;
  }
}

@media (max-width: 1300px) and (min-width: 1101px) {
  .header-center,
  .search-container {
    width: min(100%, 300px);
  }
  .router-links {
    gap: 32px;
  }
}

@media (max-width: 1100px) and (min-width: 761px) {
  header {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-rows: 100px;
    gap: 0 16px;
    padding: 0 32px;
  }

  .logo-name a {
    height: 100px;
  }

  .header-center {
    grid-column: 2;
    grid-row: 1;
    width: 300px;
    max-width: 100%;
    justify-self: center;
  }

  .search-container {
    width: 300px;
    max-width: 100%;
    margin: 0 auto;
  }

  nav {
    grid-column: 3;
    grid-row: 1;
    width: auto;
  }

  .menu-toggle {
    margin-left: 0;
  }
}

@media (max-width: 760px) {
  header {
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-rows: 90px;
    align-items: center;
    justify-items: stretch;
    gap: 0 10px;
    padding: 0 16px;
  }

  .logo-name {
    justify-self: start;
  }

  .logo-name a {
    height: 90px;
  }

  .header-center {
    grid-column: 2;
    grid-row: 1;
    width: auto;
    justify-self: end;
    align-items: center;
  }

  .header-center--mobile-open {
    grid-column: 1 / -1;
    grid-row: 2;
    width: min(100%, 420px);
    margin: 0 auto 8px;
    justify-self: center;
  }

  .header-center--discover {
    grid-column: 1 / 3;
    grid-row: 2;
    width: 100%;
    justify-self: center;
  }

  .mobile-search-trigger {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 12px;
    color: var(--color-text);
    background: var(--color-visible-search);
  }

  .mobile-search-trigger:active,
  .mobile-search-trigger:hover {
    border-color: rgba(124, 92, 255, 0.5);
    background: rgba(124, 92, 255, 0.16);
  }

  .search-container {
    display: none;
  }

  .header-center--mobile-open .search-container {
    display: block;
    width: 100%;
    margin: 0 auto;
  }

  .header-center--mobile-open .mobile-search-trigger {
    display: none;
  }

  nav {
    grid-column: 3;
    grid-row: 1;
    width: auto;
    display: flex;
    justify-content: flex-end;
  }

  .header-center--mobile-open ~ nav {
    grid-column: 3;
    grid-row: 1;
  }

  .header-center--discover ~ nav {
    grid-column: 3;
    grid-row: 1;
  }

  .router-links {
    position: absolute;
    top: 50px;
    right: 0;
    z-index: 20;
    width: min(220px, calc(100vw - 32px));
    flex-direction: column;
    gap: 0;
    padding: 8px;
    border: 1px solid var(--color-box-border);
    border-radius: 12px;
    background: #101a2a;
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.48);
  }

  .router-links--open {
    display: flex;
  }

  .router-links li {
    padding: 10px 12px;
  }

  .router-links li {
    font-size: 16px;
    white-space: nowrap;
  }

  .discover-info {
    display: none;
  }
}
</style>
