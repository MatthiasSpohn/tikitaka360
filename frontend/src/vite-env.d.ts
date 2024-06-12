/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENVIRONMENT: string

    readonly VITE_ALGOD_TOKEN: string
    readonly VITE_ALGOD_SERVER: string
    readonly VITE_ALGOD_PORT: string
    readonly VITE_ALGOD_NETWORK: string

    readonly VITE_INDEXER_TOKEN: string
    readonly VITE_INDEXER_SERVER: string
    readonly VITE_INDEXER_PORT: string

    readonly VITE_KMD_TOKEN: string
    readonly VITE_KMD_SERVER: string
    readonly VITE_KMD_PORT: string
    readonly VITE_KMD_PASSWORD: string
    readonly VITE_KMD_WALLET: string

    readonly VITE_APPID: number
    readonly VITE_ASSET_ID: number
    readonly VITE_BASE_URL: string
    readonly VITE_CALLER_ADDRESS: string
    readonly VITE_DEFAULT_LEAGUE: number
    readonly VITE_DEFAULT_SEASON: number
    readonly VITE_PINATA_GATEWAY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
