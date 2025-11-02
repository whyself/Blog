# Blog Article Manager

Electron + Vue 3 桌面工具，帮助本地可视化管理 `Blog/src/articles` 目录并提交更新到 GitHub。

## 功能概览

- 可视化新增、编辑、删除 Markdown 文章
- 直接在界面中维护 `src/articles/metadata.js` 的文章元数据
- 查看 Git 状态并一键提交推送
- 一键执行 `npm run build` + `npm run deploy` 同步到 GitHub Pages

> 提示：保存元数据时需填写 `id` 与 `title`，`file` 会自动使用当前文章文件名。

## 快速开始

```powershell
cd article-manager
npm install
npm run dev
```

开发模式会启动 Electron 应用并热更新前端界面。

## 构建打包

```powershell
npm run build
```

构建后会在 `release/` 目录生成 Windows 安装包和可执行文件。默认配置要求你将生成的应用放在博客仓库根目录运行，这样可以正确定位并修改 `src/articles` 内容。

## 环境变量

如果应用不能自动定位博客仓库，可以通过设置环境变量或在启动前手动指定：

- `BLOG_ROOT`：指向博客仓库根目录，例如 `C:\\Users\\11588\\Desktop\\Blog`。

```powershell
$env:BLOG_ROOT = "C:\\Users\\11588\\Desktop\\Blog"
npm run dev
```

## 后续开发建议

- 增强 UI 体验，例如引入组件库或 Markdown 编辑器。
- 根据需要扩展 Git 操作（切换分支、回滚等）。
- 增加文章元数据高级特性，例如批量编辑、校验等。
