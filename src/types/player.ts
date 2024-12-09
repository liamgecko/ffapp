export interface Player {
  sleeperId: string
  name: string
  team: string
  position: string
  age: string
  status: string
  active: boolean
  espnAvatar?: string
  yahooAvatar?: string
  sleeperAvatar?: string
  imageUrl?: string
  byeWeek?: number
  injury?: string
}

export interface CombinedPlayerData extends Player {
  games?: string
  gamesStarted?: string
  season?: string
  positionRank?: string
  fantasyPoints?: number
  weeklyPoints?: number[]
  passingYards?: number
  passingAttempts?: number
  passingTouchdowns?: number
  rushingYards?: number
  rushingAttempts?: number
  rushingTouchdowns?: number
  receptions?: number
  targets?: number
  receivingYards?: number
  receivingTouchdowns?: number
  fieldGoalsMade?: number
  fieldGoalsAttempted?: number
  fieldGoalsUnder30?: number
  fieldGoals30to39?: number
  fieldGoals40to49?: number
  fieldGoals50Plus?: number
  extraPointsMade?: number
  extraPointsAttempted?: number
  pointsAllowed?: number
  sacks?: number
  interceptions?: number
  fumbleRecoveries?: number
  safeties?: number
  defensiveTouchdowns?: number
  specialTeamsTouchdowns?: number
  blockedKicks?: number
  forcedFumbles?: number
  fieldGoalPercentage?: number
  extraPointPercentage?: number
  currentOpponent?: string
  opponentRank?: string
  difficultyRating?: number
  ownership?: number
} 