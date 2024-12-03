import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
} from "@tanstack/react-table"
import { useState } from "react"

export function PlayersTable() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "fantasyPoints", desc: true }
  ])

  const columns: ColumnDef<typeof mockPlayers[0]>[] = [
    {
      accessorKey: "name",
      header: "Player",
      cell: ({ row }) => (
        <div>
          <div>{row.original.name}</div>
          <div className="text-[10px] font-normal text-muted-foreground">
            {row.original.team} • {row.original.position} {row.original.byeWeek}
          </div>
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
    data: mockPlayers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
            {table.getRowModel().rows.map((row) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
} 