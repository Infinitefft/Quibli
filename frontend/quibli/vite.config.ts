import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // __dirname node 的超级变量 项目根目录
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      // 开发时浏览器请求同源 /api，由 Vite 转发到 Nest，避免浏览器跨域
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
