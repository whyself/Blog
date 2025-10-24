// Loader for WebGL-Fluid-Simulation demo
// This script dynamically loads the official demo script from the project's GitHub raw URL.
// It's a convenience so you don't have to copy all demo files into the repo manually.

(function () {
  var RAW_URL = 'https://raw.githubusercontent.com/PavelDoGreat/WebGL-Fluid-Simulation/master/script.js'

  // If a local copy exists (for offline or customization), prefer it
  var local = '/vendor/webgl/script.local.js'
  function load(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script')
      s.src = url
      s.async = true
      s.onload = function () { resolve(url) }
      s.onerror = function (e) { reject(e) }
      document.head.appendChild(s)
    })
  }

  // Try local first, then remote
  load(local).catch(function () {
    console.warn('Local webgl fluid script not found, loading remote demo script...')
    return load(RAW_URL).catch(function (err) {
      console.error('Failed to load WebGL fluid demo script:', err)
    })
  }).then(function (url) {
    if (url) console.info('Loaded webgl fluid script:', url)
  })
})()
