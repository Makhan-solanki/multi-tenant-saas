require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('./model/User');
require('./model/Ticket');


const ticketRoutes = require('./routes/tickets')
const screensRoutes = require('./routes/screens');
const webhookRoutes = require('./routes/webhook');
const auditRoutes = require('./routes/audit');
const userRoutes = require('./routes/users')


const app = express();

// ✅ Disable rate limiting unless in production
if (process.env.NODE_ENV === 'production') {
  console.log('Applying rate limit middleware for production...');
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again later.' },
  });
  app.use(apiLimiter);
} else {
  console.log('⚠️ Rate limiting is DISABLED in development mode.');
}

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:4173',
      'http://localhost:4174',
      'http://localhost:3003',
      'http://localhost:3001'
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Optional: log CORS origins
app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log("🔍 Tenant filter:", req.tenantFilter);
  next();
});

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/users', userRoutes)
app.use('/api/tickets', ticketRoutes);
app.use('/api/screens', screensRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/audit-logs', require('./routes/audit'));
app.use('/api/webhooks', require('./routes/webhook'));


// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-service', timestamp: new Date().toISOString() });
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error('API Service Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the API Service!' });
});

// ✅ Fallback for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API Service Endpoint not found' });
});

module.exports = app;
