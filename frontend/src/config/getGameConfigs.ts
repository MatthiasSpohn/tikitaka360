import { GameConfig } from '@/interfaces/tikitaka.ts'

export function getGameConfigFromViteEnvironment(): GameConfig {
    if (!import.meta.env.VITE_APPID) {
        throw new Error('Attempt to get app data without specifying GAME_APPID in the environment variables')
    }

    return {
        gameAppId: import.meta.env.VITE_APPID,
        gameAssetId: import.meta.env.VITE_ASSET_ID,
        gameBaseUrl: import.meta.env.VITE_BASE_URL,
        gameCallerAddress: import.meta.env.VITE_CALLER_ADDRESS,
        defaultLeague: import.meta.env.VITE_DEFAULT_LEAGUE,
        defaultSeason: import.meta.env.VITE_DEFAULT_SEASON,
        defaultGateway: import.meta.env.VITE_PINATA_GATEWAY,
    }
}
