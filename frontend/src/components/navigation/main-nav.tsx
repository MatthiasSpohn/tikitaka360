import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu'

export function MainNav() {
    return (
        <NavigationMenu className="hidden md:flex mr-6">
            <NavigationMenuList className="flex pl-8">

                <NavigationMenuItem>
                    <NavigationMenuLink href="/about"  className="mr-6">tikitaka<span className={"text-red-500"}>360°</span></NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink href="/" className="mr-6">Play</NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink href="/account"  className="mr-6">Account</NavigationMenuLink>
                </NavigationMenuItem>

            </NavigationMenuList>
        </NavigationMenu>
    )
}
