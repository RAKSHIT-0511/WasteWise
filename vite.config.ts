import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

// Load server-side environment variables from .env
dotenv.config();

import { handleMatterLensIdentify } from './server/matterlensGateway';
import { handleEcoVerify } from './server/ecoverifyGateway';
import { handlePincodeLookup } from './server/pincodeGateway';
import { handleNextWorth } from './server/nextworthGateway';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'server-api-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/health') {
            res.setHeader('Content-Type', 'application/json');
            // Return status without exposing the actual secret key
            const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
            res.end(JSON.stringify({
              status: 'ok',
              service: 'WasteWise Backend Gateway',
              aiConfigured: hasKey,
              model: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
            }));
            return;
          }

          if (req.url === '/api/matterlens/identify') {
            handleMatterLensIdentify(req, res).catch((err) => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message || 'Internal server error' }));
            });
            return;
          }

          if (req.url === '/api/ecoverify/verify') {
            handleEcoVerify(req, res).catch((err) => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message || 'Internal server error' }));
            });
            return;
          }

          if (req.url?.startsWith('/api/pincode/lookup')) {
            handlePincodeLookup(req, res).catch((err) => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message || 'Internal server error' }));
            });
            return;
          }

          if (req.url === '/api/nextworth/recommend') {
            handleNextWorth(req, res).catch((err) => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message || 'Internal server error' }));
            });
            return;
          }

          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
