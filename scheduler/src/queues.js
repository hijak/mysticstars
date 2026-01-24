const { Queue } = require('bullmq');

// Redis connection options
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// Default job options
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5 seconds initial delay
  },
  removeOnComplete: {
    count: 100, // Keep last 100 completed jobs
    age: 7 * 24 * 3600, // Keep for 7 days
  },
  removeOnFail: {
    count: 200, // Keep last 200 failed jobs
    age: 30 * 24 * 3600, // Keep for 30 days
  },
};

// Queue definitions matching K8s cronjobs
const QUEUE_NAMES = {
  DAILY_READINGS: 'daily-readings',
  WEEKLY_READINGS: 'weekly-readings',
  MONTHLY_READINGS: 'monthly-readings',
  YEARLY_READINGS: 'yearly-readings',
  READINGS_MONITOR: 'readings-monitor',
};

// Create queues
const dailyReadingsQueue = new Queue(QUEUE_NAMES.DAILY_READINGS, {
  connection,
  defaultJobOptions,
});

const weeklyReadingsQueue = new Queue(QUEUE_NAMES.WEEKLY_READINGS, {
  connection,
  defaultJobOptions,
});

const monthlyReadingsQueue = new Queue(QUEUE_NAMES.MONTHLY_READINGS, {
  connection,
  defaultJobOptions,
});

const yearlyReadingsQueue = new Queue(QUEUE_NAMES.YEARLY_READINGS, {
  connection,
  defaultJobOptions,
});

const readingsMonitorQueue = new Queue(QUEUE_NAMES.READINGS_MONITOR, {
  connection,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 2, // Fewer retries for monitoring
  },
});

// Export all queues
const queues = {
  [QUEUE_NAMES.DAILY_READINGS]: dailyReadingsQueue,
  [QUEUE_NAMES.WEEKLY_READINGS]: weeklyReadingsQueue,
  [QUEUE_NAMES.MONTHLY_READINGS]: monthlyReadingsQueue,
  [QUEUE_NAMES.YEARLY_READINGS]: yearlyReadingsQueue,
  [QUEUE_NAMES.READINGS_MONITOR]: readingsMonitorQueue,
};

module.exports = {
  queues,
  connection,
  QUEUE_NAMES,
  dailyReadingsQueue,
  weeklyReadingsQueue,
  monthlyReadingsQueue,
  yearlyReadingsQueue,
  readingsMonitorQueue,
};
