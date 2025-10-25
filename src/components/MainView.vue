<template>
  <div class="main-view">
    <!-- Home页面内容 -->
    <transition name="slide-up" mode="out-in">
      <div v-if="currentView === 'home'" key="home" class="view-container">
        <div class="content content-intro">
          <div class="content-inner">
            <div class="wrap fade">
              <a class="github-corner" href="https://github.com/whyself/Blog" aria-label="View source on GitHub" target="_blank" rel="noopener noreferrer">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:transparent; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true">
                  <path d="M0 0 115 115 130 115 142 142 250 250 250 0Z"></path>
                  <path class="octo-arm" d="M128.3 109C113.8 99.7 119 89.6 119 89.6 122 82.7 120.5 78.6 120.5 78.6 119.2 72 123.4 76.3 123.4 76.3 127.3 80.9 125.5 87.3 125.5 87.3 122.9 97.6 130.6 101.9 134.4 103.2" fill="currentColor" style="transform-origin: 130px 106px;"></path>
                  <path class="octo-body" d="M115 115C114.9 115.1 118.7 116.5 119.8 115.4L133.7 101.6C136.9 99.2 139.9 98.4 142.2 98.6 133.8 88 127.5 74.4 143.8 58 148.5 53.4 154 51.2 159.7 51 160.3 49.4 163.2 43.6 171.4 40.1 171.4 40.1 176.1 42.5 178.8 56.2 183.1 58.6 187.2 61.8 190.9 65.4 194.5 69 197.7 73.2 200.1 77.6 213.8 80.2 216.3 84.9 216.3 84.9 212.7 93.1 206.9 96 205.4 96.6 205.1 102.4 203 107.8 198.3 112.5 181.9 128.9 168.3 122.5 157.7 114.1 157.9 116.9 156.7 120.9 152.7 124.9L141 136.5C139.8 137.7 141.6 141.9 141.8 141.8Z" fill="currentColor"></path>
                </svg>
              </a>
              <h2 class="content-title">whyself</h2>
              <h3 class="content-subtitle" original-content="Front back left right end engineer">MyBlog</h3>
              <button class="enter" @click="goToNav" aria-label="进入导航页面">PRESS START</button>
            </div>
          </div>
          <div class="shape-wrap">
            <svg class="shape" width="100%" height="100vh" preserveAspectRatio="none" viewBox="0 0 1440 800" xmlns:pathdata="http://www.codrops.com/">
              <path d="M-44-50C-52.71 28.52 15.86 8.186 184 14.69 383.3 22.39 462.5 12.58 638 14 835.5 15.6 987 6.4 1194 13.86 1661 30.68 1652-36.74 1582-140.1 1512-243.5 15.88-589.5-44-50Z" pathdata:id="M -44,-50 C -137.1,117.4 67.86,445.5 236,452 435.3,459.7 500.5,242.6 676,244 873.5,245.6 957,522.4 1154,594 1593,753.7 1793,226.3 1582,-126 1371,-478.3 219.8,-524.2 -44,-50 Z"></path>
            </svg>
          </div>
          <div class="arrow arrow-1"></div>
          <div class="arrow arrow-2"></div>
        </div>
      </div>

      <!-- Navigation页面内容 -->
      <div v-else key="nav" class="content content-main">
        <div id="card">
          <div class="card-inner fade">
            <header>
              <img src="/avatar.jpg" width="100" height="100" alt="avatar">
              <h1 data-translate="name">whyself</h1>
              <h2 id="signature" data-translate="signature">Restart.</h2>
            </header>
            <ul>
              <li><router-link to="/articles" aria-label="Articles"><i class="icon icon-bokeyuan"></i><span data-translate="Articles">Articles</span></router-link></li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentView = ref('home')

const goToNav = () => {
  currentView.value = 'nav'
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' || event.code === 'Enter') {
    goToNav()
  }
}

// 组件挂载后初始化anime.js动画
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyPress)

  // 等待anime.js加载
  const initAnime = () => {
    if (window.anime) {
      // 使用anime.js添加额外动画效果
      window.anime({
        targets: '.content-title',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo'
      })

      window.anime({
        targets: '.content-subtitle',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        delay: 300,
        easing: 'easeOutExpo'
      })

      window.anime({
        targets: '.enter',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
        delay: 600,
        easing: 'easeOutBack'
      })

      window.anime({
        targets: '.arrow',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        delay: 800,
        easing: 'easeOutExpo'
      })
    } else {
      // 如果anime.js未加载，稍后重试
      setTimeout(initAnime, 100)
    }
  }

  initAnime()
})

