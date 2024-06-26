export interface starRailPath {
  role: { [key: string]: string }
  "guide for role": { [key: string]: string }
  relic: { [key: string]: string }
  enemy: { [key: string]: string }
  lightcone: { [key: string]: string }
}

export interface OthernameJson {
  //   role: { [key: string]: string[] }
  //   "guide for role": { [key: string]: string[] }
  //   relic: { [key: string]: string[] }
  //   enemy: { [key: string]: string[] }
  //   lightcone: { [key: string]: string[] }
  [key: string]: string[]
}
export interface JumpRecord {
  list: {
    gacha_id: number
    gacha_type: number
    item_id: number
    count: number
    time: string
    name: string
    item_type: string
    rank_type: number
    id: number
  }[]
}
