<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
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
