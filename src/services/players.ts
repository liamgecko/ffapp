import axios from 'axios'
import { Player } from '@/types/player'

const API_URL = 'http://localhost:3002'

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const response = await axios.get<Player[]>(`${API_URL}/api/players`)
    console.log('Players data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching players:', error)
    throw error
  }
} 