<script setup lang="ts">
import { useGenresPlatformsTags } from '@/stores/genresPlatformsTags.store.ts';
import { ref, watch } from 'vue';
import type { FilterParams } from '@/interfaces/filter.interface.ts';
import CorrectSVGIcon from './CorrectSVGIcon.vue';
import RatingStars from './RatingStars.vue';
import TagAutocomplete from './TagAutocomplete.vue';
import YearRangeSlider from './YearRangeSlider.vue';

const props = defineProps<{ initialFilters?: FilterParams }>();

const genresPlatformsTags = useGenresPlatformsTags();

const selectedGenres = ref<number[]>(
  props.initialFilters?.genres ? String(props.initialFilters.genres).split(',').map(Number) : [],
);
const selectedPlatforms = ref<number[]>(
  props.initialFilters?.platforms
    ? String(props.initialFilters.platforms).split(',').map(Number)
    : [],
);
const selectedTags = ref<number[]>(
  props.initialFilters?.tags ? String(props.initialFilters.tags).split(',').map(Number) : [],
);

const minYear = 1980;
const maxYear = 2026;

const parseYearRange = (): [number, number] => {
  if (!props.initialFilters?.dates) return [minYear, maxYear];
  const [from, to] = String(props.initialFilters.dates).split(',');
  const fromYear = Number(from?.slice(0, 4));
  const toYear = Number(to?.slice(0, 4));
  return [
    Number.isFinite(fromYear) ? fromYear : minYear,
    Number.isFinite(toYear) ? toYear : maxYear,
  ];
};

const range = ref<[number, number]>(parseYearRange());

const ratingFromQuery = props.initialFilters?.metacritic
  ? Number(String(props.initialFilters.metacritic).split(',')[0])
  : 0;
const minRatingStars = ref<number>(ratingFromQuery ? ratingFromQuery / 20 : 0);
const minRating = ref<number | null>(minRatingStars.value || null);

const visibleGenresCount = ref<number>(5);
const visiblePlatformsCount = ref<number>(5);

const emit = defineEmits<{ (e: 'update', filters: FilterParams): void }>();

const updateFilters = () => {
  const filters: FilterParams = {
    genres: selectedGenres.value.length ? selectedGenres.value.join(',') : undefined,
    platforms: selectedPlatforms.value.length ? selectedPlatforms.value.join(',') : undefined,
    tags: selectedTags.value.length ? selectedTags.value.join(',') : undefined,
    metacritic: minRating.value ? `${Math.round(minRating.value * 20)},100` : undefined,
    dates: `${range.value[0]}-01-01,${range.value[1]}-12-31`,
  };
  emit('update', filters);
};

watch([selectedGenres, selectedPlatforms, selectedTags, minRating, range], updateFilters, {
  deep: true,
});

watch(minRatingStars, (value) => {
  minRating.value = value || null;
});

const toggleSelection = (list: number[], id: number) => {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
};

const clearFilters = () => {
  selectedGenres.value = [];
  selectedPlatforms.value = [];
  selectedTags.value = [];
  minRatingStars.value = 0;
  minRating.value = null;
  range.value = [minYear, maxYear];
  visibleGenresCount.value = 5;
  visiblePlatformsCount.value = 5;
  updateFilters();
};
</script>

<template>
  <div class="search-column">
    <div class="genres-list">
      <h3>Genres</h3>
      <button
        class="genres-button"
        v-for="genre in genresPlatformsTags.genres.slice(0, visibleGenresCount)"
        :key="genre.id"
        :class="{ selected: selectedGenres.includes(genre.id) }"
        @click="selectedGenres = toggleSelection(selectedGenres, genre.id)"
      >
        <CorrectSVGIcon :icon_base="[genre]" size="30px" />
        <h4 class="filter-title">{{ genre.name }}</h4>
      </button>
      <button
        class="button-more"
        v-if="visibleGenresCount < genresPlatformsTags.genres.length"
        @click="visibleGenresCount += 5"
      >
        Show More
      </button>
    </div>

    <div class="platform-list">
      <h3>Platforms</h3>
      <button
        class="platform-button"
        v-for="platform in genresPlatformsTags.platforms.slice(0, visiblePlatformsCount)"
        :key="platform.id"
        :class="{ selected: selectedPlatforms.includes(platform.id) }"
        @click="selectedPlatforms = toggleSelection(selectedPlatforms, platform.id)"
      >
        <CorrectSVGIcon :icon_base="[platform]" size="27px" />
        <h4 class="platform-title">{{ platform.name }}</h4>
      </button>
      <button
        class="button-more"
        v-if="visiblePlatformsCount < genresPlatformsTags.platforms.length"
        @click="visiblePlatformsCount += 5"
      >
        Show More
      </button>
    </div>

    <div class="release-list">
      <h3>Release Year</h3>
      <YearRangeSlider v-model="range" :min="minYear" :max="maxYear" />
    </div>

    <div class="rating-list">
      <h3>Rating</h3>
      <RatingStars v-model="minRatingStars" />
    </div>

    <TagAutocomplete v-model="selectedTags" />
    <button type="button" class="clear-filters-button" @click="clearFilters">Clear filters</button>
  </div>
</template>

<style scoped>
.search-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: var(--color-visible-search);
  border: 1px solid var(--color-box-border);
  border-radius: 32px;
  padding: 24px 20px;
}

.genres-list,
.platform-list,
.release-list,
.rating-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.genres-list h3,
.platform-list h3,
.release-list h3,
.rating-list h3 {
  color: var(--color-text);
  font-size: 1.4rem;
  font-weight: 700;
}

.genres-button,
.platform-button {
  display: flex;
  align-items: center;
  height: 50px;
  gap: 12px;
  border-radius: 18px;
  padding: 7px;
  background: var(--color-visible-search);
  color: var(--color-text);
  transition: all 0.2s ease;
}

.genres-button:hover,
.platform-button:hover {
  border: 1px solid rgba(56, 189, 248, 0.5);
  transform: translateY(-1px);
}

.genres-button.selected,
.platform-button.selected {
  border: 1px solid rgba(56, 189, 248, 0.5);
  background: rgba(59, 130, 246, 0.06);
  transform: translateY(-1px);
}

.filter-title,
.platform-title,
.button-more {
  font-size: 1.15rem;
  font-weight: 500;
}

.button-more {
  border-radius: 16px;
  height: 40px;
  background: var(--color-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 70% 100%;
  transition: all 0.2s ease;
}

.button-more:hover {
  border: 1px solid rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.16);
}

.clear-filters-button {
  margin-top: 5px;
  border-radius: 16px;
  height: 45px;
  background: var(--color-gradient);
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.clear-filters-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.16);
}
</style>
