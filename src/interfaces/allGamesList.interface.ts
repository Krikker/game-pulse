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
  parent_platforms: Platform[];
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
  slug: string;
  releaseDate?: string;
  rating: number;
}
