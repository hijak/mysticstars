const cron = require('node-cron');
const {
  dailyReadingsQueue,
  weeklyReadingsQueue,
  monthlyReadingsQueue,
  yearlyReadingsQueue,
  readingsMonitorQueue,
  QUEUE_NAMES,
} = require('./queues');

// Job schedules matching K8s cronjobs
const SCHEDULES = {
  // Daily readings: Every day at 1:00 AM UTC
  [QUEUE_NAMES.DAILY_READINGS]: '0 1 * * *',
  
  // Weekly readings: Every Sunday at 2:00 AM UTC
  [QUEUE_NAMES.WEEKLY_READINGS]: '0 2 * * 0',
  
  // Monthly readings: First day of every month at 3:00 AM UTC
  [QUEUE_NAMES.MONTHLY_READINGS]: '0 3 1 * *',
  
  // Yearly readings: January 1st at 4:00 AM UTC
  [QUEUE_NAMES.YEARLY_READINGS]: '0 4 1 1 *',
  
  // Readings monitor: Every 30 minutes
  [QUEUE_NAMES.READINGS_MONITOR]: '*/30 * * * *',
};

/**
 * Add a job to a queue
 */
async function enqueueJob(queue, queueName) {
  const jobId = `${queueName}-${Date.now()}`;
  
  console.log(`[Scheduler] Enqueueing job ${jobId} to ${queueName}`);
  
  await queue.add(
    'generate',
    {
      triggeredAt: new Date().toISOString(),
      triggeredBy: 'scheduler',
    },
    {
      jobId,
    }
  );
  
  console.log(`[Scheduler] Job ${jobId} enqueued successfully`);
}

/**
 * Manually trigger a job (for UI or API)
 */
async function triggerJob(queueName) {
  const queueMap = {
    [QUEUE_NAMES.DAILY_READINGS]: dailyReadingsQueue,
    [QUEUE_NAMES.WEEKLY_READINGS]: weeklyReadingsQueue,
    [QUEUE_NAMES.MONTHLY_READINGS]: monthlyReadingsQueue,
    [QUEUE_NAMES.YEARLY_READINGS]: yearlyReadingsQueue,
    [QUEUE_NAMES.READINGS_MONITOR]: readingsMonitorQueue,
  };
  
  const queue = queueMap[queueName];
  if (!queue) {
    throw new Error(`Unknown queue: ${queueName}`);
  }
  
  const jobId = `${queueName}-manual-${Date.now()}`;
  
  await queue.add(
    'generate',
    {
      triggeredAt: new Date().toISOString(),
      triggeredBy: 'manual',
    },
    {
      jobId,
    }
  );
  
  return jobId;
}

/**
 * Start all cron schedules
 */
function startScheduler() {
  console.log('[Scheduler] Starting cron schedules...');
  console.log('[Scheduler] Timezone: UTC');
  
  const tasks = [];

  // Daily readings
  tasks.push(
    cron.schedule(
      SCHEDULES[QUEUE_NAMES.DAILY_READINGS],
      () => enqueueJob(dailyReadingsQueue, QUEUE_NAMES.DAILY_READINGS),
      { timezone: 'UTC' }
    )
  );
  console.log(`[Scheduler] Daily readings: ${SCHEDULES[QUEUE_NAMES.DAILY_READINGS]}`);

  // Weekly readings
  tasks.push(
    cron.schedule(
      SCHEDULES[QUEUE_NAMES.WEEKLY_READINGS],
      () => enqueueJob(weeklyReadingsQueue, QUEUE_NAMES.WEEKLY_READINGS),
      { timezone: 'UTC' }
    )
  );
  console.log(`[Scheduler] Weekly readings: ${SCHEDULES[QUEUE_NAMES.WEEKLY_READINGS]}`);

  // Monthly readings
  tasks.push(
    cron.schedule(
      SCHEDULES[QUEUE_NAMES.MONTHLY_READINGS],
      () => enqueueJob(monthlyReadingsQueue, QUEUE_NAMES.MONTHLY_READINGS),
      { timezone: 'UTC' }
    )
  );
  console.log(`[Scheduler] Monthly readings: ${SCHEDULES[QUEUE_NAMES.MONTHLY_READINGS]}`);

  // Yearly readings
  tasks.push(
    cron.schedule(
      SCHEDULES[QUEUE_NAMES.YEARLY_READINGS],
      () => enqueueJob(yearlyReadingsQueue, QUEUE_NAMES.YEARLY_READINGS),
      { timezone: 'UTC' }
    )
  );
  console.log(`[Scheduler] Yearly readings: ${SCHEDULES[QUEUE_NAMES.YEARLY_READINGS]}`);

  // Readings monitor
  tasks.push(
    cron.schedule(
      SCHEDULES[QUEUE_NAMES.READINGS_MONITOR],
      () => enqueueJob(readingsMonitorQueue, QUEUE_NAMES.READINGS_MONITOR),
      { timezone: 'UTC' }
    )
  );
  console.log(`[Scheduler] Readings monitor: ${SCHEDULES[QUEUE_NAMES.READINGS_MONITOR]}`);

  console.log(`[Scheduler] Started ${tasks.length} cron schedules`);
  
  return tasks;
}

/**
 * Get schedule info for display
 */
function getScheduleInfo() {
  return Object.entries(SCHEDULES).map(([queueName, schedule]) => ({
    queueName,
    schedule,
    description: getScheduleDescription(queueName),
  }));
}

function getScheduleDescription(queueName) {
  const descriptions = {
    [QUEUE_NAMES.DAILY_READINGS]: 'Every day at 1:00 AM UTC',
    [QUEUE_NAMES.WEEKLY_READINGS]: 'Every Sunday at 2:00 AM UTC',
    [QUEUE_NAMES.MONTHLY_READINGS]: 'First day of every month at 3:00 AM UTC',
    [QUEUE_NAMES.YEARLY_READINGS]: 'January 1st at 4:00 AM UTC',
    [QUEUE_NAMES.READINGS_MONITOR]: 'Every 30 minutes',
  };
  return descriptions[queueName] || 'Unknown';
}

module.exports = {
  startScheduler,
  triggerJob,
  getScheduleInfo,
  SCHEDULES,
};
