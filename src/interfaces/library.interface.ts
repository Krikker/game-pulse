import type { SingleGame } from './singleGame.interface';

export interface LibraryEntry {
  id: number;
  status: LibraryStatus;
  platform: string;
  progress: number;
  userRating?: number | null;
  updatedAt: string;
}
export type LibraryStatus = 'unmarked' | 'playing' | 'completed' | 'planned' | 'dropped' | 'paused';

export type StorageItem = number | LibraryEntry;

export type SortKey = 'recent' | 'rating' | 'playtime' | 'name';

export type FilterKey = 'all' | LibraryStatus;

export type DraftEntry = Pick<LibraryEntry, 'status' | 'platform' | 'progress' | 'userRating'>;

export type LoadedLibraryGame = SingleGame & { library: LibraryEntry };
