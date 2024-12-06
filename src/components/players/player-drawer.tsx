import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer"
import { Avatar } from "@/components/ui/avatar"
import { Player } from "@/types/player"

interface PlayerDrawerProps {
  player: Player | null
  open: boolean
  onClose: () => void
}

export function PlayerDrawer({ player, open, onClose }: PlayerDrawerProps) {
  if (!player) return null

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {player.imageUrl ? (
              <img 
                src={player.imageUrl} 
                alt={player.name}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                {player.name.charAt(0)}
              </div>
            )}
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{player.name}</h2>
            <p className="text-sm text-muted-foreground">
              {player.team} · {player.position}
            </p>
          </div>
        </DrawerHeader>
        <div className="p-4">
          {/* Add player stats and other info here */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Fantasy Stats</h3>
              <div className="space-y-1 text-sm">
                <p>Fantasy Points: {player.fantasyPoints.toFixed(1)}</p>
                <p>Position Rank: {player.positionRank}</p>
                <p>Ownership: {player.ownership}%</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Season Stats</h3>
              <div className="space-y-1 text-sm">
                <p>Passing Yards: {player.passingYards}</p>
                <p>Rushing Yards: {player.rushingYards}</p>
                <p>Receiving Yards: {player.receivingYards}</p>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 