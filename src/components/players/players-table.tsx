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
import { useState, useMemo, useEffect, useCallback } from "react"
import { TablePagination } from "./players-table-pagination"
import { TableSearch } from "./players-table-search"
import { TableEmpty } from "./players-table-empty"
import { PositionFilter } from "./players-table-position-filter"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparklines, SparklinesLine, SparklinesReferenceLine } from 'react-sparklines'
import { PlayerDrawer } from "./player-drawer"
import { useQuery } from '@tanstack/react-query'
import { fetchPlayers } from '@/services/players'
import { Player } from '@/types/player'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

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

// Helper function to create a sortable header with tooltip
const createSortableHeader = (label: string, tooltip: string) => {
  return ({ column }: { column: any }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={`flex items-center gap-0.5 p-1 transition-colors ${
            column.getIsSorted()
              ? "text-white"
              : "text-muted-foreground hover:text-white active:text-white"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() !== "desc")}
        >
          <span>{label}</span>
          <div className="w-3 h-3">
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : null}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// Define base columns outside component
const createColumns = (getRankColor: (rank: string) => string, getOwnershipColor: (ownership: number) => string): ColumnDef<Player>[] => [
  {
    accessorKey: "name",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>Player</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Player Name</p>
        </TooltipContent>
      </Tooltip>
    ),
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
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>Rank</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Position Rank</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => (
      <div className={getRankColor(row.original.positionRank)}>
        {row.original.positionRank}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "fantasyPoints",
    header: createSortableHeader("Fpts", "Fantasy Points"),
    cell: ({ row }) => row.original.fantasyPoints.toFixed(1),
  },
  {
    accessorKey: "passingYards",
    header: createSortableHeader("Pass Yds", "Passing Yards"),
  },
  {
    accessorKey: "passingAttempts",
    header: createSortableHeader("Pass Att", "Passing Attempts"),
  },
  {
    accessorKey: "passingTouchdowns",
    header: createSortableHeader("Pass TD", "Passing Touchdowns"),
  },
  {
    accessorKey: "rushingYards",
    header: createSortableHeader("Rush Yds", "Rushing Yards"),
  },
  {
    accessorKey: "rushingAttempts",
    header: createSortableHeader("Rush Att", "Rushing Attempts"),
  },
  {
    accessorKey: "rushingTouchdowns",
    header: createSortableHeader("Rush TD", "Rushing Touchdowns"),
  },
  {
    accessorKey: "receivingYards",
    header: createSortableHeader("Rec Yds", "Receiving Yards"),
  },
  {
    accessorKey: "receptions",
    header: createSortableHeader("Rec", "Receptions"),
  },
  {
    accessorKey: "targets",
    header: createSortableHeader("Tgts", "Targets"),
  },
  {
    accessorKey: "receivingTouchdowns",
    header: createSortableHeader("Rec TD", "Receiving Touchdowns"),
  },
  {
    accessorKey: "ownership",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>% Owned</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Roster Percentage</p>
        </TooltipContent>
      </Tooltip>
    ),
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

// Define fantasy columns outside component
const createFantasyColumns = (sharedColumns: ColumnDef<Player>[]): ColumnDef<Player>[] => [
  ...sharedColumns,
  {
    accessorKey: "currentOpponent",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>Opponent</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Current Week Opponent</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      const opponent = row.original.currentOpponent
      const difficulty = row.original.difficultyRating

      let colorClass = ""
      let label = ""

      if (difficulty === 0) {
        return <span>{opponent}</span>
      } else if (difficulty <= 2) {
        colorClass = "text-red-500"
        label = "Difficult"
      } else if (difficulty === 3) {
        colorClass = "text-orange-500"
        label = "Average"
      } else {
        colorClass = "text-green-500"
        label = "Great"
      }

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={colorClass}>{opponent}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label} matchup</p>
          </TooltipContent>
        </Tooltip>
      )
    }
  },
  {
    accessorKey: "pointsPerGame",
    header: createSortableHeader("PPG", "Points Per Game"),
    cell: ({ row }) => (row.original.fantasyPoints / 17).toFixed(1),
  },
  {
    accessorKey: "lastWeekPoints",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>Last Week</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Points from Last Week</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => getLastWeekPoints(row.original.weeklyPoints),
  },
  {
    accessorKey: "last3Average",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>L3 Avg</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Average Points Last 3 Games</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => calculateAverage(row.original.weeklyPoints, 3),
  },
  {
    accessorKey: "last5Average",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>L5 Avg</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Average Points Last 5 Games</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => calculateAverage(row.original.weeklyPoints, 5),
  }
]

export function PlayersTable() {
  // 1. All useState hooks first
  const [sorting, setSorting] = useState<SortingState>([])
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeView, setActiveView] = useState("nfl")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedPosition, setSelectedPosition] = useState("ALL")

  // 2. useQuery hook
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers
  })

  // 3. Helper functions with useCallback
  const getRankColor = useCallback((positionRank: string) => {
    const rank = parseInt(positionRank.replace(/[A-Z]/g, ''))
    if (rank <= 12) return "text-green-500"
    if (rank >= 37 && rank <= 48) return "text-orange-500"
    if (rank > 48) return "text-red-500"
    return ""
  }, [])

  const getOwnershipColor = useCallback((ownership: number): string => {
    if (ownership >= 95) return "bg-emerald-500"
    if (ownership >= 85) return "bg-emerald-400"
    if (ownership >= 75) return "bg-lime-400"
    if (ownership >= 65) return "bg-yellow-400"
    if (ownership >= 55) return "bg-amber-500"
    if (ownership >= 45) return "bg-orange-500"
    if (ownership >= 35) return "bg-rose-400"
    return "bg-red-500"
  }, [])

  // 4. Create columns with memoized helpers
  const columns = useMemo(() => 
    createColumns(getRankColor, getOwnershipColor)
  , [getRankColor, getOwnershipColor])

  // 5. All useMemo hooks together
  const filteredPlayers = useMemo(() => {
    if (!players.length) return []
    return selectedPosition === "ALL" 
      ? players 
      : players.filter(player => player.position === selectedPosition)
  }, [players, selectedPosition])

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  // 6. Create shared columns (without ownership)
  const sharedColumns = useMemo(() => [
    columns.find(col => col.accessorKey === "name")!,
    columns.find(col => col.accessorKey === "positionRank")!,
    columns.find(col => col.accessorKey === "fantasyPoints")!,
  ], [columns])

  // 7. Create fantasy columns (with opponent second to last)
  const fantasyColumns = useMemo(() => [
    ...sharedColumns,
    {
      accessorKey: "pointsPerGame",
      header: createSortableHeader("PPG", "Points Per Game"),
      cell: ({ row }) => (row.original.fantasyPoints / 17).toFixed(1),
    },
    {
      accessorKey: "lastWeekPoints",
      header: () => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>Last Week</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Points from Last Week</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => getLastWeekPoints(row.original.weeklyPoints),
    },
    {
      accessorKey: "last3Average",
      header: () => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>L3 Avg</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average Points Last 3 Games</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => calculateAverage(row.original.weeklyPoints, 3),
    },
    {
      accessorKey: "last5Average",
      header: () => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>L5 Avg</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average Points Last 5 Games</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => calculateAverage(row.original.weeklyPoints, 5),
    },
    {
      accessorKey: "currentOpponent",
      header: () => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>Opponent</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Current Week Opponent</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => {
        const opponent = row.original.currentOpponent
        const difficulty = row.original.difficultyRating ?? 0

        let colorClass = ""
        let label = ""

        if (difficulty === 0) {
          return <span>{opponent}</span>
        } else if (difficulty <= 2) {
          colorClass = "text-red-500"
          label = "Difficult"
        } else if (difficulty === 3) {
          colorClass = "text-orange-500"
          label = "Average"
        } else {
          colorClass = "text-green-500"
          label = "Great"
        }

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={colorClass}>{opponent}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label} matchup</p>
            </TooltipContent>
          </Tooltip>
        )
      }
    },
    columns.find(col => col.accessorKey === "ownership")!, // Keep ownership as last column
  ], [sharedColumns, columns])

  // 8. Create table instance (not inside useMemo)
  const table = useReactTable({
    data: filteredPlayers,
    columns: activeView === 'nfl' ? columns : fantasyColumns,
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

  // 9. Loading state
  if (isLoading) {
    return <div className="text-center py-4">Loading players...</div>
  }

  // 10. Event handlers
  const handlePositionChange = (position: string) => {
    setSelectedPosition(position)
  }

  return (
    <TooltipProvider>
      <div>
        {/* Table Header Section */}
        <div className="flex items-center justify-end gap-2 pb-4">
          <Tabs 
            defaultValue="nfl" 
            onValueChange={value => setActiveView(value)}
          >
            <TabsList>
              <TabsTrigger value="nfl">NFL</TabsTrigger>
              <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
            </TabsList>
          </Tabs>

          <PositionFilter onChange={handlePositionChange} />
          <TableSearch table={table} />
        </div>

        {/* Table Content */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      setSelectedPlayer(row.original)
                      setIsDrawerOpen(true)
                    }}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <TableEmpty 
                      searchTerm={globalFilter} 
                      colSpan={columns.length}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <TablePagination table={table} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <PlayerDrawer 
          player={selectedPlayer} 
          open={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
        />
      </div>
    </TooltipProvider>
  )
} 