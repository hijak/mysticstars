# Blackbox AI Model Discovery System

This document describes the dynamic model discovery system implemented to automatically find and use working models from Blackbox AI.

## Overview

The application now supports dynamic model discovery to overcome the limitation of hardcoded model lists that become outdated or unavailable. This system automatically:

1. **Retrieves available models** from the Blackbox AI API
2. **Filters for free and horoscope-optimized models**
3. **Tests model availability** in real-time
4. **Falls back gracefully** to hardcoded models if needed

## Architecture

### Components

1. **ModelDiscoveryService** (`services/modelDiscoveryService.js`)
   - Handles communication with Blackbox AI's `/v1/models` endpoint
   - Filters and categorizes available models
   - Tests model availability with actual API calls

2. **Updated BlackboxService** (`services/blackboxService.js`)
   - Integrates with ModelDiscoveryService
   - Maintains backward compatibility with hardcoded models
   - Provides async model initialization

## Key Features

### Dynamic Model Retrieval

```javascript
// Get all available models from Blackbox AI
const allModels = await discoveryService.getAvailableModels();

// Filter for free models
const freeModels = discoveryService.filterFreeModels(allModels);

// Get horoscope-optimized models
const horoscopeModels = discoveryService.getHoroscopeOptimizedModels(allModels);
```

### Real-time Model Testing

```javascript
// Test which models are actually working
const workingModels = await discoveryService.testModelAvailability(models);
```

### Automatic Best Model Selection

```javascript
// Get the best available model for horoscope generation
const bestModel = await discoveryService.getBestHoroscopeModel();
```

## Model Selection Logic

### 1. Environment Variable (Highest Priority)
```bash
export BLACKBOX_MODEL="blackboxai/specific-model:free"
```
If set, the application will use this model exclusively.

### 2. Dynamic Discovery (High Priority)
- Queries Blackbox AI's `/v1/models` endpoint
- Filters for models with `:free` suffix or `blackboxai` prefix
- Prioritizes horoscope-optimized models (creative, instruction-following)
- Tests actual availability before selection

### 3. Hardcoded Fallback (Low Priority)
If dynamic discovery fails, falls back to the original hardcoded model list.

## Horoscope-Optimized Models

The system prioritizes models known to work well for creative content:

- **deepseek-chat-v3**: Strong creative capabilities
- **qwen3-32b**: Large context window
- **mistral-small-3.2**: Good instruction following
- **llama-4-scout**: Latest LLaMA variant
- **gemma-3-27b**: Google's creative model
- **And others...**

## API Integration

### Endpoint Information
- **Base URL**: `https://api.blackbox.ai/v1/models`
- **Method**: `GET`
- **Authentication**: Bearer token required
- **Response**: OpenAI-compatible model list format

### Authentication
```javascript
const response = await fetch('https://api.blackbox.ai/v1/models', {
  headers: {
    'Authorization': `Bearer ${process.env.BLACKBOX_API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

## Usage in Application

### Initialization
The `BlackboxService` automatically initializes with dynamic discovery:

```javascript
// Starts with fallback model
this.modelName = process.env.BLACKBOX_MODEL || this.getDefaultFreeModel();

// Async discovery upgrades to better models
this.initializeModel().catch(err => {
  console.log('Async model initialization failed:', err.message);
});
```

### Runtime Model Refresh
```javascript
// Refresh to potentially better models
await blackboxService.refreshModel();
```

### Fallback Handling
```javascript
// Automatic fallback when current model fails
const result = await blackboxService.tryDifferentFreeModels();
```

## Testing

### Test the Model Discovery System
```bash
# Run the test script
node test-model-discovery.js

# Set your API key first
export BLACKBOX_API_KEY=your-api-key-here
```

### Expected Output
```
🔍 Testing Blackbox AI Model Discovery Service...

1️⃣  Testing: Get available models...
✅ Found 47 total models
   First 5 models:
   1. blackboxai/deepseek/deepseek-chat-v3-0324:free
   2. blackboxai/qwen/qwen3-32b:free
   ...

2️⃣  Testing: Filter free models...
✅ Found 23 free models

3️⃣  Testing: Get horoscope-optimized models...
✅ Found 8 horoscope-optimized models

4️⃣  Testing: Get best working horoscope model...
✅ Best working model: blackboxai/qwen/qwen3-32b:free
```

## Environment Variables

Required environment variable:
```bash
BLACKBOX_API_KEY=your-blackbox-api-key-here
```

Optional environment variable:
```bash
BLACKBOX_MODEL=specific-model-name  # Overrides dynamic discovery
```

## Error Handling

### Graceful Degradation
1. **API Key Missing**: Falls back to hardcoded models
2. **API Errors**: Logs error, uses hardcoded models
3. **No Working Models**: Tries hardcoded models with retry logic
4. **Rate Limiting**: Implements delays between model tests

### Debug Logging
The system provides comprehensive debug logging:
```
[DEBUG] Attempting to discover best available model...
[DEBUG] Using dynamically discovered model: blackboxai/qwen/qwen3-32b:free
[DEBUG] Found 8 working models dynamically
✅ Success with dynamic model: blackboxai/qwen/qwen3-32b:free
```

## Benefits

1. **Automatic Updates**: Adapts to new/removed models
2. **Higher Reliability**: Tests actual model availability
3. **Better Performance**: Uses currently working models
4. **Backward Compatibility**: Maintains original fallback logic
5. **Debugging Support**: Comprehensive logging for troubleshooting

## Troubleshooting

### Common Issues

**API Key Errors**
```
Authentication Error, No api key passed in
```
- Set `BLACKBOX_API_KEY` environment variable
- Verify API key is valid

**No Models Found**
```
Found 0 total models
```
- Check API key permissions
- Verify network connectivity
- API may be temporarily unavailable

**All Models Failing**
```
No working model found
```
- API rate limiting may be active
- Try again after a few minutes
- Check Blackbox AI service status

### Manual Model Specification
If automatic discovery fails, you can manually specify a model:
```bash
export BLACKBOX_MODEL="blackboxai/qwen/qwen3-32b:free"
```

## Future Enhancements

Potential improvements:
1. **Model Performance Caching**: Cache successful model performance metrics
2. **Regional Model Selection**: Choose models based on geographic availability
3. **Cost Optimization**: Prioritize models with better performance/cost ratios
4. **Model Health Monitoring**: Continuous monitoring of model availability
5. **Smart Load Balancing**: Distribute requests across multiple working models