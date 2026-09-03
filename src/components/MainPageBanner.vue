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
        <RouterLink to="/compare" class="btn btn-secondary">Compare games</RouterLink>
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
  min-height: clamp(270px, 31vw, 350px);
  height: clamp(270px, 31vw, 350px);
}

.main-page__banner-left {
  width: min(45%, 520px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.slogan-wrapper h1 {
  font-size: clamp(28px, 3.2vw, 40px);
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
  width: clamp(52%, 70vw, 70%);
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
  max-width: min(42%, 330px);
  z-index: 1;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.small-box p {
  width: 100%;
}

.small-box-wrapper {
  display: flex;
  padding: 10px 10px 10px 0;
}

@media (max-width: 1500px) {
  .main-page__banner {
    min-height: 275px;
    height: 275px;
  }

  .slogan-wrapper h1 {
    font-size: 35px;
  }

  .main-page__banner-left .additional-info--grey-big {
    font-size: 15px;
  }

  .rawg-info-wrapper {
    padding: 4px;
  }

  .rawg-info-wrapper__rating span {
    font-size: 20px;
  }

  .platform-wrapper {
    gap: 8px;
    padding-left: 8px;
  }
}

@media (max-width: 1100px) and (min-width: 901px) {
  .main-page__poster {
    width: 76%;
  }

  .main-page__banner-right {
    max-width: 45%;
  }
}

@media (max-width: 900px) {
  .main-page__banner {
    min-height: clamp(230px, 38vw, 310px);
    height: clamp(230px, 38vw, 310px);
  }
  .main-page__banner-left {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 44%;
    display: flex;
    gap: 8px;
    padding: 10px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.62);
    backdrop-filter: blur(4px);
    z-index: 2;
  }
  .slogan-wrapper h1 {
    display: none;
  }
  .slogan-wrapper h1:first-child {
    display: block;
    font-size: clamp(16px, 2.3vw, 22px);
  }
  .main-page__banner-left .additional-info--grey-big {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    font-size: 14px;
    line-height: 1.25;
  }
  .buttons-wrapper .btn-primary {
    padding: 8px 12px;
    white-space: nowrap;
  }
  .buttons-wrapper .btn-secondary {
    display: none;
  }
  .platform-wrapper,
  .small-box-wrapper {
    display: none;
  }
  .main-page__poster {
    left: 0;
    right: auto;
    width: 100%;
  }
  .main-page__poster-glow {
    opacity: 0.55;
    -webkit-mask-image: linear-gradient(90deg, #000 0 45%, transparent 100%);
    mask-image: linear-gradient(90deg, #000 0 45%, transparent 100%);
  }
  .main-page__banner-right {
    width: 42%;
    max-width: 42%;
    margin-left: auto;
  }
}

@media (max-width: 600px) {
  .main-page__banner {
    width: calc(100% + 32px);
    margin-left: -16px;
    align-items: stretch;
    height: 380px;
  }

  .main-page__banner-left {
    left: auto;
    right: 8px;
    bottom: 10px;
    width: 48%;
    gap: 6px;
    align-items: center;
    padding: 9px;
    text-align: center;
  }

  .main-page__banner-left .buttons-wrapper {
    justify-content: center;
  }
  .main-page__poster {
    left: 0;
    right: auto;
    width: 100%;
  }
  .main-page__img {
    object-position: 32% center;
    -webkit-mask-image: linear-gradient(
      90deg,
      #000 0 20%,
      rgba(0, 0, 0, 0.82) 55%,
      rgba(0, 0, 0, 0.25) 100%
    );
    mask-image: linear-gradient(
      90deg,
      #000 0 20%,
      rgba(0, 0, 0, 0.82) 55%,
      rgba(0, 0, 0, 0.25) 100%
    );
  }
  .main-page__poster-glow {
    opacity: 0.75;
    -webkit-mask-image: linear-gradient(90deg, #000 0 50%, transparent 100%);
    mask-image: linear-gradient(90deg, #000 0 50%, transparent 100%);
  }
  .main-page__banner-right {
    align-self: flex-end;
    width: 49%;
    max-width: 49%;
    margin-left: auto;
    margin-right: 2px;
    margin-bottom: 8px;
    align-items: center;
  }

  .rawg-info-wrapper {
    display: none;
  }
  .rawg-info-wrapper__box {
    justify-content: center;
  }
  .rawg-info-wrapper__rating span {
    font-size: clamp(18px, 5vw, 25px);
  }
  .rawg-info-wrapper__box {
    align-items: center;
  }
  .main-page__banner-left .additional-info--grey-big {
    font-size: 13px;
  }
  .slogan-wrapper h1:first-child {
    font-size: 16px;
  }
  .buttons-wrapper .btn-primary {
    padding: 7px 10px;
    font-size: 12px;
  }
  .additional-info-white,
  .rawg-info-wrapper h2 {
    font-size: clamp(13px, 3.6vw, 16px);
  }
  .additional-info--grey-small {
    font-size: clamp(10px, 2.8vw, 13px);
  }
}
</style>
