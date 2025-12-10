const fetch = require('node-fetch');

/**
 * Blackbox AI Model Discovery Service
 * Dynamically retrieves available models from the Blackbox AI API
 */

class ModelDiscoveryService {
  constructor() {
    this.apiBaseUrl = 'https://api.blackbox.ai/v1';
    this.apiKey = process.env.BLACKBOX_API_KEY;
  }

  /**
   * Get the list of all available models from Blackbox AI
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    if (!this.apiKey) {
      throw new Error('BLACKBOX_API_KEY environment variable is required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching available models:', error);
      throw error;
    }
  }

  /**
   * Filter free models from the available models list
   * @param {Array} models - List of all available models
   * @returns {Array} List of free models
   */
  filterFreeModels(models) {
    return models.filter(model => {
      // Check for free models based on naming patterns
      return model.id.includes(':free') ||
             model.id.includes('free') ||
             model.id.includes('blackboxai') &&
             (model.id.includes('deepseek') ||
              model.id.includes('qwen') ||
              model.id.includes('mistral') ||
              model.id.includes('meta-llama') ||
              model.id.includes('google') ||
              model.id.includes('nvidia') ||
              model.id.includes('rekaai') ||
              model.id.includes('nousresearch'));
    });
  }

  /**
   * Get horoscope-optimized models (good for creative content)
   * @param {Array} models - List of available models
   * @returns {Array} List of horoscope-optimized models
   */
  getHoroscopeOptimizedModels(models) {
    const preferredPatterns = [
      'deepseek-chat-v3',
      'qwen3-32b',
      'qwen2.5-72b',
      'mistral-small-3.2-24b',
      'llama-4-scout',
      'shisa-v2-llama3.3-70b',
      'llama-3.3-nemotron-super-49b',
      'gemma-3-27b-it',
      'mistral-nemo',
      'deephermes-3-llama-3-8b',
      'reka-flash-3',
      'deepseek-r1'
    ];

    return models.filter(model => {
      return preferredPatterns.some(pattern => model.id.includes(pattern)) &&
             (model.id.includes(':free') || model.id.includes('blackboxai'));
    });
  }

  /**
   * Get current working models by testing them
   * @param {Array} models - List of models to test
   * @returns {Promise<Array>} List of working models
   */
  async testModelAvailability(models) {
    const workingModels = [];
    const testMessage = {
      role: 'user',
      content: 'Hello, can you respond with just "working"?'
    };

    for (const model of models.slice(0, 5)) { // Limit to first 5 to avoid rate limiting
      try {
        console.log(`Testing model: ${model.id}`);

        const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model.id,
            messages: [testMessage],
            max_tokens: 10,
            temperature: 0.1
          })
        });

        if (response.ok) {
          workingModels.push(model.id);
          console.log(`✅ Working model: ${model.id}`);
        } else {
          console.log(`❌ Failed model: ${model.id} (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${model.id}: ${error.message}`);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return workingModels;
  }

  /**
   * Get the best model for horoscope generation
   * @returns {Promise<string>} Best available model ID
   */
  async getBestHoroscopeModel() {
    try {
      // Get all available models
      const allModels = await this.getAvailableModels();
      console.log(`Found ${allModels.length} total models`);

      // Filter for horoscope-optimized models
      const horoscopeModels = this.getHoroscopeOptimizedModels(allModels);
      console.log(`Found ${horoscopeModels.length} horoscope-optimized models`);

      if (horoscopeModels.length === 0) {
        // Fallback to any free models
        const freeModels = this.filterFreeModels(allModels);
        console.log(`Found ${freeModels.length} free models as fallback`);
        return freeModels[0]?.id || null;
      }

      // Test availability of top horoscope models
      const workingModels = await this.testModelAvailability(
        horoscopeModels.map(model => ({ id: model.id || model }))
      );

      if (workingModels.length > 0) {
        console.log(`✅ Best working model: ${workingModels[0]}`);
        return workingModels[0];
      }

      // If no models are working, return the first one and let the fallback logic handle it
      console.log(`⚠️  No models tested successfully, using first available model`);
      return horoscopeModels[0]?.id || horoscopeModels[0];
    } catch (error) {
      console.error('Error getting best horoscope model:', error);
      throw error;
    }
  }
}

module.exports = ModelDiscoveryService;