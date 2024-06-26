import redis from "@/utils/redis"
import { getToken } from "@/utils/util"
import WebSocket from "ws"
import { getGatewayApi } from "./fetch"
// import { getGatewayApi } from "./openapis"
type Event = "GUILD_MESSAGES" | "MESSAGE_AUDIT" | "DIRECT_MESSAGE"

interface Callback {
  [key: string]: ((data: string) => void) | null
}
class WebSocketClient {
  private ws!: WebSocket
  private heartbeatInterval: NodeJS.Timeout | null = null
  private reconnectStimer: NodeJS.Timeout | null = null
  private delay: number = 2
  private recommect: boolean = false
  private messageCallback: ((data: string) => void) | null = null
  private callback: Callback = {
    GUILD_MESSAGES: null,
    MESSAGE_AUDIT: null,
  }
  private messageEvent: { [key: string]: string[] } = {
    GUILD_MESSAGES: ["MESSAGE_CREATE", "MESSAGE_DELETE"],
    MESSAGE_AUDIT: ["MESSAGE_AUDIT_PASS", "MESSAGE_AUDIT_REJECT"],
    DIRECT_MESSAGE: ["DIRECT_MESSAGE_CREATE", "DIRECT_MESSAGE_DELETE"],
  }
  constructor() {
    this.connect()
  }
  private async connect() {
    console.log("开始连接")
    try {
      const res = await getGatewayApi()
      if (!res.success) return
      const url = res.result.url
      this.ws = new WebSocket(url)

      this.ws.on("open", () => this.openStatus())
      this.ws.on("error", () => this.closeStatus())
      this.ws.on("close", () => this.closeStatus())
      this.ws.on("message", (data: string) => this.handleMessage(data))
    } catch (err) {
      console.error(err)
    }
  }
  // 通信正常
  private async openStatus() {
    if (this.ws.readyState === WebSocket.OPEN) {
      const payload = {
        op: 1,
        d: null,
      }
      console.log("发送第一次心跳", payload)
      this.ws.send(JSON.stringify(payload))
      const s = await redis.get("s")
      // 定时发送心跳
      this.heartbeatInterval = setInterval(async () => {
        const xinTiao = {
          op: 1,
          d: s ? Number(s) : null,
        }
        console.log("心跳校验", xinTiao)
        this.ws.send(JSON.stringify(xinTiao))
      }, 20000) // 发送心跳消息的频率为 5000 毫秒

      // 重连恢复

      const token = await getToken()
      const session_id = await redis.get("session_id")
      if (s && token && session_id && this.recommect) {
        const restore = {
          op: 6,
          d: {
            token: "QQBot " + token,
            session_id: session_id,
            seq: s,
          },
        }
        this.ws.send(JSON.stringify(restore))
        this.recommect = false
      }
    }
  }
  // 连接关闭
  private closeStatus() {
    console.log("连接断开")
    console.log(this.delay + "秒后重连")
    this.recommect = true
    if (this.reconnectStimer) clearTimeout(this.reconnectStimer)
    this.reconnectStimer = setTimeout(async () => {
      // console.log(this.baseUrl)
      await this.connect()
    }, this.delay)
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
  // 消息获取
  private async handleMessage(data: string) {
    const res = JSON.parse(data.toString())
    // console.log(res)

    // 登录鉴权获得 Session
    if (res.op === 10) {
      console.log("ws连接成功")
      const token = await getToken()
      const payload = {
        op: 2,
        d: {
          token: "QQBot " + token,
          intents:
            0 |
            (1 << 0) |
            (1 << 1) |
            (1 << 9) |
            (1 << 10) |
            (1 << 12) |
            (1 << 26) |
            (1 << 27) |
            (1 << 28) |
            (1 << 29) |
            (1 << 30),
          shard: [],
          properties: {
            $os: "linux",
            $browser: "",
            $device: "",
          },
        },
      }
      // console.log(payload.d.intents)

      // 发送payload
      this.ws.send(JSON.stringify(payload))
    }
    // 成功存session到redis
    if (res.d && res.d.session_id) {
      await redis.set("session_id", res.d.session_id)
    }
    if (res.t) {
      // console.log("事件", res.t)
      // if (res.t === "MESSAGE_CREATE" || res.t === "MESSAGE_DELETE") {
      //   console.log("输出：", res.d)
      //   if (this.messageCallback) this.messageCallback(res.d)
      // }
      for (let key in this.messageEvent) {
        if (this.messageEvent[key].includes(res.t)) {
          // this.callback[key](res.d
          if (this.callback[key] !== null && this.callback[key] !== undefined) {
            const cb = this.callback[key] as (data: string) => void
            cb(res.d)
          }
        }
      }

      // if(res.t)
    }
    if (res.shard) console.log("shard", res.shard)
    // 保存最新s
    if (res.s) {
      await redis.set("s", res.s)
    }
  }
  public disconnect() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
    if (this.reconnectStimer) clearTimeout(this.reconnectStimer)
    if (this.ws) {
      this.ws.close()
    } else {
      console.error("WebSocket is not initialized")
    }
  }

  public onMessage(event: Event, callback: (message: any) => void) {
    // this.messageCallback = callback
    this.callback[event] = callback
  }
}
export default WebSocketClient
