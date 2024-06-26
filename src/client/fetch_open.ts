import { maxRetries, qq_http_url } from "@/config"
import fetch from "node-fetch-retry"

interface token {
  code: number
  message: string
  access_token: string
  expires_in: number
}

export const getTokenApi = async (): Promise<token> => {
  const data = {
    appId: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
  }
  try {
    const res = await fetch(qq_http_url, {
      method: "post",
      body: JSON.stringify(data),
      headers: { "Content-Type": " application/json" },
      retry: maxRetries,
      pause: 500,
    })
    if (!res.ok) {
      throw new Error(`HTTP error! status2: ${res.status}`)
    }
    return (await res.json()) as token
  } catch (error: any) {
    if (error.response) {
      throw new Error("Response:", error.response)
    } else {
      throw new Error(String(error))
    }
  }
}
