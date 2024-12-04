import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const app = express()
const port = 3001
const CACHE_FILE = path.join(__dirname, 'cache', 'players.json')

// Ensure cache directory exists
if (!fs.existsSync(path.join(__dirname, 'cache'))) {
  fs.mkdirSync(path.join(__dirname, 'cache'))
}

app.use(cors())

app.get('/api/players', async (req, res) => {
  try {
    // Check if cache exists and is less than 24 hours old
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE)
      const cacheAge = Date.now() - stats.mtimeMs
      const MAX_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 hours

      if (cacheAge < MAX_CACHE_AGE) {
        console.log('Serving players from cache')
        const cachedData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
        return res.json(cachedData)
      }
    }

    // If no cache or cache is old, fetch from API
    console.log('Fetching fresh data from API')
    const teamId = 17 // Kansas City Chiefs
    const playersUrl = `https://v1.american-football.api-sports.io/players?team=${teamId}&season=2023`

    const playersResponse = await fetch(playersUrl, {
      headers: {
        'x-rapidapi-host': 'v1.american-football.api-sports.io',
        'x-rapidapi-key': process.env.NFL_API_KEY!
      }
    })

    const data = await playersResponse.json()
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(JSON.stringify(data.errors))
    }

    const players = data.response.map((player: any) => ({
      id: player.id.toString(),
      name: player.name,
      position: player.position || 'Unknown',
      team: 'Kansas City Chiefs',
      imageUrl: 'https://media.api-sports.io/american-football/teams/17.png',
      totalPoints: 0,
      gamesPlayed: 0,
      weeklyPoints: [],
      nextGame: null,
    }))

    // Save to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(players))
    console.log('Saved players to cache')

    res.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    
    // If error occurs but cache exists, serve from cache
    if (fs.existsSync(CACHE_FILE)) {
      console.log('Serving from cache due to error')
      const cachedData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
      return res.json(cachedData)
    }

    res.status(500).json({ 
      error: 'Failed to fetch players',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 