<template>
  <div class="fluid-wrapper" ref="root">
    <!-- canvas will be created by the vendor script or by the demo init -->
    <!-- overlay slot for page content above the fluid background -->
    <div class="fluid-overlay"><slot /></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// Props (composition API style via script setup)
const props = defineProps({
  // URL to the vendor WebGL fluid demo script. Could be local (public/vendor/...) or CDN.
  src: { type: String, required: true },
  // canvas id used by the demo (if demo auto-inits by id). If empty, we attempt to let demo auto-create.
  canvasId: { type: String, default: 'fluid-canvas' },
  // disable on mobile
  mobileDisable: { type: Boolean, default: true },
  // small config object passed to the init function if available
  config: { type: Object, default: () => ({}) }
})

const root = ref(null)
let vendorScriptEl = null
let fluidInstance = null

function loadScript(url) {
  return new Promise((resolve, reject) => {
    // avoid duplicate loads
    const existing = document.querySelector(`script[data-src="${url}"]`)
    if (existing) {
      if (existing.getAttribute('data-ready') === 'true') return resolve(existing)
      existing.addEventListener('load', () => resolve(existing))
      existing.addEventListener('error', () => reject(new Error('Failed to load script')))
      return
    }

    const s = document.createElement('script')
    s.src = url
    s.async = true
    s.setAttribute('data-src', url)
    s.addEventListener('load', () => {
      s.setAttribute('data-ready', 'true')
      resolve(s)
    })
    s.addEventListener('error', () => reject(new Error(`Failed to load ${url}`)))
    document.head.appendChild(s)
    vendorScriptEl = s
  })
}

function isMobileDevice() {
  return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)
}

onMounted(async () => {
  try {
    if (props.mobileDisable && isMobileDevice()) {
      // do not initialize heavy WebGL on mobile
      return
    }

    await loadScript(props.src)

    // Several versions of WebGL-Fluid demos exist. We try multiple conventions:
    // 1) an exported global init function named `initFluidDemo` or `init`
    // 2) the demo script auto-initializes by finding a canvas in DOM
    // 3) the demo exposes a global `fluid` object with an `init` method

    // If the demo expects a canvas id, create one inside our root container
    let canvas = document.getElementById(props.canvasId)
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = props.canvasId
      canvas.className = 'fluid-canvas'
      // insert canvas as first child so overlay sits above
      root.value.insertBefore(canvas, root.value.firstChild)
    }

    // Prefer explicit init function if present
    if (window.initFluidDemo && typeof window.initFluidDemo === 'function') {
      // store instance if returned
      fluidInstance = window.initFluidDemo({ canvasId: props.canvasId, ...props.config })
      return
    }

    if (window.init && typeof window.init === 'function') {
      // some demos provide global init
      fluidInstance = window.init({ canvasId: props.canvasId, ...props.config })
      return
    }

    // fallback: some demos auto-run and attach to global `fluid` or similar
    if (window.fluid && typeof window.fluid.init === 'function') {
      fluidInstance = window.fluid.init({ canvas: canvas, ...props.config })
      return
    }

    // If none of the above, hope demo auto-initialized on load and attached to canvas
    // We leave fluidInstance null but background should render if demo auto-initializes
  } catch (err) {
    // loading failed or init failed; keep silent but log for debugging
    // console.warn('FluidBackground init error:', err)
  }
})

onBeforeUnmount(() => {
  try {
    // try to call destroy on instance
    if (fluidInstance && typeof fluidInstance.destroy === 'function') {
      fluidInstance.destroy()
    }
    // some demos expose destroy on global
    if (window.fluid && typeof window.fluid.destroy === 'function') {
      window.fluid.destroy()
    }
    // remove vendor script if we inserted it
    if (vendorScriptEl && vendorScriptEl.parentNode) vendorScriptEl.parentNode.removeChild(vendorScriptEl)
  } catch (e) {
    // ignore
  }
})
</script>

<style scoped>
.fluid-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; }
.fluid-canvas { position: absolute; top:0; left:0; width:100%; height:100%; z-index:0; }
.fluid-overlay { position: relative; z-index:2; pointer-events: auto; }
</style>
