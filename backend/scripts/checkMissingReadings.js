#!/usr/bin/env node

/*
  Checks the API for missing current readings per zodiac sign and type.
  If any are missing, sends a Telegram alert.

  Env vars:
  - API_BASE_URL: Base URL of the API (default: http://mysticstars-api:3000)
  - TELEGRAM_BOT_TOKEN: Telegram bot token
  - TELEGRAM_CHAT_ID: Telegram chat ID (user or group)
*/

const fetch = require('node-fetch');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://mysticstars-api:3000';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;

// Lazy-load the generator to allow running in alert-only mode
let ReadingGenerator = null;

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const TYPES = ['daily', 'weekly', 'monthly', 'yearly'];

async function ping(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, timeout: 15000 });
    return res;
  } catch (err) {
    throw new Error(`Request failed for ${url}: ${err.message}`);
  }
}

async function checkOne(sign, type) {
  const url = `${API_BASE_URL}/api/readings/${sign}/${type}`;
  try {
    const res = await ping(url);
    if (res.status === 404) return { ok: false, reason: 'not_found' };
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const body = await res.json();
    if (!body?.success || !body?.data?.isCurrentlyValid) {
      return { ok: false, reason: 'invalid_or_inactive' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `error_${err.message}` };
  }
}

async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials missing: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    return { ok: false, status: 'missing_creds' };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`Failed to send Telegram message: ${res.status} ${text}`);
    return { ok: false, status: res.status };
  }
  return { ok: true };
}

function formatAlert(missing, regenResults = []) {
  const now = new Date().toISOString();
  const header = `⚠️ Missing horoscope readings detected (${missing.length})\nTime: ${now}`;

  // Group by type for readability
  const byType = TYPES.map(t => ({ type: t, items: missing.filter(m => m.type === t) }))
    .filter(g => g.items.length > 0);

  const lines = byType.map(group => {
    const signs = group.items.map(i => i.sign).join(', ');
    return `- ${group.type}: ${signs}`;
  });

  let base = [header, ...lines].join('\n');

  if (regenResults.length > 0) {
    const ok = regenResults.filter(r => r.afterOk).length;
    const fail = regenResults.length - ok;
    base += `\n\nAuto-regeneration attempted immediately: ✅ ${ok}, ❌ ${fail}`;
    if (fail > 0) {
      const failLines = regenResults
        .filter(r => !r.afterOk)
        .map(r => `- ${r.type} ${r.sign}: ${r.error?.slice(0, 120) || r.afterReason || 'failed'}`);
      base += `\nFailures:\n${failLines.join('\n')}`;
    }
  }

  return base;
}

async function main() {
  console.log(`Checking readings at ${API_BASE_URL} ...`);

  // Quick health check (non-fatal)
  try {
    const health = await ping(`${API_BASE_URL}/api/health/live`);
    console.log(`Health: ${health.status}`);
  } catch (e) {
    console.warn(`Health check failed: ${e.message}`);
  }

  const canRegenerate = Boolean(OPENROUTER_API_KEY);
  let generator = null;
  if (canRegenerate) {
    try {
      ReadingGenerator = require('./generateReadings.js');
      generator = new ReadingGenerator();
    } catch (e) {
      console.warn('Could not load ReadingGenerator, skipping regeneration:', e.message);
    }
  }

  const missingFound = [];
  const regenResults = [];

  for (const sign of SIGNS) {
    for (const type of TYPES) {
      const before = await checkOne(sign, type);
      if (!before.ok) {
        missingFound.push({ sign, type, reason: before.reason });
        if (generator) {
          try {
            console.log(`Missing detected -> regenerating: ${sign} ${type} (${before.reason})`);
            await generator.generateAndStoreReading(sign, type);
            // small delay then recheck
            await new Promise(r => setTimeout(r, 400));
            const after = await checkOne(sign, type);
            regenResults.push({ sign, type, beforeReason: before.reason, afterOk: after.ok, afterReason: after.reason });
          } catch (e) {
            console.error(`Regeneration failed for ${sign} ${type}: ${e.message}`);
            regenResults.push({ sign, type, beforeReason: before.reason, afterOk: false, error: e.message });
          }
        }
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }

  if (missingFound.length === 0) {
    console.log('All readings present and active.');
    process.exit(0);
  }

  let finalMessage = formatAlert(missingFound, regenResults);
  if (!generator && canRegenerate) {
    finalMessage += `\n\nNote: Regeneration enabled but generator could not load.`;
  } else if (!canRegenerate) {
    finalMessage += `\n\nNote: Set OPENROUTER_API_KEY to enable auto-regeneration.`;
  }

  try {
    const result = await sendTelegram(finalMessage);
    if (!result.ok) console.error('Telegram alert failed.');
  } catch (err) {
    console.error(`Error sending Telegram alert: ${err.message}`);
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Monitor failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { checkOne, formatAlert };
