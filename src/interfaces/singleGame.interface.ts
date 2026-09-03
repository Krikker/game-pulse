import type { Platform, Ratings } from './allGamesList.interface';
import type { GenresPlatformsTagsBase } from './filter.interface';

export interface SingleGame {
  id: number;
  slug: string;
  name: string;
  description_raw: string;
  metacritic: number;
  released: string;
  background_image: string;
  background_image_additional: string;
  website: string;
  rating: number;
  ratings: Ratings[];
  added: number;
  added_by_status: AddedByStatus;
  playtime: number;
  platforms: Platform[];
  developers: GenresPlatformsTagsBase[];
  publishers: GenresPlatformsTagsBase[];

  reddit_url: string;
  reddit_count: number;
  twitch_count: string;
  youtube_count: string;

  reviews_text_count: number;
  game_series_count: number;
  screenshots_count: number;
  ratings_count: number;
  movies_count: number;
  achievements_count: number;
}

export interface AddedByStatus {
  beaten: number;
  dropped: number;
  owned: number;
  playing: number;
  toplay: number;
  yet: number;
}

export interface GameScreenshot {
  id: number;
  image: string;
}

export interface StatusBucket {
  key: string;
  label: string;
  color: string;
  count: number;
  percent: number;
}

export interface ActivityCard {
  label: string;
  value: string;
  hint: string;
}

export interface DetailItem {
  label: string;
  value: string;
}
