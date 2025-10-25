<script setup>
import SharedBackground from './components/SharedBackground.vue'
</script>

<template>
  <div id="app">
    <!-- 共享背景，一直挂载 -->
    <SharedBackground />

    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<style>
/* App容器样式 */
#app {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
</style>
