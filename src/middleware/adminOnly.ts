import { Request, Response, NextFunction } from "express"

function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.isAdmin) {
    next()
  } else {
    res.status(401).json({
      status: "error",
      msg: "Unauthorized",
    })
  }
}

export default adminOnly
