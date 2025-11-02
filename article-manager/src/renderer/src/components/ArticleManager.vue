<template>
  <div class="manager">
    <aside class="sidebar">
      <header class="sidebar__header">
        <h1>文章</h1>
        <button class="ghost" @click="loadArticles" :disabled="isLoading">
          刷新
        </button>
      </header>

      <div class="list" v-if="articles.length">
        <button
          v-for="item in articles"
          :key="item"
          class="list__item"
          :class="{ active: item === currentArticleName }"
          @click="() => selectArticle(item)"
        >
          {{ item }}
        </button>
      </div>
      <p v-else class="empty">暂无文章</p>

      <section class="new-article">
        <input
          v-model="newArticleName"
          placeholder="new-article-name"
          spellcheck="false"
        />
        <button @click="createArticle" :disabled="!newArticleName.trim() || isLoading">
          新建
        </button>
        <button
          class="danger"
          @click="deleteCurrentArticle"
          :disabled="!currentArticleName || isLoading"
        >
          删除当前
        </button>
      </section>

      <section class="git">
        <div class="git__header">
          <h2>Git 状态</h2>
          <button class="ghost" @click="loadGitStatus" :disabled="isLoading">
            刷新
          </button>
        </div>
        <pre class="git__status">{{ gitStatus || '暂无改动' }}</pre>
        <input
          v-model="commitMessage"
          placeholder="提交信息"
          spellcheck="false"
        />
        <button
          class="primary"
          @click="commitAndPush"
          :disabled="!commitMessage.trim() || isLoading"
        >
          提交并推送
        </button>
        <button class="primary" @click="buildAndDeploy" :disabled="isLoading">
          构建并部署
        </button>
        <pre v-if="deploymentLog" class="deploy__log">{{ deploymentLog }}</pre>
      </section>
    </aside>

    <main class="editor">
      <header class="editor__header">
        <h1>{{ currentArticleName || '请选择或新建文章' }}</h1>
        <button class="primary" @click="saveArticle" :disabled="!currentArticleName || isLoading">
          保存
        </button>
      </header>

      <textarea
        v-model="currentContent"
        class="editor__textarea"
        :disabled="!currentArticleName || isLoading"
        placeholder="Markdown 内容"
      ></textarea>

      <section v-if="currentArticleName" class="metadata">
        <div class="metadata__header">
          <h2>文章元数据</h2>
          <button class="primary" @click="saveMetadata" :disabled="isLoading">
            保存元数据
          </button>
        </div>

        <p class="metadata__hint">保存前请至少填写 ID 和标题。</p>

        <div class="metadata__grid">
          <label class="metadata__field">
            <span>ID</span>
            <input v-model="metadataForm.id" placeholder="唯一 ID" spellcheck="false" />
          </label>
          <label class="metadata__field">
            <span>标题</span>
            <input v-model="metadataForm.title" placeholder="文章标题" spellcheck="false" />
          </label>
          <label class="metadata__field">
            <span>发布日期</span>
            <input v-model="metadataForm.date" placeholder="YYYY-MM-DD" spellcheck="false" />
          </label>
          <label class="metadata__field">
            <span>作者</span>
            <input v-model="metadataForm.author" placeholder="作者" spellcheck="false" />
          </label>
          <label class="metadata__field">
            <span>阅读时长</span>
            <input v-model="metadataForm.readTime" placeholder="例如 10 min read" spellcheck="false" />
          </label>
          <label class="metadata__field">
            <span>文件名</span>
            <input v-model="metadataForm.file" spellcheck="false" readonly />
          </label>
        </div>

        <label class="metadata__field metadata__summary">
          <span>摘要</span>
          <textarea
            v-model="metadataForm.summary"
            rows="4"
            placeholder="用于文章列表预览的摘要"
            spellcheck="false"
          ></textarea>
        </label>
      </section>

      <p v-if="feedbackMessage" class="feedback">{{ feedbackMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const articles = ref([]);
const currentArticleName = ref('');
const currentContent = ref('');
const newArticleName = ref('');
const commitMessage = ref('');
const gitStatus = ref('');
const feedbackMessage = ref('');
const errorMessage = ref('');
const deploymentLog = ref('');
const isLoading = ref(false);
const metadataList = ref([]);
const metadataForm = ref(createEmptyMetadata());

const api = window.articleApi;

function createEmptyMetadata(file = '') {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    title: '',
    date: today,
    author: 'WhySelf',
    readTime: '5 min read',
    summary: '',
    file
  };
}

const withLoading = async (fn) => {
  isLoading.value = true;
  errorMessage.value = '';
  feedbackMessage.value = '';
  try {
    await fn();
  } catch (error) {
    errorMessage.value = error?.message || '发生未知错误';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const fetchArticles = async () => {
  const list = await api.listArticles();
  articles.value = list;
  if (!list.includes(currentArticleName.value)) {
    currentArticleName.value = '';
    currentContent.value = '';
    metadataForm.value = createEmptyMetadata();
  }
};

const fetchGitStatus = async () => {
  gitStatus.value = await api.gitStatus();
};

const applyMetadataForArticle = (filename) => {
  if (!filename) {
    metadataForm.value = createEmptyMetadata();
    return;
  }

  const existing = metadataList.value.find((item) => item.file === filename);
  if (existing) {
    metadataForm.value = { ...existing };
  } else {
    metadataForm.value = createEmptyMetadata(filename);
  }
};

const fetchMetadata = async () => {
  const list = await api.listMetadata();
  metadataList.value = list;
  if (currentArticleName.value) {
    applyMetadataForArticle(currentArticleName.value);
  }
};

const loadArticles = async () => {
  await withLoading(async () => {
    await fetchArticles();
    await fetchMetadata();
  });
};

const selectArticle = async (name) => {
  await withLoading(async () => {
    const article = await api.readArticle(name);
    currentArticleName.value = article.name;
    currentContent.value = article.content;
    applyMetadataForArticle(article.name);
  });
};

const createArticle = async () => {
  const incoming = newArticleName.value.trim();
  if (!incoming) return;
  const normalised = incoming.endsWith('.md') ? incoming : `${incoming}.md`;
  await withLoading(async () => {
    await api.saveArticle(normalised, `# ${incoming}\n`);
    newArticleName.value = '';
    feedbackMessage.value = `${normalised} 已创建`;
    await fetchArticles();
    const article = await api.readArticle(normalised);
    currentArticleName.value = article.name;
    currentContent.value = article.content;
    applyMetadataForArticle(article.name);
  });
};

const saveArticle = async () => {
  if (!currentArticleName.value) return;
  await withLoading(async () => {
    await api.saveArticle(currentArticleName.value, currentContent.value);
    feedbackMessage.value = `${currentArticleName.value} 已保存`;
    await fetchGitStatus();
  });
};

const deleteCurrentArticle = async () => {
  if (!currentArticleName.value) return;
  await withLoading(async () => {
    const result = await api.deleteArticle(currentArticleName.value);
    if (result.deleted) {
      feedbackMessage.value = `${currentArticleName.value} 已删除`;
      currentArticleName.value = '';
      currentContent.value = '';
      metadataForm.value = createEmptyMetadata();
      await fetchArticles();
      await fetchGitStatus();
    }
  });
};

const saveMetadata = async () => {
  if (!currentArticleName.value) return;
  const payload = {
    ...metadataForm.value,
    file: currentArticleName.value
  };

  await withLoading(async () => {
    const saved = await api.saveMetadataEntry(payload);
    metadataForm.value = { ...saved };
    feedbackMessage.value = `${saved.title || saved.file} 元数据已保存`;
    await fetchMetadata();
  });
};

const loadGitStatus = async () => {
  await withLoading(fetchGitStatus);
};

const commitAndPush = async () => {
  const message = commitMessage.value.trim();
  if (!message) return;
  await withLoading(async () => {
    const result = await api.commitAndPush(message);
    commitMessage.value = '';
    feedbackMessage.value = result.message || '推送完成';
    await fetchGitStatus();
  });
};

const buildAndDeploy = async () => {
  deploymentLog.value = '';
  await withLoading(async () => {
    const result = await api.buildAndDeploy();
    deploymentLog.value = result.output || '';
    feedbackMessage.value = result.message || '构建部署完成';
    await fetchGitStatus();
  });
};

onMounted(async () => {
  await loadArticles();
  await loadGitStatus();
});
</script>

<style scoped>
.manager {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-right: 1px solid rgba(148, 163, 184, 0.2);
  overflow-y: auto;
}

.sidebar__header,
.editor__header,
.git__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.list {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.list__item {
  text-align: left;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease;
}

.list__item:hover {
  background: rgba(148, 163, 184, 0.2);
}

.list__item.active {
  background: rgba(14, 116, 144, 0.6);
}

.empty {
  text-align: center;
  color: rgba(148, 163, 184, 0.7);
}

.new-article,
.git {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input,
textarea,
button {
  font-family: "Segoe UI", sans-serif;
}

input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
}

input:focus,
textarea:focus {
  outline: 2px solid rgba(14, 116, 144, 0.8);
}

button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: rgba(51, 65, 85, 0.6);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

button:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.4);
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.primary {
  background: rgba(14, 116, 144, 0.8);
}

button.danger {
  background: rgba(239, 68, 68, 0.7);
}

button.ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.editor {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 16px;
  min-width: 0;
}

.editor__textarea {
  flex: 1;
  resize: none;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.8);
  padding: 16px;
  color: inherit;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .manager {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgba(15, 23, 42, 0.98);
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.6);
  }

  .editor {
    min-height: calc(100vh - 40px);
  }
}

.metadata {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.6);
}

.metadata__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metadata__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.metadata__hint {
  margin: 0;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.7);
}

.metadata__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.metadata__field span {
  color: rgba(148, 163, 184, 0.9);
}

.metadata__summary textarea {
  resize: vertical;
  min-height: 120px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
  padding: 12px;
  line-height: 1.5;
}

.feedback {
  color: #38bdf8;
}

.error {
  color: #f87171;
}

.git__status {
  min-height: 120px;
  max-height: 200px;
  overflow: auto;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  padding: 12px;
  white-space: pre-wrap;
}

.deploy__log {
  margin: 0;
  max-height: 160px;
  overflow: auto;
  background: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  padding: 12px;
  white-space: pre-wrap;
}
</style>
