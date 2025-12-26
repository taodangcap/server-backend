// Backend Proxy Server for SoundCloud API
// This server proxies requests to SoundCloud API to bypass CORS restrictions

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
// Hỗ trợ cả PORT (cho hosting) và PROXY_PORT (cho local)
const PORT = process.env.PORT || process.env.PROXY_PORT || 3001

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// SoundCloud API proxy endpoint
app.get('/api/soundcloud/search', async (req, res) => {
  try {
    const { q, limit = 10, client_id } = req.query

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' })
    }

    if (!client_id) {
      return res.status(400).json({ error: 'Client ID is required. Set VITE_SOUNDCLOUD_CLIENT_ID in .env' })
    }

    const searchQuery = encodeURIComponent(q)
    const apiUrl = `https://api-v2.soundcloud.com/search/tracks?q=${searchQuery}&limit=${limit}&client_id=${client_id}`

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SoundCloud Proxy Server running on port ${PORT}`)
  console.log(`📡 Proxy endpoint: /api/soundcloud/search`)
})

