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
/* 页面切换动画 */
.slide-up-enter-active {
  transition: all 0.6s ease-out;
  animation: slide-in 0.6s ease-out;
}

.slide-up-leave-active {
  transition: all 0.6s ease-in;
  animation: slide-out 0.6s ease-in;
}

@keyframes slide-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh);
  }
}

@keyframes slide-in {
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
