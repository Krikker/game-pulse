<script setup lang="ts">
import { useGenresPlatformsTags } from '@/stores/genresPlatformsTags.store';
import { computed, ref } from 'vue';

const genresPlatformsTags = useGenresPlatformsTags();

const tagQuery = ref<string>('');
const isOpen = ref<boolean>(false);
const selectedTags = defineModel<number[]>('modelValue', { default: [] });

const filterTags = computed(() => {
  if (!tagQuery.value) return [];
  return genresPlatformsTags.tags
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
  selectedTags.value = selectedTags.value.filter((tag) => tag !== id);
};

const showSelected = computed(() => {
  return genresPlatformsTags.tags.filter((tag) => selectedTags.value.includes(tag.id));
});
</script>

<template>
  <div class="tag-list">
    <h3>Tags</h3>
    <input
      type="text"
      class="tag-input"
      v-model="tagQuery"
      placeholder="Search tags..."
      @focus="isOpen = true"
    />
    <ul class="autocomplete-suggest" v-if="isOpen && selectedTags.length > 0">
      <li class="matches" v-for="item in filterTags" :key="item.id" @click="addTag(item.id)">
        {{ item.name }}
      </li>
      <li class="no-matches" v-if="filterTags.length === 0">Tags not found</li>
    </ul>
    <div class="selected-matches" v-if="selectedTags.length > 0">
      <span lass="selected-tag" v-for="item in showSelected" :key="item.id">
        {{ item.name }}
        <button type="button" @click="removeTag(item.id)">x</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.tag-list {
  position: relative;
  background: #1e293b;
  border-radius: 8px;
  padding: 8px;
  min-height: 45px;
  cursor: text;
}

.selected-tag {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.selected-matches button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}

.tag-input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
  flex: 1;
  min-width: 100px;
}

.autocomplete-suggest {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #131a2a;
  border: 1px solid #334155;
  border-radius: 8px;
  margin-top: 5px;
  list-style: none;
  padding: 0;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.matches {
  padding: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.matches:hover {
  background: #1e293b;
  color: #60a5fa;
}
</style>
