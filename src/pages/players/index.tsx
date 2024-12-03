import { PlayersTable } from "@/components/players/players-table"

export default function PlayersPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Players</h1>
      <PlayersTable />
    </div>
  )
} 