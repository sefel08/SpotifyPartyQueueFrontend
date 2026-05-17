import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginSvgr from 'vite-plugin-svgr'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), vitePluginSvgr()], // add basicSsl() to enable HTTPS

  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
