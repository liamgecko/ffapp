import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowUp, ArrowDown, SignalLow, SignalMedium, SignalHigh } from "lucide-react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { useState, useMemo, useEffect } from "react"
import { TablePagination } from "./players-table-pagination"
import { TableSearch } from "./players-table-search"
import { TableEmpty } from "./players-table-empty"
import { PositionFilter } from "./players-table-position-filter"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparklines, SparklinesLine, SparklinesReferenceLine } from 'react-sparklines'
import { PlayerDrawer } from "./player-drawer"

// At the top of the file, add this interface to define the expected player structure
interface Player {
  id: string
  name: string
  position: string
  team: string
  imageUrl: string
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
  ownership: number
  weeklyPoints: number[]
  currentOpponent: string
  difficultyRating: number
  opponentRank: string
  byeWeek: number
  injury: string | null
  positionRank: string
}

// Helper function to calculate average over last N games
const calculateAverage = (points: number[] = [], games: number) => {
  if (!points || points.length === 0) return "0.0"
  const recentGames = points.slice(-games)
  const total = recentGames.reduce((sum, p) => sum + p, 0)
  return (total / Math.min(games, recentGames.length)).toFixed(1)
}

// Helper function to get last week's points
const getLastWeekPoints = (points: number[] = []) => {
  if (!points || points.length === 0) return "0.0"
  return points[points.length - 1].toFixed(1)
}

