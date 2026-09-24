const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB error:', err.message);
  });
}

module.exports = connectDB;