onUnmounted(() => {
  // 组件卸载时移除事件监听
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.main-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

@font-face {
  font-family: 'iconfont';
  font-display: auto;
  src: url('//at.alicdn.com/t/font_1056856_p9cyrhslv5j.eot?t=1551327438450'); /* IE9 */
  src: url('//at.alicdn.com/t/font_1056856_p9cyrhslv5j.eot?t=1551327438450#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAigAAsAAAAADxAAAAhSAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCEGAqPYIxdATYCJAMoCxYABCAFhG0HgRQbrwwjESZs1EX2FweZ3MWewKz2pGZnd5rMSlW4wjhlUqUv84D8x7m53bQj8T4Hz9Pa78/Mnd2n0iCRzCSrJLcMiURoGqJmutdv1r4PT5v7d9ySVimxGAuMWltbA1uzisTgtO+MAvywyraIH900QMCZeai4teMO1gmaEPOX8IubdfdzChP1jinP/vLTMlNIWwgfwvr/71XNxGyQebMtQAGL4ftZY3bshT2lD1ygsYb9UrDBaktSIA...') format('woff2'),
       url('//at.alicdn.com/t/font_1056856_p9cyrhslv5j.woff?t=1551327438450') format('woff'),
       url('//at.alicdn.com/t/font_1056856_p9cyrhslv5j.ttf?t=1551327438450') format('truetype'),
       url('//at.alicdn.com/t/font_1056856_p9cyrhslv5j.svg?t=1551327438450#iconfont') format('svg'); /* iOS 4.1- */
}

.icon {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  margin: 0 auto;
  fill: currentColor;
  font-family: 'iconfont' !important;
  font-size: 1.2em;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-bokeyuan:before {
  content: '\e603';
}

.icon-idea:before {
  content: '\e650';
}

.view-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 页面切换动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(50vh);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-50vh);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Home页面样式 */
.content-intro {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.content-inner {
  z-index: 2;
  position: relative;
}

.content-title {
  font-size: 6rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.content-subtitle {
  font-size: 1.5rem;
  margin: 1rem 0;
  opacity: 0.8;
}

.enter {
  display: inline-block;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-decoration: none;
  border: 2px solid #fff;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  margin: 2rem 0;
  font-family: inherit;
  font-size: inherit;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.enter::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2s infinite;
}

.enter:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.enter:active {
  transform: scale(0.95);
}

.arrow {
  position: absolute;
  left: 49.5%;
  top: 95%;
  transform-origin: 50% 50%;
  transform: translate3d(-50%, 0%, 0);
}

.arrow:before,
.arrow:after {
  background: #fff;
  content: "";
  display: block;
  height: 3px;
  position: absolute;
  top: 0;
  left: 0;
  width: 13px;
  box-shadow: 1px 1px 20px 0px #fff;
}

.arrow:before {
  transform: rotate(45deg) translateX(-10%);
  transform-origin: top left;
}

.arrow:after {
  transform: rotate(-45deg) translateX(10%);
  transform-origin: top right;
}

.arrow-1 {
  animation: arrow-movement 2s ease-in-out infinite;
}

.arrow-2 {
  animation: arrow-movement 2s 1s ease-in-out infinite;
}

@keyframes arrow-movement {
  0% {
    opacity: 0;
    top: 92%;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.shape-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.shape {
  fill: rgba(255, 255, 255, 0.1);
}

.fade {
  opacity: 1;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* GitHub corner animation */
.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%, 100% {
    transform: rotate(0);
  }
  20%, 60% {
    transform: rotate(-25deg);
  }
  40%, 80% {
    transform: rotate(10deg);
  }
}

@keyframes shine {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

/* Navigation页面样式 */
.content-main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

/* #card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 3rem;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
  width: 90%;
  z-index: 2;
  position: relative;
} */
 #card {
  display: inline-block;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-decoration: none;
  border-radius: 15px; /* 添加圆角 */
  cursor: pointer;
  transition: all 0.3s;
  margin: 2rem 0;
  font-family: inherit;
  font-size: inherit;
  position: relative;
  z-index: 10;
  overflow: hidden;
  width: 500px; /* 固定宽度 */
}

.card-inner header img {
  border-radius: 50%;
  margin-bottom: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.card-inner h1 {
  font-size: 2.5rem;
  margin: 0.5rem 0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.card-inner h2 {
  font-size: 1.2rem;
}

.card-inner ul {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0 0;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.card-inner li {
  margin: 0;
  font-size: 1.2em;
}

.card-inner a {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s;
  gap: 0.5rem; /* 图标和文字之间的间距 */
}

.card-inner a:hover {
  color: rgba(255, 255, 255, 0.8);
}

.card-inner span {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-intro h2 {
    font-size: 3rem !important;
  }
  .content-intro h3 {
    font-size: 1rem !important;
  }
  #card {
    padding: 2rem;
  }
  .card-inner h1 {
    font-size: 2rem;
  }
  .card-inner a {
    padding: 0.8rem 1rem;
  }
}

@media (max-width: 500px) {
  .github-corner:hover .octo-arm {
    animation: none;
  }
  .github-corner .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
}
</style>