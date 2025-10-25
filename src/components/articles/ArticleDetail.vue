<template>
  <section
    v-if="article"
    class="article-detail"
    aria-label="Article content"
  >
    <header class="article-detail-header">
      <router-link
        class="article-detail-nav-link"
        :to="{ name: 'Articles' }"
        aria-label="Back to article list"
      >
        &lt; Back to the list
      </router-link>
      <h1 class="article-detail-title">{{ article.title }}</h1>
      <div class="article-detail-meta">
        <span>{{ article.displayDate }}</span>
        <span>· {{ article.author }}</span>
        <span>· {{ article.readTime }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="article-loading">正在加载文章内容...</div>
    <div v-else-if="loadError" class="article-error">{{ loadError }}</div>
    <div
      v-else
      class="markdown-body"
      v-html="renderedContent"
    />
  </section>

  <section v-else class="article-missing" aria-live="polite">
    <h2>未找到文章</h2>
    <p>你访问的文章不存在，或者已经被移动。</p>
    <router-link class="article-back" :to="{ name: 'Articles' }">返回文章列表</router-link>
  </section>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps({
  articles: {
    type: Array,
    default: () => []
  }
})

const route = useRoute()
const markdownSource = ref('')
const isLoading = ref(false)
const loadError = ref('')

const { escapeHtml } = new MarkdownIt().utils

const markdownRenderer = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(code, { language: lang }).value
        return `<pre class="hljs"><code>${highlighted}</code></pre>`
      } catch (error) {
        console.error('代码高亮失败', error)
      }
    }

    const fallback = escapeHtml(code)
    return `<pre class="hljs"><code>${fallback}</code></pre>`
  }
}).enable(['table'])

const copyToClipboard = async (text) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  if (typeof document === 'undefined') {
    return false
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  let succeeded = false
  try {
    succeeded = document.execCommand('copy')
  } catch (error) {
    console.error('复制代码失败', error)
    succeeded = false
  } finally {
    document.body.removeChild(textarea)
  }

  return succeeded
}

const enhanceCodeBlocks = () => {
  if (typeof window === 'undefined') {
    return
  }

  nextTick(() => {
    const blocks = document.querySelectorAll('.markdown-body pre.hljs')
    blocks.forEach((block) => {
      if (block.dataset.copyBound === 'true') {
        return
      }

      const codeElement = block.querySelector('code')
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'code-copy-btn'
      button.textContent = 'Copy'
      button.setAttribute('aria-label', '复制代码')

      button.addEventListener('click', async () => {
        if (!codeElement) {
          return
        }

        const codeText = codeElement.innerText
        try {
          const result = await copyToClipboard(codeText)
          if (!result) {
            throw new Error('Clipboard unavailable')
          }
          button.textContent = 'Copied'
          button.classList.add('copied')
        } catch (error) {
          console.error(error)
          button.textContent = 'Failed'
          button.classList.add('error')
        }

        window.setTimeout(() => {
          button.textContent = 'Copy'
          button.classList.remove('copied')
          button.classList.remove('error')
        }, 2000)
      })

      block.appendChild(button)
      block.dataset.copyBound = 'true'
    })
  })
}

const article = computed(() =>
  props.articles.find((item) => item.id === route.params.slug)
)

const renderedContent = computed(() =>
  markdownSource.value ? markdownRenderer.render(markdownSource.value) : ''
)

const markdownModules = import.meta.glob('../../articles/*.md', {
  query: '?raw',
  import: 'default'
})

watch(
  () => renderedContent.value,
  () => {
    enhanceCodeBlocks()
  },
  { flush: 'post' }
)

const runArticleAnimation = () => {
  if (typeof window === 'undefined' || !window.anime) {
    return
  }

  window.anime({
    targets: '.article-detail',
    translateY: [12, 0],
    opacity: [0, 1],
    duration: 450,
    easing: 'easeOutCubic'
  })
}

