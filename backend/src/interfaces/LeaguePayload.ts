export type LeaguePayload = {
  league_id: number,
  league_name: string,
  country: string,
  logo: string,
  flag: string,
  season: number
}

export type TeamImportPayload = {
  league_id: number,
  season: number
}

export type PlayerImportPayload = {
  team_id: number,
  season: number
}

export type Statistic = {
  appearances?: number,
  captain?: boolean,
  cardsred?: number,
  cardsyellow?: number,
  cardsyellowred?: number,
  createdAt: string,
  dribblesattempts?: number,
  dribblespast?: number,
  dribblessuccess?: number,
  duelstotal?: number,
  duelswon?: number,
  foulscommitted?: number,
  foulsdrawn?: number,
  goalsassists?: number,
  goalsconceded?: number,
  goalssaves?: number,
  goalstotal?: number,
  league_id?: number,
  lineups?: number,
  minutes?: number,
  number?: number,
  passesaccuracy?: number,
  passeskey?: number,
  passestotal?: number,
  penaltycommited?: number,
  penaltymissed?: number,
  penaltysaved?: number,
  penaltyscored?: number,
  penaltywon?: number,
  playerPlayerId: number,
  position?: string,
  rating?: number,
  season?: number,
  shotson?: number,
  shotstotal?: number,
  statistic_id: number,
  substitutesbench?: number,
  substitutesin?: number,
  substitutesout?: number,
  tacklesblocks?: number,
  tacklesinterceptions?: number,
  tacklestotal?: number,
  team_id: number,
  updatedAt: string,
}

export type PlayerPayload = {
  age?: number,
  birthcountry?: string,
  birthdate?: string,
  birthplace?: string,
  createdAt: string,
  firstname: string,
  height?: string,
  injured: boolean,
  lastname: string,
  name: string,
  nationality?: string,
  photo: string,
  player_id: number,
  statistics: Statistic[],
  updatedAt: string,
  weight?: string,
}

export type Properties = {
  player_id: number,
  season: number,
  team_id: number,
  league_id: number,
  firstname: string,
  lastname: string,
  birthdate?: string,
  nationality?: string,
  number?: number,
  position?: string,
}

export type MintPayload = {
  name: string,
  unit_name: string,
  total_supply: number,
  decimals: number,
  image: string,
  description: string,
  external_url: string,
  properties: Properties,
}

export type PinataResponse = {
  assetName: string,
  unitName: string,
  decimals: number,
  meta_cid: string,
  total: number,
  url: string,
}
