#!/usr/bin/env node

/**
 * Test script for model discovery functionality
 * Usage: node test-model-discovery.js
 */

const ModelDiscoveryService = require('./services/modelDiscoveryService');

async function testModelDiscovery() {
  console.log('🔍 Testing Blackbox AI Model Discovery Service...\n');

  const discoveryService = new ModelDiscoveryService();

  try {
    // Test 1: Get all available models
    console.log('1️⃣  Testing: Get available models...');
    const allModels = await discoveryService.getAvailableModels();
    console.log(`✅ Found ${allModels.length} total models`);

    if (allModels.length > 0) {
      console.log('   First 5 models:');
      allModels.slice(0, 5).forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.id || model} (${model.object || 'unknown'})`);
      });
    }
    console.log('');

    // Test 2: Filter free models
    console.log('2️⃣  Testing: Filter free models...');
    const freeModels = discoveryService.filterFreeModels(allModels);
    console.log(`✅ Found ${freeModels.length} free models`);

    if (freeModels.length > 0) {
      console.log('   First 5 free models:');
      freeModels.slice(0, 5).forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.id || model}`);
      });
    }
    console.log('');

    // Test 3: Get horoscope-optimized models
    console.log('3️⃣  Testing: Get horoscope-optimized models...');
    const horoscopeModels = discoveryService.getHoroscopeOptimizedModels(allModels);
    console.log(`✅ Found ${horoscopeModels.length} horoscope-optimized models`);

    if (horoscopeModels.length > 0) {
      console.log('   First 5 horoscope models:');
      horoscopeModels.slice(0, 5).forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.id || model}`);
      });
    }
    console.log('');

    // Test 4: Get best horoscope model (this will test actual API calls)
    console.log('4️⃣  Testing: Get best working horoscope model...');
    const bestModel = await discoveryService.getBestHoroscopeModel();
    if (bestModel) {
      console.log(`✅ Best working model: ${bestModel}`);
    } else {
      console.log('❌ No working model found');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error testing model discovery:', error.message);

    if (error.message.includes('BLACKBOX_API_KEY')) {
      console.log('\n💡 Make sure to set the BLACKBOX_API_KEY environment variable');
      console.log('   Example: export BLACKBOX_API_KEY=your-api-key-here');
    } else if (error.message.includes('Authentication')) {
      console.log('\n💡 Check that your API key is valid and has proper permissions');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Authentication error - verify your API key is correct');
    }
  }
}

// Run the test
testModelDiscovery();