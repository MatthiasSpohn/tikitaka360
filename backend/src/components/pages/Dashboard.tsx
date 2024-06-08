import { lazy, useState, useTransition } from "react";
import { PanelLeft } from "lucide-react";
import { SettingsTrigger } from "@/components/partials/settings-trigger.tsx";
import { DashboardHome } from "@/components/partials/dashboard-home.tsx";
import { DashboardLeagues } from "@/components/partials/dashboard-leagues.tsx";
import { DashboardTeams } from "@/components/partials/dashboard-teams.tsx";
import { DashboardPlayer } from "@/components/partials/dashboard-player.tsx";
import { DashboardStatistics } from "@/components/partials/dashboard-statistics.tsx";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet.tsx";
import { Button } from "@/components/ui/button.tsx";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu.tsx";
import { AccountMenu } from "@/components/partials/account-menu.tsx";
import { MobileNav } from "@/components/partials/mobile-nav.tsx";
import ConnectMenu from "@/components/wallet/connect-menu.tsx";

const DashboardComponent = lazy(() =>
  import('@/components/pages/dashboard-component.tsx')
    .then(({ DashboardComponent }) => ({ default: DashboardComponent })),
);
const LeaguesComponent = lazy(() =>
  import('@/components/pages/leagues-component.tsx')
    .then(({ LeaguesComponent }) => ({ default: LeaguesComponent })),
);
const TeamsComponent = lazy(() =>
  import('@/components/pages/teams-component.tsx')
    .then(({ TeamsComponent }) => ({ default: TeamsComponent })),
);
const PlayerComponent = lazy(() =>
  import('@/components/pages/player-component.tsx')
    .then(({ PlayerComponent }) => ({ default: PlayerComponent })),
);
const StatisticsComponent = lazy(() =>
  import('@/components/pages/statistics-component.tsx')
    .then(({ StatisticsComponent }) => ({ default: StatisticsComponent })),
);

export function Dashboard() {
  const [, startTransition] = useTransition();
  const [home, setHome] = useState<boolean>(false);
  const [leagues, setLeague] = useState<boolean>(false);
  const [teams, setTeams] = useState<boolean>(false);
  const [players, setPlayers] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<boolean>(false);

  const loadHome = (value: boolean) => {
    setLeague(!value);
    setTeams(!value);
    setPlayers(!value);
    setStatistics(!value);
    startTransition(() => {
      setHome(value);
    });
  }

  const loadLeagues = (value: boolean) => {
    setHome(!value);
    setTeams(!value);
    setPlayers(!value);
    setStatistics(!value);
    startTransition(() => {
      setLeague(value);
    });
  }

  const loadTeams = (value: boolean) => {
    setHome(!value);
    setLeague(!value);
    setPlayers(!value);
    setStatistics(!value);
    startTransition(() => {
      setTeams(value);
    });
  }

  const loadPlayers = (value: boolean) => {
    setHome(!value);
    setLeague(!value);
    setTeams(!value);
    setStatistics(!value);
    startTransition(() => {
      setPlayers(value);
    });
  }

  const loadStatistics = (value: boolean) => {
    setHome(!value);
    setLeague(!value);
    setTeams(!value);
    setPlayers(!value);
    startTransition(() => {
      setStatistics(value);
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <NavigationMenu className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex" orientation="vertical">
        <NavigationMenuList className="flex flex-col items-center gap-4 px-2 py-4">
          <NavigationMenuItem>
            <DashboardHome active={home} isSelected={loadHome} />
          </NavigationMenuItem>

          <NavigationMenuItem>
            <DashboardLeagues active={leagues} isSelected={loadLeagues} />
          </NavigationMenuItem>

          <NavigationMenuItem>
            <DashboardTeams active={teams} isSelected={loadTeams} />
          </NavigationMenuItem>

          <NavigationMenuItem>
            <DashboardPlayer active={players} isSelected={loadPlayers} />
          </NavigationMenuItem>

          <NavigationMenuItem>
            <DashboardStatistics active={statistics} isSelected={loadStatistics} />
          </NavigationMenuItem>

        </NavigationMenuList>
        <SettingsTrigger />
      </NavigationMenu>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header
          className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <MobileNav
                home={home}
                loadHome={loadHome}
                leagues={leagues}
                loadLeagues={loadLeagues}
                teams={teams}
                loadTeams={loadTeams}
                players={players}
                loadPlayers={loadPlayers}
                statistics={statistics}
                loadStatistics={loadStatistics}
              />
            </SheetContent>
          </Sheet>
          <p className="w-full text-center text-red-800 font-bold">TikiTaka 360°</p>
          <ConnectMenu />
          <AccountMenu />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {home && <DashboardComponent />}
          {leagues && <LeaguesComponent />}
          {teams && <TeamsComponent />}
          {players && <PlayerComponent/>}
          {statistics && <StatisticsComponent reload={undefined}/>}
        </main>
      </div>
    </div>
  )
}
