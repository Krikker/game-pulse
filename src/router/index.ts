import ComparePage from '@/views/ComparePage.vue';
import DiscoverPage from '@/views/DiscoverPage.vue';
import LibraryPage from '@/views/LibraryPage.vue';
import MainPage from '@/views/MainPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';
import SearchPage from '@/views/SearchPage.vue';
import StatsPage from '@/views/StatsPage.vue';
import TrendPage from '@/views/TrendPage.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainPage,
    },
    {
      path: '/search',
      component: SearchPage,
      name: 'Search',
    },
    {
      path: '/trending',
      component: TrendPage,
    },
    {
      path: '/discover',
      component: DiscoverPage,
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
    {
      path: '/profile',
      component: ProfilePage,
    },
  ],
});

export default router;
