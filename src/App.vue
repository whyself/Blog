<script setup>
import { useRouter } from 'vue-router'
import SharedBackground from './components/SharedBackground.vue'

const router = useRouter()
</script>

<template>
  <div id="app">
    <!-- 共享背景，一直挂载 -->
    <SharedBackground />

    <!-- 路由视图使用 transition 做向上滑切换 -->
    <transition name="slide-up" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<style>
/* App容器样式 */
#app {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 页面切换动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.8s ease, opacity 0.8s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100vh);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100vh);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
