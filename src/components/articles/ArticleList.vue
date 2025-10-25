<template>
  <section class="articles-list" aria-label="Article summaries">
    <router-link
      v-for="article in articles"
      :key="article.id"
      class="article-card-link"
      :to="{ name: 'ArticleDetail', params: { slug: article.id } }"
      :aria-label="`阅读 ${article.title}`"
    >
      <article class="article-card">
        <h2 class="article-title">{{ article.title }}</h2>
        <div class="article-meta">
          <span>{{ article.displayDate }}</span>
          <span>· {{ article.author }}</span>
          <span>· {{ article.readTime }}</span>
        </div>
        <p class="article-summary">{{ article.summary }}</p>
      </article>
    </router-link>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  }
})

onMounted(() => {
  if (typeof window === 'undefined' || !window.anime) {
    return
  }

  window.anime({
    targets: '.article-card',
    translateY: [24, 0],
    opacity: [0, 1],
    duration: 500,
    delay: window.anime.stagger(120, { start: 200 }),
    easing: 'easeOutCubic'
  })
})
</script>

<style scoped>
.articles-list {
  display: grid;
  gap: 2rem;
}

.article-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.article-card {
  padding: 2rem;
  background: rgba(22, 22, 26, 0.7);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.article-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
  -webkit-mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
  mask-composite: exclude;
}

.article-card-link:hover .article-card,
.article-card-link:focus-visible .article-card {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.35);
}

.article-title {
  font-size: 1.6rem;
  color: #ffffff;
  letter-spacing: 0.04em;
  transition: color 0.3s ease;
}

.article-card-link:hover .article-title,
.article-card-link:focus-visible .article-title {
  color: #c9d4ff;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.8rem;
  font-size: 0.85rem;
  opacity: 0.7;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.article-summary {
  margin-top: 1.4rem;
  line-height: 1.7;
  font-size: 1rem;
  opacity: 0.88;
}

@media (max-width: 768px) {
  .article-card {
    padding: 1.6rem;
  }

  .article-title {
    font-size: 1.35rem;
  }
}

@media (max-width: 480px) {
  .article-meta {
    font-size: 0.78rem;
  }
}
</style>
