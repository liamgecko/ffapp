import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Player } from "@/types/player"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TableSearchProps {
  table: Table<Player>
}

export function TableSearch({ table }: TableSearchProps) {
  const value = table.getState().globalFilter ?? ""

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search players"
        value={value}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        className="w-[300px] pl-8 pr-8"
      />
      {value && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 h-full -translate-y-1/2 hover:bg-transparent"
                onClick={() => table.setGlobalFilter("")}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
} 