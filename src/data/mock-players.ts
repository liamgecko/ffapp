export type Player = {
  id: string
  name: string
  team: string
  position: string
  byeWeek: number
  fantasyPoints: number
  passingYards: number
  passingAttempts: number
  passingTouchdowns: number
  rushingYards: number
  rushingAttempts: number
  rushingTouchdowns: number
  receivingYards: number
  receptions: number
  targets: number
  receivingTouchdowns: number
}

export const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Patrick Mahomes",
    team: "KC",
    position: "QB",
    byeWeek: 10,
    fantasyPoints: 324.5,
    passingYards: 4839,
    passingAttempts: 648,
    passingTouchdowns: 41,
    rushingYards: 358,
    rushingAttempts: 61,
    rushingTouchdowns: 4,
    receivingYards: 0,
    receptions: 0,
    targets: 0,
    receivingTouchdowns: 0
  },
  {
    id: "2",
    name: "Christian McCaffrey",
    team: "SF",
    position: "RB",
    byeWeek: 9,
    fantasyPoints: 298.7,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 1459,
    rushingAttempts: 272,
    rushingTouchdowns: 14,
    receivingYards: 564,
    receptions: 67,
    targets: 83,
    receivingTouchdowns: 7
  },
  {
    id: "3",
    name: "Justin Jefferson",
    team: "MIN",
    position: "WR",
    byeWeek: 7,
    fantasyPoints: 252.1,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 26,
    rushingAttempts: 4,
    rushingTouchdowns: 0,
    receivingYards: 1809,
    receptions: 128,
    targets: 184,
    receivingTouchdowns: 8
  },
  {
    id: "4",
    name: "Travis Kelce",
    team: "KC",
    position: "TE",
    byeWeek: 10,
    fantasyPoints: 258.3,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 0,
    rushingAttempts: 0,
    rushingTouchdowns: 0,
    receivingYards: 1338,
    receptions: 110,
    targets: 152,
    receivingTouchdowns: 12
  },
  {
    id: "5",
    name: "Josh Allen",
    team: "BUF",
    position: "QB",
    byeWeek: 13,
    fantasyPoints: 312.8,
    passingYards: 4283,
    passingAttempts: 612,
    passingTouchdowns: 35,
    rushingYards: 762,
    rushingAttempts: 124,
    rushingTouchdowns: 7,
    receivingYards: 0,
    receptions: 0,
    targets: 0,
    receivingTouchdowns: 0
  },
  {
    id: "6",
    name: "Austin Ekeler",
    team: "LAC",
    position: "RB",
    byeWeek: 5,
    fantasyPoints: 276.5,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 915,
    rushingAttempts: 204,
    rushingTouchdowns: 13,
    receivingYards: 722,
    receptions: 107,
    targets: 127,
    receivingTouchdowns: 5
  },
  {
    id: "7",
    name: "Tyreek Hill",
    team: "MIA",
    position: "WR",
    byeWeek: 10,
    fantasyPoints: 269.4,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 32,
    rushingAttempts: 7,
    rushingTouchdowns: 0,
    receivingYards: 1710,
    receptions: 119,
    targets: 170,
    receivingTouchdowns: 7
  },
  {
    id: "8",
    name: "Justin Tucker",
    team: "BAL",
    position: "K",
    byeWeek: 13,
    fantasyPoints: 168.0,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 0,
    rushingAttempts: 0,
    rushingTouchdowns: 0,
    receivingYards: 0,
    receptions: 0,
    targets: 0,
    receivingTouchdowns: 0
  },
  {
    id: "9",
    name: "San Francisco 49ers",
    team: "SF",
    position: "DEF",
    byeWeek: 9,
    fantasyPoints: 187.0,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 0,
    rushingAttempts: 0,
    rushingTouchdowns: 0,
    receivingYards: 0,
    receptions: 0,
    targets: 0,
    receivingTouchdowns: 0
  },
  {
    id: "10",
    name: "Mark Andrews",
    team: "BAL",
    position: "TE",
    byeWeek: 13,
    fantasyPoints: 172.5,
    passingYards: 0,
    passingAttempts: 0,
    passingTouchdowns: 0,
    rushingYards: 0,
    rushingAttempts: 0,
    rushingTouchdowns: 0,
    receivingYards: 847,
    receptions: 73,
    targets: 113,
    receivingTouchdowns: 5
  },
  {
    id: "11",
    name: "Jalen Hurts",
    team: "PHI",
    position: "QB",
    byeWeek: 10,
    fantasyPoints: 294.6,
    passingYards: 3701,
    passingAttempts: 591,
    passingTouchdowns: 22,
    rushingYards: 760,
    rushingAttempts: 165,
    rushingTouchdowns: 13,
    receivingYards: 0,
    receptions: 0,
    targets: 0,
    receivingTouchdowns: 0
  }
] 