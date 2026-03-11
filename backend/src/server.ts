import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import healthRoutes from './routes/health';
import dashboardRoutes from './routes/dashboard';
import errorHandler from './middleware/errorHandler';
import { swaggerSpec } from './config/swagger';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

const RATE_LIMIT_ENABLED = process.env.USE_RATE_LIMIT === 'true';

if (!RATE_LIMIT_ENABLED) {
  console.log('Rate limiting disabled (USE_RATE_LIMIT != true)');
} else {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'TooManyRequests', message: 'Too many requests, please try again later.' },
  });
  app.use(limiter);
}
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/health', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

const gracefulShutdown = (signal: string): void => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
