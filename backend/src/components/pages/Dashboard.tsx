import { PanelLeft } from "lucide-react";
import { SettingsTrigger } from "@/components/partials/settings-trigger.tsx";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuViewport
} from "@/components/ui/navigation-menu.tsx";
import { AccountMenu } from "@/components/partials/account-menu.tsx";
import { MobileNav } from "@/components/partials/mobile-nav.tsx";
import ConnectMenu from "@/components/wallet/connect-menu.tsx";
import { Outlet } from "react-router-dom";
import { NavigationCommon } from "@/components/partials/navigation-common.tsx";

export function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <NavigationMenu className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex" orientation="vertical">
        <NavigationMenuList className="flex flex-col items-center gap-4 px-2 py-4">
          <NavigationCommon />
        </NavigationMenuList>
        <SettingsTrigger />
        <NavigationMenuViewport className="NavigationMenuViewport" />
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
              <MobileNav />
            </SheetContent>
          </Sheet>
          <p className="w-full text-center text-red-800 font-bold">TikiTaka 360°</p>
          <ConnectMenu />
          <AccountMenu />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
