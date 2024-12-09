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
import axios from "axios"

// Move all helper functions to the top
const calculateAverage = (points: number[] = [], games: number) => {
  if (!points || points.length === 0) return "0.0"
  const recentGames = points.slice(-games)
  const total = recentGames.reduce((sum, p) => sum + p, 0)
  return (total / Math.min(games, recentGames.length)).toFixed(1)
}

const getLastWeekPoints = (points: number[] = []) => {
  if (!points || points.length === 0) return "0.0"
  return points[points.length - 1].toFixed(1)
}

const getRankColor = (positionRank: string) => {
  if (!positionRank) return "" // Add null check
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

export function PlayersTable() {
  // 1. All useState hooks
  const [players, setPlayers] = useState<CombinedPlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([{ id: "fantasyPoints", desc: true }])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeView, setActiveView] = useState("nfl")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [filteredPlayers, setFilteredPlayers] = useState<CombinedPlayerData[]>([])

  // 2. Define columns first
  const columns: ColumnDef<typeof players[0]>[] = [
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
              {row.original.team} · {row.original.position} {row.original.byeWeek ? `(${row.original.byeWeek})` : ''}
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
      cell: ({ row }) => {
        const points = row.original.fantasyPoints
        return points !== undefined ? points.toFixed(1) : "0.0"
      }
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
      cell: ({ row }) => {
        return (row.original.passingYards || 0).toLocaleString();
      },
      sortingFn: 'passingYards'
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
      cell: ({ row }) => {
        return (row.original.passingAttempts || 0).toLocaleString();
      },
      sortingFn: 'passingAttempts'
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
      cell: ({ row }) => {
        return (row.original.passingTouchdowns || 0).toLocaleString();
      },
      sortingFn: 'passingTouchdowns'
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
      cell: ({ row }) => {
        return (row.original.rushingYards || 0).toLocaleString();
      },
      sortingFn: 'rushingYards'
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
      cell: ({ row }) => {
        return (row.original.rushingAttempts || 0).toLocaleString();
      },
      sortingFn: 'rushingAttempts'
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
      cell: ({ row }) => {
        return (row.original.rushingTouchdowns || 0).toLocaleString();
      },
      sortingFn: 'rushingTouchdowns'
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
      cell: ({ row }) => {
        return (row.original.receivingYards || 0).toLocaleString();
      },
      sortingFn: 'receivingYards'
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
      cell: ({ row }) => {
        return (row.original.receptions || 0).toLocaleString();
      },
      sortingFn: 'receptions'
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
      cell: ({ row }) => {
        return (row.original.targets || 0).toLocaleString();
      },
      sortingFn: 'targets'
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
      cell: ({ row }) => {
        return (row.original.receivingTouchdowns || 0).toLocaleString();
      },
      sortingFn: 'receivingTouchdowns'
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

  // 3. Get ownership column
  const ownershipColumn = columns.find(col => col.accessorKey === "ownership")!

  // 4. Define defense columns
  const defenseColumns: ColumnDef<typeof players[0]>[] = [
    columns.find(col => col.accessorKey === "name")!,
    columns.find(col => col.accessorKey === "positionRank")!,
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
      cell: ({ row }) => {
        const points = row.original.fantasyPoints
        return points !== undefined ? points.toFixed(1) : "0.0"
      }
    },
    {
      accessorKey: "pointsAllowed",
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
              <span>PA</span>
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
            <p>Points Allowed</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.pointsAllowed || 0).toLocaleString(),
      sortingFn: 'pointsAllowed'
    },
    {
      accessorKey: "sacks",
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
              <span>Sacks</span>
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
            <p>Total Sacks</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.sacks || 0).toLocaleString(),
      sortingFn: 'sacks'
    },
    {
      accessorKey: "interceptions",
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
              <span>INT</span>
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
            <p>Interceptions</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.interceptions || 0).toLocaleString(),
      sortingFn: 'interceptions'
    },
    {
      accessorKey: "forcedFumbles",
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
              <span>FF</span>
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
            <p>Forced Fumbles</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.forcedFumbles || 0).toLocaleString(),
      sortingFn: 'forcedFumbles'
    },
    {
      accessorKey: "fumbleRecoveries",
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
              <span>FR</span>
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
            <p>Fumble Recoveries</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.fumbleRecoveries || 0).toLocaleString(),
      sortingFn: 'fumbleRecoveries'
    },
    {
      accessorKey: "safeties",
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
              <span>SAF</span>
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
            <p>Safeties</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.safeties || 0).toLocaleString(),
      sortingFn: 'safeties'
    },
    {
      accessorKey: "defensiveTouchdowns",
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
              <span>DEF TD</span>
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
            <p>Defensive Touchdowns</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.defensiveTouchdowns || 0).toLocaleString(),
      sortingFn: 'defensiveTouchdowns'
    },
    {
      accessorKey: "specialTeamsTouchdowns",
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
              <span>ST TD</span>
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
            <p>Special Teams Touchdowns</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.specialTeamsTouchdowns || 0).toLocaleString(),
      sortingFn: 'specialTeamsTouchdowns'
    },
    {
      accessorKey: "blockedKicks",
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
              <span>BLK</span>
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
            <p>Blocked Kicks</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.blockedKicks || 0).toLocaleString(),
      sortingFn: 'blockedKicks'
    },
    ownershipColumn
  ]

  // 5. Define kicker columns
  const kickerColumns: ColumnDef<typeof players[0]>[] = [
    columns.find(col => col.accessorKey === "name")!,
    columns.find(col => col.accessorKey === "positionRank")!,
    columns.find(col => col.accessorKey === "fantasyPoints")!,
    {
      accessorKey: "fieldGoalsMade",
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
              <span>FGM</span>
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
            <p>Field Goals Made</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => row.original.fieldGoalsMade?.toLocaleString() || '0',
      sortingFn: 'fieldGoalsMade'
    },
    {
      accessorKey: "fieldGoalPercentage",
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
              <span>FG%</span>
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
            <p>Field Goal Percentage</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => {
        const made = row.original.fieldGoalsMade || 0;
        const attempted = row.original.fieldGoalsAttempted || 0;
        const percentage = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
        return `${percentage}%`;
      },
      sortingFn: 'fieldGoalPercentage'
    },
    {
      accessorKey: "fieldGoalsAttempted",
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
              <span>FGA</span>
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
            <p>Field Goals Attempted</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.fieldGoalsAttempted || 0).toLocaleString(),
      sortingFn: 'fieldGoalsAttempted'
    },
    {
      accessorKey: "fieldGoalsUnder30",
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
              <span>&lt;30</span>
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
            <p>Field Goals Under 30 Yards</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.fieldGoalsUnder30 || 0).toLocaleString(),
      sortingFn: 'fieldGoalsUnder30'
    },
    {
      accessorKey: "fieldGoals30to39",
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
              <span>30-39</span>
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
            <p>Field Goals 30-39 Yards</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.fieldGoals30to39 || 0).toLocaleString(),
      sortingFn: 'fieldGoals30to39'
    },
    {
      accessorKey: "fieldGoals40to49",
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
              <span>40-49</span>
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
            <p>Field Goals 40-49 Yards</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.fieldGoals40to49 || 0).toLocaleString(),
      sortingFn: 'fieldGoals40to49'
    },
    {
      accessorKey: "fieldGoals50Plus",
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
              <span>50+</span>
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
            <p>Field Goals 50+ Yards</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.fieldGoals50Plus || 0).toLocaleString(),
      sortingFn: 'fieldGoals50Plus'
    },
    {
      accessorKey: "extraPointsMade",
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
              <span>XPM</span>
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
            <p>Extra Points Made</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => row.original.extraPointsMade?.toLocaleString() || '0',
      sortingFn: 'extraPointsMade'
    },
    {
      accessorKey: "extraPointPercentage",
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
              <span>XP%</span>
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
            <p>Extra Point Percentage</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => {
        const made = row.original.extraPointsMade || 0;
        const attempted = row.original.extraPointsAttempted || 0;
        const percentage = attempted > 0 ? ((made / attempted) * 100).toFixed(1) : '0.0';
        return `${percentage}%`;
      },
      sortingFn: 'extraPointPercentage'
    },
    {
      accessorKey: "extraPointsAttempted",
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
              <span>XPA</span>
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
            <p>Extra Points Attempted</p>
          </TooltipContent>
        </Tooltip>
      ),
      cell: ({ row }) => (row.original.extraPointsAttempted || 0).toLocaleString(),
      sortingFn: 'extraPointsAttempted'
    },
    ownershipColumn
  ]

  // 6. Define shared columns
  const sharedColumns: ColumnDef<typeof players[0]>[] = [
    columns.find(col => col.accessorKey === "name")!,
    columns.find(col => col.accessorKey === "positionRank")!,
    columns.find(col => col.accessorKey === "fantasyPoints")!,
  ]

  // 7. Define fantasy columns
  const fantasyColumns: ColumnDef<typeof players[0]>[] = [
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

  // 8. Define active columns
  const activeColumns = useMemo(() => {
    if (activeView === 'fantasy') {
      return fantasyColumns;
    } else {
      if (filteredPlayers.length > 0) {
        if (filteredPlayers[0].position === 'K') {
          return kickerColumns;
        } else if (filteredPlayers[0].position === 'DEF') {
          return defenseColumns;
        }
      }
      const nflColumnsWithOwnership = [
        ...columns.filter(col => col.accessorKey !== "ownership"),
        ownershipColumn
      ];
      return nflColumnsWithOwnership;
    }
  }, [activeView, filteredPlayers, columns, fantasyColumns, kickerColumns, defenseColumns]);

  // 9. All useMemo hooks
  const playersWithRanks = useMemo(() => {
    if (!players.length) return []
    const positionGroups = players.reduce((groups, player) => {
      const position = player.position
      if (!groups[position]) {
        groups[position] = []
      }
      groups[position].push(player)
      return groups
    }, {} as Record<string, typeof players>)

    return players.map(player => {
      const positionGroup = positionGroups[player.position]
      const sortedGroup = [...positionGroup].sort((a, b) => b.fantasyPoints - a.fantasyPoints)
      const rank = sortedGroup.findIndex(p => p.name === player.name) + 1
      const prefix = player.position === "DEF" ? "D" : player.position
      return {
        ...player,
        positionRank: `${prefix}${rank}`
      }
    })
  }, [players])

  const paginationValue = useMemo(() => ({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  }), [pagination.pageIndex, pagination.pageSize])

  // 10. Table configuration
  const table = useReactTable({
    data: filteredPlayers,
    columns: activeColumns,
    state: {
      sorting,
      pagination: paginationValue,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    sortingFns: {
      fieldGoalsMade: (rowA, rowB) => {
        const a = rowA.original.fieldGoalsMade ?? 0;
        const b = rowB.original.fieldGoalsMade ?? 0;
        return b - a;
      },
      fieldGoalsAttempted: (rowA, rowB) => {
        const a = rowA.original.fieldGoalsAttempted ?? 0;
        const b = rowB.original.fieldGoalsAttempted ?? 0;
        return b - a;
      },
      fieldGoalPercentage: (rowA, rowB) => {
        const aFGM = rowA.original.fieldGoalsMade ?? 0;
        const aFGA = rowA.original.fieldGoalsAttempted ?? 0;
        const bFGM = rowB.original.fieldGoalsMade ?? 0;
        const bFGA = rowB.original.fieldGoalsAttempted ?? 0;
        
        const aPercentage = aFGA > 0 ? (aFGM / aFGA * 100) : 0;
        const bPercentage = bFGA > 0 ? (bFGM / bFGA * 100) : 0;
        
        return bPercentage - aPercentage;
      },
      // Offensive stats
      passingYards: (rowA, rowB) => {
        const a = rowA.original.passingYards ?? 0;
        const b = rowB.original.passingYards ?? 0;
        return b - a;
      },
      passingTouchdowns: (rowA, rowB) => {
        const a = rowA.original.passingTouchdowns ?? 0;
        const b = rowB.original.passingTouchdowns ?? 0;
        return b - a;
      },
      rushingYards: (rowA, rowB) => {
        const a = rowA.original.rushingYards ?? 0;
        const b = rowB.original.rushingYards ?? 0;
        return b - a;
      },
      rushingTouchdowns: (rowA, rowB) => {
        const a = rowA.original.rushingTouchdowns ?? 0;
        const b = rowB.original.rushingTouchdowns ?? 0;
        return b - a;
      },
      receptions: (rowA, rowB) => {
        const a = rowA.original.receptions ?? 0;
        const b = rowB.original.receptions ?? 0;
        return b - a;
      },
      receivingYards: (rowA, rowB) => {
        const a = rowA.original.receivingYards ?? 0;
        const b = rowB.original.receivingYards ?? 0;
        return b - a;
      },
      receivingTouchdowns: (rowA, rowB) => {
        const a = rowA.original.receivingTouchdowns ?? 0;
        const b = rowB.original.receivingTouchdowns ?? 0;
        return b - a;
      },
    }
  })

  // 11. useEffect hooks
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/players/2024')
        console.log('Total players:', response.data.length);
        console.log('Players by position:', {
          QB: response.data.filter(p => p.position === 'QB').length,
          RB: response.data.filter(p => p.position === 'RB').length,
          WR: response.data.filter(p => p.position === 'WR').length,
          TE: response.data.filter(p => p.position === 'TE').length,
          K: response.data.filter(p => p.position === 'K').length,
          DEF: response.data.filter(p => p.position === 'DEF').length,
        });
        console.log('Defense players:', response.data.filter(p => p.position === 'DEF'));
        setPlayers(response.data)
        setFilteredPlayers(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch players')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // 12. Event handlers
  const handlePositionChange = useCallback((position: string) => {
    if (position === "ALL") {
      setFilteredPlayers(playersWithRanks)
    } else {
      setFilteredPlayers(playersWithRanks.filter(player => player.position === position))
    }
  }, [playersWithRanks])

  // 5. Render
  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading players...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">Error: {error}</div>
  }

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
                      rowsPerPage={pagination.pageSize}
                      page={pagination.pageIndex}
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