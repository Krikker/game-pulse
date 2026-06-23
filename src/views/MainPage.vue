<script setup lang="ts">
import { rawgService } from '@/api';
import CorrectSVGIcon from '@/components/CorrectSVGIcon.vue';
import MainPageBanner from '@/components/MainPageBanner.vue';
import TrendingGames from '@/components/TrendingGames.vue';
import type { Result } from '@/interfaces/allGamesList.interface';
import { useGenresPlatformsTags } from '@/stores/genresPlatformsTags.store';
import { onBeforeMount, ref } from 'vue';
import { RouterLink } from 'vue-router';

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

const genresPlatformsTags = useGenresPlatformsTags();

onBeforeMount(() => {
  fetchGOTY();
  fetchTrands();
  genresPlatformsTags.fetchData();
});
</script>

<template>
  <main>
    <MainPageBanner :games="topGame" />
    <div class="tranding-games-section">
      <div class="mini-section__header">
        <p>Tranding Games</p>
        <RouterLink to="/trending">See all</RouterLink>
      </div>
      <div class="trending-games-list">
        <TrendingGames
          v-for="game in trendGames"
          :key="game.id"
          :icon="game.background_image"
          :title="game.name"
          :slug="game.slug"
          :rating="game.rating"
        />
      </div>
    </div>
    <div class="genres-and-platforms">
      <div class="genres-section">
        <div class="mini-section__header">
          <p>Popular genres</p>
          <RouterLink to="/trending">See all</RouterLink>
        </div>
        <div class="genres-list">
          <RouterLink
            :to="{
              name: 'Discover',
              query: { genres: genre.id },
            }"
            class="genres-list__item"
            v-for="genre in genresPlatformsTags.genres.slice(0, 5)"
            :key="genre.id"
          >
            <CorrectSVGIcon :icon_base="[genre]" size="40px" />
            <h3 class="genres-list__title">{{ genre.name }}</h3>
            <p class="additional-info-grey">{{ genre.games_count }} games</p>
          </RouterLink>
        </div>
      </div>
      <div class="platforms-section">
        <div class="mini-section__header">
          <p>Top Platforms</p>
          <RouterLink to="/trending">See all</RouterLink>
        </div>
        <div class="platforms-list">
          <RouterLink
            :to="{
              name: 'Discover',
              query: { genres: platform.id },
            }"
            class="platforms-list__item"
            v-for="platform in genresPlatformsTags.platforms.slice(0, 5)"
            :key="platform.id"
          >
            <CorrectSVGIcon :icon_base="[platform]" size="40px" />
            <h3 class="platforms-list__title">{{ platform.name }}</h3>
            <p class="additional-info-grey">
              {{ platform.platforms.reduce((acc, item) => item.games_count + acc, 0) }} games
            </p>
          </RouterLink>
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
  padding: 10px 0 30px;
  gap: 15px;
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

.mini-section__header {
  display: flex;
  justify-content: space-between;
}

.mini-section__header p,
.genres-list__title {
  font-size: 23px;
  font-weight: 600;
}

.mini-section__header a {
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

.trending-games-list a {
  width: 230px;
  height: 285px;
  position: relative;
  border-radius: 10px;
  background: var(--color-visible-search);
}

.genres-and-platforms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.platforms-section,
.genres-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.genres-list,
.platforms-list {
  display: flex;
  gap: 20px;
}

.genres-list a,
.platforms-list a {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--color-visible-search);
  padding: 10px 0;
}

.additional-info-grey {
  color: var(--color-search-text);
  font-size: 13px;
  font-weight: 500;
}
</style>
