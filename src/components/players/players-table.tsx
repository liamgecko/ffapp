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
import { mockPlayers } from "@/data/mock-players"
import { ArrowUp, ArrowDown } from "lucide-react"
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
import { useState, useMemo } from "react"
import { TablePagination } from "./players-table-pagination"
import { TableSearch } from "./players-table-search"
import { TableEmpty } from "./players-table-empty"
import { PositionFilter } from "./players-table-position-filter"
import { cn } from "@/lib/utils"

export function PlayersTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "fantasyPoints", desc: true }
  ])

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [globalFilter, setGlobalFilter] = useState("")

  const playersWithRanks = useMemo(() => {
    const positionGroups = mockPlayers.reduce((groups, player) => {
      const position = player.position
      if (!groups[position]) {
        groups[position] = []
      }
      groups[position].push(player)
      return groups
    }, {} as Record<string, typeof mockPlayers>)

    return mockPlayers.map(player => {
      const positionGroup = positionGroups[player.position]
      const sortedGroup = [...positionGroup].sort((a, b) => b.fantasyPoints - a.fantasyPoints)
      const rank = sortedGroup.findIndex(p => p.name === player.name) + 1
      const prefix = player.position === "DEF" ? "D" : player.position
      return {
        ...player,
        positionRank: `${prefix}${rank}`
      }
    })
  }, [])

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

  const columns: ColumnDef<typeof mockPlayers[0]>[] = [
    {
      accessorKey: "name",
      header: "Player",
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-1.5">
            {row.original.name}
            {row.original.injury && (
              <span className={cn(
                "text-xs font-medium",
                row.original.injury === "Q" ? "text-orange-500" : "text-red-500"
              )}>
                {row.original.injury}
              </span>
            )}
          </div>
          <div className="text-[10px] font-normal text-muted-foreground">
            {row.original.position} {row.original.team} ({row.original.byeWeek})
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
  ]

  const table = useReactTable({
    data: filteredPlayers,
    columns,
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

  return (
    <TooltipProvider>
      <div>
        <div className="flex items-center justify-end gap-2 mb-4">
          <PositionFilter onChange={handlePositionChange} />
          <TableSearch
            value={globalFilter}
            onChange={setGlobalFilter}
            onClear={() => setGlobalFilter("")}
          />
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
  )
} 