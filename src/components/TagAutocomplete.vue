<script setup lang="ts">
import { useGenresPlatformsTags } from '@/stores/genresPlatformsTags.store';
import { computed, ref, onMounted, onUnmounted } from 'vue';

const store = useGenresPlatformsTags();

const tagQuery = ref<string>('');
const isOpen = ref<boolean>(false);
const containerRef = ref<HTMLElement | null>(null);

const selectedTags = defineModel<number[]>('modelValue', { default: [] });

const filterTags = computed(() => {
  if (!tagQuery.value) return [];
  return store.tags
    .filter(
      (tag) =>
        tag.name.toLowerCase().includes(tagQuery.value.toLowerCase()) &&
        !selectedTags.value.includes(tag.id),
    )
    .slice(0, 5);
});

const addTag = (id: number) => {
  if (!selectedTags.value.includes(id)) {
    selectedTags.value.push(id);
  }
  tagQuery.value = '';
  isOpen.value = false;
};

const removeTag = (id: number) => {
  selectedTags.value = selectedTags.value.filter((tagId) => tagId !== id);
};

const showSelected = computed(() => {
  return store.tags.filter((tag) => selectedTags.value.includes(tag.id));
});

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="tag-list" ref="containerRef">
    <h3>Tags</h3>
    <input
      type="text"
      class="tag-input"
      v-model="tagQuery"
      placeholder="Search tags..."
      @focus="isOpen = true"
      @click.stop="isOpen = true"
    />
    <ul v-if="isOpen && tagQuery && filterTags.length > 0" class="autocomplete-suggest">
      <li class="matches" v-for="item in filterTags" :key="item.id" @click="addTag(item.id)">
        {{ item.name }}
      </li>
    </ul>
    <ul v-if="isOpen && tagQuery && filterTags.length === 0" class="autocomplete-suggest">
      <li class="no-matches">No tags found</li>
    </ul>
    <div class="selected-matches" v-if="showSelected.length > 0">
      <span class="selected-tag" v-for="item in showSelected" :key="item.id">
        {{ item.name }}
        <button type="button" @click.stop="removeTag(item.id)">×</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.tag-list h3 {
  color: var(--color-text);
  font-size: 1.4rem;
  font-weight: 700;
}

.tag-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 16px;
  color: var(--color-text);
  padding: 12px 14px;
  outline: none;
  transition: border-color 0.2s;
  font-size: 1rem;
}

.tag-input::placeholder {
  color: var(--color-search-text);
}

.tag-input:focus {
  border-color: #3b82f6;
}

.selected-matches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-tag {
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
  padding: 6px 12px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.selected-matches button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.selected-matches button:hover {
  opacity: 1;
}

.autocomplete-suggest {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  margin-top: 10px;
  list-style: none;
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

.matches,
.no-matches {
  padding: 10px 16px;
  font-size: 1rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: background 0.2s;
}

.matches:hover {
  background: rgba(59, 130, 246, 0.14);
  color: #ffffff;
}

.no-matches {
  cursor: default;
  color: #64748b;
}
</style>
