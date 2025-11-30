import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { ttsRouter } from './routes/tts';
import { healthRouter } from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Parse allowed origins from env
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'];

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked request from origin: ${origin}`);
      callback(null, true); // Allow anyway for development
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/tts', ttsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║          Friday Backend Server Started            ║
  ╠═══════════════════════════════════════════════════╣
  ║  Port: ${PORT}                                       ║
  ║  Mode: ${process.env.NODE_ENV || 'development'}                              ║
  ║  TTS:  Google Cloud Text-to-Speech                ║
  ╚═══════════════════════════════════════════════════╝

  Endpoints:
  - GET  /api/health     - Health check
  - POST /api/tts        - Text-to-speech synthesis
  - GET  /api/tts/voices - List available voices
  `);
});

export default app;
