import { ThemeProvider } from "@/components/theme-provider"
import { Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletsProvider } from "@/components/wallet/wallets-provider.tsx";
import { Toaster } from "@/components/ui/sonner"

function App() {
  const queryClient = new QueryClient()

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <WalletsProvider>
        <QueryClientProvider client={queryClient}>
          <div className="relative flex min-h-screen flex-col">
            <Outlet />
          </div>
          <Toaster richColors/>
        </QueryClientProvider>
      </WalletsProvider>
    </ThemeProvider>
  )
}

export default App
