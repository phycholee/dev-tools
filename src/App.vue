<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <AppToast ref="toastRef" />
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
import AppToast from './components/common/AppToast.vue'
import { findToolByPath } from './tools/registry'

// Toast
const toastRef = ref<InstanceType<typeof AppToast>>()

function toast(message: string) {
  toastRef.value?.show(message)
}

provide('toast', toast)

// Fullscreen state
const route = useRoute()
const isFullscreen = ref(false)

const currentToolSupportsFullscreen = computed(() => {
  const tool = findToolByPath(route.path)
  return tool?.fullscreen === true
})

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

watch(() => route.path, () => {
  isFullscreen.value = false
})

provide('isFullscreen', isFullscreen)
provide('currentToolSupportsFullscreen', currentToolSupportsFullscreen)
provide('toggleFullscreen', toggleFullscreen)
</script>
