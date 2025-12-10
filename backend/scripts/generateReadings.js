#!/usr/bin/env node

const BlackboxService = require('../services/blackboxService');
require('dotenv').config();

class ReadingGenerator {
  constructor() {
    this.apiBaseURL = process.env.API_BASE_URL || 'http://mysticstars-api:3000';
    this.blackboxService = new BlackboxService();
    this.zodiacSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    // Circuit breaker state
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 3;
    this.circuitBreakerCooldown = 30000; // 30 seconds
    this.lastFailureTime = 0;
  }

  async postReading(zodiacSign, readingType, content, generationMetadata) {
    try {
      const response = await fetch(`${this.apiBaseURL}/api/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zodiacSign,
          readingType,
          content,
          generationMetadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to post ${readingType} reading for ${zodiacSign}:`, error.message);
      throw error;
    }
  }

  async generateAndStoreReading(zodiacSign, readingType, maxRetries = 5) {
    // Circuit breaker check
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.circuitBreakerCooldown) {
        const remainingCooldown = Math.ceil((this.circuitBreakerCooldown - timeSinceLastFailure) / 1000);
        console.log(`⚡ Circuit breaker active. Waiting ${remainingCooldown}s before retrying...`);
        await this.delay(this.circuitBreakerCooldown - timeSinceLastFailure);
      }
      // Reset circuit breaker after cooldown
      this.consecutiveFailures = 0;
    }
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 Generating ${readingType} reading for ${zodiacSign}...`);
        
        const { content, metadata } = await this.blackboxService.generateReading(zodiacSign, readingType);
        
        console.log(`💾 Storing ${readingType} reading for ${zodiacSign}...`);
        const result = await this.postReading(zodiacSign, readingType, content, metadata);
        
        console.log(`✅ Successfully stored ${readingType} reading for ${zodiacSign}`);
        
        // Reset failure counter on success
        this.consecutiveFailures = 0;
        
        return result;
      } catch (error) {
        lastError = error;
        this.consecutiveFailures++;
        this.lastFailureTime = Date.now();
        
        console.error(`Error generating ${readingType} reading for ${zodiacSign}: ${error.message}`);
        
        if (attempt < maxRetries) {
          console.log(`Retrying... ${maxRetries - attempt} attempts remaining`);
          
          // If it's a Blackbox API error or incomplete content, try switching models
          if (error.message.includes('Invalid response format from Blackbox API') || 
              error.message.includes('Blackbox API Error') ||
              error.message.includes('fetch failed') ||
              error.message.includes('Generated content appears incomplete') ||
              error.message.includes('Generated content may be truncated')) {
            console.log('🔄 Attempting to find working model...');
            const modelResult = await this.blackboxService.tryDifferentFreeModels();
            if (modelResult.success) {
              console.log(`✅ Found working model: ${modelResult.workingModel}`);
              // Reset circuit breaker on successful model switch
              this.consecutiveFailures = 0;
            } else {
              console.log('⚠️ No working model found, continuing with current model');
            }
          }
          
          // Progressive backoff: wait longer between retries
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this.delay(backoffDelay);
        }
      }
    }
    
    console.error(`❌ Failed to generate/store ${readingType} reading for ${zodiacSign} after ${maxRetries} attempts:`, lastError.message);
    throw lastError;
  }

  async generateDailyReadings() {
    console.log('🌅 Starting daily readings generation...');
    const results = [];
    const errors = [];

    for (const sign of this.zodiacSigns) {
      try {
        const result = await this.generateAndStoreReading(sign, 'daily');
        results.push({ sign, type: 'daily', success: true, id: result.data.id });
        
        // Small delay between requests
        await this.delay(500);
      } catch (error) {
        console.error(`❌ Final failure for ${sign} daily reading: ${error.message}`);
        errors.push({ sign, type: 'daily', error: error.message });
      }
    }

    this.logResults('Daily', results, errors);
    return { results, errors };
  }

  async generateWeeklyReadings() {
    console.log('📅 Starting weekly readings generation...');
    const results = [];
    const errors = [];

    for (const sign of this.zodiacSigns) {
      try {
        const result = await this.generateAndStoreReading(sign, 'weekly');
        results.push({ sign, type: 'weekly', success: true, id: result.data.id });
        
        await this.delay(500);
      } catch (error) {
        console.error(`❌ Final failure for ${sign} weekly reading: ${error.message}`);
        errors.push({ sign, type: 'weekly', error: error.message });
      }
    }

    this.logResults('Weekly', results, errors);
    return { results, errors };
  }

  async generateMonthlyReadings() {
    console.log('📊 Starting monthly readings generation...');
    const results = [];
    const errors = [];

    for (const sign of this.zodiacSigns) {
      try {
        const result = await this.generateAndStoreReading(sign, 'monthly');
        results.push({ sign, type: 'monthly', success: true, id: result.data.id });
        
        await this.delay(500);
      } catch (error) {
        console.error(`❌ Final failure for ${sign} monthly reading: ${error.message}`);
        errors.push({ sign, type: 'monthly', error: error.message });
      }
    }

    this.logResults('Monthly', results, errors);
    return { results, errors };
  }

  async generateYearlyReadings() {
    console.log('🎊 Starting yearly readings generation...');
    const results = [];
    const errors = [];

    for (const sign of this.zodiacSigns) {
      try {
        const result = await this.generateAndStoreReading(sign, 'yearly');
        results.push({ sign, type: 'yearly', success: true, id: result.data.id });
        
        await this.delay(500);
      } catch (error) {
        console.error(`❌ Final failure for ${sign} yearly reading: ${error.message}`);
        errors.push({ sign, type: 'yearly', error: error.message });
      }
    }

    this.logResults('Yearly', results, errors);
    return { results, errors };
  }

  logResults(type, results, errors) {
    console.log(`\n📈 ${type} Readings Generation Summary:`);
    console.log(`  ✅ Successful: ${results.length}/${this.zodiacSigns.length}`);
    console.log(`  ❌ Failed: ${errors.length}/${this.zodiacSigns.length}`);
    
    if (errors.length > 0) {
      console.log('  Failed signs:');
      errors.forEach(error => {
        console.log(`    - ${error.sign}: ${error.error}`);
      });
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testAPIConnection() {
    try {
      const response = await fetch(`${this.apiBaseURL}/api/health`);
      if (!response.ok) {
        throw new Error(`API health check failed: ${response.status}`);
      }
      console.log('✅ API connection successful');
      return true;
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      return false;
    }
  }

  async testBlackboxConnection() {
    try {
      const result = await this.blackboxService.testConnection();
      if (result.success) {
        console.log('✅ Blackbox AI connection successful');
        return true;
      } else {
        console.error('❌ Blackbox AI connection failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Blackbox AI connection failed:', error.message);
      return false;
    }
  }
}

// CLI interface
async function main() {
  const generator = new ReadingGenerator();
  const command = process.argv[2];
  const argSign = process.argv[3];
  const argType = process.argv[4];

  console.log('🔮 MysticStars Reading Generator');
  console.log('=====================================\n');

  // Test connections first
  console.log('🔍 Testing connections...');
  const apiOk = await generator.testAPIConnection();
  const blackboxOk = await generator.testBlackboxConnection();

  if (!apiOk || !blackboxOk) {
    console.error('❌ Connection tests failed. Exiting.');
    process.exit(1);
  }

  console.log(''); // Empty line for readability

  try {
    switch (command) {
      case 'daily':
        await generator.generateDailyReadings();
        break;
      case 'weekly':
        await generator.generateWeeklyReadings();
        break;
      case 'monthly':
        await generator.generateMonthlyReadings();
        break;
      case 'yearly':
        await generator.generateYearlyReadings();
        break;
      case 'all':
        await generator.generateDailyReadings();
        await generator.generateWeeklyReadings();
        await generator.generateMonthlyReadings();
        await generator.generateYearlyReadings();
        break;
      case 'regen':
      case 'one':
        if (!argSign || !argType) {
          console.log('Usage: node generateReadings.js regen <sign> <daily|weekly|monthly|yearly>');
          process.exit(1);
        }
        if (!generator.zodiacSigns.includes(argSign.toLowerCase())) {
          console.log('Invalid sign. Must be one of:', generator.zodiacSigns.join(', '));
          process.exit(1);
        }
        if (!['daily','weekly','monthly','yearly'].includes(argType.toLowerCase())) {
          console.log('Invalid type. Must be: daily, weekly, monthly, or yearly');
          process.exit(1);
        }
        await generator.generateAndStoreReading(argSign.toLowerCase(), argType.toLowerCase());
        console.log(`\n✅ Regenerated ${argType} reading for ${argSign}`);
        break;
      default:
        console.log('Usage: node generateReadings.js [daily|weekly|monthly|yearly|all|regen <sign> <type>]');
        console.log('');
        console.log('Commands:');
        console.log('  daily   - Generate daily readings for all zodiac signs');
        console.log('  weekly  - Generate weekly readings for all zodiac signs');
        console.log('  monthly - Generate monthly readings for all zodiac signs');
        console.log('  yearly  - Generate yearly readings for all zodiac signs');
        console.log('  all     - Generate all types of readings');
        console.log('  regen <sign> <type> - Regenerate one reading for a sign');
        process.exit(1);
    }

    console.log('\n🎉 Reading generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Reading generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ReadingGenerator;
