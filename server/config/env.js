require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Don't crash local dev over missing optional keys; only warn.
    console.warn(`[config] Missing env var ${name}`);
  }
  return value;
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/careconnect'),
  jwtSecret: required('JWT_SECRET', 'dev_only_insecure_secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev_only_insecure_refresh_secret'),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  // Local LLM (Ollama) config -- no API key needed. If Ollama isn't running
  // or the model isn't pulled, the AI service falls back to a heuristic
  // classifier automatically (see services/ai/localLlmClient.js).
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.1',
};
