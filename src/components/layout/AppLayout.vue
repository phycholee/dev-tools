<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    <main class="flex-1 bg-background">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>
