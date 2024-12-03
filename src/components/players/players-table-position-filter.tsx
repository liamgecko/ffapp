import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ListFilter } from "lucide-react"

export function PositionFilter({ onChange }: { onChange: (position: string) => void }) {
  return (
    <Select onValueChange={onChange} defaultValue="ALL">
      <SelectTrigger className="w-[180px]">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4" />
          <SelectValue placeholder="Position" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Positions</SelectItem>
        <SelectItem value="QB">Quarterback</SelectItem>
        <SelectItem value="RB">Running Back</SelectItem>
        <SelectItem value="WR">Wide Receiver</SelectItem>
        <SelectItem value="TE">Tight End</SelectItem>
        <SelectItem value="K">Kicker</SelectItem>
        <SelectItem value="DEF">Defense</SelectItem>
      </SelectContent>
    </Select>
  )
}