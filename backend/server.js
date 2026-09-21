const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { runExpiryMonitorJob } = require('./src/jobs/expiryMonitorJob');

// Route files
const authRoutes = require('./src/routes/authRoutes');
const instrumentRoutes = require('./src/routes/instrumentRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const inspectionRoutes = require('./src/routes/inspectionRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const publicRoutes = require('./src/routes/publicRoutes');

const app = express();

// Database Connection
connectDB();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting for public endpoints & brute force protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Metrya Legal Metrology Verification Platform API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/instruments', instrumentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Run expiry monitor on startup and schedule hourly check
setTimeout(() => {
  runExpiryMonitorJob();
}, 3000);

setInterval(() => {
  runExpiryMonitorJob();
}, 60 * 60 * 1000); // Check every hour

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Metrya API] Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});

module.exports = app;
