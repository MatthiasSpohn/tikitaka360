import { WalletProvider, useInitializeProviders, PROVIDER_ID, ProvidersArray } from '@txnlab/use-wallet'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { ReactNode } from 'react'
import algosdk from 'algosdk'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from "@/utils/network/getAlgoClientConfigs.ts"
type RootLayoutProps = { children: ReactNode }

export function WalletsProvider({ children }: RootLayoutProps) {
  let providersArray: ProvidersArray

  if (import.meta.env.VITE_ALGOD_NETWORK === '') {
    const kmdConfig = getKmdConfigFromViteEnvironment()
    providersArray = [
      {
        id: PROVIDER_ID.KMD,
        clientOptions: {
          wallet: kmdConfig.wallet,
          password: kmdConfig.password,
          host: kmdConfig.server,
          token: String(kmdConfig.token),
          port: String(kmdConfig.port),
        },
      },
    ]
  } else {
    providersArray = [
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
    ]
  }
  const algodConfig = getAlgodConfigFromViteEnvironment()

  const walletProviders = useInitializeProviders({
    providers: providersArray,
    nodeConfig: {
      network: algodConfig.network,
      nodeServer: algodConfig.server,
      nodePort: String(algodConfig.port),
      nodeToken: String(algodConfig.token),
    },
    algosdkStatic: algosdk,
  })

  //https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=eur%2Cusd
  return <WalletProvider value={walletProviders}>{children}</WalletProvider>
}
