import { client } from "@/client/openapi"
import type { CKdata, MessageData } from "@/types"
import { clearAllspace, sc, getImageUrl } from "@/utils/util"

import path, { dirname } from "path"
import { fileURLToPath } from "url"
import redis from "@/utils/redis"
import { getMHYuserInfoApi, getMhyRolesApi, getSRinfoApi } from "./api/mhySrApi"
import { UidData } from "./api/types"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 监听关于sr游戏的私聊消息
export const watchSrPrivateMessage = async (data: MessageData) => {
  let { content } = data
  content = clearAllspace(content)

  if (content.startsWith("/绑定ck")) {
    return await setMHYcookie(content, "/绑定ck", data)
  }
}
// 保存cookie
const setMHYcookie = async (
  content: string,
  str: string,
  data: MessageData
) => {
  const cookie = content.substring(str.length)

  const accountId = cookie.match(/account_id=([^;]+)/)
  const ltuid = cookie.match(/ltuid=([^;]+)/)
  const ltuidV2 = cookie.match(/ltuid_v2=([^;]+)/)
  const accountIdV2 = cookie.match(/account_id_v2=([^;]+)/)

  let uid: string = ""
  if (accountId) {
    uid = accountId[1]
  } else if (ltuid) {
    uid = ltuid[1]
  } else if (ltuidV2) {
    uid = ltuidV2[1]
  } else if (accountIdV2) {
    uid = accountIdV2[1]
  }
  if (!uid) {
    return await client.postPrivateMessage(data.guild_id, {
      content: "cooike 格式不正确!",
      msg_id: data.id.toString(),
    })
  }
  const issets = await redis.get(`mhy_ck_${data.author.id}`)
  let cks: CKdata[] = []
  const params = {
    htmlPath: path.join(__dirname, "html/ck/ck-list.html"),
    outputPath: `ck/${uid}.jpeg`,
    element: "#container",
  }
  if (issets) {
    cks = JSON.parse(issets)
    const uidIsset = cks.findIndex((item) => item.uid === uid)
    if (uidIsset > -1) {
      cks[uidIsset].ck = cookie
      const url = await getImageUrl(params, { cks: cks })
      if (!url) return

      await redis.set(`mhy_ck_${data.author.id}`, JSON.stringify(cks))
      await setSaveUid(data)
      await client.postPrivateMessageFile(
        data.guild_id,
        url,
        data.id.toString()
      )
      return
    }
  }

  const res = await getMHYuserInfoApi(uid, cookie)
  if (!res) {
    return client.postPrivateMessage(data.guild_id, {
      msg_id: data.id.toString(),
      content: "网络超时,重试一下吧",
    })
  }

  const ckData = {
    active: 1,
    avatar_url: res.data.user_info.avatar_url,
    uid: uid,
    username: res.data.user_info.nickname,
    ck: cookie,
  }
  cks.push(ckData)
  const url = await getImageUrl(params, { cks: cks })
  if (!url) return

  await redis.set(`mhy_ck_${data.author.id}`, JSON.stringify(cks))
  await setSaveUid(data)
  await client.postPrivateMessageFile(data.guild_id, url, data.id.toString())
}
// 保存uid
export const setSaveUid = async (data: MessageData) => {
  const userId = data.author.id
  const ckRes = await redis.get(`mhy_ck_${userId}`)
  let ck: CKdata[]
  if (!ckRes) {
    return await client.postPrivateMessage(data.guild_id, {
      content: "cooike 不存在,请私聊发送 /绑定ck{cooike} ",
      msg_id: data.id.toString(),
    })
  }
  ck = JSON.parse(ckRes)
  for (const item of ck) {
    const srInfo = await getMhyRolesApi(item.ck)
    if (!srInfo) {
      return client.postPrivateMessage(data.guild_id, {
        msg_id: data.id.toString(),
        content: "网络超时,重试一下吧",
      })
    }
    const srUids: UidData[] = []
    for (const list of srInfo.data.list) {
      if (list.game_biz === "hkrpg_cn") {
        const srRes = await getSRinfoApi(list.game_uid, item.ck)
        if (!srRes) {
          return client.postPrivateMessage(data.guild_id, {
            msg_id: data.id.toString(),
            content: "网络超时,重试一下吧",
          })
        }
        const obj = {
          uid: list.game_uid,
          active: list.is_chosen,
          avatar_url: srRes.data.cur_head_icon_url,
          username: list.nickname,
          level: list.level,
        }
        srUids.push(obj)
      }
    }
    await redis.set(`sr_uid_${userId}_${item.uid}`, JSON.stringify(srUids))
  }
}
