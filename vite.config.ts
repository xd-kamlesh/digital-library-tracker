import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace YOUR_REPO_NAME with your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: 'digital-library-tracker', 
})
