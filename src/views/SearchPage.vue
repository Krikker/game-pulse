<script setup lang="ts">
import { rawgService } from '@/api';
import IconSearch from '@/components/icons/IconSearch.vue';
import type { Result } from '@/interfaces/allGamesList.interface';
// import { useGenresPlatformsTags } from '@/stores/genresPlatformsTags.store';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const games = ref<Result[]>([]);
const searchQuery = ref<string>('');

const loadData = async () => {
  if (route.name === 'SearchByPlatform') {
    const { data } = await rawgService.getByFilter({ platforms: route.params.id as string });
    games.value = data.results;
  } else if (route.name === 'SearchByGenre') {
    const { data } = await rawgService.getByFilter({ genres: route.params.id as string });
    games.value = data.results;
  } else if (route.name === 'SearchByGame') {
    const { data } = await rawgService.getById(route.params.slug as string);
    games.value = data.results;
  } else {
    const { data } = await rawgService.getAll(route.params.query as string, 20);
    games.value = data.results;
  }
  console.log(games.value);
};

// const genresPlatformsTags = useGenresPlatformsTags();

onUnmounted(() => {
  games.value = [];
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <main>
    <div class="search-header">
      <h1 class="search-header__title">Search</h1>
      <p class="gg">Find your next favorite game</p>
      <div class="search-header__input">
        <button type="submit"><IconSearch /></button>
        <input type="text" v-model="searchQuery" placeholder="Search games..." />
      </div>
    </div>
    <div class="search-body">
      <div class="search-filters"></div>
      <div class="search-games"></div>
    </div>
  </main>
</template>

<style scoped></style>
