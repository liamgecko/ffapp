import { TableCell, TableRow } from "@/components/ui/table"
import { SearchX } from "lucide-react"

interface TableEmptyProps {
  searchTerm?: string
  colSpan?: number
}

export function TableEmpty({ searchTerm, colSpan }: TableEmptyProps) {
  return (
    <div className="text-center">
      {searchTerm ? (
        <p>No results found for "{searchTerm}"</p>
      ) : (
        <p>No data available</p>
      )}
    </div>
  )
} 