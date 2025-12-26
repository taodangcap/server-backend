// Backend Proxy Server for SoundCloud API
// This server proxies requests to SoundCloud API to bypass CORS restrictions

import express from 'express'
import cors from 'cors'
import config from './config.js'

const app = express()
const PORT = config.port

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// SoundCloud API proxy endpoint
app.get('/api/soundcloud/search', async (req, res) => {
  try {
    const { q, limit = config.soundcloud.defaultLimit, client_id } = req.query

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    // Use client_id from query or config
    const clientId = client_id || config.soundcloud.clientId

    if (!clientId) {
      return res.status(400).json({ 
        error: 'Client ID is required. Set SOUNDCLOUD_CLIENT_ID environment variable or pass it as query parameter' 
      })
    }

    // Validate and limit the search limit
    const searchLimit = Math.min(parseInt(limit) || config.soundcloud.defaultLimit, config.soundcloud.maxLimit)
    const searchQuery = encodeURIComponent(q)
    const apiUrl = `${config.soundcloud.apiBaseUrl}/search/tracks?q=${searchQuery}&limit=${searchLimit}&client_id=${clientId}`

    console.log(`Proxying SoundCloud search: ${q}`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SoundCloud API error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: `SoundCloud API error: ${response.status}`,
        details: errorText 
      })
    }

    const data = await response.json()
    
    // Transform the data to match frontend expectations
    const tracks = (data.collection || []).map(track => ({
      id: track.id?.toString() || track.permalink_url || `sc_${Date.now()}_${Math.random()}`,
      title: track.title || 'Untitled',
      description: track.description || '',
      thumbnail: track.artwork_url || track.user?.avatar_url || '',
      channelTitle: track.user?.username || track.user?.full_name || 'Unknown Artist',
      duration: track.duration || 0,
      viewCount: track.playback_count || 0,
      publishedAt: track.created_at || new Date().toISOString(),
      source: 'soundcloud',
      streamUrl: track.stream_url,
      permalinkUrl: track.permalink_url || `https://soundcloud.com/${track.user?.permalink}/${track.permalink}`,
    }))

    console.log(`Found ${tracks.length} tracks`)
    res.json(tracks)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SoundCloud Proxy Server' })
})

app.listen(PORT, config.host, () => {
  console.log(`🚀 ${config.server.name} v${config.server.version}`)
  console.log(`📍 Running on ${config.host}:${PORT}`)
  console.log(`📡 Proxy endpoint: /api/soundcloud/search`)
  console.log(`🌍 Environment: ${config.nodeEnv}`)
  console.log(`✅ Server is listening on all interfaces (0.0.0.0)`)
  if (config.soundcloud.clientId) {
    console.log(`🔑 SoundCloud Client ID: ${config.soundcloud.clientId.substring(0, 8)}...`)
  } else {
    console.log(`⚠️  SoundCloud Client ID: Not set (will use query parameter or fail)`)
  }
})

