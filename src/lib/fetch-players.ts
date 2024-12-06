import axios from 'axios'

export interface Player {
  id: string
  name: string
  position: string
  team: string
  imageUrl?: string
  passingYards?: number
}

export async function fetchPlayers(): Promise<Player[]> {
  try {
    console.log('Fetching players from server...')
    const response = await axios.get<Player[]>('http://localhost:3003/api/players')
    console.log('Received players:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Error fetching players:', error)
    return []
  }
} 