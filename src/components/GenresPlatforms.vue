<script setup lang="ts">
import PlatformsReleased from './PlatformsReleased.vue';

const info = defineProps();
</script>

<template>
  <div>
    <PlatformsReleased :platforms="games.games?.platforms || []" size="28px" />
    <h5>{{}}</h5>
  </div>
</template>

<style scoped></style>
