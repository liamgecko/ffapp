export interface Player {
  id: string
  name: string
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF'
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
  difficultyRating?: number
} 