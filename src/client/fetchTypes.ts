export interface ReturnFetch<T> {
  result: T
  code: number
  success: number
}
export interface SendMessage {
  id: string
  channel_id: string
  guild_id: string
  content: string
}
export interface getway {
  url: string
}
