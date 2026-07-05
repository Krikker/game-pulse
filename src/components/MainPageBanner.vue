<script setup lang="ts">
import type { Ratings, Result } from '@/interfaces/allGamesList.interface';
import CorrectSVGIcon from './CorrectSVGIcon.vue';

const games = defineProps<{
  games: Result | undefined;
}>();
const frequentRating = (ratingsArr: Ratings[] | undefined) => {
  if (!ratingsArr || ratingsArr.length === 0) return 'No ratings yet';
  const topRating = ratingsArr.reduce((prev, current) =>
    current.count > prev.count ? current : prev,
  );
  return topRating.title.charAt(0).toUpperCase() + topRating.title.slice(1) + '!';
};
</script>

<template>
  <div class="main-page__banner">
    <div class="main-page__banner-left">
      <div class="slogan-wrapper">
        <h1>Track games.</h1>
        <h1>Analyze trends.</h1>
        <h1 class="slogan-colorful">Play better.</h1>
      </div>
      <h4 class="additional-info--grey-big">
        GamePulse provides powerful insights, player stats and community sentiment for games you
        love.
      </h4>
      <div class="buttons-wrapper">
        <RouterLink to="/discover" class="btn btn-primary">Explore Games</RouterLink>
        <RouterLink to="/discover" class="btn btn-secondary">Watch Demo</RouterLink>
      </div>
    </div>
    <div
      class="main-page__poster"
      :style="{
        '--banner-image': `url(https://i.playground.ru/p/w-tOTelVOAfmvWVYi57P6w.jpeg)`,
      }"
    >
      <div class="main-page__poster-glow"></div>
      <img
        :src="'https://i.playground.ru/p/w-tOTelVOAfmvWVYi57P6w.jpeg'"
        alt="Game Poster"
        class="main-page__img"
      />
    </div>
    <div class="main-page__banner-right">
      <div class="rawg-info-wrapper">
        <h2>{{ games.games?.name }}</h2>
        <div class="rawg-info-wrapper__box">
          <div class="rawg-info-wrapper__rating">
            <span>{{ games.games?.rating }}</span>
            <p>Very good!</p>
          </div>
          <div>
            <p class="additional-info-white">{{ frequentRating(games.games?.ratings) }}</p>
            <p class="additional-info--grey-small">Release Date: {{ games.games?.released }}</p>
            <p class="additional-info--grey-small">Based on RAWG users ratings!</p>
          </div>
        </div>
      </div>
      <div class="rawg-info-wrapper platform-wrapper">
        <CorrectSVGIcon :icon_base="games.games?.parent_platforms || []" size="28px" />
      </div>
      <div class="rawg-info-wrapper small-box-wrapper">
        <div class="small-box">
          <p>{{ games.games?.added }}</p>
          <p class="additional-info--grey-small">Added to the library</p>
        </div>
        <div class="small-box">
          <p>{{ games.games?.playtime }}</p>
          <p class="additional-info--grey-small">Average playtime</p>
        </div>
        <div class="small-box">
          <p>{{ games.games?.ratings_count }}</p>
          <p class="additional-info--grey-small">Ratings Count</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-page__banner {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: end;
  height: 350px;
}

.main-page__banner-left {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.slogan-wrapper h1 {
  font-size: 40px;
  font-weight: 750;
  line-height: 1.2;
}

.slogan-colorful {
  background: var(--color-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 40% 100%;
}

.buttons-wrapper {
  display: flex;
  align-items: center;
  font-weight: 600;
  gap: 5px;
}

.btn-primary {
  padding: 10px 20px;
  background: var(--color-gradient);
  border-radius: 8px;
  transition: scale 0.3s ease;
}

.btn-primary:hover {
  scale: 1.1;
}

.btn-secondary {
  position: relative;
  padding: 10px 20px;
  background: var(--color-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 100% 100%;
  transition: scale 0.3s ease;
}

.btn-secondary::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  padding: 3px;
  background: var(--color-gradient);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-secondary:hover::before {
  opacity: 1;
}

.btn-secondary:hover {
  scale: 1.1;
}

.main-page__poster {
  position: absolute;
  top: 0;
  right: 0;
  width: 65%;
  height: inherit;
  z-index: -1;
  overflow: hidden;
}

.main-page__poster-glow {
  position: absolute;
  inset: -13%;
  background-image: var(--banner-image);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: blur(1px);
  transform: scale(1.1);
  opacity: 0.75;
  -webkit-mask-image: radial-gradient(circle at center, #000 0 42%, transparent 74%);
  mask-image: radial-gradient(circle at center, #000 0 42%, transparent 60%);
}

.main-page__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  -webkit-mask-image: radial-gradient(circle at center, #000 0 35%, transparent 70%);
  mask-image: radial-gradient(circle at center, #000 0 35%, transparent 85%);
}

.main-page__banner-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rawg-info-wrapper {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 10px;
}

.rawg-info-wrapper h2 {
  background: var(--color-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rawg-info-wrapper__box {
  display: flex;
  gap: 15px;
}

.rawg-info-wrapper__rating {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-search-text);
  border-radius: 10px;
  padding: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.rawg-info-wrapper__rating span {
  font-size: 25px;
  font-weight: 700;
  color: var(--color-gold);
}

.rawg-info-wrapper__rating p {
  color: var(--color-success);
  font-size: 12px;
  font-weight: 500;
}

.additional-info-white {
  font-size: 16px;
  font-weight: 500;
}

.platform-wrapper {
  display: flex;
  gap: 15px;
  padding-left: 15px;
}

.small-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.small-box-wrapper {
  display: flex;
  gap: 10px;
}
</style>