export function PlayersTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "fantasyPoints", desc: true }
  ])

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [globalFilter, setGlobalFilter] = useState("")

  const [activeView, setActiveView] = useState("nfl")

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const [serverPlayers, setServerPlayers] = useState([])

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/players')
        if (!response.ok) throw new Error('Failed to fetch players')
        const data = await response.json()
        
        // Transform the data to match required structure
        const transformedData = data.map((player: any) => ({
          id: player.id,
          name: player.name,
          position: player.position,
          team: player.team,
          imageUrl: player.imageUrl,
          fantasyPoints: 0, // Default values for required fields
          passingYards: 0,
          passingAttempts: 0,
          passingTouchdowns: 0,
          rushingYards: 0,
          rushingAttempts: 0,
          rushingTouchdowns: 0,
          receivingYards: 0,
          receptions: 0,
          targets: 0,
          receivingTouchdowns: 0,
          ownership: 0,
          weeklyPoints: [],
          currentOpponent: "BYE",
          difficultyRating: 0,
          opponentRank: "",
          byeWeek: 0,
          injury: null,
          positionRank: "" // This will be calculated later
        }))

        console.log('Sample transformed player:', transformedData[0])
        setServerPlayers(transformedData)
      } catch (error) {
        console.error('Error fetching players:', error)
      }
    }

    fetchPlayers()
  }, [])

  useEffect(() => {
    console.log('2. serverPlayers state:', serverPlayers)
  }, [serverPlayers])

  const playersWithRanks = useMemo(() => {
    console.log('3. Calculating playersWithRanks from:', serverPlayers)
    
    const positionGroups = serverPlayers.reduce((groups, player) => {
      const position = player.position
      if (!groups[position]) {
        groups[position] = []
      }
      groups[position].push(player)
      return groups
    }, {} as Record<string, typeof serverPlayers>)

    const result = serverPlayers.map(player => ({
      ...player,
      fantasyPoints: 0,
      passingYards: 0,
      passingAttempts: 0,
      passingTouchdowns: 0,
      rushingYards: 0,
      rushingAttempts: 0,
      rushingTouchdowns: 0,
      receivingYards: 0,
      receptions: 0,
      targets: 0,
      receivingTouchdowns: 0,
      ownership: 0,
      weeklyPoints: [],
      currentOpponent: "BYE",
      difficultyRating: 0,
      opponentRank: "",
      byeWeek: 0,
      injury: null,
      positionRank: `${player.position}${positionGroups[player.position].findIndex(p => p.id === player.id) + 1}`
    }))

    console.log('4. Calculated playersWithRanks:', result)
    return result
  }, [serverPlayers])

  useEffect(() => {
    console.log('5. Setting filteredPlayers:', playersWithRanks)
    setFilteredPlayers(playersWithRanks)
  }, [playersWithRanks])

  const [filteredPlayers, setFilteredPlayers] = useState(playersWithRanks)

  const handlePositionChange = (position: string) => {
    if (position === "ALL") {
      setFilteredPlayers(playersWithRanks)
    } else {
      setFilteredPlayers(playersWithRanks.filter(player => player.position === position))
    }
  }

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const getRankColor = (positionRank: string) => {
    const rank = parseInt(positionRank.replace(/[A-Z]/g, ''))
    
    if (rank <= 12) return "text-green-500"
    if (rank >= 37 && rank <= 48) return "text-orange-500"
    if (rank > 48) return "text-red-500"
    return "" // default color for ranks 13-36
  }

  const getOwnershipColor = (ownership: number): string => {
    if (ownership >= 95) return "bg-emerald-500"
    if (ownership >= 85) return "bg-emerald-400"
    if (ownership >= 75) return "bg-lime-400"
    if (ownership >= 65) return "bg-yellow-400"
    if (ownership >= 55) return "bg-amber-500"
    if (ownership >= 45) return "bg-orange-500"
    if (ownership >= 35) return "bg-rose-400"
    return "bg-red-500"
  }

  const columns: ColumnDef<typeof serverPlayers[0]>[] = [
    {
      accessorKey: "name",
      header: "Player",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {row.original.imageUrl ? (
              <img 
                src={row.original.imageUrl} 
                alt={row.original.name}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                {row.original.name.charAt(0)}
              </div>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium truncate">{row.original.name}</span>
              {row.original.injury && (
                <span className="text-xs text-red-500 font-medium flex-shrink-0">
                  {row.original.injury}
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {row.original.team} · {row.original.position} ({row.original.byeWeek})
            </div>
          </div>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "positionRank",
      header: "Rank",
      cell: ({ row }) => (
        <div className={getRankColor(row.original.positionRank)}>
          {row.original.positionRank}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "fantasyPoints",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Fpts</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fantasy Points</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => row.original.fantasyPoints.toFixed(1),
    },
    {
      accessorKey: "passingYards",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Pass Yds</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Passing Yards</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "passingAttempts",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Pass Att</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Passing Attempts</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "passingTouchdowns",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Pass TD</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Passing Touchdowns</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "rushingYards",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Rush Yds</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rushing Yards</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "rushingAttempts",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Rush Att</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rushing Attempts</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "rushingTouchdowns",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Rush TD</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rushing Touchdowns</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "receivingYards",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Rec Yds</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Receiving Yards</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "receptions",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Rec</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Receptions</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "targets",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Tgts</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Targets</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "receivingTouchdowns",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Rec TD</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Receiving Touchdowns</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "ownership",
      header: "% Owned",
      cell: ({ row }) => {
        const ownership = row.original.ownership
        return (
          <div className="w-24 flex items-center gap-2">
            <div className={cn("h-2 w-full bg-muted rounded-full overflow-hidden")}>
              <div 
                className={cn("h-full transition-all", getOwnershipColor(ownership))} 
                style={{ width: `${ownership}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {ownership}%
            </span>
          </div>
        )
      },
    }
  ]

  // First, let's create shared columns WITHOUT ownership
  const sharedColumns: ColumnDef<typeof serverPlayers[0]>[] = [
    // Player column (existing)
    columns.find(col => col.accessorKey === "name")!,
    // Position Rank column (existing)
    columns.find(col => col.accessorKey === "positionRank")!,
    // Fantasy Points column (existing)
    columns.find(col => col.accessorKey === "fantasyPoints")!,
  ]

  // Get ownership column separately
  const ownershipColumn = columns.find(col => col.accessorKey === "ownership")!

  // New fantasy-specific columns (now with ownership at the end)
  const fantasyColumns: ColumnDef<typeof serverPlayers[0]>[] = [
    ...sharedColumns,
    {
      accessorKey: "pointsPerGame",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>PPG</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Points Per Game</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.fantasyPoints / 17).toFixed(1),
    },
    {
      accessorKey: "lastWeekPoints",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Last Week</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last Week's Points</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => getLastWeekPoints(row.original.weeklyPoints),
    },
    {
      accessorKey: "last3Average",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Avg L3</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average Last 3 Games</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => calculateAverage(row.original.weeklyPoints, 3),
    },
    {
      accessorKey: "last5Average",
      header: ({ column }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`flex items-center gap-1 p-1 transition-colors ${
                column.getIsSorted()
                  ? "text-white"
                  : "text-muted-foreground hover:text-white active:text-white"
              }`}
              onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
            >
              <span>Avg L5</span>
              <div className="w-3 h-3 ml-1">
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average Last 5 Games</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => calculateAverage(row.original.weeklyPoints, 5),
    },
    {
      accessorKey: "opponent",
      header: "Opponent",
      cell: ({ row }) => {
        const difficulty = row.original.difficultyRating
        let colorClass = "text-green-500"
        let label = "Great"

        if (difficulty === 0) {
          return <span>{row.original.currentOpponent}</span>
        } else if (difficulty <= 2) {
          colorClass = "text-red-500"
          label = "Difficult"
        } else if (difficulty === 3) {
          colorClass = "text-orange-500"
          label = "Average"
        }

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-start cursor-pointer">
                <span>{row.original.currentOpponent}</span>
                <div className="flex items-start gap-0.5">
                  <SignalHigh className={`h-4 w-4 ${colorClass}`} />
                  <span className={`text-[11px] ${colorClass}`}>{label}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.opponentRank}</p>
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    ownershipColumn,
  ]

  // In your PlayersTable component, modify the table to use conditional columns
  const activeColumns = useMemo(() => {
    const nflColumnsWithOwnership = [
      ...columns.filter(col => col.accessorKey !== "ownership"),
      ownershipColumn
    ]
    return activeView === 'nfl' ? nflColumnsWithOwnership : fantasyColumns
  }, [activeView])

  // Update the table configuration
  const table = useReactTable({
    data: filteredPlayers,
    columns: activeColumns,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  console.log('6. Table row count:', table.getRowModel().rows.length)

  return (
    <>
      <TooltipProvider>
        <div>
          <div className="flex items-center justify-end gap-4 mb-4">
            <Tabs 
              value={activeView} 
              onValueChange={setActiveView}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nfl">NFL</TabsTrigger>
                <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <PositionFilter onChange={handlePositionChange} />
              <TableSearch
                value={globalFilter}
                onChange={setGlobalFilter}
                onClear={() => setGlobalFilter("")}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {table.getHeaderGroups().map((headerGroup) => (
                    headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-medium text-xs bg-muted/40">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow 
                      key={row.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setSelectedPlayer(row.original)
                        setIsDrawerOpen(true)
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableEmpty 
                    searchTerm={globalFilter} 
                    colSpan={columns.length} 
                  />
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length}>
                    <TablePagination
                      rowsPerPage={pageSize}
                      page={pageIndex}
                      totalRows={table.getFilteredRowModel().rows.length}
                      setRowsPerPage={(value) => 
                        setPagination((prev) => ({ ...prev, pageSize: value }))
                      }
                      setPage={(value) => 
                        setPagination((prev) => ({ ...prev, pageIndex: value }))
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </TooltipProvider>
      {selectedPlayer && (
        <PlayerDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          player={selectedPlayer}
        />
      )}
    </>
  )
} 