import express, { Request, Response } from "express"
import cors from "cors"
import morgan from "morgan"
import { config } from "dotenv"
import cookieParser from "cookie-parser"

import routes from "./routes"

config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get("/", (req: Request, res: Response): void => {
  res.send("Welcome")
})

// importing routes
app.use("/api", routes)

app.all("*", (req: Request, res: Response): void => {
  res.status(404).send("URL NOT FOUND")
})

app.listen(PORT, () => console.log("App running on port:", PORT))

export { app }
