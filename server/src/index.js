import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { sequelize } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import evidenceRoutes from './routes/evidence.js';
import verifyRoutes from './routes/verify.js';
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    await sequelize.sync();
    console.log('✅ Database models synced.');
  } catch (error) {
    console.warn('⚠️ Database connection notice:', error.message);
    console.warn('⚠️ Starting Express server in standalone API mode. Ensure PostgreSQL is running for persistent database operations.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 SentinelChain Express API Server listening at http://localhost:${PORT}`);
  });
};

startServer();
