import { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import pool from "../db"
import { isValidId } from "../utils"

async function authRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessId = req.headers.sessid || req.cookies.SESSID

  if (!sessId || !isValidId(sessId as string)) {
    res.status(400).json({
      status: "error",
      msg: "Please provide a valid session id",
    })
    return
  }

  const { rows: sessions } = await pool.query("SELECT * FROM sessions WHERE id = $1", [sessId])

  if (!sessions.length) {
    res.status(404).json({
      status: "error",
      msg: "No sessions found",
    })
    return
  }

  const { token, loggedOut }: { token: string; loggedOut: boolean } = sessions[0]

  if (loggedOut) {
    res.status(440).json({
      status: "error",
      msg: "Session expired",
    })
    return
  }

  try {
    const decoded = await verify(token, process.env.JWT_SECRET as string)

    req.user = decoded

    next()
  } catch (error) {
    res.status(498).json({
      status: "error",
      msg: "Token not valid",
    })

    if (error) throw error
  }
}

export default authRequest
