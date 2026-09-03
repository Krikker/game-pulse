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
  font-size: clamp(18px, 2.1vw, 23px);
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
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(8px, 1.4vw, 16px);
}

.trending-games-list a {
  width: 100%;
}

.genres-and-platforms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(20px, 5vw, 60px);
}

.platforms-section,
.genres-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.genres-list,
.platforms-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(6px, 1.5vw, 20px);
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
  min-width: 0;
  padding: clamp(7px, 1vw, 10px) 5px;
}

.genres-list__title,
.platforms-list__title {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(15px, 1.9vw, 18px);
}

.additional-info-grey {
  color: var(--color-search-text);
  font-size: clamp(11px, 1.2vw, 13px);
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 1500px) {
  main {
    gap: 10px;
  }

  .mini-section__header a {
    padding-top: 8px;
  }

  .tranding-games-section {
    padding: 3px 0 8px;
    gap: 5px;
  }

  .trending-games-list :deep(.trend-game__img) {
    height: 125px;
  }

  .trending-games-list :deep(.trend-game__rating) {
    top: 7px;
    right: 7px;
  }

  .trending-games-list :deep(.trand-game__container-desc) {
    padding: 4px 6px;
    gap: 2px;
  }

  .trending-games-list :deep(.trend-game__title) {
    font-size: 0.95rem;
  }

  .platforms-section,
  .genres-section {
    gap: 5px;
  }

  .genres-list,
  .platforms-list {
    gap: 6px;
  }

  .genres-list__title,
  .platforms-list__title {
    font-size: 17px;
  }

  .additional-info-grey {
    font-size: 12px;
  }
}

@media (max-width: 1450px) and (min-width: 1201px) {
  .trending-games-list {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .trending-games-list a:nth-child(n + 6) {
    display: none;
  }

  .genres-list .additional-info-grey,
  .platforms-list .additional-info-grey {
    display: none;
  }
}

@media (max-width: 1200px) {
  .trending-games-list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .trending-games-list a:nth-child(n + 5) {
    display: none;
  }
  .genres-and-platforms {
    grid-template-columns: 1fr;
  }
  .genres-list,
  .platforms-list {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  main {
    padding-bottom: 50px;
  }
  .tranding-games-section {
    padding: 7px 0 22px;
    gap: 10px;
  }
  .trending-games-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .genres-and-platforms {
    gap: 22px;
  }
  .genres-list,
  .platforms-list {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .genres-list a:nth-child(n + 5),
  .platforms-list a:nth-child(n + 5) {
    display: none;
  }
}
</style>
