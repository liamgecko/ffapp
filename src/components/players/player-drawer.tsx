import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Player } from "@/types/player"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface PlayerDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  player: Player
}

export function PlayerDrawer({ isOpen, onOpenChange, player }: PlayerDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] w-full border-t bg-background p-0 m-0"
        autoFocus={false}
      >
        <div className="flex flex-col h-full">
          <SheetHeader>
            <div className="container py-8">  
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={player.imageUrl} 
                    alt={player.name} 
                    className="object-cover"
                  />
                  <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-2xl font-bold">
                    {player.name}
                  </SheetTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{player.team}</span>
                    <span>•</span>
                    <span>{player.position}</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetHeader>
          
          <Separator className="my-4" />
          
          <div className="container py-8 flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex-1 mt-6 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="grid gap-4 pr-4">
                    {/* Quick Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">PPG</p>
                          <p className="text-2xl font-bold">
                            {(player.totalPoints / player.gamesPlayed).toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Points</p>
                          <p className="text-2xl font-bold">
                            {player.totalPoints}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Games Played</p>
                          <p className="text-2xl font-bold">{player.gamesPlayed}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upcoming Matchup */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming Matchup</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Opponent</p>
                            <p className="text-lg font-semibold">{player.nextGame?.opponent}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Week</p>
                            <p className="text-lg font-semibold">{player.nextGame?.week}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] bg-muted rounded-md">
                          {/* We can add a chart here using player.weeklyPoints */}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="stats" className="flex-1 mt-6">
                <ScrollArea className="h-full">
                  {/* Detailed Statistics Content */}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="news" className="flex-1 mt-6">
                <ScrollArea className="h-full">
                  {/* News Articles Content */}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analysis" className="flex-1 mt-6">
                <ScrollArea className="h-full">
                  {/* Advanced Analysis Content */}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 