import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,

    projects: [
      {
        plugins: [react()],
        test: {
          name: 'node',
          environment: 'node',
          setupFiles: ['./src/test/setup.ts'],
          include: ['**/*.test.ts'],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['**/*.test.tsx'],
        },
      },
    ],
  },
})