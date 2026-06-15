<script setup lang="ts">
import { rawgService } from '@/api';
import MainPageBanner from '@/components/MainPageBanner.vue';
import TrendingGames from '@/components/TrendingGames.vue';
import type { Result } from '@/interfaces/allGamesList.interface';
import { onBeforeMount, ref } from 'vue';

const topGame = ref<Result>();
async function fetchGOTY() {
  try {
    const response: { data: { results: Result[] } } = await rawgService.getGOTY(10);
    const goty = response.data.results.sort(
      (a, b) => (b.rating || 0) * (b.ratings_count || 0) - (a.rating || 0) * (a.ratings_count || 0),
    )[0];
    topGame.value = goty;
    console.log(goty);
  } catch (error) {
    console.error('Error fetching GOTY game:', error);
  }
}

const trendGames = ref<Result[]>();
async function fetchTrands() {
  try {
    const response: { data: { results: Result[] } } = await rawgService.getTrending(6);
    trendGames.value = response.data.results;
    console.log(trendGames.value);
  } catch (error) {
    console.error('Error fetching trending games:', error);
  }
}

const genres = ref<Result[]>();
async function fetchGenres() {
  try {
    const response: { data: { results: Result[] } } = await rawgService.getGenres(5);
    genres.value = response.data.results;
    console.log(genres.value);
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

const platforms = ref<Result[]>();
async function fetchPlatforms() {
  try {
    const response: { data: { results: Result[] } } = await rawgService.getPlatforms(5);
    platforms.value = response.data.results;
    console.log(platforms.value);
  } catch (error) {
    console.error('Error fetching platforms:', error);
  }
}
onBeforeMount(() => {
  fetchGOTY();
  fetchTrands();
  fetchGenres();
  fetchPlatforms();
});
</script>

<template>
  <main>
    <MainPageBanner :games="topGame" />
    <div class="tranding-games-section">
      <div class="tranding-section__header">
        <p>Tranding Games</p>
        <RouterLink to="/trending" class="load-more-link">See all</RouterLink>
      </div>
      <div class="trending-games-list">
        <TrendingGames
          v-for="game in trendGames"
          :key="game.id"
          :icon="game.background_image"
          :title="game.name"
          :rating="game.rating"
        />
      </div>
    </div>
    <div class="genres-and-platforms">
      <div class="genres-section">
        <div class="tranding-section__header">
          <p>Popular genres</p>
          <RouterLink to="/trending" class="load-more-link">See all</RouterLink>
        </div>
      </div>
      <div class="platforms-section">
        <div class="tranding-section__header">
          <p>Top Platforms</p>
          <RouterLink to="/trending" class="load-more-link">See all</RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 0 150px;
}

.tranding-games-section {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px 0;
}

.tranding-games-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 1px;
  background-color: var(--color-visible-search);
}

.tranding-games-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 1px;
  background-color: var(--color-visible-search);
}

.tranding-section__header {
  display: flex;
  justify-content: space-between;
}

.tranding-section__header p {
  font-size: 23px;
  font-weight: 600;
}

.tranding-section__header a {
  font-size: 16px;
  background: var(--color-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.trending-games-list {
  display: flex;
  justify-content: space-between;
}

.trending-games-list div {
  width: 230px;
  height: 300px;
  position: relative;
  border-radius: 10px;
  background: var(--color-visible-search);
}
</style>
