import { ref } from 'vue';
import { defineStore } from 'pinia';
import { rawg, rawgService } from '@/api';

export const useSearchStore = defineStore('search', () => {
  const searchRes = ref<string>('');

  async function fetchSearchRes() {
    const { data } = await rawgService.getAll(searchRes.value);
  }

  return { searchRes, fetchSearchRes };
});
