import { useWallet } from '@txnlab/use-wallet'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function ConnectMenu() {
  const { providers, activeAddress } = useWallet()

  return (
    <DropdownMenu>
      {activeAddress ? (
        <Button
          variant="ghost"
          className="bg-slate-950 hover:bg-slate-900 border border-slate-700 navbar-burger flex items-center p-3 text-xs"
          onClick={() => {
            if (providers) {
              const activeProvider = providers.find((p) => p.isActive)
              if (activeProvider) {
                activeProvider.disconnect().then(() => null)
              } else {
                localStorage.removeItem('txnlab-use-wallet')
                window.location.reload()
              }
            }
          }}
        >
          Logout
        </Button>
      ) : (
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="bg-slate-950 hover:bg-slate-900 border border-slate-700 navbar-burger flex items-center p-3 text-xs"
          >
            Connect Wallet
          </Button>
        </DropdownMenuTrigger>
      )}

      <DropdownMenuContent align="center" className="w-full">
        {providers?.map((provider) => (
          <DropdownMenuItem onClick={provider.connect} key={provider.metadata.id} className="w-full">
            <div className="flex items-center cursor-pointer mb-4 w-full">
              <img className="w-5 mr-6" alt={`${provider.metadata.name} icon`} src={provider.metadata.icon} width={28} height={28} />
              {provider.metadata.name} {provider.isActive && '[active]'}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
