// backend/src/index.js
const express = require('express');
const cors = require('cors');
const { initDB, closeDB } = require('./db');
const { attachRoutes } = require('./routes');
const seed = require('./seed'); // ✅ this is a function

const PORT = process.env.PORT || 8000;

async function start() {
  const app = express();

  // Middleware
  app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
  app.use(express.json());

  try {
    // Initialize DB (with retries)
    const pool = await initDB();

    // ✅ Seed data
    await seed();

    // Attach routes
    attachRoutes(app, pool);

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Backend listening on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        await closeDB();
        console.log('Server and DB connections closed. Goodbye!');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
