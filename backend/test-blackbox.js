#!/usr/bin/env node

// Quick test script for Blackbox API integration
const BlackboxService = require('./services/blackboxService');
require('dotenv').config();

async function testBlackboxAPI() {
  console.log('🧪 Testing Blackbox AI API Integration...\n');
  
  try {
    const service = new BlackboxService();
    console.log(`📡 Using model: ${service.modelName}`);
    console.log(`🔗 API URL: ${service.apiBaseUrl}\n`);
    
    // Test connection
    console.log('1️⃣ Testing API connection...');
    const connectionTest = await service.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Connection successful!');
      console.log(`📝 Response: ${connectionTest.message}\n`);
    } else {
      console.log('❌ Connection failed:');
      console.log(`❗ Error: ${connectionTest.error}\n`);
      return;
    }
    
    // Test reading generation
    console.log('2️⃣ Testing reading generation...');
    const startTime = Date.now();
    
    const reading = await service.generateReading('aries', 'daily');
    const duration = Date.now() - startTime;
    
    console.log('✅ Reading generated successfully!');
    console.log(`⏱️  Generation time: ${duration}ms`);
    console.log(`📊 Model: ${reading.metadata.model}`);
    console.log(`🎯 Temperature: ${reading.metadata.temperature}`);
    console.log(`📄 Max tokens: ${reading.metadata.maxTokens}`);
    
    if (reading.metadata.usage) {
      console.log(`💰 Token usage:`, reading.metadata.usage);
    }
    
    console.log('\n📖 Generated Reading:');
    console.log('─'.repeat(50));
    console.log(reading.content);
    console.log('─'.repeat(50));
    
    console.log('\n🎉 All tests passed! Blackbox AI integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error.message);
    
    if (error.message.includes('BLACKBOX_API_KEY')) {
      console.log('\n💡 Make sure to set your BLACKBOX_API_KEY environment variable:');
      console.log('   export BLACKBOX_API_KEY="your-api-key-here"');
    }
  }
}

// Run the test
testBlackboxAPI().catch(console.error);