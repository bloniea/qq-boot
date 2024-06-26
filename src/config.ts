import "dotenv/config"
export const bootConfig = {
  appID: process.env.APP_ID as string, // 申请机器人时获取到的机器人 BotAppID
  token: process.env.APP_TOKEN as string, // 申请机器人时获取到的机器人 BotToken
  intents: [], // 事件订阅,用于开启可接收的消息类型
  sandbox: false, // 沙箱支持，可选，默认false. v2.7.0+
}
export const starRailUrl = "http://121.37.40.51/"
export const hsrIconUrl = "http://121.37.40.51/hsr/"
export const starrailApi = "https://api.mihomo.me/"
export const qq_http_url = "https://bots.qq.com/app/getAppAccessToken"
export const openUrl = "https://api.sgroup.qq.com"
export const routeParams = {
  host: "http://127.0.0.1",
  port: 999,
}
// Mihomo API
export const mihomoApiUrl = "https://api.mihomo.me/sr_info_parsed"
export const ds1Salt = {
  K2: "t0qEgfub6cvueAPgR5m9aQWWVciEer7v",
  lk2: "EJncUPGnOHajenjLhBOsdpwEMZmiCmQX",
}
export const ds2Salt = {
  "4X": "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs",
  "6X": "t0qEgfub6cvueAPgR5m9aQWWVciEer7v",
  PROD: "JwYDpKvLj6MrMqqYU6jTKF17KNO2PXoS",
}
export const mhy = {
  bbsApi: "https://bbs-api.miyoushe.com",
  api: "https://api-takumi.miyoushe.com",
  api2: "https://api-takumi-record.mihoyo.com",
  hk4eSdk: "https://hk4e-sdk.mihoyo.com",
}
export const maxRetries = 10
