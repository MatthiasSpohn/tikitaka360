import { NavigationMenuLink, NavigationMenuItem } from "@/components/ui/navigation-menu.tsx";
import { Group, Home, LineChart, User, Users2 } from "lucide-react";
import { useState } from "react";

export function NavigationCommon() {
  const [homeSelected, setHomeSelected] = useState<boolean>(false);
  const [leaguesSelected, setLeaguesSelected] = useState<boolean>(false);
  const [teamsSelected, setTeamsSelect] = useState<boolean>(false);
  const [playersSelected, setPlayersSelected] = useState<boolean>(false);
  const [statisticsSelected, setStatisticsSelected] = useState<boolean>(false);

  return (
    <>
      <NavigationMenuItem>
        <NavigationMenuLink
          href={"/dashboard"}
          className={`flex items-center rounded-lg ${homeSelected ? "text-white-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer`}
          onSelect={() => setHomeSelected(true)}>
          <Home className="h-5 w-5 sm:hidden md:flex" />
          <span className="sm:flex ml-5 md:hidden">Dashboard</span>
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink
          href={"/dashboard/leagues"}
          className={`flex items-center rounded-lg ${leaguesSelected ? "text-white-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer`}
          onSelect={() => setLeaguesSelected(true)}>
          <Group className="h-5 w-5 sm:hidden md:flex" />
          <span className="sm:flex ml-5 md:hidden">Leagues</span>
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink
          href={"/dashboard/teams/2023/140"}
          className={`flex items-center rounded-lg ${teamsSelected ? "text-white-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer`}
          onSelect={() => setTeamsSelect(true)}>
          <Users2 className="h-5 w-5 sm:hidden md:flex" />
          <span className="sm:flex ml-5 md:hidden">Teams</span>
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink
          href={"/dashboard/players/2023/1"}
          className={`flex items-center rounded-lg ${playersSelected ? "text-white-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer`}
          onSelect={() => setPlayersSelected(true)}>
          <User className="h-5 w-5 sm:hidden md:flex" />
          <span className="sm:flex ml-5 md:hidden">Players</span>
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink
          href={"/dashboard/statistics"}
          className={`flex items-center rounded-lg ${statisticsSelected ? "text-white-foreground" : "text-muted-foreground"} transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer`}
          onSelect={() => setStatisticsSelected(true)}>
          <LineChart className="h-5 w-5 sm:hidden md:flex" />
          <span className="sm:flex ml-5 md:hidden">Statistics</span>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </>
  )
}
