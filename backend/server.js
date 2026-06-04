const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (process.env.MONGO_URI && process.env.MONGO_URI !== 'your_mongodb_connection_string') {
      await connectDB();
    } else {
      console.warn('⚠ MongoDB URI not configured. Set MONGO_URI in .env');
      console.warn('  The server will start, but database operations will fail.');
      console.warn('  To set up MongoDB Atlas:');
      console.warn('    1. Go to https://cloud.mongodb.com');
      console.warn('    2. Create a free M0 cluster');
      console.warn('    3. Get your connection string');
      console.warn('    4. Add it to backend/.env as MONGO_URI');
    }

    const server = app.listen(PORT, () => {
      console.log(`\n  LeadFlow CRM API`);
      console.log(`  ──────────────────────────────`);
      console.log(`  Server:    http://localhost:${PORT}`);
      console.log(`  Health:    http://localhost:${PORT}/api/v1/health`);
      console.log(`  API Base:  http://localhost:${PORT}/api/v1`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  ──────────────────────────────\n`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
