import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const POSITIONS = [
  { value: "ALL", label: "All Positions" },
  { value: "QB", label: "Quarterback" },
  { value: "RB", label: "Running Back" },
  { value: "WR", label: "Wide Receiver" },
  { value: "TE", label: "Tight End" },
  { value: "K", label: "Kicker" },
  { value: "DEF", label: "Defense" }
]

interface PositionFilterProps {
  onChange: (value: string) => void
}

export function PositionFilter({ onChange }: PositionFilterProps) {
  return (
    <Select onValueChange={onChange} defaultValue="ALL">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select position" />
      </SelectTrigger>
      <SelectContent>
        {POSITIONS.map(position => (
          <SelectItem key={position.value} value={position.value}>
            {position.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}