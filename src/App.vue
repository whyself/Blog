<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div id="app">
    <transition name="slide-up" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<style>
/* 页面切换动画 - 流畅连续滑动 */
.slide-up-enter-active {
  animation: slide-in-smooth 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-leave-active {
  animation: slide-out-smooth 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slide-out-smooth {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh);
  }
}

@keyframes slide-in-smooth {
  0% {
    opacity: 0;
    transform: translateY(100vh);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
