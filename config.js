// Configuration file for SoundCloud Proxy Server
// This file manages all configuration without requiring .env file

export const config = {
  // Server configuration
  port: process.env.PORT || process.env.PROXY_PORT || 8080,
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // SoundCloud API configuration
  soundcloud: {
    // Client ID - You can set it in 3 ways (priority order):
    // 1. Environment variable: SOUNDCLOUD_CLIENT_ID (for Fly.io: fly secrets set SOUNDCLOUD_CLIENT_ID=xxx)
    // 2. Hardcode directly here: replace '' with 'your_client_id_here'
    // 3. Pass via query parameter: ?client_id=xxx
    clientId: process.env.SOUNDCLOUD_CLIENT_ID || process.env.VITE_SOUNDCLOUD_CLIENT_ID || 'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M', // ← Hardcode here if needed
    
    // API base URL
    apiBaseUrl: 'https://api-v2.soundcloud.com',
    
    // Default search limit
    defaultLimit: 10,
    
    // Max search limit
    maxLimit: 50,
  },
  
  // CORS configuration
  cors: {
    enabled: true,
    // Add specific origins if needed
    // origins: ['https://yourdomain.com']
  },
  
  // Server settings
  server: {
    name: 'SoundCloud Proxy Server',
    version: '1.0.0',
  }
}

// Validate required configuration
if (!config.soundcloud.clientId && config.nodeEnv === 'production') {
  console.warn('⚠️  WARNING: SOUNDCLOUD_CLIENT_ID is not set. API calls will fail.')
  console.warn('   Set it via: fly secrets set SOUNDCLOUD_CLIENT_ID=your_client_id')
}

export default config

