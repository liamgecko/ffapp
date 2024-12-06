import axios from 'axios'

interface SleeperPlayer {
  player_id: string
  full_name: string
  position: string
  team: string
  active: boolean
}

interface Player {
  id: string
  name: string
  position: string
  team: string
  imageUrl: string
  byeWeek: number
  currentOpponent: string
  injury: string
  fantasyPoints: number
  positionRank: string
  weeklyPoints: number[]
  averagePoints: number
  lastWeekPoints: number
  lastThreeAvg: number
  lastFiveAvg: number
  ownership: number
  difficultyRating: number
}

export async function fetchSleeperPlayers(): Promise<Player[]> {
  try {
    const response = await axios.get('https://api.sleeper.app/v1/players/nfl')
    const players = Object.values(response.data) as SleeperPlayer[]

    const filteredPlayers = players
      .filter(p => 
        p.active && 
        p.team && 
        ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position)
      )
      .map(p => ({
        id: p.player_id,
        name: p.full_name,
        position: p.position,
        team: p.team,
        imageUrl: `https://sleepercdn.com/content/nfl/players/${p.player_id}.jpg`,
        byeWeek: 0,
        currentOpponent: '',
        injury: '',
        fantasyPoints: 0,
        positionRank: `${p.position}1`,
        weeklyPoints: [],
        averagePoints: 0,
        lastWeekPoints: 0,
        lastThreeAvg: 0,
        lastFiveAvg: 0,
        ownership: 0
      }))

    console.log('Filtered players count:', filteredPlayers.length)
    console.log('Sample player:', filteredPlayers[0])

    return filteredPlayers
  } catch (error) {
    console.error('Error fetching from Sleeper:', error)
    throw error
  }
}