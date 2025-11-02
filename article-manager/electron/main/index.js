const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');

let mainWindow;
let blogRoot;

const ARTICLES_SEGMENTS = ['src', 'articles'];
const METADATA_FILE_NAME = 'metadata.js';
const METADATA_FIELDS = ['id', 'title', 'date', 'author', 'readTime', 'summary', 'file'];
const resolveNpmRunner = () => {
  if (process.env.npm_execpath) {
    return {
      command: process.execPath,
      args: [process.env.npm_execpath, 'run']
    };
  }

  return {
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run']
  };
};

const { command: NPM_COMMAND, args: NPM_ARGS } = resolveNpmRunner();

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devServerUrl = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
};

const ensureBlogRoot = () => {
  const candidates = [];

  if (process.env.BLOG_ROOT) {
    candidates.push(process.env.BLOG_ROOT);
  }

  candidates.push(process.cwd());
  const appPath = app.getAppPath();
  candidates.push(appPath);
  candidates.push(path.resolve(appPath, '..'));
  candidates.push(path.resolve(appPath, '..', '..'));

  for (const candidate of candidates) {
    if (!candidate) continue;
    const articlesDir = path.join(candidate, ...ARTICLES_SEGMENTS);
    if (existsSync(articlesDir)) {
      return path.resolve(candidate);
    }
  }

  return appPath;
};

const getArticlesDir = () => {
  return path.join(blogRoot, ...ARTICLES_SEGMENTS);
};

const getMetadataPath = () => {
  return path.join(getArticlesDir(), METADATA_FILE_NAME);
};

const toSafeArticlePath = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('文件名不能为空');
  }
  const normalised = name.replace(/\\/g, '/');
  if (normalised.includes('..')) {
    throw new Error('文件名不合法');
  }
  const finalName = normalised.endsWith('.md') ? normalised : `${normalised}.md`;
  return path.join(getArticlesDir(), finalName);
};

const execGit = (args) => {
  return new Promise((resolve, reject) => {
  const child = spawn('git', args, { cwd: blogRoot });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        const message = stderr || stdout || `Git 命令执行失败 (退出码 ${code})`;
        reject(new Error(message.trim()));
        return;
      }
      resolve(stdout.trim());
    });
  });
};

const execNpmScript = (script) => {
  return new Promise((resolve, reject) => {
    const child = spawn(NPM_COMMAND, [...NPM_ARGS, script], {
      cwd: blogRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        const message = stderr || stdout || `npm run ${script} 执行失败 (退出码 ${code})`;
        reject(new Error(message.trim()));
        return;
      }
      resolve(stdout.trim());
    });
  });
};

const escapeMetadataValue = (value) => {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
};

const formatMetadata = (entries) => {
  const blocks = entries.map((entry) => {
    const lines = METADATA_FIELDS.map((field) => {
      const escaped = escapeMetadataValue(entry[field] ?? '');
      return `    ${field}: '${escaped}'`;
    });
    return `  {\n${lines.join(',\n')}\n  }`;
  });

  const body = blocks.join(',\n\n');
  const tail = body ? `\n${body}\n` : '\n';
  return `export const articlesMeta = [${tail}]\n`;
};

const loadArticlesMeta = async () => {
  const metadataPath = getMetadataPath();

  if (!existsSync(metadataPath)) {
    return [];
  }

  try {
    const fileUrl = `${pathToFileURL(metadataPath).href}?t=${Date.now()}`;
    const module = await import(fileUrl);
    const { articlesMeta } = module;

    if (!Array.isArray(articlesMeta)) {
      throw new Error('metadata 文件格式不正确');
    }

    return articlesMeta.map((entry) => {
      const record = {};
      for (const field of METADATA_FIELDS) {
        record[field] = typeof entry[field] === 'string' ? entry[field] : '';
      }
      return record;
    });
  } catch (error) {
    throw new Error(`解析 metadata 失败: ${error.message}`);
  }
};

const writeArticlesMeta = async (entries) => {
  const metadataPath = getMetadataPath();
  const formatted = formatMetadata(entries);
  await fs.writeFile(metadataPath, formatted, 'utf-8');
};

const registerIpcHandlers = () => {
  ipcMain.handle('articles:list', async () => {
    const dir = getArticlesDir();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
    console.log('[Article Manager] Articles:', files);
    return files;
  });

  ipcMain.handle('articles:read', async (_event, name) => {
    const filePath = toSafeArticlePath(name);
    const content = await fs.readFile(filePath, 'utf-8');
    return { name: path.basename(filePath), content };
  });

  ipcMain.handle('articles:save', async (_event, name, content) => {
    if (typeof content !== 'string') {
      throw new Error('文章内容必须是文本');
    }
    const filePath = toSafeArticlePath(name);
    await fs.writeFile(filePath, content, 'utf-8');
    return { name: path.basename(filePath) };
  });

  ipcMain.handle('articles:delete', async (_event, name) => {
    const filePath = toSafeArticlePath(name);
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: '删除文章',
      message: `确认删除 ${path.basename(filePath)}?`,
      buttons: ['取消', '删除'],
      defaultId: 0,
      cancelId: 0
    });

    if (result.response !== 1) {
      return { deleted: false };
    }

    await fs.unlink(filePath);
    return { deleted: true };
  });

  ipcMain.handle('git:status', async () => {
    const status = await execGit(['status', '--short', 'src/articles']);
    return status;
  });

  ipcMain.handle('git:commitAndPush', async (_event, message) => {
    const trimmed = (message || '').trim();
    if (!trimmed) {
      throw new Error('提交信息不能为空');
    }

    const changes = await execGit(['status', '--porcelain', 'src/articles']);
    if (!changes) {
      return { skipped: true, message: '没有检测到文章改动' };
    }

    await execGit(['add', 'src/articles']);
    await execGit(['commit', '-m', trimmed]);
    const pushResult = await execGit(['push']);

    return { skipped: false, message: pushResult };
  });

  ipcMain.handle('metadata:list', async () => {
    return loadArticlesMeta();
  });

  ipcMain.handle('metadata:saveEntry', async (_event, payload) => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('元数据为空');
    }

    const entry = {};
    for (const field of METADATA_FIELDS) {
      entry[field] = typeof payload[field] === 'string' ? payload[field].trim() : '';
    }

    if (!entry.id) {
      throw new Error('请填写文章 ID');
    }

    if (!entry.title) {
      throw new Error('请填写文章标题');
    }

    if (!entry.file) {
      throw new Error('请填写文章文件名');
    }

    const list = await loadArticlesMeta();
    const index = list.findIndex((item) => item.file === entry.file || item.id === entry.id);

    if (index >= 0) {
      list[index] = entry;
    } else {
      list.push(entry);
    }

    await writeArticlesMeta(list);

    return entry;
  });

  ipcMain.handle('project:buildAndDeploy', async () => {
    const outputs = [];
    const scripts = ['build', 'deploy'];
    for (const script of scripts) {
      try {
        const output = await execNpmScript(script);
        outputs.push(`npm run ${script}\n${output}`);
      } catch (error) {
        outputs.push(`npm run ${script}\n${error.message || error}`);
        throw error;
      }
    }

    return {
      message: '构建与部署已完成',
      output: outputs.join('\n\n')
    };
  });
};

app.whenReady().then(() => {
  blogRoot = ensureBlogRoot();
  console.log(`[Article Manager] Using blog root: ${blogRoot}`);
  createWindow();
  registerIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
