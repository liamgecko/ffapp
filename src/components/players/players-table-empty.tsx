import { TableCell, TableRow } from "@/components/ui/table"
import { SearchX } from "lucide-react"

interface TableEmptyProps {
  searchTerm: string
  colSpan: number
}

export function TableEmpty({ searchTerm, colSpan }: TableEmptyProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <SearchX className="h-8 w-8 mb-2" />
          <span className="text-sm">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : "No results found"}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
} 