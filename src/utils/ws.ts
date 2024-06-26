import WebSocket from "@/client/ws"
import { watchSrPrivateMessage } from "@/plugins/starRail/privateSrMessage"
import { watchSrChannelMessage } from "@/plugins/starRail/starRail"
const ws = new WebSocket()
const funs: Function[] = [watchSrChannelMessage]

// 监听频道内的全部消息
ws.onMessage("GUILD_MESSAGES", async (data) => {
  // console.log(data)
  Promise.all(funs.map((i) => i(data)))
})
const privateMessage: Function[] = [watchSrPrivateMessage]
// 监听私信
ws.onMessage("DIRECT_MESSAGE", async (data) => {
  Promise.all(privateMessage.map((i) => i(data)))
})
