export interface MessageData {
  author: {
    avatar: string
    id: string
    username: string
  }
  channel_id: string
  content: string
  guild_id: string
  id: string
}

export interface CKdata {
  active: number
  avatar_url: string
  username: string
  uid: string
  ck: string
}
