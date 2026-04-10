<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-lg border border-border bg-card text-foreground text-sm shadow-lg cursor-pointer"
        role="status"
        aria-live="polite"
        @click="dismiss"
      >
        <span class="text-green-400">✓</span>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')

let timer: ReturnType<typeof setTimeout> | null = null

interface QueuedMessage {
  msg: string
  duration: number
}

const queue: QueuedMessage[] = []

function showNext() {
  if (queue.length === 0) return
  const { msg, duration } = queue.shift()!
  message.value = msg
  visible.value = true
  timer = setTimeout(() => {
    visible.value = false
    // Wait for leave transition, then show next
    setTimeout(() => showNext(), 300)
  }, duration)
}

function show(msg: string, duration = 2000) {
  if (visible.value) {
    // Queue the message to show after current one
    queue.push({ msg, duration })
    return
  }
  message.value = msg
  visible.value = true
  timer = setTimeout(() => {
    visible.value = false
    setTimeout(() => showNext(), 300)
  }, duration)
}

function dismiss() {
  if (timer) clearTimeout(timer)
  visible.value = false
  setTimeout(() => showNext(), 300)
}

defineExpose({ show })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
