import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu.tsx";
import { DashboardHome } from "@/components/partials/dashboard-home.tsx";
import { DashboardLeagues } from "@/components/partials/dashboard-leagues.tsx";
import { DashboardTeams } from "@/components/partials/dashboard-teams.tsx";
import { DashboardPlayer } from "@/components/partials/dashboard-player.tsx";
import { DashboardStatistics } from "@/components/partials/dashboard-statistics.tsx";

type Props = {
  home: boolean
  leagues: boolean
  teams: boolean
  players: boolean
  statistics: boolean
  loadHome: (arg0: boolean) => void
  loadLeagues: (arg0: boolean) => void
  loadTeams: (arg0: boolean) => void
  loadPlayers: (arg0: boolean) => void
  loadStatistics: (arg0: boolean) => void
}

export function MobileNav(props: Props) {
  return (
    <NavigationMenu orientation="vertical">
      <NavigationMenuList  className="grid gap-6 text-lg font-medium">
        <NavigationMenuItem>
          <DashboardHome active={props.home} isSelected={props.loadHome} />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <DashboardLeagues active={props.leagues} isSelected={props.loadLeagues} />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <DashboardTeams active={props.teams} isSelected={props.loadTeams} />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <DashboardPlayer active={props.players} isSelected={props.loadPlayers} />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <DashboardStatistics active={props.statistics} isSelected={props.loadStatistics} />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
