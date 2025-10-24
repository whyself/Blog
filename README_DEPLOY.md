# 部署与维护（简易手册）

适用于仓库：whyself/Blog

当前配置概述
- Pages Source: `gh-pages` 分支（站点托管来源）
- CI: `.github/workflows/deploy.yml`，在 `main` 分支 push 时自动构建并把产物发布到 `gh-pages`

## 本地开发

安装依赖：

```powershell
npm ci
```

启动本地开发服务器：

```powershell
npm run dev
# 在浏览器打开 http://localhost:5173
```

## 本地构建与预览

```powershell
npm run build
# 可选：用临时静态服务器预览
npx serve dist
```

## 自动部署（已配置 Actions）

在 `main` 上的每次 `git push` 都会触发 CI：Actions 会安装依赖、运行 `npm run build`，并把 `dist` 发布到 `gh-pages` 分支。

常用命令（推送后自动触发）：

```powershell
git add .
git commit -m "feat: 更新内容"
git push origin main
```

如果想临时触发一次 CI（不改变代码）：

```powershell
git commit --allow-empty -m "chore: trigger CI deploy"
git push origin main
```

## 验证部署是否成功（快速检查）

```powershell
$r = Invoke-WebRequest -Uri 'https://whyself.github.io/Blog/' -UseBasicParsing
$r.StatusCode        # 期望 200
$r.Content -match '/Blog/assets'  # 期望 True
```

或者在浏览器打开： https://whyself.github.io/Blog/

## 查看 Actions 日志

在浏览器打开： https://github.com/whyself/Blog/actions

或使用 gh CLI (已登录)：

```powershell
gh run list --repo whyself/Blog
gh run view <run-id> --repo whyself/Blog --log
```

## 回滚 / 备份

`gh-pages` 分支保存构建产物历史。查看并回滚示例：

```powershell
git fetch origin gh-pages:gh-pages
git checkout gh-pages
git log --oneline
# 回滚（谨慎）：
git reset --hard <commit-hash>
git push -f origin gh-pages
```

## 自定义域（可选）

在 `dist/` 下放置 `CNAME` 文件（内容为你的域名），或在 workflow 的 Build 之后写入 `dist/CNAME`。

示例（在 workflow 中）：

```yaml
- name: Add CNAME
  run: echo 'www.example.com' > dist/CNAME
```

## 注意事项

- 确保 `vite.config.js` 中 `base` 值为 `'/Blog/'`（当前仓库名），否则资源路径会 404。
- 不要把 `dist` 提交到 `main`，让 Actions 推到 `gh-pages` 分支以保持源码分支清洁。
- 使用 Actions 的 `${{ secrets.GITHUB_TOKEN }}`，避免手动 PAT 泄露。
- 定期运行 `npm audit`、`npm outdated` 以保持依赖安全与更新。

如果你需要，我可以把这个文件也放到仓库并帮你添加一个简单的 `verify-deploy.ps1` 用于自动化检测。

---
作者自动生成：部署助手
