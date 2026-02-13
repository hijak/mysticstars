const fetch = require('node-fetch');

/**
 * Blackbox AI Model Discovery Service
 * Dynamically retrieves available models from the Blackbox AI API
 */

class ModelDiscoveryService {
  constructor() {
    this.apiBaseUrl = 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTER_API_KEY;
  }

  /**
   * Get the list of all available models from OpenRouter
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'https://mysticstars.com',
          'X-Title': 'MysticStars Horoscope'
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
      // OpenRouter marks free models with pricing information
      // Check if prompt pricing is 0 or very low (free tier)
      const pricing = model.pricing;
      if (pricing && pricing.prompt && parseFloat(pricing.prompt) === 0) {
        return true;
      }
      // Also check for common free model patterns in the name/id
      return model.id.includes('free') ||
             model.id.includes('openrouter/free');
    });
  }

  /**
   * Get horoscope-optimized models (good for creative content)
   * @param {Array} models - List of available models
   * @returns {Array} List of horoscope-optimized models
   */
  getHoroscopeOptimizedModels(models) {
    // For OpenRouter, we'll just use the openrouter/free endpoint
    // which automatically routes to available free models
    return models.filter(model => model.id === 'openrouter/free');
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
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.SITE_URL || 'https://mysticstars.com',
            'X-Title': 'MysticStars Horoscope'
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
    // For OpenRouter, we simply use the openrouter/free endpoint
    // which automatically routes to the best available free model
    return 'openrouter/free';
  }
}

module.exports = ModelDiscoveryService;