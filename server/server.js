const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`[server] CareConnect API listening on http://localhost:${port}`);
  });
}

start();
