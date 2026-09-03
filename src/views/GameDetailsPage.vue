<script setup lang="ts">
import { rawgService } from '@/api';
import GameDetailsHeroPanel from '@/components/game-details/GameDetailsHeroPanel.vue';
import GameDetailsMediaPanel from '@/components/game-details/GameDetailsMediaPanel.vue';
import GameDetailsOverview from '@/components/game-details/GameDetailsOverview.vue';
import type { Ratings } from '@/interfaces/allGamesList.interface';
import type { AddedByStatus, GameScreenshot, SingleGame } from '@/interfaces/singleGame.interface';
import { useLibrary } from '@/stores/library.store';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const library = useLibrary();
const game = ref<SingleGame | null>(null);
const screenshots = ref<GameScreenshot[]>([]);
const isLoading = ref<boolean>(false);
const loadError = ref<string>('');
const activeShotIndex = ref<number | null>(null);

const ratingLegend = [
  { key: 'exceptional', label: 'Exceptional', color: '#34d399' },
  { key: 'recommended', label: 'Recommended', color: '#60a5fa' },
  { key: 'meh', label: 'Meh', color: '#fbbf24' },
  { key: 'skip', label: 'Skip', color: '#fb7185' },
] as const;

const statusLegend = [
  { key: 'playing', label: 'Playing', color: '#60a5fa' },
  { key: 'beaten', label: 'Beaten', color: '#34d399' },
  { key: 'toplay', label: 'To play', color: '#fbbf24' },
  { key: 'owned', label: 'Owned', color: '#c084fc' },
  { key: 'dropped', label: 'Dropped', color: '#fb7185' },
  { key: 'yet', label: 'Yet to play', color: '#94a3b8' },
] as const;

