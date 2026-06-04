import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import chatRouter from './routes/chat';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Strip Vercel route prefix if present so routes match correctly on deployment
app.use((req, _res, next) => {
  if (req.url.startsWith('/_/backend')) {
    req.url = req.url.slice('/_/backend'.length);
  }
  if (!req.url.startsWith('/')) {
    req.url = '/' + req.url;
  }
  next();
});

const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
);

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/chat', chatRouter);

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — must be last
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 Spur backend running on http://localhost:${env.port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   Frontend URL: ${env.frontendUrl}`);
});

export default app;
