export interface PlayerObject {
    player_id: number
    name: string
    firstname?: string
    lastname?: string
    age?: number
    birthdate?: string
    birthplace?: string
    birthcountry?: string
    nationality?: string
    height?: string
    weight?: string
    injured?: number
    photo?: string
    team_id?: number
    season?: number
    league_id?: number
    appearences?: number
    lineups?: number
    minutes?: number
    number?: number
    position?: string
    rating?: number
    captain?: number
    substitutesin?: number
    substitutesout?: number
    substitutesbench?: number
    shotstotal?: number
    shotson?: number
    goalstotal?: number
    goalsconceded?: number
    goalsassists?: number
    goalssaves?: number
    passestotal?: number
    passeskey?: number
    passesaccuracy?: number
    tacklestotal?: number
    tacklesblocks?: number
    tacklesinterceptions?: number
    duelstotal?: number
    duelswon?: number
    dribblesattempts?: number
    dribblessuccess?: number
    dribblespast?: number
    foulsdrawn?: number
    foulscommitted?: number
    cardsyellow?: number
    cardsyellowred?: number
    cardsred?: number
    penaltywon?: number
    penaltycommited?: number
    penaltyscored?: number
    penaltymissed?: number
    penaltysaved?: number
}

export interface TeamVenue {
    team_id: number
    league_id: number
    name?: string
    code?: string
    country?: string
    founded?: number
    national?: number
    logo?: string
    venue_id?: number
    venue_name?: string
    address?: string
    city?: string
    capacity?: number
    surface?: string
    image?: string
}

export type PropertiesType = {
    player_id: number,
    season: number,
    team_id: number,
    league_id: number,
    firstname: string,
    lastname: string,
    birthdate: string,
    nationality: string,
    number: number,
    position: string
}

export type NftType = {
    description: string,
    external_url: string,
    image: string,
    image_integrity: string,
    image_mimetype: string,
    name: string,
    properties: PropertiesType
}

