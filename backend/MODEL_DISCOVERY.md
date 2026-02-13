# OpenRouter Model Discovery System

This document describes the model system implemented to use OpenRouter's free model endpoint for horoscope generation.

## Overview

The application now uses OpenRouter's `openrouter/free` endpoint which automatically routes requests to the best available free model. This system:

1. **Uses OpenRouter's free endpoint** (`openrouter/free`) for automatic model routing
2. **Supports manual model selection** via environment variable if needed
3. **Integrates seamlessly** with OpenRouter's model marketplace

## Architecture

### Components

1. **ModelDiscoveryService** (`services/modelDiscoveryService.js`)
   - Handles communication with OpenRouter's `/v1/models` endpoint
   - Filters for free models based on pricing information
   - Returns `openrouter/free` as the default model

2. **Updated BlackboxService** (`services/blackboxService.js`)
   - Integrates with OpenRouter API
   - Uses `openrouter/free` as the default model
   - Provides async model initialization

## Key Features

### OpenRouter Free Model

```javascript
// The default model automatically routes to available free models
const modelName = 'openrouter/free';
```

### Manual Model Selection (Optional)

```javascript
// Override with a specific OpenRouter model
process.env.OPENROUTER_MODEL = 'google/gemma-3-27b-it:free';
```

### Real-time Model Testing

```javascript
// Test which models are actually working
const workingModels = await discoveryService.testModelAvailability(models);
```

### Model Selection Logic

### 1. Environment Variable (Highest Priority)
```bash
export OPENROUTER_MODEL="google/gemma-3-27b-it:free"
```
If set, the application will use this model exclusively.

### 2. Default (Recommended)
Uses `openrouter/free` which automatically routes to the best available free model.

## API Integration

### Endpoint Information
- **Base URL**: `https://openrouter.ai/api/v1/chat/completions`
- **Models URL**: `https://openrouter.ai/api/v1/models`
- **Method**: `POST` for chat, `GET` for models
- **Authentication**: Bearer token required
- **Response**: OpenAI-compatible format

### Authentication
```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://mysticstars.com',
    'X-Title': 'MysticStars Horoscope'
  }
});
```

## Usage in Application

### Initialization
The `BlackboxService` automatically initializes with OpenRouter:

```javascript
// Default model
this.modelName = process.env.OPENROUTER_MODEL || 'openrouter/free';
```

### Runtime Model Refresh
```javascript
// Refresh to check model status
await blackboxService.refreshModel();
```

### Fallback Handling
```javascript
// Retry with the same model
const result = await blackboxService.tryDifferentFreeModels();
```

## Testing

### Test the OpenRouter Integration
```bash
# Run the test script
node test-model-discovery.js

# Set your API key first
export OPENROUTER_API_KEY=your-api-key-here
```

### Test API Connection
```bash
# Test the basic connection
node test-blackbox.js
```

### Expected Output
```
🧪 Testing OpenRouter API Integration...

📡 Using model: openrouter/free
🔗 API URL: https://openrouter.ai/api/v1/chat/completions

1️⃣ Testing API connection...
✅ Connection successful!
📝 Response: Hello from OpenRouter API!

2️⃣ Testing reading generation...
✅ Reading generated successfully!
⏱️  Generation time: 1234ms
📊 Model: openrouter/free

📖 Generated Reading:
───────────────────────────────────────────
[Your generated horoscope text here]
───────────────────────────────────────────

🎉 All tests passed! OpenRouter integration is working correctly.
```

## Environment Variables

Required environment variable:
```bash
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

Optional environment variable:
```bash
OPENROUTER_MODEL=openrouter/free  # Uses default free routing
```

## Error Handling

### Graceful Degradation
1. **API Key Missing**: Logs warning, uses MOCK mode
2. **API Errors**: Retries with exponential backoff
3. **Rate Limiting**: Implements delays between retries
4. **Model Failures**: Falls back to retry logic

### Debug Logging
The system provides comprehensive debug logging:
```
[DEBUG] Using OpenRouter free model: openrouter/free
[DEBUG] BlackboxService initialized: {
  model: 'openrouter/free',
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions'
}
```

## Benefits

1. **Automatic Model Selection**: OpenRouter routes to the best available free model
2. **High Reliability**: No need to maintain hardcoded model lists
3. **Better Performance**: Always uses currently working models
4. **Simple Configuration**: Just set the API key and go
5. **Debugging Support**: Comprehensive logging for troubleshooting

## Troubleshooting

### Common Issues

**API Key Errors**
```
Authentication Error, No api key passed in
```
- Set `OPENROUTER_API_KEY` environment variable
- Get your API key from https://openrouter.ai/keys

**No Credits**
```
No credits found
```
- Add credits to your OpenRouter account
- OpenRouter offers free tier credits

**Rate Limiting**
```
Rate limit exceeded
```
- Wait a few minutes before retrying
- Consider adding more credits to your account

### Manual Model Specification
If you want to use a specific model instead of the free router:
```bash
export OPENROUTER_MODEL="google/gemma-3-27b-it:free"
```

## Getting Started with OpenRouter

1. **Create an account**: Go to https://openrouter.ai/
2. **Get your API key**: Navigate to https://openrouter.ai/keys
3. **Add credits**: OpenRouter offers free credits for new accounts
4. **Set the environment variable**:
   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
5. **Test the connection**:
   ```bash
   node test-blackbox.js
   ```

## Future Enhancements

Potential improvements:
1. **Model Performance Caching**: Cache successful model performance metrics
2. **Cost Optimization**: Monitor token usage and costs
3. **Model Health Monitoring**: Continuous monitoring of model availability
4. **Smart Load Balancing**: Distribute requests across multiple models
