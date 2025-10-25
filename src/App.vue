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
/* 页面切换动画 - 连续滑动衔接效果 */
.slide-up-enter-active {
  animation: slide-in-continuous 1.2s ease-out;
}

.slide-up-leave-active {
  animation: slide-out-continuous 1.2s ease-in;
}

@keyframes slide-out-continuous {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-50vh);
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh);
  }
}

@keyframes slide-in-continuous {
  0% {
    opacity: 0;
    transform: translateY(100vh);
  }
  50% {
    opacity: 1;
    transform: translateY(50vh);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
