"use strict";
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const Store = require("electron-store");
let mainWindow;
let blogRoot = "";
const store = new Store({
  name: "article-manager",
  defaults: {
    blogRoot: ""
  }
});
const ARTICLES_SEGMENTS = ["src", "articles"];
const METADATA_FILE_NAME = "metadata.js";
const METADATA_FIELDS = ["id", "title", "date", "author", "readTime", "summary", "file"];
const resolveNpmRunner = () => {
  if (process.env.npm_execpath) {
    return {
      command: process.execPath,
      args: [process.env.npm_execpath, "run"]
    };
  }
  return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: ["run"]
  };
};
const { command: NPM_COMMAND, args: NPM_ARGS } = resolveNpmRunner();
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  const devServerUrl = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }
  const indexHtml = path.join(app.getAppPath(), "dist", "renderer", "index.html");
  mainWindow.loadFile(indexHtml);
};
const ensureBlogRoot = () => {
  const candidates = [];
  if (process.env.BLOG_ROOT) {
    candidates.push(process.env.BLOG_ROOT);
  }
  const cached = store.get("blogRoot");
  if (cached) {
    candidates.push(cached);
  }
  const addCandidate = (value) => {
    if (value && !candidates.includes(value)) {
      candidates.push(value);
    }
  };
  addCandidate(process.cwd());
  const appPath = app.getAppPath();
  addCandidate(appPath);
  addCandidate(path.resolve(appPath, ".."));
  addCandidate(path.resolve(appPath, "..", ".."));
  const resourcesPath = process.resourcesPath;
  addCandidate(path.resolve(resourcesPath, ".."));
  addCandidate(path.resolve(resourcesPath, "..", ".."));
  const execDir = path.dirname(process.execPath);
  addCandidate(execDir);
  addCandidate(path.resolve(execDir, ".."));
  for (const candidate of candidates) {
    if (!candidate) continue;
    const articlesDir = path.join(candidate, ...ARTICLES_SEGMENTS);
    if (existsSync(articlesDir)) {
      const resolved = path.resolve(candidate);
      store.set("blogRoot", resolved);
      blogRoot = resolved;
      return resolved;
    }
  }
  blogRoot = "";
  return blogRoot;
};
const ensureBlogRootOrThrow = () => {
  const resolved = blogRoot || ensureBlogRoot();
  if (!resolved) {
    throw new Error("博客根目录未配置");
  }
  return resolved;
};
const getArticlesDir = () => {
  return path.join(ensureBlogRootOrThrow(), ...ARTICLES_SEGMENTS);
};
const getMetadataPath = () => {
  return path.join(getArticlesDir(), METADATA_FILE_NAME);
};
const toSafeArticlePath = (name) => {
  if (!name || typeof name !== "string") {
    throw new Error("文件名不能为空");
  }
  const normalised = name.replace(/\\/g, "/");
  if (normalised.includes("..")) {
    throw new Error("文件名不合法");
  }
  const finalName = normalised.endsWith(".md") ? normalised : `${normalised}.md`;
  return path.join(getArticlesDir(), finalName);
};
const execGit = (args) => {
  const cwd = ensureBlogRootOrThrow();
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
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
  const cwd = ensureBlogRootOrThrow();
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const command = isWindows ? "cmd.exe" : NPM_COMMAND;
    const args = isWindows ? ["/d", "/s", "/c", `npm run ${script}`] : [...NPM_ARGS, script];
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
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
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
};
const formatMetadata = (entries) => {
  const blocks = entries.map((entry) => {
    const lines = METADATA_FIELDS.map((field) => {
      const escaped = escapeMetadataValue(entry[field] ?? "");
      return `    ${field}: '${escaped}'`;
    });
    return `  {
${lines.join(",\n")}
  }`;
  });
  const body = blocks.join(",\n\n");
  const tail = body ? `
${body}
` : "\n";
  return `export const articlesMeta = [${tail}]
`;
};
const normaliseArticleName = (value) => {
  if (!value) {
    return "";
  }
  const cleaned = value.replace(/\\/g, "/").trim();
  if (!cleaned) {
    return "";
  }
  const segments = cleaned.split("/");
  const base = segments[segments.length - 1] || cleaned;
  if (!base) {
    return "";
  }
  if (base.toLowerCase() === "metadata.js") {
    return "";
  }
  return base.endsWith(".md") ? base.slice(0, -3) : base;
};
const buildAutoCommitMessage = (rawStatus, articleHint = "") => {
  if (!rawStatus) {
    return "";
  }
  const lines = rawStatus.split(/[\r\n]+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) {
    return "";
  }
  const hintName = normaliseArticleName(articleHint);
  const segments = [];
  for (const line of lines) {
    const status = line.slice(0, 2);
    let file = line.slice(3).trim();
    if (!file) {
      continue;
    }
    if (file.includes("->")) {
      const parts = file.split("->");
      file = (parts[1] ?? parts[0]).trim();
    }
    if (file.startsWith('"') && file.endsWith('"')) {
      file = file.slice(1, -1);
    }
    const base = path.basename(file).replace(/\\/g, "/");
    const lowerBase = base.toLowerCase();
    let article = base.endsWith(".md") ? base.slice(0, -3) : "";
    if (!article) {
      article = lowerBase === "metadata.js" ? "" : base.replace(/\.[^/.]+$/, "");
    }
    if ((!article || lowerBase === "metadata.js") && hintName) {
      article = hintName;
    }
    if (!article) {
      if (lowerBase === "metadata.js") {
        continue;
      }
      article = base;
    }
    let prefix = "修改文章";
    if (status.includes("?") || status.includes("A")) {
      prefix = "新建文章";
    } else if (status.includes("D")) {
      prefix = "删除文章";
    }
    const entry = `${prefix}${article}`;
    if (lowerBase === "metadata.js" && segments.includes(entry)) {
      continue;
    }
    segments.push(entry);
  }
  return Array.from(new Set(segments)).join("、");
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
      throw new Error("metadata 文件格式不正确");
    }
    return articlesMeta.map((entry) => {
      const record = {};
      for (const field of METADATA_FIELDS) {
        record[field] = typeof entry[field] === "string" ? entry[field] : "";
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
  await fs.writeFile(metadataPath, formatted, "utf-8");
};
const registerIpcHandlers = () => {
  ipcMain.handle("app:getBlogRoot", async () => {
    const root = blogRoot || ensureBlogRoot();
    return { blogRoot: root };
  });
  ipcMain.handle("app:selectBlogRoot", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "选择博客仓库目录",
      properties: ["openDirectory"]
    });
    if (result.canceled || !result.filePaths?.length) {
      throw new Error("未选择目录");
    }
    const chosen = path.resolve(result.filePaths[0]);
    const articlesDir = path.join(chosen, ...ARTICLES_SEGMENTS);
    if (!existsSync(articlesDir)) {
      throw new Error("选定目录下不存在 src/articles");
    }
    store.set("blogRoot", chosen);
    blogRoot = chosen;
    return { blogRoot: chosen };
  });
  ipcMain.handle("articles:list", async () => {
    const dir = getArticlesDir();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
    console.log("[Article Manager] Articles:", files);
    return files;
  });
  ipcMain.handle("articles:read", async (_event, name) => {
    const filePath = toSafeArticlePath(name);
    const content = await fs.readFile(filePath, "utf-8");
    return { name: path.basename(filePath), content };
  });
  ipcMain.handle("articles:save", async (_event, name, content) => {
    if (typeof content !== "string") {
      throw new Error("文章内容必须是文本");
    }
    const filePath = toSafeArticlePath(name);
    await fs.writeFile(filePath, content, "utf-8");
    return { name: path.basename(filePath) };
  });
  ipcMain.handle("articles:delete", async (_event, name) => {
    const filePath = toSafeArticlePath(name);
    const result = await dialog.showMessageBox(mainWindow, {
      type: "warning",
      title: "删除文章",
      message: `确认删除 ${path.basename(filePath)}?`,
      buttons: ["取消", "删除"],
      defaultId: 0,
      cancelId: 0
    });
    if (result.response !== 1) {
      return { deleted: false };
    }
    try {
      const list = await loadArticlesMeta();
      const filtered = list.filter((entry) => entry.file !== path.basename(filePath));
      if (filtered.length !== list.length) {
        await writeArticlesMeta(filtered);
      }
    } catch (error) {
      console.warn("[Article Manager] Failed to remove metadata for deleted article:", error.message);
    }
    await fs.unlink(filePath);
    return { deleted: true };
  });
  ipcMain.handle("git:status", async () => {
    return execGit(["status", "--short", "src/articles"]);
  });
  ipcMain.handle("git:commitAndPush", async (_event, message) => {
    const trimmed = (message || "").trim();
    if (!trimmed) {
      throw new Error("提交信息不能为空");
    }
    const changes = await execGit(["status", "--porcelain", "src/articles"]);
    if (!changes) {
      return { skipped: true, message: "没有检测到文章改动" };
    }
    await execGit(["add", "src/articles"]);
    await execGit(["commit", "-m", trimmed]);
    const pushResult = await execGit(["push"]);
    return { skipped: false, message: pushResult };
  });
  ipcMain.handle("metadata:list", async () => {
    return loadArticlesMeta();
  });
  ipcMain.handle("metadata:saveEntry", async (_event, payload) => {
    if (!payload || typeof payload !== "object") {
      throw new Error("元数据为空");
    }
    const entry = {};
    for (const field of METADATA_FIELDS) {
      entry[field] = typeof payload[field] === "string" ? payload[field].trim() : "";
    }
    if (!entry.id) {
      throw new Error("请填写文章 ID");
    }
    if (!entry.title) {
      throw new Error("请填写文章标题");
    }
    if (!entry.file) {
      throw new Error("请填写文章文件名");
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
  ipcMain.handle("project:autoCommitPushDeploy", async (_event, articleHint = "") => {
    const status = await execGit(["status", "--porcelain", "src/articles"]);
    const commitMessage = buildAutoCommitMessage(status, articleHint);
    if (!commitMessage) {
      throw new Error("没有检测到文章改动");
    }
    const outputs = [];
    await execGit(["add", "src/articles"]);
    const commitResult = await execGit(["commit", "-m", commitMessage]);
    outputs.push(`git commit -m "${commitMessage}"
${commitResult}`);
    const pushResult = await execGit(["push"]);
    outputs.push(`git push
${pushResult}`);
    const scripts = ["build", "deploy"];
    for (const script of scripts) {
      try {
        const output = await execNpmScript(script);
        outputs.push(`npm run ${script}
${output}`);
      } catch (error) {
        outputs.push(`npm run ${script}
${error.message || error}`);
        throw error;
      }
    }
    return {
      message: "提交、推送并部署完成",
      commitMessage,
      output: outputs.join("\n\n")
    };
  });
  ipcMain.handle("project:buildAndDeploy", async () => {
    const outputs = [];
    const scripts = ["build", "deploy"];
    for (const script of scripts) {
      try {
        const output = await execNpmScript(script);
        outputs.push(`npm run ${script}
${output}`);
      } catch (error) {
        outputs.push(`npm run ${script}
${error.message || error}`);
        throw error;
      }
    }
    return {
      message: "构建与部署已完成",
      output: outputs.join("\n\n")
    };
  });
};
app.whenReady().then(() => {
  blogRoot = ensureBlogRoot();
  console.log(`[Article Manager] Using blog root: ${blogRoot || "未定位"}`);
  createWindow();
  registerIpcHandlers();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
