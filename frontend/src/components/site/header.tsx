import { MainNav } from '@/components/navigation/main-nav'
import { MobileNav } from '@/components/navigation/mobile-nav'
import ConnectMenu from '@/components/wallet/connect-menu'

export function SiteHeader() {
    return (
        <header className="supports-backdrop-blur:bg-background sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between flex-wrap h-14">
                <MainNav />
                <div className="flex flex-1 items-center justify-end space-x-2 mr-2">
                    <ConnectMenu />
                    <MobileNav />
                </div>
            </div>
        </header>
    )
}
