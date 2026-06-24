import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 仓库名为 qingxin-shudong，GitHub Pages / Gitee Pages 部署在 /qingxin-shudong/ 子路径
  base: '/qingxin-shudong/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // 代理 Agnes AI 接口，避免浏览器 CORS 限制（仅开发环境）
      '/llm-api': {
        target: 'https://apihub.agnes-ai.com/v1',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/llm-api/, ''),
      },
      // 代理 Agnes AI 生图模型返回的图片 URL，避免 Canvas 跨域污染（仅开发环境）
      '/agnes-img': {
        target: 'https://platform-outputs.agnes-ai.space',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/agnes-img/, ''),
      },
    },
  },
})
