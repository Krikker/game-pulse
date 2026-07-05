<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  totalItems: number;
  pageSize: number;
  currentPage: number;
}>();

const emit = defineEmits<{
  (e: 'update', page: number): void;
}>();

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize));

const updatePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return;
  emit('update', page);
};

const pagesShowed = computed(() => {
  const pages: number[] = [];
  if (totalPages.value <= 0) return pages;
  const windowSize = 4;
  let start = 1;
  let end = totalPages.value;

  if (totalPages.value <= windowSize) {
    start = 1;
    end = totalPages.value;
  } else if (props.currentPage <= 2) {
    start = 1;
    end = windowSize;
  } else if (props.currentPage >= totalPages.value - 1) {
    start = totalPages.value - (windowSize - 1);
    end = totalPages.value;
  } else {
    start = props.currentPage - 1;
    end = props.currentPage + 1;
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const firstPageToShow = computed(() => pagesShowed.value[0]);
const lastPageToShow = computed(() => pagesShowed.value[pagesShowed.value.length - 1]);
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      type="button"
      class="page-btn"
      v-if="firstPageToShow && firstPageToShow > 1"
      @click="updatePage(1)"
    >
      1
    </button>
    <span class="dots" v-if="firstPageToShow && firstPageToShow > 2">...</span>
    <button
      type="button"
      class="page-btn"
      v-for="page in pagesShowed"
      :key="page"
      :disabled="page === currentPage"
      @click="updatePage(page)"
      :class="{ active: page === currentPage }"
    >
      {{ page }}
    </button>
    <span class="dots" v-if="lastPageToShow && lastPageToShow < totalPages - 1">...</span>
    <button
      type="button"
      class="page-btn"
      v-if="lastPageToShow && lastPageToShow < totalPages"
      @click="updatePage(totalPages)"
    >
      {{ totalPages }}
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 40px 0 15px;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--color-box-border);
  border-radius: 8px;
  color: var(--color-search-text);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: var(--color-text);
  background: rgba(15, 23, 42, 0.9);
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: var(--color-text);
  cursor: default;
  pointer-events: none;
}

.page-btn:disabled {
  opacity: 1;
}

.page-btn:disabled:hover {
  border-color: #3b82f6;
  color: var(--color-text);
  background: #3b82f6;
}

.dots {
  color: #64748b;
  font-size: 1.5rem;
  padding: 0 4px;
}
</style>
