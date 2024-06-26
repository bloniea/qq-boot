import { getTokenApi } from "@/client/fetch_open"
import redis from "./redis"
import md5 from "md5"
import qs from "qs"

import template from "art-template"
import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"
import { client } from "@/client/openapi"
import { ds1Salt, ds2Salt, maxRetries } from "@/config"
export const getToken = async (): Promise<string> => {
  const token_ttl = await redis.getTtl("access_token")
  //   -2 则不存在
  let token: string
  if (token_ttl === -2) {
    const data = await setToken()
    await redis.set(
      "access_token",

      data.access_token,

      data.expires_in,
      "EX"
    )

    return data.access_token
  } else {
    if (token_ttl < 60) {
      const data = await setToken()
      await redis.set(
        "access_token",

        data.access_token,

        data.expires_in,
        "EX"
      )

      return data.access_token
    }

    return (await redis.get("access_token")) as string
  }
}

const setToken = async (): Promise<{
  access_token: string
  expires_in: number
}> => {
  const res_token = await getTokenApi()
  return res_token
}
/**
 * 清楚字符串所有空格
 * @param str 包含要处理的字符串
 */
export const clearAllspace = (str: string) => {
  return str.replace(/\s/g, "")
}
/**
 * 这个就是console.log
 * @param args 要输出的值
 */
export const sc = (...args: any[]) => {
  console.log(...args)
}

type Ds2Salt = "4X" | "6X" | "PROD"
export const ds2 = (
  obt: {
    body?: { [key: string]: any }
    query?: string
  } = {},
  type: Ds2Salt = "4X"
) => {
  let salt: string
  switch (type) {
    case "4X":
      salt = ds2Salt["4X"]
    case "6X":
      salt = ds2Salt["6X"]
    case "PROD":
      salt = ds2Salt.PROD
    default:
      salt = ds2Salt["4X"]
  }

  // body和query一般来说不会同时存在
  // 可以使用内置的JSON.stringify函数将对象或数组转换为JSON字符串
  // const body = JSON.stringify({role: "123456789"})
  const body = obt.body ? JSON.stringify(obt.body) : ""
  // 需要对URL参数进行排序

  const query = obt.query ? obt.query.split("&").sort().join("&") : ""

  const t = Math.floor(Date.now() / 1000)
  let r = Math.floor(Math.random() * 100001 + 100000)
  if (r == 100000) {
    r = 642367
  }
  // const r = Math.floor(Math.random() * 100001 + 100001)

  const main = `salt=${salt}&t=${t}&r=${r}&b${body}=&q=${query}`
  // const main = `salt=${salt}&t=${t}&r=${r}&q=${query}&b=`
  const ds = md5(main)

  const final = `${t},${r},${ds}` // 最终结果
  return final
}

type Ds1Salt = "k2" | "lk2"
export const ds1 = (type: Ds1Salt = "k2") => {
  const salt = type === "lk2" ? ds1Salt.lk2 : ds1Salt.K2
  const lettersAndNumbers =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const t = Math.floor(Date.now() / 1000)
  let r = ""
  for (let i = 0; i < 6; i++) {
    r += lettersAndNumbers[Math.floor(Math.random() * lettersAndNumbers.length)]
  }

  const main = `salt=${salt}&t=${t}&r=${r}`
  const ds = md5(main)
  const final = `${t},${r},${ds}` // 最终结果
  return final
}

interface ImageData {
  htmlPath: string
  outputPath: string
  // width: number
  // height: number
  element: string
}
interface Value {
  [key: string]: any
}
// 获取图片
export const getImageUrl = async (
  data: ImageData,
  values: Value
): Promise<string | null> => {
  if (
    !data.htmlPath ||
    !data.outputPath ||
    // data.width === undefined ||
    // data.height === undefined ||
    !data.element
  ) {
    console.error(
      "properties (htmlPath, outputPath, width, height) must be provided."
    )
    return null
  }
  try {
    const html = template(data.htmlPath, values)
    const _fs = fs.promises
    const tempMach = data.htmlPath.match(/^(.*)\.([^\.]+)$/)
    // console.log(tempMach)
    if (!tempMach || !tempMach[2]) {
      console.error("The filename must include an extension.")
      return null
    }
    const tempFilePath = `${tempMach[1]}.temp.${tempMach[2]}`
    // console.log(tempFilePath)
    await _fs.writeFile(tempFilePath, html)
    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    })
    await page.goto(tempFilePath, {
      waitUntil: "networkidle0",
      // waitUntil: "domcontentloaded",
    })
    // 获取 div 的大小和位置
    const selector = data.element
    const clip = await page.$eval(selector, (element: Element) => {
      const { width, height, top: y, left: x } = element.getBoundingClientRect()
      return { width, height, x, y }
    })

    // 根据 div 的大小和位置截图
    const outputUrl = path.join(process.cwd(), `/output/${data.outputPath}`)
    // 检查目录是否存在，如果不存在则创建
    const outputDir = path.dirname(outputUrl)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    await page.screenshot({ path: outputUrl, clip })

    await browser.close()
    return outputUrl
  } catch (error) {
    console.error("错误:", error)
    return null
  }
}

export const convertSecondsToTime = (seconds: number): string => {
  // 获取当前时间
  const currentDate: Date = new Date()

  // 将秒数转换为毫秒并添加到当前时间
  currentDate.setSeconds(currentDate.getSeconds() + seconds)

  // 获取年、月、日、小时、分钟和秒
  const year: number = currentDate.getFullYear()
  const month: number = currentDate.getMonth() + 1 // 月份从0开始，所以需要加1
  const day: number = currentDate.getDate()
  let hours: number | string = currentDate.getHours()
  let minutes: number | string = currentDate.getMinutes()

  // 格式化月、日、小时、分钟和秒为两位数
  const formattedMonth: string = month < 10 ? `0${month}` : `${month}`
  const formattedDay: string = day < 10 ? `0${day}` : `${day}`
  hours = hours < 10 ? `0${hours}` : `${hours}`
  minutes = minutes < 10 ? `0${minutes}` : `${minutes}`

  // 返回格式化的日期和时间
  return `${year}-${formattedMonth}-${formattedDay} ${hours}:${minutes}`
}

export const clearAt = (content: string): string | null => {
  const regex = /\/[^/]+\/?/
  const match = content.match(regex)
  if (match) {
    return match[0]
  }
  return null
}
