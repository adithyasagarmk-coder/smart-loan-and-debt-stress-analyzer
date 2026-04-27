const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react').default;

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
