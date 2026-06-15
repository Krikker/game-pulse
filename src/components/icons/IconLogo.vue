<template>
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="drop-shadow-lg"
  >
    <path
      d="M20 45 C20 35 30 30 40 35 L50 35 V65 L40 65 C30 70 20 65 20 55 Z"
      fill="#1E293B"
      stroke="#3B82F6"
      stroke-width="2"
    />

    <path d="M30 45 H40 M35 40 V50" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" />

    <path
      d="M80 45 C80 35 70 30 60 35 L50 35 V65 L60 65 C70 70 80 65 80 55 Z"
      stroke="#3B82F6"
      stroke-width="2"
      stroke-dasharray="4 4"
      opacity="0.5"
      fill="none"
    />
    <path
      d="M50 50 L58 50 L64 35 L70 65 L76 45 L82 50"
      stroke="#06B6D4"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="animate-pulse-slow"
    />
  </svg>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse-glow 3s infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 1;
    filter: drop-shadow(0 0 2px #06b6d4);
  }
  50% {
    opacity: 0.7;
    filter: drop-shadow(0 0 5px #06b6d4);
  }
}
</style>
