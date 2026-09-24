const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}.`;
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists.` : 'Duplicate resource.';
  }

  if (process.env.NODE_ENV !== 'production' && !(err instanceof ApiError) && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = errorHandler;
