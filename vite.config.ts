import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// Replace YOUR_REPO_NAME with your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/digital-library-tracker/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'docs',
  },
})
