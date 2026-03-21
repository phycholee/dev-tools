<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <Toaster position="top-right" :toastOptions="{ style: { background: 'hsl(0 0% 12%)', color: 'hsl(0 0% 91%)', border: '1px solid hsl(0 0% 22%)' } }" />
</template>

<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
import { Toaster } from 'vue-sonner'
// App 根组件
</script>

<style scoped>
#app {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  min-height: 100vh;
}

h1 {
  margin-bottom: var(--spacing-md);
}

p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

button:hover {
  background: var(--btn-primary-hover);
}
</style>
