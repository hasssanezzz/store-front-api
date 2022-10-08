import express, { Request, Response } from "express"
import bcryptjs from "bcryptjs"
import Users from "../../models/user.model"
import { authRequest } from "../../middleware"

const app = express.Router()

app.put("/update-password", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { email, password, newPassword } = req.body

  // making sure all inputs exists
  if (!email || !password || !newPassword) {
    res.status(400).json({
      status: "error",
      msg: "Please fill in all the inputs",
    })
    return
  }

  const userWithSameEmail = await Users.findByEmail(email)

  // making sure email exists
  if (!userWithSameEmail) {
    res.status(404).json({
      status: "error",
      msg: "Email not found",
    })
    return
  }

  // making sure that the new password is not the same old password
  if (password === newPassword) {
    res.status(400).json({
      status: "error",
      msg: "Please fill in with a new password",
    })
    return
  }

  const validPassowrd = await bcryptjs.compare(password, userWithSameEmail.password as string)

  if (!validPassowrd) {
    res.status(403).json({
      status: "error",
      msg: "Wrong password",
    })
    return
  }

  // logging out all past sessions
  // await Sessions.logOutAllSessionsByUserId(userWithSameEmail.id)

  const salt = await bcryptjs.genSalt(10)
  const hash = await bcryptjs.hash(newPassword, salt)

  const result = await Users.updatePasswordByEmail(email, hash)

  res.json({
    status: "success",
    data: result,
    msg: "Password updated successfully",
  })
})

export default app
