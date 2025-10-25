<template>
  <div class="content content-main">
    <div id="card">
      <div class="card-inner fade">
        <header>
          <img src="/avatar.jpg" width="100" height="100" alt="avatar">
          <h1 data-translate="name">WhySelf</h1>
          <h2 id="signature" data-translate="signature">STDIN | Think &gt;&gt; /dev/Mind</h2>
        </header>
        <ul>
          <li><router-link to="/blog" aria-label="Blog"><i class="icon icon-bokeyuan"></i><span data-translate="Blog">Blog</span></router-link></li>
          <li><router-link to="/thoughts" aria-label="Thoughts"><i class="icon icon-biaoqing"></i><span data-translate="Thoughts">Thoughts</span></router-link></li>
          <li><router-link to="/about" aria-label="About"><i class="icon icon-zhifeiji"></i><span data-translate="About">About</span></router-link></li>
          <li><router-link to="/gallery" aria-label="Gallery"><i class="icon icon-xiangce"></i><span data-translate="Gallery">Gallery</span></router-link></li>
          <li><router-link to="/projects" aria-label="Projects"><i class="icon icon-projects"></i><span data-translate="Projects">Projects</span></router-link></li>
          <li><a href="https://thinking.simonaking.com/" aria-label="Thinking" target="_blank" rel="noopener"><i class="icon icon-idea"></i><span data-translate="Thinking">Thinking</span></a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// 组件挂载后初始化anime.js动画
onMounted(() => {

  // 等待anime.js加载
  const initAnime = () => {
    if (window.anime) {
      // 使用anime.js添加卡片进入动画
      window.anime({
        targets: '#card',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutBack'
      })

      // 头像动画
      window.anime({
        targets: '.card-inner header img',
        rotate: [360, 0],
        scale: [0, 1],
        duration: 1000,
        delay: 200,
        easing: 'easeOutElastic'
      })

      // 文字动画
      window.anime({
        targets: '.card-inner h1',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600,
        delay: 400,
        easing: 'easeOutExpo'
      })

      window.anime({
        targets: '.card-inner h2',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        delay: 500,
        easing: 'easeOutExpo'
      })

      // 链接列表动画
      window.anime({
        targets: '.card-inner li',
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 500,
        delay: window.anime.stagger(100, {start: 600}),
        easing: 'easeOutExpo'
      })
    } else {
      // 如果anime.js未加载，稍后重试
      setTimeout(initAnime, 100)
    }
  }

  initAnime()
})
</script>

<style scoped>
/* 导航页样式 */
.content-main {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

#card {
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
  margin: 0.5rem 0 2rem;
  opacity: 0.8;
  font-style: italic;
}

.card-inner ul {
  list-style: none;
  padding: 0;
}

.card-inner li {
  margin: 1.5rem 0;
}

.card-inner a {
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-inner a:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.icon {
  margin-right: 0.5rem;
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.fade {
  opacity: 1;
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式 */
@media (max-width: 768px) {
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
</style>