"use strict";
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { execFile } = require("node:child_process");
let mainWindow;
let blogRoot;
const ARTICLES_SEGMENTS = ["src", "articles"];
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
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
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
  candidates.push(path.resolve(appPath, ".."));
  candidates.push(path.resolve(appPath, "..", ".."));
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
  return new Promise((resolve, reject) => {
    const child = execFile("git", args, { cwd: blogRoot }, (error, stdout, stderr) => {
      if (error) {
        const message = stderr?.toString() || stdout?.toString() || error.message;
        reject(new Error(message.trim() || "Git 命令执行失败"));
        return;
      }
      resolve(stdout.toString().trim());
    });
    child.stdin?.end();
  });
};
const registerIpcHandlers = () => {
  ipcMain.handle("articles:list", async () => {
    const dir = getArticlesDir();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
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
    await fs.unlink(filePath);
    return { deleted: true };
  });
  ipcMain.handle("git:status", async () => {
    const status = await execGit(["status", "--short", "src/articles"]);
    return status;
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
};
app.whenReady().then(() => {
  blogRoot = ensureBlogRoot();
  console.log(`[Article Manager] Using blog root: ${blogRoot}`);
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