const formatCount = (value: number | string | undefined | null) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return String(value ?? 0);

  return new Intl.NumberFormat('en', {
    notation: numericValue >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(numericValue);
};

const frequentRating = (ratingsArr: Ratings[] | undefined) => {
  if (!ratingsArr || ratingsArr.length === 0) return 'No ratings yet';
  const topRating = ratingsArr.reduce((prev, current) =>
    current.count > prev.count ? current : prev,
  );
  return topRating.title.charAt(0).toUpperCase() + topRating.title.slice(1) + '!';
};

const loadData = async () => {
  const slug = route.params.slug as string;
  if (!slug) return;

  isLoading.value = true;
  loadError.value = '';

  try {
    const res = await rawgService.getById(slug);
    game.value = res.data;

    try {
      const screenshotsRes = await rawgService.getScreenshots(res.data.id);
      screenshots.value = screenshotsRes.data?.results ?? [];
    } catch (screenshotError) {
      console.error(screenshotError);
      screenshots.value = [];
    }
  } catch (e) {
    console.error(e);
    game.value = null;
    screenshots.value = [];
    loadError.value = 'Failed to load game data.';
  } finally {
    isLoading.value = false;
    if (game.value) {
      await scrollToMediaPanel();
    }
  }
};

const toggleGame = (id: number) => {
  if (library.hasGame(id)) {
    library.removeFromLib(id);
  } else {
    library.addToLib(id);
  }
};

const ratingBuckets = computed(() => {
  const items = game.value?.ratings ?? [];
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return ratingLegend.map((rating) => {
    const bucket = items.find((item) => item.title === rating.key);
    const count = bucket?.count ?? 0;

    return {
      ...rating,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    };
  });
});

const addedByStatus = computed(() => {
  const values = game.value?.added_by_status;
  const total = values ? Object.values(values).reduce((sum, value) => sum + value, 0) : 0;

  return statusLegend.map((status) => {
    const count = values?.[status.key as keyof AddedByStatus] ?? 0;

    return {
      ...status,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    };
  });
});

const statusRingStyle = computed(() => {
  const segments = addedByStatus.value.filter((item) => item.count > 0);
  if (!segments.length) {
    return { background: 'conic-gradient(#1f2937 0deg 360deg)' };
  }

  let cursor = 0;
  const parts = segments.map((segment) => {
    const start = cursor;
    cursor += (segment.percent / 100) * 360;
    return `${segment.color} ${start}deg ${cursor}deg`;
  });

  return {
    background: `conic-gradient(${parts.join(', ')})`,
  };
});

const activityCards = computed(() => [
  {
    label: 'Reddit mentions',
    value: formatCount(game.value?.reddit_count),
    hint: 'Community discussions',
  },
  {
    label: 'Twitch viewers',
    value: formatCount(game.value?.twitch_count),
    hint: 'Live streams and showcases',
  },
  {
    label: 'YouTube clips',
    value: formatCount(game.value?.youtube_count),
    hint: 'Trailers and guides',
  },
  {
    label: 'Screenshots',
    value: formatCount(game.value?.screenshots_count),
    hint: 'Official media assets',
  },
  {
    label: 'Movies',
    value: formatCount(game.value?.movies_count),
    hint: 'Video content',
  },
  {
    label: 'Achievements',
    value: formatCount(game.value?.achievements_count),
    hint: 'In-game goals',
  },
]);

const playerRating = computed(() => Math.round((game.value?.rating ?? 0) * 20));
const playerRatingDisplay = computed(() => (game.value ? game.value.rating.toFixed(1) : '0.0'));
const metacriticScore = computed(() => game.value?.metacritic ?? 0);
const scoreGap = computed(() => playerRating.value - metacriticScore.value);

const platformNames = computed(
  () => game.value?.platforms?.map((item) => item.platform.name) ?? [],
);
const platformIcons = computed(() => game.value?.platforms ?? []);
const developerNames = computed(() => game.value?.developers?.map((item) => item.name) ?? []);
const publisherNames = computed(() => game.value?.publishers?.map((item) => item.name) ?? []);

const heroStats = computed(() => [
  {
    label: 'Platforms',
    value: platformNames.value.length ? 'Available' : 'Unspecified',
  },
  {
    label: 'Developer',
    value: developerNames.value.length ? developerNames.value.join(', ') : 'Unspecified',
  },
  {
    label: 'Publisher',
    value: publisherNames.value.length ? publisherNames.value.join(', ') : 'Unspecified',
  },
  {
    label: 'Metacritic Score',
    value: game.value?.metacritic ? String(game.value.metacritic) : 'Unspecified',
  },
  {
    label: 'Playtime',
    value: game.value?.playtime ? `${game.value.playtime} h` : 'Unspecified',
  },
]);

const detailsItems = computed(() => [
  {
    label: 'Released',
    value: game.value?.released || 'Не указано',
  },
  {
    label: 'Average playtime',
    value: game.value?.playtime ? `${game.value.playtime} h` : 'Не указано',
  },
  {
    label: 'Achievements',
    value: game.value?.achievements_count ? String(game.value.achievements_count) : 'Не указано',
  },
]);

const mediaShots = computed(() => {
  const fetchedShots = screenshots.value.slice(0, 6).map((item) => item.image);
  if (fetchedShots.length) return fetchedShots;

  return [game.value?.background_image_additional, game.value?.background_image].filter(
    (item): item is string => Boolean(item),
  );
});

const ratingSummary = computed(() => frequentRating(game.value?.ratings));

const openShot = (index: number) => {
  activeShotIndex.value = index;
};

const closeShot = () => {
  activeShotIndex.value = null;
};

const stepShot = (direction: 1 | -1) => {
  if (activeShotIndex.value === null || !mediaShots.value.length) return;

  const nextIndex = activeShotIndex.value + direction;
  const lastIndex = mediaShots.value.length - 1;

  if (nextIndex < 0) {
    activeShotIndex.value = lastIndex;
    return;
  }

  if (nextIndex > lastIndex) {
    activeShotIndex.value = 0;
    return;
  }

  activeShotIndex.value = nextIndex;
};

const scrollToMediaPanel = async () => {
  await nextTick();

  const posterFrame = document.getElementById('game-hero');
  if (!posterFrame) return;

  posterFrame.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

watch(activeShotIndex, (value) => {
  document.body.style.overflow = value === null ? '' : 'hidden';
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});

watch(() => route.params.slug, loadData, { immediate: true });
</script>

<template>
  <main class="game-details">
    <section v-if="isLoading" class="game-state">
      <div class="game-state__card">
        <p class="game-state__eyebrow">Loading</p>
        <h1>Fetching game data</h1>
        <p>We are bringing in RAWG details, charts, and screenshots.</p>
      </div>
    </section>

    <section v-else-if="loadError" class="game-state game-state--error">
      <div class="game-state__card">
        <p class="game-state__eyebrow">Error</p>
        <h1>{{ loadError }}</h1>
        <button type="button" class="add-library__button" @click="loadData">Try again</button>
      </div>
    </section>

    <template v-else-if="game">
      <GameDetailsHeroPanel
        :game="game"
        :hero-stats="heroStats"
        :platform-icons="platformIcons"
        :rating-summary="ratingSummary"
        :is-in-library="library.hasGame(game.id)"
        @toggle-game="toggleGame(game.id)"
      />

      <GameDetailsOverview
        :rating-buckets="ratingBuckets"
        :rating-summary="ratingSummary"
        :ratings-count="game.ratings_count"
        :added-by-status="addedByStatus"
        :status-ring-style="statusRingStyle"
        :activity-cards="activityCards"
        :player-rating-display="playerRatingDisplay"
        :player-rating="playerRating"
        :metacritic-score="metacriticScore"
        :score-gap="scoreGap"
        :details-items="detailsItems"
        :developer-names="developerNames"
        :publisher-names="publisherNames"
        :website-available="Boolean(game.website)"
      />

      <GameDetailsMediaPanel
        :media-shots="mediaShots"
        :game-name="game.name"
        :screenshots-count="game.screenshots_count"
        :active-shot-index="activeShotIndex"
        @open-shot="openShot"
        @close-shot="closeShot"
        @step-shot="stepShot"
      />
    </template>
  </main>
</template>

<style scoped>
main.game-details {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 0 0 50px;
}

.game-state {
  min-height: 60vh;
  display: grid;
  place-items: center;
}

.game-state__card {
  padding: 35px 45px;
  border: 1px solid var(--color-box-border);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(31, 91, 187, 0.24), transparent 42%),
    rgba(14, 20, 31, 0.84);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}

.game-state__eyebrow {
  margin-bottom: 10px;
  color: var(--color-search-text);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 13px;
  font-weight: 700;
}

.game-state__card h1 {
  margin: 12px 0;
  font-size: clamp(2.1rem, 4vw, 4rem);
  line-height: 0.95;
}

.game-state__card p {
  color: var(--color-search-text);
  font-size: 1rem;
}
</style>
