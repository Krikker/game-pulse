import axios from 'axios';

export const rawg = axios.create({
  baseURL: 'https://api.rawg.io/api',
  timeout: 10000,
  params: {
    key: import.meta.env.VITE_RAWG_API_KEY,
  },
});

export const rawgService = {
  getAll: (query: string, pageSize = 5) => {
    return rawg.get('/games', {
      params: {
        search: query,
        page_size: pageSize,
      },
    });
  },
  getById: (slug: string) => rawg.get(`/games/${slug}`),
  getTrending: (pageSize = 6) => {
    return rawg.get('/games', {
      params: {
        dates: '2024-01-01,2025-12-31',
        ordering: '-added',
        page_size: pageSize,
      },
    });
  },
  getGOTY: (pageSize = 10) => {
    return rawg.get('/games', {
      params: {
        dates: '2025-01-01,2025-12-31',
        ordering: '-rating',
        page_size: pageSize,
      },
    });
  },
  getGenres: (pageSize = 5) => {
    return rawg.get('/genres', {
      params: {
        page_size: pageSize,
      },
    });
  },
  getPlatforms: (pageSize = 5) => {
    return rawg.get('/platforms', {
      params: {
        page_size: pageSize,
      },
    });
  },
};

/*В планах реализовать доступ к steam api для отзывов и количества людей, 
играющих в данный момент, это усложняется невозможностью достать steam app id,
его можно взять при запросе к stores у RAWG, и достать из адресной строки игры 
в steam, но это лишний запрос, в котором пока не вижу необходимости */

// export const steam = axios.create({
//   baseURL: 'https://api.steampowered.com',
//   timeout: 10000,
//   params: {
//     key: import.meta.env.VITE_STEAM_API_KEY,
//   },
// });
