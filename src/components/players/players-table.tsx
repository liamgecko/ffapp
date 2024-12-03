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

export function PlayersTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TooltipProvider>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Player</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Player</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Fpts</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fantasy Points</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Pass Yds</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Passing Yards</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Pass Att</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Passing Attempts</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Pass TD</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Passing Touchdowns</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Rush Yds</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rushing Yards</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Rush Att</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rushing Attempts</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Rush TD</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rushing Touchdowns</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Rec Yds</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Receiving Yards</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Rec</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Receptions</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Tgts</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Targets</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="font-medium text-xs bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>Rec TD</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Receiving Touchdowns</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            </TooltipProvider>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPlayers.map((player) => (
            <TableRow 
              key={player.id}
              className="hover:bg-muted/50 cursor-pointer"
            >
              <TableCell className="font-medium">
                <div>
                  <div>{player.name}</div>
                  <div className="text-[10px] font-normal text-muted-foreground">
                    {player.team} • {player.position} {player.byeWeek}
                  </div>
                </div>
              </TableCell>
              <TableCell>{player.fantasyPoints.toFixed(1)}</TableCell>
              <TableCell>{player.passingYards}</TableCell>
              <TableCell>{player.passingAttempts}</TableCell>
              <TableCell>{player.passingTouchdowns}</TableCell>
              <TableCell>{player.rushingYards}</TableCell>
              <TableCell>{player.rushingAttempts}</TableCell>
              <TableCell>{player.rushingTouchdowns}</TableCell>
              <TableCell>{player.receivingYards}</TableCell>
              <TableCell>{player.receptions}</TableCell>
              <TableCell>{player.targets}</TableCell>
              <TableCell>{player.receivingTouchdowns}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 