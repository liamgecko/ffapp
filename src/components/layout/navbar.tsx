import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Scores", href: "/scores" },
  { title: "Players", href: "/players" },
  { title: "Leagues", href: "/leagues" },
  { title: "Mock Draft", href: "/mock-draft" },
]

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (href: string) => {
    navigate(href)
  }

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <button 
          onClick={() => handleNavigation("/")} 
          className="text-xl font-bold"
        >
          NFL Fantasy
        </button>

        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              {mainNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "cursor-pointer",
                      location.pathname === item.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.title}
                  </button>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">john.doe@example.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 hover:!bg-red-200 dark:hover:!bg-red-200 dark:hover:!text-red-500">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 