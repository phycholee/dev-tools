<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <AppToast ref="toastRef" />
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import AppLayout from './components/layout/AppLayout.vue'
import AppToast from './components/common/AppToast.vue'

const toastRef = ref<InstanceType<typeof AppToast>>()

function toast(message: string) {
  toastRef.value?.show(message)
}

provide('toast', toast)
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
