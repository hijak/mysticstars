#!/usr/bin/env node

const { Reading, initReading } = require('../models/Reading');
const { connectDB } = require('../config/database');

async function fixExistingReadings() {
  console.log('🔧 Fixing existing readings with incorrect validity periods...');
  
  try {
    // Connect to database
    const sequelize = await connectDB();
    await initReading(sequelize);
    
    // Find all active readings
    const readings = await Reading.findAll({
      where: {
        isActive: true
      },
      order: [['dateGenerated', 'DESC']]
    });
    
    console.log(`Found ${readings.length} active readings to check`);
    
    let fixed = 0;
    
    for (const reading of readings) {
      const expectedValidUntil = calculateExpectedValidUntil(reading.validFrom, reading.readingType);
      
      // Check if validity period is too short (likely 24 hours from old default)
      const currentDuration = reading.validUntil - reading.validFrom;
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      // If current duration is approximately 24 hours and expected is much longer
      if (Math.abs(currentDuration - oneDayMs) < 60000) { // Within 1 minute of 24 hours
        console.log(`Fixing ${reading.readingType} reading for ${reading.zodiacSign}:`);
        console.log(`  Old: ${reading.validFrom} -> ${reading.validUntil}`);
        console.log(`  New: ${reading.validFrom} -> ${expectedValidUntil}`);
        
        await reading.update({
          validUntil: expectedValidUntil
        });
        
        fixed++;
      }
    }
    
    console.log(`✅ Fixed ${fixed} readings with incorrect validity periods`);
    
    // Show current status
    console.log('\n📊 Current active readings:');
    const now = new Date();
    const activeReadings = await Reading.findAll({
      where: {
        isActive: true,
        validFrom: { [require('sequelize').Op.lte]: now },
        validUntil: { [require('sequelize').Op.gte]: now }
      }
    });
    
    const byType = {};
    activeReadings.forEach(r => {
      if (!byType[r.readingType]) byType[r.readingType] = 0;
      byType[r.readingType]++;
    });
    
    console.log('Active by type:', byType);
    
  } catch (error) {
    console.error('❌ Error fixing readings:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

function calculateExpectedValidUntil(validFrom, readingType) {
  const start = new Date(validFrom);
  const end = new Date(start);
  
  switch (readingType) {
    case 'daily':
      end.setDate(start.getDate() + 2);
      end.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      end.setDate(start.getDate() + 8);
      break;
    case 'monthly':
      end.setMonth(start.getMonth() + 1);
      end.setDate(end.getDate() + 3);
      break;
    case 'yearly':
      end.setFullYear(start.getFullYear() + 1);
      end.setDate(end.getDate() + 7);
      break;
    default:
      end.setDate(start.getDate() + 2);
      end.setHours(0, 0, 0, 0);
  }
  
  return end;
}

if (require.main === module) {
  fixExistingReadings();
}

module.exports = { fixExistingReadings };