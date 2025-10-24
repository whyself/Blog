<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import FluidBackground from './components/FluidBackground.vue'

// vendor script path for WebGL Fluid Simulation (place demo files under public/vendor/webgl/)
const fluidScript = '/vendor/webgl/script.js'
</script>

<template>
  <FluidBackground :src="fluidScript">
    <header>
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

      <div class="wrapper">
        <HelloWorld msg="You did it!" />
      </div>
    </header>

    <main>
      <TheWelcome />
    </main>
  </FluidBackground>
</template>

<style scoped>
.fluid-wrapper { min-height: 100vh; display: block; }
header {
  line-height: 1.5;
  position: relative;
  z-index: 2;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

/* ensure overlay content is readable on top of fluid canvas */
.wrapper { background: rgba(0,0,0,0.35); padding: 1rem; border-radius: 8px; }

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
