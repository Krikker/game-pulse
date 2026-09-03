import type { LibraryEntry, StorageItem } from '@/interfaces/library.interface';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const defaultEntry = (gameId: number): LibraryEntry => ({
  id: gameId,
  status: 'unmarked',
  platform: 'pc',
  progress: 0,
  userRating: null,
  updatedAt: new Date().toISOString(),
});

const normalizeProgress = (status: LibraryEntry['status'], progress: number) => {
  if (status === 'completed') return 100;
  if (status === 'planned') return 0;
  return Math.max(0, Math.min(100, Math.round(progress)));
};

const normalizeEntry = (item: StorageItem): LibraryEntry => {
  if (typeof item === 'number') {
    return defaultEntry(item);
  }

  const status = item.status || 'unmarked';
  const progress = Number.isFinite(Number(item.progress)) ? Number(item.progress) : 0;
  const parsedRating = item.userRating == null ? Number.NaN : Number(item.userRating);
  const userRating = Number.isFinite(parsedRating)
    ? Math.max(0, Math.min(10, Math.round(parsedRating * 10) / 10))
    : null;

  return {
    id: item.id,
    status,
    platform: item.platform || 'pc',
    progress: normalizeProgress(status, progress),
    userRating,
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
};

export const useLibrary = defineStore('lib', () => {
  const fromStorage = localStorage.getItem('library');
  const parsedStorage: StorageItem[] = fromStorage ? JSON.parse(fromStorage) : [];
  const my_lib = ref<LibraryEntry[]>(parsedStorage.map(normalizeEntry));

  watch(
    my_lib,
    (newVal) => {
      localStorage.setItem('library', JSON.stringify(newVal));
    },
    { deep: true },
  );

  const hasGame = (gameId: number) => my_lib.value.some((item) => item.id === gameId);

  const getEntry = (gameId: number) => my_lib.value.find((item) => item.id === gameId) ?? null;

  const addToLib = (
    gameId: number,
    patch: Partial<Omit<LibraryEntry, 'id' | 'updatedAt'>> = {},
  ) => {
    const existing = getEntry(gameId);
    const nextEntry: LibraryEntry = {
      ...(existing ?? defaultEntry(gameId)),
      ...patch,
      id: gameId,
      updatedAt: new Date().toISOString(),
    };
    nextEntry.progress = normalizeProgress(nextEntry.status, nextEntry.progress);

    if (existing) {
      my_lib.value = my_lib.value.map((item) => (item.id === gameId ? nextEntry : item));
      return;
    }

    my_lib.value.push(nextEntry);
  };

  const updateEntry = (gameId: number, patch: Partial<Omit<LibraryEntry, 'id'>>) => {
    const existing = getEntry(gameId);
    if (!existing) {
      addToLib(gameId, patch);
      return;
    }

    my_lib.value = my_lib.value.map((item) => {
      if (item.id !== gameId) return item;

      const nextItem = {
        ...item,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...nextItem,
        progress: normalizeProgress(nextItem.status, nextItem.progress),
      };
    });
  };

  const removeFromLib = (gameId: number) => {
    my_lib.value = my_lib.value.filter((item) => item.id !== gameId);
  };

  return { my_lib, addToLib, removeFromLib, updateEntry, getEntry, hasGame };
});
