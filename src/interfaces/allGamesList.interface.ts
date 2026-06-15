export interface Result {
  id: number;
  slug: string;
  name: string;
  released: string;
  background_image: string;
  rating: number;
  ratings_count: number;
  ratings: Ratings[];
  added: number;
  metacritic: number;
  playtime: number;
  platforms: Platform[];
  short_screenshots: ShortScreenshot[];
}

export interface Ratings {
  id: number;
  title: string;
  count: number;
  percent: number;
}

export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ShortScreenshot {
  id: number;
  image: string;
}

export interface GameCard {
  icon: string;
  title: string;
  releaseDate?: string;
  rating: number;
}

// export interface RootInterface {
//   id: number;
//   slug: string;
//   name: string;
//   name_original: string;
//   description: string;
//   metacritic: number;
//   metacritic_platforms: Metacriticplatform[];
//   released: string;
//   tba: boolean;
//   updated: string;
//   background_image: string;
//   background_image_additional: string;
//   website: string;
//   rating: number;
//   rating_top: number;
//   ratings: Ratings;
//   reactions: Ratings;
//   added: number;
//   added_by_status: Ratings;
//   playtime: number;
//   screenshots_count: number;
//   movies_count: number;
//   creators_count: number;
//   achievements_count: number;
//   parent_achievements_count: string;
//   reddit_url: string;
//   reddit_name: string;
//   reddit_description: string;
//   reddit_logo: string;
//   reddit_count: number;
//   twitch_count: string;
//   youtube_count: string;
//   reviews_text_count: string;
//   ratings_count: number;
//   suggestions_count: number;
//   alternative_names: string[];
//   metacritic_url: string;
//   parents_count: number;
//   additions_count: number;
//   game_series_count: number;
//   esrb_rating: Esrbrating;
//   platforms: Platform[];
// }

// export interface Platform {
//   platform: Esrbrating;
//   released_at: string;
//   requirements: Requirements;
// }

// export interface Requirements {
//   minimum: string;
//   recommended: string;
// }

// export interface Esrbrating {
//   id: number;
//   slug: string;
//   name: string;
// }

// export interface Metacriticplatform {
//   metascore: number;
//   url: string;
// }
