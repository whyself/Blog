
# ant-design-vue

这是一个基于 Vue 3 的前端项目，支持通过 GitHub Pages 自动部署。

## 本地开发

```powershell
npm install
npm run dev
```

## 构建生产包

```powershell
npm run build
```

## 部署到 GitHub Pages

### 手动部署

```powershell
npm run deploy
```

### 自动部署（推荐）

推送到 main 分支后，GitHub Actions 会自动构建并部署到 gh-pages 分支。

## 访问地址

部署完成后，可通过如下地址访问：

```
https://whyself.github.io/Blog/
```

> 注意：如需更换仓库名或用户名，请同步修改 `vite.config.js` 中的 `base` 配置。
