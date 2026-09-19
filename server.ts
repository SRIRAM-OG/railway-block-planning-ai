import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import taskRoutes from './server/routes/tasks';
import corridorRoutes from './server/routes/corridors';
import trainRoutes from './server/routes/trains';
import auditRoutes from './server/routes/audit';
import notificationRoutes from './server/routes/notifications';
import optimizationRoutes from './server/routes/optimization';
import { getDb } from './server/db';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Initialize database on server start
  getDb();
  console.log('✅ SQLite database initialized');

  // === API Routes ===

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', system: 'PDR-26027 Block Planning Platform', database: 'connected' });
  });

  // CRUD Routes
  app.use('/api/tasks', taskRoutes);
  app.use('/api/corridors', corridorRoutes);
  app.use('/api/trains', trainRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/optimize', optimizationRoutes);

  // Gemini AI Copilot Proxy
  app.post('/api/ai-copilot', async (req, res) => {
    try {
      const { prompt, context } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          reply: `[AI Platform Copilot — Offline Mode]\n\nNo API key configured. Please set GEMINI_API_KEY in your .env file.\n\nQuery: "${prompt}"`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI Operations Copilot for the AI Platform — an Automatic Block Planning system. You help railway operations controllers optimize maintenance block scheduling, resolve train-block conflicts, explain AI priority scores, and coordinate multi-department maintenance windows.

Context: ${JSON.stringify(context)}

User query: ${prompt}

Respond with specific, actionable railway operations analysis. Reference task IDs, corridor codes, and specific metrics where relevant.`,
      });

      res.json({ reply: response.text || 'Analysis completed.' });
    } catch (err: any) {
      console.error('Gemini error:', err);
      res.status(500).json({
        error: 'AI analysis failed',
        reply: `[AI Platform Copilot — Error]\n\nUnable to reach Gemini API: ${err.message || 'Unknown error'}.\n\nPlease check your GEMINI_API_KEY is valid.`
      });
    }
  });

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚂 PDR-26027 Server running on http://localhost:${PORT}`);
  });
}

startServer();
