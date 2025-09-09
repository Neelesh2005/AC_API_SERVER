import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Import routes
import authRoutes from './src/routes/auth_routes.js';
import companyRoutes from './src/routes/companyRoutes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { formatResponse } from './src/utils/responseFormatter.js';
import { routesList } from './src/utils/routeLists.js';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: formatResponse('error', 'Too many requests from this IP, please try again later.'),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/server/auth', authRoutes);
app.use('/server/company', companyRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json(formatResponse('success', 'Welcome to AC API Server! 🚀', {
    version: '1.0.0',
    available_routes: routesList,
    endpoints: {
      auth: '/api/auth',
      company: '/api/company'
    },
    documentation: 'Check README.md'
  }));
});

// Health check
app.get('/health', (req, res) => {
  res.json(formatResponse('success', 'Server is healthy', {
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    memory_usage: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development'
  }));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(
    formatResponse('error', `Route ${req.method} ${req.originalUrl} not found`)
  );
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 AC API Server Started');
  
});