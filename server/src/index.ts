import express from 'express'
import cors from 'cors'
import { fetchSleeperPlayers } from './services/sleeper'

const app = express()
app.use(cors())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/players', async (req, res) => {
  try {
    const players = await fetchSleeperPlayers()
    res.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    res.status(500).json({ error: 'Failed to fetch players' })
  }
})

const port = 3002
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
