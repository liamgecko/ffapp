import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

interface NFLPlayer {
  id: string
  name: string
  position: string
  team: string
  jersey_number?: string
  birth_date?: string
  height?: string
  weight?: string
  college?: string
  draft?: {
    year: number
    round: number
    pick: number
    team: string
  }
  status?: string
}

export interface SimplePlayerInfo {
  id: string
  name: string
  position: string
  team: string
  imageUrl?: string
  stats?: {
    passingYards?: number
  }
}

const SPORTRADAR_API_KEY = process.env.SPORTRADAR_API_KEY
const BASE_URL = 'https://api.sportradar.us/nfl/official/trial/v7/en'

export async function fetchAllPlayers(): Promise<SimplePlayerInfo[]> {
  try {
    console.log('Starting NFL player fetch from Sportradar...')
    
    // First get all teams
    const teamsResponse = await axios.get(
      `${BASE_URL}/league/hierarchy.json`,
      {
        params: {
          api_key: SPORTRADAR_API_KEY
        }
      }
    )

    if (!teamsResponse.data?.conferences) {
      console.error('No team data received')
      return []
    }

    // Extract all teams
    const teams = teamsResponse.data.conferences.flatMap((conf: any) => 
      conf.divisions.flatMap((div: any) => div.teams)
    )

    console.log(`Found ${teams.length} teams`)

    // Get rosters for each team
    const players: SimplePlayerInfo[] = []
    
    for (const team of teams) {
      try {
        const rosterResponse = await axios.get(
          `${BASE_URL}/teams/${team.id}/roster.json`,
          {
            params: {
              api_key: SPORTRADAR_API_KEY
            }
          }
        )

        if (rosterResponse.data?.players) {
          const teamPlayers = rosterResponse.data.players
            .filter((p: NFLPlayer) => p.position === 'QB') // For now just get QBs
            .map((p: NFLPlayer) => ({
              id: p.id,
              name: p.name,
              position: p.position,
              team: team.alias,
              imageUrl: `https://api.sportradar.us/nfl/official/images/players/${p.id}/headshot`, // Sportradar player images
              stats: {
                passingYards: 0 // We'll add this in a separate call
              }
            }))
          
          players.push(...teamPlayers)
          console.log(`Added ${teamPlayers.length} players from ${team.alias}`)
        }

        // Add delay between team requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error fetching roster for ${team.alias}:`, error)
      }
    }

    console.log(`Returning ${players.length} total players`)
    return players

  } catch (error) {
    console.error('Error in fetchAllPlayers:', error)
    throw error
  }
}