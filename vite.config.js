// 保存路径: vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 设置 @ 指向 src 目录，方便后续编写干净的路径导入
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // 锁定本地开发端口
    host: true  // 允许局域网内其他设备访问（如手机端测试）
  },
  build: {
    outDir: 'dist', // 确保打包生成的静态目录名称为 dist
    assetsDir: 'assets', // 静态资源子目录
    sourcemap: false // 生产环境关闭 sourcemap 以提高构建速度并减小包体积
  }
})