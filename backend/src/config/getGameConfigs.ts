export interface GameConfig {
    /** The app of caller */
    gameAppId: number
    /** The asset id of the utility token */
    gameAssetId: number
    /** The caller app-address */
    gameCallerAddress: string
    /** Base URL of the server, where the API is located */
    gameBaseUrl: string
    /** League number (API ID) exp. 80 */
    defaultLeague: number
    /** First Year of a season exp. 2023 */
    defaultSeason: number
}

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
    }
}
