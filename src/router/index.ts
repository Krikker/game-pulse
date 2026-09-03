import ComparePage from '@/views/ComparePage.vue';
import DiscoverPage from '@/views/DiscoverPage.vue';
import GameDetailsPage from '@/views/GameDetailsPage.vue';
import LibraryPage from '@/views/LibraryPage.vue';
import MainPage from '@/views/MainPage.vue';
import StatsPage from '@/views/StatsPage.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainPage,
    },
    {
      path: '/game/:slug',
      name: 'GameDetails',
      component: GameDetailsPage,
      props: true,
    },
    {
      path: '/discover',
      component: DiscoverPage,
      name: 'Discover',
      props: (route) => ({ query: route.query }),
    },
    {
      path: '/compare',
      component: ComparePage,
    },
    {
      path: '/stats',
      component: StatsPage,
    },
    {
      path: '/lib',
      component: LibraryPage,
    },
  ],
});

export default router;
