import redis from "@/utils/redis"
import dotenv from "dotenv"

dotenv.config()
import { qq_http_url } from "@/config"
import {
  postMessageApi,
  postMessageFileApi,
  postPrivateMessageApi,
  postPrivateMessageFileApi,
} from "./fetch"
import { sendMessage } from "../@types/openapi"

class Client {
  constructor() {}
  // 发送消息
  public async postMessage(channel_id: string | number, message: sendMessage) {
    return await postMessageApi(channel_id, message)
  }
  // 发送文件
  public async postMessageFile(
    channel_id: string | number,
    imagePath: string,
    msgId: string
  ) {
    return await postMessageFileApi(channel_id, imagePath, msgId)
  }
  // 发送私聊
  public async postPrivateMessage(
    guild_id: string | number,
    message: sendMessage
  ) {
    return await postPrivateMessageApi(guild_id, message)
  }
  // 发送私聊文件
  public async postPrivateMessageFile(
    guild_id: string | number,
    imagePath: string,
    msgId: string
  ) {
    return await postPrivateMessageFileApi(guild_id, imagePath, msgId)
  }
}

export const client = new Client()
