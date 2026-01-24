const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const {
  dailyReadingsQueue,
  weeklyReadingsQueue,
  monthlyReadingsQueue,
  yearlyReadingsQueue,
  readingsMonitorQueue,
  QUEUE_NAMES,
} = require('./queues');
const { triggerJob, getScheduleInfo } = require('./scheduler');

const PORT = process.env.PORT || 3002;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * Basic auth middleware
 */
function basicAuth(req, res, next) {
  // Skip auth if no credentials configured
  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Scheduler Admin"');
    return res.status(401).send('Authentication required');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [user, password] = credentials.split(':');

  if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Scheduler Admin"');
  return res.status(401).send('Invalid credentials');
}

/**
 * Create and configure Express app with Bull Board
 */
function createDashboard() {
  const app = express();

  // Bull Board setup
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin');

  createBullBoard({
    queues: [
      new BullMQAdapter(dailyReadingsQueue),
      new BullMQAdapter(weeklyReadingsQueue),
      new BullMQAdapter(monthlyReadingsQueue),
      new BullMQAdapter(yearlyReadingsQueue),
      new BullMQAdapter(readingsMonitorQueue),
    ],
    serverAdapter,
  });

  // Health check endpoint (no auth)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Apply auth to admin routes
  app.use('/admin', basicAuth, serverAdapter.getRouter());

  // API endpoints for manual triggers
  app.use(express.json());

  // Get schedule info
  app.get('/api/schedules', basicAuth, (req, res) => {
    res.json({
      success: true,
      schedules: getScheduleInfo(),
    });
  });

  // Trigger a job manually
  app.post('/api/trigger/:queueName', basicAuth, async (req, res) => {
    const { queueName } = req.params;

    try {
      const jobId = await triggerJob(queueName);
      res.json({
        success: true,
        message: `Job triggered successfully`,
        jobId,
        queueName,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Simple home page with links
  app.get('/', (req, res) => {
    const schedules = getScheduleInfo();
    const schedulesHtml = schedules
      .map(
        (s) => `
      <tr>
        <td><code>${s.queueName}</code></td>
        <td><code>${s.schedule}</code></td>
        <td>${s.description}</td>
        <td>
          <button onclick="triggerJob('${s.queueName}')" class="btn">
            Run Now
          </button>
        </td>
      </tr>`
      )
      .join('');

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MysticStars Scheduler</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #0f0f23;
            color: #ccc;
          }
          .container { max-width: 1000px; margin: 0 auto; }
          h1 { color: #ffff66; margin-bottom: 10px; }
          h2 { color: #00cc00; margin-top: 30px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          a { color: #00cc00; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #333;
          }
          th { color: #ffff66; }
          code {
            background: #1a1a2e;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 14px;
          }
          .btn {
            background: #00cc00;
            color: #0f0f23;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }
          .btn:hover { background: #00ff00; }
          .btn:disabled { background: #333; color: #666; cursor: not-allowed; }
          .links {
            margin-top: 30px;
            padding: 20px;
            background: #1a1a2e;
            border-radius: 8px;
          }
          .links a {
            display: inline-block;
            margin-right: 20px;
            padding: 10px 20px;
            background: #333;
            border-radius: 4px;
            text-decoration: none;
          }
          .links a:hover { background: #444; }
          .status { margin-top: 20px; padding: 10px; display: none; border-radius: 4px; }
          .status.success { background: #1a3a1a; color: #00ff00; display: block; }
          .status.error { background: #3a1a1a; color: #ff6666; display: block; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>MysticStars Scheduler</h1>
          <p class="subtitle">Job scheduling service with Bull Board monitoring</p>
          
          <div class="links">
            <a href="/admin">Bull Board Dashboard</a>
            <a href="/health">Health Check</a>
          </div>

          <h2>Scheduled Jobs</h2>
          <table>
            <thead>
              <tr>
                <th>Queue</th>
                <th>Schedule (Cron)</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${schedulesHtml}
            </tbody>
          </table>

          <div id="status" class="status"></div>
        </div>

        <script>
          async function triggerJob(queueName) {
            const statusEl = document.getElementById('status');
            statusEl.className = 'status';
            statusEl.style.display = 'none';
            
            try {
              const res = await fetch('/api/trigger/' + queueName, { method: 'POST' });
              const data = await res.json();
              
              if (data.success) {
                statusEl.className = 'status success';
                statusEl.textContent = 'Job triggered: ' + data.jobId;
              } else {
                statusEl.className = 'status error';
                statusEl.textContent = 'Error: ' + data.error;
              }
            } catch (err) {
              statusEl.className = 'status error';
              statusEl.textContent = 'Error: ' + err.message;
            }
          }
        </script>
      </body>
      </html>
    `);
  });

  return app;
}

/**
 * Start the dashboard server
 */
function startDashboard() {
  const app = createDashboard();

  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`[Dashboard] Bull Board UI running at http://localhost:${PORT}/admin`);
      console.log(`[Dashboard] Home page at http://localhost:${PORT}/`);
      if (ADMIN_USER) {
        console.log(`[Dashboard] Basic auth enabled for user: ${ADMIN_USER}`);
      } else {
        console.log(`[Dashboard] Warning: No authentication configured (set ADMIN_USER and ADMIN_PASSWORD)`);
      }
      resolve(server);
    });
  });
}

module.exports = {
  createDashboard,
  startDashboard,
};
