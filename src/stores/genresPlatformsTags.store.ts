import { rawgService } from '@/api';
import type { GenresPlatformsTagsBase, PlatformByApi } from '@/interfaces/filter.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGenresPlatformsTags = defineStore('app', () => {
  const genres = ref<GenresPlatformsTagsBase[]>([]);
  const platforms = ref<PlatformByApi[]>([]);
  const tags = ref<GenresPlatformsTagsBase[]>([]);
  const isLoaded = ref<boolean>(false);
  async function fetchData() {
    if (isLoaded.value) return;
    try {
      const [genresRes, platformsRes, tagsRes] = await Promise.all([
        rawgService.getGenres(20),
        rawgService.getPlatforms(10),
        rawgService.getTags(),
      ]);
      genres.value = genresRes.data.results;
      platforms.value = platformsRes.data.results;
      tags.value = tagsRes.data.results;
      isLoaded.value = true;
    } catch (e) {
      console.error(e);
    }
  }
  return { genres, platforms, tags, fetchData };
});
