export interface CombinedPlayerData {
  sleeperId: string;
  name: string;
  team: string;
  position: string;
  age: string;
  status: string;
  active: boolean;
  espnAvatar?: string;
  yahooAvatar?: string;
  sleeperAvatar?: string;
  games?: string;
  gamesStarted?: string;
  season?: string;
  fantasyPoints: number;
  weeklyPoints?: number[];
  byeWeek?: number;
  injury?: string;
  imageUrl?: string;
  ownership: number;
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  fieldGoalsUnder30?: number;
  fieldGoals30to39?: number;
  fieldGoals40to49?: number;
  fieldGoals50Plus?: number;
  extraPointsMade?: number;
  extraPointsAttempted?: number;
}

export type Player = CombinedPlayerData; 