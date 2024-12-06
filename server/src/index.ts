import express from 'express'
import cors from 'cors'
import { fetchAllPlayers, SimplePlayerInfo } from './services/nfl'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// All players endpoint with better error handling
app.get('/api/players', async (req, res) => {
  let timeoutId: NodeJS.Timeout

  try {
    console.log('Received request for players')
    
    const timeoutPromise = new Promise<SimplePlayerInfo[]>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timed out after 60 seconds'))
      }, 60000)
    })

    const playersPromise = fetchAllPlayers().then(players => {
      clearTimeout(timeoutId)
      return players
    })

    const players = await Promise.race([playersPromise, timeoutPromise])
    
    if (!players || !Array.isArray(players)) {
      throw new Error('Invalid response format')
    }

    console.log(`Successfully fetched ${players.length} players`)
    res.json(players)

  } catch (error) {
    clearTimeout(timeoutId!)
    console.error('Error in /api/players:', error)
    res.status(error.message.includes('timeout') ? 504 : 500).json({
      error: error.message.includes('timeout') ? 'Gateway Timeout' : 'Internal Server Error',
      details: error.message
    })
  }
})

const PORT = process.env.PORT || 3002

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}).on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`)
    process.exit(1)
  } else {
    console.error('Server error:', error)
    process.exit(1)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})