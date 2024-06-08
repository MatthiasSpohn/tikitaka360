import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { WalletsProvider } from '@/components/wallet/wallets-provider.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { Outlet } from 'react-router-dom'

export default function Root() {
    const queryClient = new QueryClient()

    return (
        <WalletsProvider>
            <QueryClientProvider client={queryClient}>
                <div className="relative flex min-h-screen flex-col">
                    <SiteHeader />
                    <Outlet />
                    <SiteFooter />
                    <Toaster />
                </div>
            </QueryClientProvider>
        </WalletsProvider>
    )
}
