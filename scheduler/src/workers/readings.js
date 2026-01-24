const { Worker } = require('bullmq');
const { spawn } = require('child_process');
const path = require('path');
const { connection, QUEUE_NAMES } = require('../queues');

// Path to backend scripts (mounted or copied in Docker)
const SCRIPTS_PATH = process.env.SCRIPTS_PATH || '/app/backend/scripts';
// Path to backend root (for node_modules resolution)
const BACKEND_PATH = process.env.BACKEND_PATH || '/app/backend';

/**
 * Execute a Node.js script and capture output
 */
function runScript(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_PATH, scriptName);
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    console.log(`[Worker] Starting script: ${scriptName} ${args.join(' ')}`);

    const proc = spawn('node', [scriptPath, ...args], {
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
      cwd: BACKEND_PATH, // Run from backend root so require() finds node_modules
    });

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      // Stream output to console
      process.stdout.write(`[${scriptName}] ${text}`);
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(`[${scriptName}] ${text}`);
    });

    proc.on('close', (code) => {
      const duration = Date.now() - startTime;
      console.log(`[Worker] Script ${scriptName} finished with code ${code} in ${duration}ms`);

      if (code === 0) {
        resolve({
          success: true,
          exitCode: code,
          stdout,
          stderr,
          duration,
        });
      } else {
        reject(new Error(`Script ${scriptName} exited with code ${code}\n${stderr || stdout}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start script ${scriptName}: ${err.message}`));
    });
  });
}

/**
 * Create a worker for a readings generation queue
 */
function createReadingsWorker(queueName, scriptArgs) {
  const worker = new Worker(
    queueName,
    async (job) => {
      console.log(`[${queueName}] Processing job ${job.id}`);
      
      try {
        const result = await runScript('generateReadings.js', scriptArgs);
        
        // Update job progress
        await job.updateProgress(100);
        
        return {
          success: true,
          ...result,
          completedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`[${queueName}] Job ${job.id} failed:`, error.message);
        throw error;
      }
    },
    {
      connection,
      concurrency: 1, // Only one job at a time per queue
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`[${queueName}] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[${queueName}] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

/**
 * Create the readings monitor worker
 */
function createMonitorWorker() {
  const worker = new Worker(
    QUEUE_NAMES.READINGS_MONITOR,
    async (job) => {
      console.log(`[readings-monitor] Processing job ${job.id}`);
      
      try {
        const result = await runScript('checkMissingReadings.js', []);
        
        await job.updateProgress(100);
        
        return {
          success: true,
          ...result,
          completedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`[readings-monitor] Job ${job.id} failed:`, error.message);
        throw error;
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`[readings-monitor] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[readings-monitor] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

/**
 * Start all workers
 */
function startWorkers() {
  console.log('[Workers] Starting all workers...');

  const workers = [
    createReadingsWorker(QUEUE_NAMES.DAILY_READINGS, ['daily']),
    createReadingsWorker(QUEUE_NAMES.WEEKLY_READINGS, ['weekly']),
    createReadingsWorker(QUEUE_NAMES.MONTHLY_READINGS, ['monthly']),
    createReadingsWorker(QUEUE_NAMES.YEARLY_READINGS, ['yearly']),
    createMonitorWorker(),
  ];

  console.log(`[Workers] Started ${workers.length} workers`);
  
  return workers;
}

module.exports = {
  startWorkers,
  runScript,
};
