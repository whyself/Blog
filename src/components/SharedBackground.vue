<template>
  <canvas id="shared-background"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { initBackgroundAnimation } from '../utils/background.js'

let cleanup = null

onMounted(() => {
  // 初始化共享背景动画
  cleanup = initBackgroundAnimation('shared-background')
})

onUnmounted(() => {
  // 清理动画（如果需要）
  if (cleanup && typeof cleanup === 'function') {
    cleanup()
  }
})
</script>

<style scoped>
#shared-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none; /* 不阻塞鼠标事件 */
}
</style>