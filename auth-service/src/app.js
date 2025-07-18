require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Conditional Rate Limiting ===
// Ensure rate limiting is ONLY applied when not in a test environment
if (process.env.NODE_ENV !== 'test') {
  console.log('Applying rate limit middleware...');
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' },
  });
  app.use(apiLimiter);
} else {
  console.log('Rate limiting is DISABLED for test environment.');
}
// End Conditional Rate Limiting

// Security middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));
app.use(helmet());
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service', timestamp: new Date().toISOString() });
});
app.use((req, res, next) => {
  console.log('🔍 Request Origin:', req.headers.origin);
  console.log('🔍 Request Method:', req.method, req.originalUrl);
  next();
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export the app instance ONLY
module.exports = app;
