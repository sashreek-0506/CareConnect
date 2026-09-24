const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { clientUrl, nodeEnv } = require('./config/env');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler.middleware');
const notFound = require('./middleware/notFound.middleware');

const app = express();

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Rate-limit auth routes specifically to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.', errors: [] },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
