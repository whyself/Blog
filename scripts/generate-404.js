import { copyFile } from 'fs/promises'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = resolve(__dirname, '..', 'dist')
const indexPath = resolve(distDir, 'index.html')
const notFoundPath = resolve(distDir, '404.html')

async function generateFallbackPage() {
  try {
    await copyFile(indexPath, notFoundPath)
    console.log('Generated dist/404.html for GitHub Pages fallback.')
  } catch (error) {
    console.error('Failed to generate 404.html from index.html:', error)
    process.exitCode = 1
  }
}

generateFallbackPage()
