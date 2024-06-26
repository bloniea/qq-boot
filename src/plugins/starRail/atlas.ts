// 引入 fs.promises 模块
// const fs = require('fs').promises;
import { promises as fs } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { starRailPath, OthernameJson } from "./interface"
import yaml from "js-yaml"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// 异步函数读取 JSON 文件
// 读取文件内容，尝试解析为 JSON，如果解析失败，尝试解析为 YAML

export const readJsonOrYamlFile = async <T>(
  filePath: string
): Promise<T | undefined> => {
  try {
    // 读取文件内容
    const fullPath = join(__dirname, filePath)
    const fileContents = await fs.readFile(fullPath, "utf8")

    // 尝试解析为 JSON
    try {
      const jsonData = JSON.parse(fileContents)
      return <T>jsonData
    } catch (jsonError) {
      // 如果解析 JSON 失败，尝试解析为 YAML
      try {
        const yamlData = yaml.load(fileContents)
        return <T>yamlData
      } catch (yamlError) {
        console.error("The file is neither valid JSON nor valid YAML.")
        // throw new Error("The file is neither valid JSON nor valid YAML.")
        // return undefined
      }
    }
  } catch (err) {
    console.error("Error reading or parsing JSON file:", err)
    // throw err
  }
}
// 读取 path.json 文件
export const pathJson = async (): Promise<starRailPath | undefined> => {
  return await readJsonOrYamlFile<starRailPath>("./star-rail-atlas/path.json")
}
// 读取 othername 文件夹下的所有文件
export const othernameData = async (): Promise<OthernameJson> => {
  const filePaths = [
    { name: "enemy", path: "./star-rail-atlas/othername/enemy.yaml" },
    // {
    //   name: "guide for role",
    //   path: "./star-rail-atlas/othername/guide for role.yaml",
    // },
    { name: "lightcone", path: "./star-rail-atlas/othername/lightcone.yaml" },
    { name: "relic", path: "./star-rail-atlas/othername/relic.yaml" },
    { name: "role", path: "./star-rail-atlas/othername/role.yaml" },
  ]
  try {
    const results = await Promise.all(
      filePaths.map(async (file) => readJsonOrYamlFile(file.path))
    )

    const mergedResult = Object.assign({}, ...results)
    return <OthernameJson>(<unknown>mergedResult)
  } catch (err) {
    console.error("Error reading multiple files:", err)
    throw err
  }
}
