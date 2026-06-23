export interface FilterParams {
  page?: number;
  pageSize?: number;
  genres?: string;
  platforms?: string;
  tags?: string;
  dates?: string;
  metacritic?: string;
  ordering?: string;
  search?: string;
}

export interface PlatformByApi {
  id: number;
  name: string;
  platforms: GenresPlatformsTagsBase[];
  slug: string;
}

export interface GenresPlatformsTagsBase {
  id: number;
  name: string;
  slug: string;
  games_count: number;
}
