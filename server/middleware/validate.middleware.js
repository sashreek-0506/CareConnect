const ApiError = require('../utils/ApiError');

// Usage: validate(someZodSchema) as route middleware.
// Runs schema.parse(req.body) and attaches the parsed (typed/cleaned) result
// back onto req.body, or throws a formatted 400.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return next(new ApiError(400, 'Validation failed.', errors));
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
