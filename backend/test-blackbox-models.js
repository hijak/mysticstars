#!/usr/bin/env node

// Test script to find working OpenRouter free models
const BlackboxService = require('./services/blackboxService');
require('dotenv').config();

async function testOpenRouterModels() {
  console.log('🧪 Testing OpenRouter Free Models...\n');

  try {
    const service = new BlackboxService();

    console.log('🔍 Testing different free model names...\n');

    // Test the model auto-discovery feature
    const result = await service.tryDifferentFreeModels();

    if (result.success) {
      console.log('\n🎉 Found working free model!');
      console.log(`✅ Model: ${result.workingModel}`);
      console.log(`📝 Response: ${result.message}`);

      console.log('\n💡 To use this model permanently, set:');
      console.log(`export OPENROUTER_MODEL="${result.workingModel}"`);

    } else {
      console.log('\n❌ No working free models found');
      console.log('💡 Possible solutions:');
      console.log('1. Check your OpenRouter account has free tier access');
      console.log('2. Verify your API key is correct');
      console.log('3. Check if you need to add credits to your OpenRouter account');
      console.log('4. Contact OpenRouter support about free model access');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.message.includes('OPENROUTER_API_KEY')) {
      console.log('\n💡 Make sure to set your OPENROUTER_API_KEY environment variable:');
      console.log('   export OPENROUTER_API_KEY="your-api-key-here"');
    }
  }
}

// Also test manual model specifications
async function testManualModels() {
  console.log('\n🔬 Testing manual model specifications...\n');

  const manualModels = [
    'openrouter/free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-small-3.2-24b-instruct:free'
  ];

  for (const model of manualModels) {
    try {
      console.log(`Testing: ${model}`);
      process.env.OPENROUTER_MODEL = model;

      const service = new BlackboxService();
      const result = await service.testConnection();

      if (result.success) {
        console.log(`✅ ${model} works!`);
        console.log(`   Response: ${result.message}`);
      } else {
        console.log(`❌ ${model} failed: ${result.error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${model} error: ${error.message.substring(0, 100)}...`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the tests
async function runAllTests() {
  await testOpenRouterModels();
  await testManualModels();
}

runAllTests().catch(console.error);