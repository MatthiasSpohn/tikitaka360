import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu.tsx";
import { NavigationCommon } from "@/components/partials/navigation-common.tsx";

export function MobileNav() {
  return (
    <NavigationMenu orientation="vertical">
      <NavigationMenuList  className="grid gap-6 text-lg font-medium">
        <NavigationCommon />
      </NavigationMenuList>
    </NavigationMenu>
  )
}
