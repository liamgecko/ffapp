import { Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/layout/navbar"

// Page imports
import DashboardPage from "@/pages/dashboard"
import ScoresPage from "@/pages/scores"
import PlayersPage from "@/pages/players"
import LeaguesPage from "@/pages/leagues"
import MockDraftPage from "@/pages/mock-draft"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scores" element={<ScoresPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        <Route path="/mock-draft" element={<MockDraftPage />} />
      </Routes>
    </div>
  )
}

export default App
