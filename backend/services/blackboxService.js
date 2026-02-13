const fetch = require('node-fetch');
const ModelDiscoveryService = require('./modelDiscoveryService');

class BlackboxService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY not found. Using MOCK mode.');
      this.isMock = true;
    }

    this.modelDiscovery = new ModelDiscoveryService();
    this.apiBaseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    // Initialize with environment variable model or fallback to default
    // Note: initializeModel is async, so we start it but don't wait here
    this.modelName = process.env.OPENROUTER_MODEL || 'openrouter/free';
    if (!this.isMock) {
      this.initializeModel().catch(err => {
        console.log('[DEBUG] Async model initialization failed:', err.message);
      });
    }

    this.zodiacTraits = {
      aries: "fiery, courageous, pioneering, energetic, and natural leaders",
      taurus: "grounded, reliable, patient, sensual, and lovers of beauty",
      gemini: "curious, communicative, adaptable, intellectual, and social",
      cancer: "nurturing, intuitive, emotional, protective, and home-loving",
      leo: "confident, creative, generous, dramatic, and natural performers",
      virgo: "analytical, practical, perfectionist, helpful, and detail-oriented",
      libra: "balanced, diplomatic, harmonious, social, and beauty-seeking",
      scorpio: "intense, mysterious, transformative, passionate, and intuitive",
      sagittarius: "adventurous, optimistic, philosophical, freedom-loving, and exploratory",
      capricorn: "ambitious, disciplined, practical, responsible, and goal-oriented",
      aquarius: "innovative, humanitarian, independent, progressive, and visionary",
      pisces: "compassionate, artistic, intuitive, dreamy, and spiritually connected"
    };
  }

  /**
   * Initialize the model - try dynamic discovery first, then fallback to hardcoded list
   */
  async initializeModel() {
    try {
      // First, try to use environment variable if set
      if (process.env.OPENROUTER_MODEL) {
        this.modelName = process.env.OPENROUTER_MODEL;
        console.log(`[DEBUG] Using environment variable model: ${this.modelName}`);
        return;
      }

      // Use the default OpenRouter free model
      this.modelName = 'openrouter/free';
      console.log(`[DEBUG] Using OpenRouter free model: ${this.modelName}`);
    } catch (error) {
      console.log('[DEBUG] Model initialization failed, using fallback:', error.message);
      this.modelName = 'openrouter/free';
    }

    console.log('[DEBUG] BlackboxService initialized:', {
      model: this.modelName,
      apiUrl: this.apiBaseUrl
    });
  }

  /**
   * Refresh the model (OpenRouter handles model routing automatically)
   */
  async refreshModel() {
    console.log('[DEBUG] OpenRouter handles model routing automatically');
    return this.modelName;
  }

  /**
   * Get current available models (for debugging/monitoring)
   * Note: OpenRouter doesn't have a public models endpoint
   */
  async getAvailableModels() {
    console.log('[DEBUG] OpenRouter handles model routing automatically');
    return [{ id: 'openrouter/free', name: 'OpenRouter Free (auto-routes to available free models)' }];
  }

  getDefaultFreeModel() {
    return 'openrouter/free';
  }

  // Method to retry with the OpenRouter free model (OpenRouter handles model routing automatically)
  async tryDifferentFreeModels() {
    console.log('[DEBUG] Retrying with OpenRouter free model...');

    // Try the openrouter/free model up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[DEBUG] Attempt ${attempt}/3...`);
        const result = await this.testConnection();
        if (result.success) {
          console.log(`✅ Success with OpenRouter free model (attempt ${attempt})`);
          return { success: true, workingModel: 'openrouter/free', message: result.message };
        } else {
          console.log(`  Attempt ${attempt} failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`  Attempt ${attempt} error: ${error.message}`);
      }

      // Wait before retrying (unless it's the last attempt)
      if (attempt < 3) {
        console.log(`  Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { success: false, error: 'No working free model found' };
  }

  generatePrompt(zodiacSign, readingType) {
    const traits = this.zodiacTraits[zodiacSign.toLowerCase()];
    const timeFrame = this.getTimeFrameDescription(readingType);
    const readingSpecs = this.getReadingSpecifications(readingType);

    return `Write an inspiring ${readingType} horoscope reading for ${zodiacSign.charAt(0).toUpperCase() + zodiacSign.slice(1)}.

CRITICAL: Respond with ONLY the final horoscope text. Do NOT include:
- Any reasoning or thinking process
- Explanations of your approach
- Meta-commentary about the horoscope
- Introduction or conclusion text
- Any text that isn't part of the actual horoscope reading

Guidelines:
- Balance mystical elements with practical, motivational guidance
- Incorporate subtle celestial references (stars, planetary influences) without being overly mystical
- Highlight the positive traits of ${zodiacSign}: ${traits}
- Provide actionable guidance and gentle motivation for ${timeFrame}
- ${readingSpecs.focus}
- ${readingSpecs.actionItems}
- Use uplifting, confident language that feels both inspiring and grounded
- Vary the motivational themes - avoid repetitive phrases about "cosmic energy" or "celestial forces"
- Mix practical advice with gentle spiritual wisdom
- Avoid overly mystical language like "the universe conspires" or "cosmic alignment"
- Focus on empowerment, courage, and positive action
- Length: ${readingSpecs.wordCount}
- Tone: ${readingSpecs.tone}
- Write in second person (you/your)
- IMPORTANT: Use paragraph breaks to make the text readable. Do NOT write a single wall of text. For love, career, and health readings, you MUST use a blank line between paragraphs.
- IMPORTANT: Always end with a complete sentence, never cut off mid-sentence

Your response should start immediately with the horoscope text and contain nothing else.`;
  }

  getReadingSpecifications(readingType) {
    switch (readingType.toLowerCase()) {
      case 'daily':
        return {
          wordCount: '60-100 words',
          focus: 'Focus on one specific action or mindset for today',
          actionItems: 'Suggest one concrete thing the reader can do or focus on today',
          tone: 'Concise, direct, and immediately actionable'
        };

      case 'weekly':
        return {
          wordCount: '100-150 words',
          focus: 'Focus on 2-3 themes or goals for the week ahead',
          actionItems: 'Encourage weekly planning and 2-3 actionable steps they can take this week',
          tone: 'Encouraging and goal-oriented, with a weekly perspective'
        };

      case 'monthly':
        return {
          wordCount: '150-200 words',
          focus: 'Focus on monthly themes, personal growth, and relationship development',
          actionItems: 'Suggest monthly goals, habit formation, or important conversations to have',
          tone: 'Thoughtful and comprehensive, covering multiple life areas'
        };

      case 'yearly':
        return {
          wordCount: '200-300 words',
          focus: 'Focus on major life themes, long-term growth, and transformative opportunities',
          actionItems: 'Encourage big-picture thinking, annual goal setting, and significant life changes',
          tone: 'Comprehensive and transformative, covering major life areas and long-term vision'
        };

      case 'love':
        return {
          wordCount: '25-40 words',
          focus: 'Focus briefly on one key romantic insight or emotional connection',
          actionItems: 'Use exactly 2 short paragraphs: insight then one actionable tip. Separate them with a blank line (double newline). Never output one continuous block of text.',
          tone: 'Compassionate and concise'
        };

      case 'career':
        return {
          wordCount: '25-40 words',
          focus: 'Focus briefly on one professional opportunity or financial tip',
          actionItems: 'Use exactly 2 short paragraphs: opportunity then one action. Separate them with a blank line (double newline). Never output one continuous block of text.',
          tone: 'Direct, ambitious, and practical'
        };

      case 'health':
        return {
          wordCount: '25-40 words',
          focus: 'Focus briefly on one wellness area or mindset',
          actionItems: 'Use exactly 2 short paragraphs: wellness insight then one simple habit. Separate them with a blank line (double newline). Never output one continuous block of text.',
          tone: 'Nurturing, clear, and calming'
        };

      default:
        return {
          wordCount: '100-150 words',
          focus: 'Focus on positive guidance and personal growth',
          actionItems: 'Encourage taking positive action and pursuing opportunities',
          tone: 'Inspiring and motivational'
        };
    }
  }

  getTimeFrameDescription(readingType) {
    switch (readingType.toLowerCase()) {
      case 'daily':
        return 'the day ahead';
      case 'weekly':
        return 'the week ahead';
      case 'monthly':
        return 'the month ahead';
      case 'yearly':
        return 'the year ahead';
      case 'love':
        return 'matters of the heart';
      case 'career':
        return 'professional and financial matters';
      case 'health':
        return 'wellness and self-care';
      default:
        return 'the time ahead';
    }
  }

  getMaxTokensForReadingType(readingType) {
    switch (readingType.toLowerCase()) {
      case 'daily':
        return 200; // 60-100 words ≈ 80-150 tokens + buffer
      case 'weekly':
        return 300; // 100-150 words ≈ 130-225 tokens + buffer
      case 'monthly':
        return 400; // 150-200 words ≈ 200-300 tokens + buffer
      case 'yearly':
        return 600; // 200-300 words ≈ 260-450 tokens + buffer
      case 'love':
      case 'career':
      case 'health':
        return 120; // 25-40 words ≈ 35-60 tokens + buffer
      default:
        return 400; // Default safe limit
    }
  }

  async generateReading(zodiacSign, readingType, retries = 3) {
    const startTime = Date.now();

    try {
      const prompt = this.generatePrompt(zodiacSign, readingType);
      const maxTokens = this.getMaxTokensForReadingType(readingType);

      const requestBody = {
        model: this.modelName,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
        top_p: 0.9,
        stream: false
      };

      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'https://mysticstars.com',
          'X-Title': 'MysticStars Horoscope'
        },
        body: JSON.stringify(requestBody),
        timeout: 30000 // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Blackbox API Error: ${response.status} - ${errorData}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(`Failed to parse Blackbox API response: ${parseError.message}`);
      }

      // More detailed validation of the response structure
      if (!data) {
        throw new Error('Invalid response format from Blackbox API: empty response');
      }

      if (!data.choices) {
        throw new Error(`Invalid response format from Blackbox API: missing choices. Response: ${JSON.stringify(data).substring(0, 200)}`);
      }

      if (!Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error(`Invalid response format from Blackbox API: choices is not an array or empty. Response: ${JSON.stringify(data).substring(0, 200)}`);
      }

      if (!data.choices[0]) {
        throw new Error(`Invalid response format from Blackbox API: first choice is undefined`);
      }

      if (!data.choices[0].message) {
        throw new Error(`Invalid response format from Blackbox API: message is missing. Choice: ${JSON.stringify(data.choices[0])}`);
      }

      // Handle standard responses and reasoning model fallback
      let content = '';
      const message = data.choices[0].message;

      if (message.content && message.content.trim()) {
        // Standard response format (preferred)
        content = message.content.trim();
      } else if (message.reasoning_content && message.reasoning_content.trim()) {
        // DeepSeek reasoning model format - extract the actual horoscope content
        console.log(`📝 Model ${this.modelName} returned reasoning format, extracting content...`);
        content = this.extractHoroscopeFromReasoning(message.reasoning_content.trim());

        if (!content || content.length < 50) {
          console.log(`⚠️ Could not extract valid horoscope from reasoning content, will try different model`);
          throw new Error('Could not extract valid horoscope content from reasoning format - will try different model');
        }

        console.log(`✅ Successfully extracted horoscope content from reasoning format`);
      } else {
        throw new Error(`Invalid response format from Blackbox API: both content and reasoning_content are missing or empty. Message: ${JSON.stringify(message)}`);
      }

      if (!content || content.length < 50) {
        throw new Error('Generated content is too short or empty');
      }

      // Check if content ends with incomplete sentence (enhanced validation)
      const trimmedContent = content.trim();
      const lastChar = trimmedContent[trimmedContent.length - 1];

      // Check for proper sentence endings
      if (!['!', '.', '?'].includes(lastChar)) {
        throw new Error(`Generated content appears incomplete - no proper sentence ending found. Last 50 chars: "${trimmedContent.slice(-50)}"`);
      }

      // Additional checks for clearly incomplete content
      const lastSentence = trimmedContent.split(/[.!?]/).pop().trim();
      if (lastSentence.length > 50) { // Very long final segment without punctuation
        throw new Error(`Generated content may be truncated - last segment too long without punctuation. Content: "${trimmedContent.slice(-80)}"`);
      }

      // Check for common truncation patterns
      const suspiciousEndings = ['and', 'or', 'but', 'the', 'a', 'an', 'to', 'for', 'with', 'that', 'this'];
      const lastWords = trimmedContent.toLowerCase().split(/\s+/).slice(-2);
      if (lastWords.length > 0 && suspiciousEndings.includes(lastWords[lastWords.length - 1])) {
        throw new Error(`Generated content appears to end mid-sentence with "${lastWords[lastWords.length - 1]}". Content: "${trimmedContent.slice(-60)}"`);
      }

      const processingTime = Date.now() - startTime;

      return {
        content,
        metadata: {
          prompt,
          temperature: requestBody.temperature,
          maxTokens: requestBody.max_tokens,
          processingTime,
          model: this.modelName,
          generatedAt: new Date().toISOString(),
          usage: data.usage || {}
        }
      };

    } catch (error) {
      console.error(`Error generating ${readingType} reading for ${zodiacSign}:`, error);

      // Check if it's a network/fetch error
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' ||
        error.message.includes('fetch failed') || error.message.includes('network')) {
        console.log('🌐 Network error detected, will retry with backoff');
      }

      if (retries > 0) {
        console.log(`Retrying... ${retries} attempts remaining`);
        // Progressive backoff for network errors
        const baseDelay = error.message.includes('fetch failed') ? 3000 : 1000;
        const backoffDelay = baseDelay * (4 - retries); // More delay for fewer remaining retries
        await this.delay(backoffDelay);
        return this.generateReading(zodiacSign, readingType, retries - 1);
      }

      throw new Error(`Failed to generate reading after multiple attempts: ${error.message}`);
    }
  }

  async generateAllReadingsForSign(zodiacSign) {
    const readingTypes = ['daily', 'weekly', 'monthly', 'yearly'];
    const results = {};
    const errors = [];

    console.log(`🌟 Generating all readings for ${zodiacSign}...`);

    for (const type of readingTypes) {
      try {
        console.log(`  Generating ${type} reading...`);
        const reading = await this.generateReading(zodiacSign, type);
        results[type] = reading;

        // Add a small delay between requests to be respectful to the API
        await this.delay(500);
      } catch (error) {
        console.error(`  Failed to generate ${type} reading:`, error.message);
        errors.push({ type, error: error.message });
      }
    }

    return { results, errors };
  }

  async generateAllReadings() {
    const allSigns = Object.keys(this.zodiacTraits);
    const allResults = {};
    const allErrors = [];

    console.log('🚀 Starting generation of all horoscope readings...');

    for (const sign of allSigns) {
      try {
        const { results, errors } = await this.generateAllReadingsForSign(sign);
        allResults[sign] = results;
        allErrors.push(...errors.map(e => ({ ...e, sign })));

        // Longer delay between signs to avoid rate limiting
        await this.delay(2000);
      } catch (error) {
        console.error(`Failed to generate readings for ${sign}:`, error.message);
        allErrors.push({ sign, error: error.message });
      }
    }

    console.log('✨ Reading generation complete!');
    console.log(`  Generated readings for ${Object.keys(allResults).length} signs`);
    console.log(`  Total errors: ${allErrors.length}`);

    return { results: allResults, errors: allErrors };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Extract horoscope content from reasoning format responses
  extractHoroscopeFromReasoning(reasoningContent) {
    try {
      // The reasoning content usually contains the final horoscope at the end
      // Look for patterns that indicate the final horoscope text

      // Method 1: Look for text after "Here's the horoscope:" or similar patterns
      const patterns = [
        /(?:here'?s? (?:the|your) (?:horoscope|reading)[:\s]*\n*)([\s\S]+?)(?:\n\n|$)/i,
        /(?:final (?:horoscope|reading)[:\s]*\n*)([\s\S]+?)(?:\n\n|$)/i,
        /(?:horoscope (?:text|content)[:\s]*\n*)([\s\S]+?)(?:\n\n|$)/i,
        /(?:reading[:\s]*\n*)([\s\S]+?)(?:\n\n|$)/i
      ];

      for (const pattern of patterns) {
        const match = reasoningContent.match(pattern);
        if (match && match[1]) {
          let extracted = match[1].trim();
          // Clean up any remaining reasoning artifacts
          extracted = this.cleanExtractedContent(extracted);
          if (extracted.length > 50 && this.isValidHoroscope(extracted)) {
            console.log(`[DEBUG] Extracted horoscope using pattern: ${pattern.source.substring(0, 30)}...`);
            return extracted;
          }
        }
      }

      // Method 2: If no patterns match, take the last substantial paragraph
      const paragraphs = reasoningContent.split(/\n\s*\n/).filter(p => p.trim().length > 50);
      if (paragraphs.length > 0) {
        let lastParagraph = paragraphs[paragraphs.length - 1].trim();
        lastParagraph = this.cleanExtractedContent(lastParagraph);
        if (this.isValidHoroscope(lastParagraph)) {
          console.log(`[DEBUG] Using last substantial paragraph as horoscope`);
          return lastParagraph;
        }
      }

      // Method 3: Look for content that starts with "You" (second person)
      const sentences = reasoningContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const horoscopeSentences = [];
      let foundHoroscopeStart = false;

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.toLowerCase().startsWith('you ') || foundHoroscopeStart) {
          foundHoroscopeStart = true;
          horoscopeSentences.push(trimmed);
          // Stop if we hit reasoning text again
          if (trimmed.toLowerCase().includes('think') || trimmed.toLowerCase().includes('consider') ||
            trimmed.toLowerCase().includes('reason') || trimmed.toLowerCase().includes('analysis')) {
            break;
          }
        }
      }

      if (horoscopeSentences.length > 0) {
        let extracted = horoscopeSentences.join('. ').trim();
        if (!extracted.endsWith('.') && !extracted.endsWith('!') && !extracted.endsWith('?')) {
          extracted += '.';
        }
        extracted = this.cleanExtractedContent(extracted);
        if (this.isValidHoroscope(extracted)) {
          console.log(`[DEBUG] Extracted horoscope from second-person sentences`);
          return extracted;
        }
      }

      console.log(`[DEBUG] Could not extract valid horoscope content from reasoning format`);
      return null;

    } catch (error) {
      console.error('Error extracting horoscope from reasoning content:', error);
      return null;
    }
  }

  // Clean extracted content of reasoning artifacts
  cleanExtractedContent(content) {
    let cleaned = content;

    // Remove common reasoning prefixes
    const reasoningPrefixes = [
      /^(?:I think|I believe|Let me|I'll|I should|I would|I can|I will)\s+/i,
      /^(?:Based on|According to|Given that|Considering)\s+/i,
      /^(?:The horoscope|This reading|The reading)\s+(?:should|would|could|might)\s+/i,
      /^(?:Here'?s?|Now)\s+(?:the|your|a)\s+(?:horoscope|reading)[:\s]*/i
    ];

    for (const prefix of reasoningPrefixes) {
      cleaned = cleaned.replace(prefix, '');
    }

    // Remove reasoning suffixes
    const reasoningSuffixes = [
      /\s*(?:This|That)\s+(?:captures|reflects|embodies)\s+[\s\S]*$/i,
      /\s*(?:I think|I believe)\s+this\s+[\s\S]*$/i
    ];

    for (const suffix of reasoningSuffixes) {
      cleaned = cleaned.replace(suffix, '');
    }

    // Clean up quotes if the content is wrapped in them
    cleaned = cleaned.replace(/^["']|["']$/g, '');

    return cleaned.trim();
  }

  // Validate that extracted content looks like a valid horoscope
  isValidHoroscope(content) {
    // Basic validation checks
    if (!content || content.length < 50) return false;

    // Should be primarily second person (contains "you" or "your")
    const secondPersonCount = (content.toLowerCase().match(/\b(?:you|your|you're|you'll|you've)\b/g) || []).length;
    const wordCount = content.split(/\s+/).length;

    // At least 10% second person pronouns
    if (secondPersonCount / wordCount < 0.1) {
      console.log(`[DEBUG] Content doesn't seem to be second person (${secondPersonCount}/${wordCount})`);
      return false;
    }

    // Should not contain too much reasoning language
    const reasoningWords = ['think', 'consider', 'analyze', 'because', 'therefore', 'thus', 'reasoning'];
    const reasoningCount = reasoningWords.reduce((count, word) =>
      count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0);

    if (reasoningCount > wordCount * 0.05) { // More than 5% reasoning words
      console.log(`[DEBUG] Content contains too much reasoning language (${reasoningCount}/${wordCount})`);
      return false;
    }

    // Should end with proper punctuation
    const lastChar = content.trim().slice(-1);
    if (!['.', '!', '?'].includes(lastChar)) {
      console.log(`[DEBUG] Content doesn't end with proper punctuation: "${lastChar}"`);
      return false;
    }

    return true;
  }

  async testConnection() {
    if (this.isMock) {
      console.log('[MOCK] Skipping Blackbox API connection test');
      return { success: true, message: 'Mock mode active', model: 'mock-model' };
    }
    try {
      const requestBody = {
        model: this.modelName,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from Blackbox AI API!"'
          }
        ],
        temperature: 0.7,
        max_tokens: 50,
        stream: false
      };

      console.log('[DEBUG] API Request:', {
        url: this.apiBaseUrl,
        model: this.modelName,
        headers: {
          'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`,
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'https://mysticstars.com',
          'X-Title': 'MysticStars Horoscope'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        return { success: false, error: `API Error: ${response.status} - ${errorData}` };
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return { success: false, error: 'Invalid response format' };
      }

      return {
        success: true,
        message: data.choices[0].message.content.trim(),
        model: this.modelName
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate lucky influences for a zodiac sign
   * These are deterministic based on sign + date (seeded random)
   * @param {string} zodiacSign - The zodiac sign
   * @param {Date} date - The date to generate influences for (defaults to today)
   * @returns {Object} Lucky influences with number, color, and time
   */
  generateLuckyInfluences(zodiacSign, date = new Date()) {
    // Create a seed from the zodiac sign and date
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const seedString = `${zodiacSign}-${dateStr}`;

    // Simple seeded random number generator
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = ((seed << 5) - seed) + seedString.charCodeAt(i);
      seed = seed & seed; // Convert to 32-bit integer
    }
    // Ensure seed is positive
    seed = Math.abs(seed) || 1;

    // Seeded random function - always returns 0-1
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return Math.abs(seed) / 233280;
    };

    // Lucky Number (1-99)
    const luckyNumber = Math.floor(seededRandom() * 99) + 1;

    // Lucky Color from predefined palette
    const colors = [
      // Reds & Pinks
      'Crimson Red', 'Ruby Red', 'Coral Pink', 'Rose Quartz', 'Blush Pink', 'Magenta',
      // Oranges & Yellows
      'Sunset Orange', 'Tangerine', 'Golden Yellow', 'Amber Glow', 'Honey Gold', 'Lemon Zest',
      // Greens
      'Emerald Green', 'Jade Green', 'Forest Green', 'Mint Fresh', 'Sage Green', 'Olive Branch',
      // Blues
      'Royal Blue', 'Sapphire Blue', 'Midnight Blue', 'Ocean Teal', 'Sky Blue', 'Turquoise',
      // Purples
      'Amethyst Purple', 'Violet Dream', 'Lavender Mist', 'Plum', 'Orchid', 'Indigo Night',
      // Neutrals & Metallics
      'Silver Mist', 'Pearl White', 'Onyx Black', 'Champagne Gold', 'Bronze Shimmer', 'Copper Glow',
      // Earth Tones
      'Terracotta', 'Mocha Brown', 'Sand Dune', 'Burnt Sienna', 'Dusty Rose', 'Warm Taupe'
    ];
    const colorIndex = Math.floor(seededRandom() * colors.length);
    const luckyColor = colors[colorIndex] || colors[0]; // Fallback to first color

    // Power Hour (6 AM - 10 PM)
    const hour = Math.floor(seededRandom() * 17) + 6; // 6-22
    const minute = Math.floor(seededRandom() * 4) * 15; // 0, 15, 30, 45
    const powerHour = new Date(date);
    powerHour.setHours(hour, minute, 0, 0);

    // Format time as "2:00 PM" or "11:30 AM"
    const formatTime = (d) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    return {
      number: luckyNumber,
      color: luckyColor,
      time: formatTime(powerHour)
    };
  }
}

module.exports = BlackboxService;