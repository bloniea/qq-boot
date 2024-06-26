import { maxRetries, openUrl, qq_http_url } from "@/config"
import fetch from "node-fetch-retry"
import dotenv from "dotenv"
import { getToken } from "@/utils/util"
import { sendMessage } from "../@types/openapi"
import { FormData } from "formdata-polyfill/esm.min.js"
import { fileFromSync } from "fetch-blob/from.js"
import { ReturnFetch, SendMessage, getway } from "./fetchTypes"

dotenv.config()
const fetchApi = async <T>(
  endpoint: URL | RequestInfo,
  method: string = "get",
  options: RequestInit = {},
  mFormData: boolean = false
): Promise<ReturnFetch<T>> => {
  options.method = method
  const token = await getToken()
  let Myheaders = {
    "Content-Type": "application/json",
    Authorization: "QQBot " + token,
    "X-Union-Appid": process.env.APP_ID as string,
  }

  let defaultHeaders: HeadersInit = Myheaders

  if (mFormData) {
    const { "Content-Type": _, ...rest } = defaultHeaders
    defaultHeaders = rest
  }
  // 合并默认的 headers 对象和 options 参数中的 headers 对象
  const headers = { ...defaultHeaders, ...options.headers }
  try {
    const response: Response = await fetch(endpoint, {
      headers,
      ...options,
      retry: maxRetries,
      pause: 500,
    })
    const jsonData = await response.json()
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status},${JSON.stringify(jsonData)}`
      )
    }

    return {
      result: <T>jsonData,
      code: response.status,
      success: 1,
    }
  } catch (e) {
    console.error(e)
    return {
      result: <T>null,
      code: 0,
      success: 0,
    }
  }
}

/**
 *发送消息
 * @param channel_id 频道id
 * @param message 请求数据
 *
 */
export const postMessageApi = async (
  channel_id: string | number,
  message: sendMessage
): Promise<ReturnFetch<SendMessage>> => {
  const res: ReturnFetch<SendMessage> = await fetchApi(
    openUrl + `/channels/${channel_id}/messages`,
    "post",
    {
      body: JSON.stringify(message),
    }
  )
  return res
}
/**
 *
 * @param channel_id 频道id
 * @param imagePath 文件地址
 * @param msgId 回复id
 *
 */
export const postMessageFileApi = async (
  channel_id: string | number,
  imagePath: string,
  msgId: string
): Promise<ReturnFetch<SendMessage>> => {
  const form = new FormData()
  const image = fileFromSync(imagePath)
  form.append("file_image", image)
  form.append("msg_id", msgId)
  const res: ReturnFetch<SendMessage> = await fetchApi(
    openUrl + `/channels/${channel_id}/messages`,
    "post",
    {
      body: form,
    },
    true
  )
  return res
}

/**
 * 获取ws连接地址
 *
 */
export const getGatewayApi = async (): Promise<ReturnFetch<getway>> => {
  const res: ReturnFetch<getway> = await fetchApi(openUrl + "/gateway")
  return res
}

/**
 *发送私聊消息
 * @param {string | number}guild_id 私聊id
 * @param message 请求数据
 *
 */
export const postPrivateMessageApi = async (
  guild_id: string | number,
  message: sendMessage
): Promise<ReturnFetch<SendMessage>> => {
  const res: ReturnFetch<SendMessage> = await fetchApi(
    openUrl + `/dms/${guild_id}/messages`,
    "post",
    {
      body: JSON.stringify(message),
    }
  )
  return res
}

/**
 *
 * @param {string | number}guild_id 私聊id
 * @param imagePath 文件地址
 * @param msgId 回复id
 *
 */
export const postPrivateMessageFileApi = async (
  guild_id: string | number,
  imagePath: string,
  msgId: string
): Promise<ReturnFetch<SendMessage>> => {
  const form = new FormData()
  const image = fileFromSync(imagePath)
  form.append("file_image", image)
  form.append("msg_id", msgId)
  const res: ReturnFetch<SendMessage> = await fetchApi(
    openUrl + `/dms/${guild_id}/messages`,
    "post",
    {
      body: form,
    },
    true
  )
  return res
}
