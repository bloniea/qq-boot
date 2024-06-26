import express from "express"

import path, { dirname } from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()

app.use("/css", express.static(path.join(__dirname, "static/css")))

app.get("/character", (req, res) => {
  // console.log(__dirname)
  // res.sendFile(path.join(__dirname, "/character/character.html"))
})
export default app
