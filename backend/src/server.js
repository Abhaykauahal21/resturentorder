const http = require('http');

const { loadEnv } = require('./config/env');
const { connectMongo } = require('./config/db');
const { createSocketServer } = require('./config/socket');
const { createApp } = require('./app');
const { ensureSeedData } = require('./utils/seed');

async function start() {
  loadEnv();

  await connectMongo();
  console.log('Successfully connected to MongoDB');
  await ensureSeedData();

  const app = createApp();
  const server = http.createServer(app);
  const io = createSocketServer(server);
  app.set('socketio', io);

  const port = Number(process.env.PORT || 5000);
  server.listen(port, () => console.log(`Backend server active on port ${port}`));
}

start().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
