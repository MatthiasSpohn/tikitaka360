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
    /** Name of the pinata gateway */
    defaultGateway: string
}

export interface Statistic {
    appearances: number | null
    captain: boolean
    cardsred: number | null
    cardsyellow: number | null
    cardsyellowred: number | null
    createdAt: string
    dribblesattempts: number | null
    dribblespast: number | null
    dribblessuccess: number | null
    duelstotal: number | null
    duelswon: number | null
    foulscommitted: number | null
    foulsdrawn: number | null
    goalsassists: number | null
    goalsconceded: number | null
    goalssaves: number | null
    goalstotal: number | null
    league_id: number | null
    lineups: number | null
    minutes: number | null
    number: number | null
    passesaccuracy: number | null
    passeskey: number | null
    passestotal: number | null
    penaltycommited: number | null
    penaltymissed: number | null
    penaltysaved: number | null
    penaltyscored: number | null
    penaltywon: number | null
    playerPlayerId: number | null
    position: string
    rating: number | null
    season: number | null
    shotson: number | null
    shotstotal: number | null
    statistic_id: number | null
    substitutesbench: number | null
    substitutesin: number | null
    substitutesout: number | null
    tacklesblocks: number | null
    tacklesinterceptions: number | null
    tacklestotal: number | null
    team_id: number | null
    updatedAt: string
}

export interface TeamPlayer {
    createdAt: string
    playerPlayerId: number
    season: number
    teamTeamId: number
    updatedAt: string
}

export interface PlayerObject {
    age: number
    birthcountry: string
    birthdate: string
    birthplace: string
    createdAt: string
    firstname: string
    height: string
    injured: boolean
    lastname: string
    name: string
    nationality: string
    photo: string
    player_id: number
    statistics: Statistic[]
    team_players: TeamPlayer[]
    weight: string
}

export interface Venue {
    address: string
    capacity: number
    city: string
    createdAt: string
    image: string
    surface: string
    updatedAt: string
    venue_id: number
    venue_name: string
}

export interface TeamVenue {
    code: string
    country: string
    createdAt: string
    founded: number
    leagueLeagueId: number
    logo: string
    national: boolean
    team_id: number
    team_name: string
    updatedAt: string
    venue: Venue
}

export type PropertiesType = {
    player_id: number
    season: number
    team_id: number
    league_id: number
    firstname: string
    lastname: string
    birthdate: string
    nationality: string
    number: number
    position: string
}

export type NftType = {
    description: string
    external_url: string
    image: string
    image_integrity: string
    image_mimetype: string
    name: string
    properties: PropertiesType
}

export type Ratings = {
    dribbling: number
    passing: number
    tackling: number
    fairplay: number
    agility: number
    acceleration: number
    concentration: number
}

export type OraclePayload = {
    player_id: number
    potential: number | undefined
    ratings: Ratings | undefined
    weight: number
}
