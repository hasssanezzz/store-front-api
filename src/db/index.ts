import { Pool } from "pg"
import { config } from "dotenv"

config()

const dbName = process.env.NODE_ENV?.[0] == "t" ? process.env.DB_NAME_TEST : process.env.DB_NAME

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: dbName,
  password: process.env.DB_PASSWORD,
  port: +(process.env.DB_PORT || 5432),
})

pool.on("error", (error: Error) => console.error(error.message))

export default pool
