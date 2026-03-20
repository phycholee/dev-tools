<template>
  <div id="app">
    <h1 style="color: var(--text-accent)">DevTools</h1>
    <p>暗色主题已启用</p>
    <button style="background: var(--btn-primary); color: white; border: none; padding: 8px 16px; border-radius: 4px;">
      测试按钮
    </button>
  </div>
</template>

<script setup lang="ts">
// 基础 App 组件
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
