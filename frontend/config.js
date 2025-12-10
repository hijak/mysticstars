// Configuration for MysticStars frontend
window.MYSTICSTARS_CONFIG = {
  // API Configuration - Update this to your actual API endpoint
  // For Kubernetes deployment, use your ingress or service URL
  API_BASE_URL: 'https://api.mysticstars.app/api', // Update this to your actual domain
  
  // Alternative configurations for different environments:
  // For local Kubernetes: 'http://localhost:8080/api' (if using port-forward)
  // For development: 'http://localhost:3000'
  // For production: 'https://yourdomain.com/api'
  
  // Fallback to mock data if API is unavailable (recommended for development)
  USE_MOCK_DATA_FALLBACK: true,
  
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 15000, // Increased for better reliability
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // Increased delay between retries
  
  // CORS handling for Cloudflare Pages
  CORS_MODE: 'cors',
  
  // Additional headers for API requests
  ADDITIONAL_HEADERS: {
    'X-Requested-With': 'XMLHttpRequest'
  }
};