import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './database/config';
import authRoutes from './modules/auth/auth.routes';
import projectsRoutes from './modules/projects/projects.routes';
import testsRoutes from './modules/tests/tests.routes';
import executionsRoutes from './modules/executions/executions.routes';
import objectsRoutes from './modules/objects/objects.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import aiRoutes from './modules/ai/ai.routes';
import metricsRoutes from './modules/metrics/metrics.routes';
import autonomousTestingRoutes from './modules/autonomous-testing/autonomous-testing.routes';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import { Logger } from './utils/logger';

dotenv.config();

const logger = new Logger('API');
const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics middleware - collect HTTP metrics
app.use(metricsMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TestMaster API is running' });
});

// Metrics endpoint (Prometheus)
app.use('/metrics', metricsRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/projects', testsRoutes);
app.use('/api', executionsRoutes);
app.use('/api/projects', objectsRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/autonomous-testing', autonomousTestingRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    app.listen(PORT, () => {
      logger.info(`TestMaster API server is running on port ${PORT}`);
      logger.info(`Metrics endpoint available at http://localhost:${PORT}/metrics`);
    });
  } catch (error) {
    logger.error('Unable to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing server gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing server gracefully...');
  process.exit(0);
});

startServer();
