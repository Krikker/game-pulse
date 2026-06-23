<script setup lang="ts">
import { useGenresPlatformsTags } from '@/stores/genresPlatformsTags.store.ts';
import { ref, watch } from 'vue';
import type VueSlider from 'vue-slider-component';
import IconStar from './icons/IconStar.vue';
import type { FilterParams } from '@/interfaces/filter.interface.ts';
import TagAutocomplete from './TagAutocomplete.vue';

const genresPlatformsTags = useGenresPlatformsTags();

const selectedGenres = ref<number[]>([]);
const selectedPlatforms = ref<number[]>([]);
const selectedTags = ref<number[]>([]);
const minRating = ref<number | null>(null);
const yearFrom = ref<string>('');
const yearTo = ref<string>('');

const emit = defineEmits<{ (e: 'update', filters: FilterParams): void }>();

const updateFilters = () => {
  const filters = {
    genres: selectedGenres.value.length ? selectedGenres.value.join(',') : undefined,
    platforms: selectedPlatforms.value.length ? selectedPlatforms.value.join(',') : undefined,
    tags: selectedTags.value.length ? selectedTags.value.join(',') : undefined,
    metacritic: minRating.value ? `${Math.round(minRating.value * 20)},100` : undefined,
    dates:
      yearFrom.value && yearTo.value ? `${yearFrom.value}-01-01,${yearTo.value}-12-31` : undefined,
  };
  emit('update', filters);
};

watch(
  [selectedGenres, selectedPlatforms, selectedTags, minRating, yearFrom, yearTo],
  updateFilters,
  { deep: true },
);

const toggleSelection = (list: number[], id: number) => {
  if (list.includes(id)) {
    return list.filter((item) => item !== id);
  } else {
    return [...list, id];
  }
};

const visibleGenresCount = ref<number>(5);
const visiblePlatformsCount = ref<number>(5);

const range = ref<number[]>([2000, 2026]);

const minRatingStars = ref<number>(0);
const hoverRating = ref<number>(0);
</script>

<template>
  <div class="search-column">
    <div class="genres-list">
      <h3>Genres</h3>
      <button
        class="genres-button"
        v-for="genre in genresPlatformsTags.genres.slice(0, visibleGenresCount)"
        :key="genre.id"
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
      <h3>Genres</h3>
      <button
        class="platform-button"
        v-for="platform in genresPlatformsTags.platforms.slice(0, visiblePlatformsCount)"
        :key="platform.id"
        @click="selectedGenres = toggleSelection(selectedGenres, platform.id)"
      >
        <CorrectSVGIcon :icon_base="[platform]" size="30px" />
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
      <VueSlider v-model="range" :min="1980" :max="2026" :interval="1" class="slider-date" />
      <span class="years-display">{{ range[0] }} - {{ range[1] }}</span>
    </div>
    <div class="rating-list">
      <h3>Rating</h3>
      <div class="stars-wrapper" @mouseleave="hoverRating = minRatingStars">
        <div class="star-container" v-for="i in 5" :key="i">
          <div
            class="hit-area left"
            :class="{ filled: hoverRating >= i - 0.5 }"
            @mouseenter="hoverRating = i - 0.5"
            @click="minRatingStars = i - 0.5"
          >
            <IconStar />
          </div>
          <div
            class="hit-area right"
            :class="{ filled: hoverRating >= i }"
            @mouseenter="hoverRating = i"
            @click="minRatingStars = i"
          >
            <IconStar />
          </div>
        </div>
      </div>
    </div>
    <TagAutocomplete />
  </div>
</template>

<style scoped>
.star-box {
  position: relative;
  width: 24px;
  height: 24px;
}

.half-star {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  overflow: hidden; /* Обрезаем все, что выходит за половину */
  color: #334155; /* Серый по умолчанию */
  transition: color 0.2s;
}

.half-star.left {
  left: 0;
}
.half-star.right {
  right: 0;
}

/* Когда добавляем класс filled, меняем цвет на золотой */
.half-star.filled {
  color: #fcd34d;
}

/* Внутри half-star иконка должна быть полной, чтобы обрезка работала корректно */
.half-star svg {
  width: 200%; /* Растягиваем иконку в 2 раза, чтобы она заняла всю ширину контейнера */
  height: 100%;
  position: absolute;
  top: 0;
}

.half-star.left svg {
  left: 0;
}
.half-star.right svg {
  right: 0;
} /* Сдвигаем правую иконку влево, чтобы она встала на место */
</style>
