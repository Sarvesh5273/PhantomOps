import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.loca.lt'], // ✅ allow any loca.lt subdomain
    host: true,                 // ✅ allow external access
    port: 5173                  // your existing dev port
  },
});
