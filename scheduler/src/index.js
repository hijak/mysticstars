#!/usr/bin/env node

require('dotenv').config();

const { startScheduler } = require('./scheduler');
const { startWorkers } = require('./workers/readings');
const { startDashboard } = require('./dashboard');

console.log('========================================');
console.log('  MysticStars Scheduler Service');
console.log('========================================');
console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`  Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
console.log(`  API URL: ${process.env.API_BASE_URL || 'http://localhost:3000'}`);
console.log('========================================\n');

async function main() {
  try {
    // Start workers first (they process jobs)
    const workers = startWorkers();
    console.log('');

    // Start the cron scheduler (enqueues jobs on schedule)
    const cronTasks = startScheduler();
    console.log('');

    // Start the dashboard (Bull Board UI)
    await startDashboard();
    console.log('');

    console.log('========================================');
    console.log('  Scheduler service is running!');
    console.log('========================================\n');

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Shutdown] Received ${signal}, shutting down gracefully...`);

      // Stop cron tasks
      cronTasks.forEach((task) => task.stop());
      console.log('[Shutdown] Cron tasks stopped');

      // Close workers
      await Promise.all(workers.map((w) => w.close()));
      console.log('[Shutdown] Workers closed');

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start scheduler service:', error);
    process.exit(1);
  }
}

main();
