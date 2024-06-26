export interface sendMessage {
  content?: string
  embed?: MessageEmbed
  message_reference?: {
    message_id: string
    ignore_get_message_error: boolean = false
  }
  image?: string
  msg_id?: string
  event_id?: string
  markdown?: MessageMarkdown
  file_image?: ReadStream
}
interface MessageMarkdown {
  template_id: number
  params: {
    key: string
    values: Array<string>
  }
  content: string
}
interface MessageEmbed {
  title: string
  prompt: string
  thumbnail: { url: string }
  fields: { name: string }
}