const loadArticleContent = async (target) => {
  if (!target) {
    markdownSource.value = ''
    loadError.value = ''
    return
  }

  const modulePath = `../../articles/${target.file}`
  const loader = markdownModules[modulePath]

  if (!loader) {
    markdownSource.value = ''
    loadError.value = '文章内容文件不存在。'
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    markdownSource.value = await loader()
    runArticleAnimation()
  } catch (error) {
    console.error(error)
    markdownSource.value = ''
    loadError.value = '加载文章内容时发生错误。'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => article.value,
  (target) => {
    loadArticleContent(target)
  },
  { immediate: true }
)
</script>

<style scoped>
.article-detail {
  padding: 2.5rem;
  background: rgba(22, 22, 26, 0.78);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
}

.article-detail-header {
  margin-bottom: 1.8rem;
}

.article-detail-title {
  font-size: 2.25rem;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.article-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.85rem;
  opacity: 0.76;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.article-detail-nav-link {
  position: relative;
  display: inline-block;
  margin-bottom: 1.4rem;
  color: #f5f6f7;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  transition: color 0.3s ease;
}

.article-detail-nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.3rem;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.article-detail-nav-link:hover,
.article-detail-nav-link:focus-visible {
  color: #ffffff;
}

.article-detail-nav-link:hover::after,
.article-detail-nav-link:focus-visible::after {
  transform: scaleX(1);
}

.article-loading,
.article-error {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  text-align: center;
}

.article-error {
  color: #ffb4b4;
}

.markdown-body {
  font-size: 1.05rem;
  line-height: 1.8;
  color: rgba(247, 248, 249, 0.92);
  max-width: 1200px;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 2.4rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.markdown-body h1:first-child {
  margin-top: 0;
}

.markdown-body p {
  margin-bottom: 1.1rem;
}

:deep(.markdown-body code) {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  font-size: 0.92rem;
}

:deep(.markdown-body a) {
  color: #7ab7ff;
  text-decoration: none;
  border-bottom: 1px solid rgba(122, 183, 255, 0.4);
  transition: color 0.2s ease, border-color 0.2s ease;
}

:deep(.markdown-body a:hover),
:deep(.markdown-body a:focus-visible) {
  color: #a3ccff;
  border-bottom-color: rgba(163, 204, 255, 0.7);
}

:deep(.markdown-body pre) {
  padding: 1.2rem;
  border-radius: 12px;
  overflow-x: auto;
  margin: 2rem 0;
  display: inline-block;
  width: fit-content;
  min-width: 600px;
  max-width: 100%;
}

:deep(.markdown-body pre:not(.hljs)) {
  background: rgba(0, 0, 0, 0.35);
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
}

:deep(.markdown-body pre.hljs) {
  position: relative;
  padding: 1.4rem 1.4rem 1.2rem;
  border-radius: 18px;
  background: rgba(60, 60, 63, 0.92);
  border: 1px solid rgba(60, 60, 63, 0.92);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
}

:deep(.markdown-body pre.hljs code) {
  font-family: 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
  font-size: 0.95rem;
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: rgba(30, 30, 36, 0.82);
  border-radius: 16px;
  overflow: hidden;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem 1rem;
  text-align: left;
}

:deep(.markdown-body th) {
  background: rgba(45, 45, 54, 0.9);
  font-weight: 600;
}

:deep(.markdown-body tr:nth-child(even) td) {
  background: rgba(40, 40, 48, 0.65);
}

:deep(.markdown-body table font) {
  color: #ffffff !important;
}

:deep(.markdown-body .code-copy-btn) {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 0;
  border-radius: 0;
  border: none;
  background: rgba(60, 60, 63, 0.92);
  color: #ffffff;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: none;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease;
}

:deep(.markdown-body .code-copy-btn:hover),
:deep(.markdown-body .code-copy-btn:focus-visible) {
  background: rgba(60, 60, 63, 0.92);
  color: #ffffff;
}

:deep(.markdown-body .code-copy-btn.copied) {
  background: rgba(60, 60, 63, 0.92);
  color: #d8fff3;
}

.article-missing {
  padding: 2rem;
  background: rgba(22, 22, 26, 0.78);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.article-back {
  display: inline-block;
  margin-top: 1.2rem;
  padding: 0.6rem 1.6rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  text-decoration: none;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.article-back:hover,
.article-back:focus-visible {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
}


@media (max-width: 768px) {
  .article-detail {
    padding: 2rem;
  }

  .article-detail-title {
    font-size: 1.9rem;
  }
}

@media (max-width: 480px) {
  .article-detail {
    padding: 1.6rem;
  }

  .article-detail-title {
    font-size: 1.65rem;
  }
}
</style>
