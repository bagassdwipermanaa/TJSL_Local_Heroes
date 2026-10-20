import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { config } from './config/index.js';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import { loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { sanitizeMiddleware } from './middlewares/sanitizeMiddleware.js';
import { generalApiLimiter } from './middlewares/rateLimiter.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { initDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeMiddleware);
app.use(loggerMiddleware);
app.use('/api', generalApiLimiter.middleware());

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Penilaian TJSL Local Heroes PLN ES API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api', assessmentRoutes);
app.use('/api', registrationRoutes);
app.use('/api', uploadRoutes);
app.use('/api', authRoutes);

// Global Error Handler (including Multer errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran berkas melebihi batas maksimum (20 MB).'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Kesalahan unggah berkas: ' + err.message
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Terjadi kesalahan pada server.'
    });
  }

  next();
});

// Start server and initialize MySQL connection
async function startServer() {
  await initDatabase();
  app.listen(config.port, () => {
    console.log(`[PLN ES TJSL API] Server running on port ${config.port} (${config.nodeEnv})`);
    console.log(`[PLN ES TJSL API] Health check: http://localhost:${config.port}/api/health`);
    console.log(`[PLN ES TJSL API] Upload endpoint: http://localhost:${config.port}/api/upload`);
  });
}

startServer();
// Active
