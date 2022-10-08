import express, { Request, Response } from "express"
import { authRequest } from "../../middleware"

const app = express.Router()

app.get("/verify-session", authRequest, async (req: Request, res: Response): Promise<void> => {
  res.json({
    status: "success",
    data: req.user,
    msg: "User verified successfully",
  })
})

export default app
