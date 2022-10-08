import express from "express"
import bcryptjs from "bcryptjs"
import { sign } from "jsonwebtoken"
import { TOKEN_MAX_AGE } from "../../constants"
import { Session, User } from "../../interfaces"
import Sessions from "../../models/session.model"
import Users from "../../models/user.model"

const app = express.Router()

app.post("/login", async (req, res): Promise<void> => {
  const { email, password } = req.body

  // making sure email and password exist
  if (!email || !password) {
    res.status(400).json({
      status: "error",
      msg: "Please fill in all the inputs",
    })
    return
  }

  // making sure a user with this email exists
  const userWithSameEmail = (await Users.findByEmail(email)) as User

  // sending error message
  if (!userWithSameEmail) {
    res.status(404).json({
      status: "error",
      msg: "Email not found",
    })
    return
  }

  const user = userWithSameEmail
  const hashedPw = user.password

  // comparing the hashed password from the database
  const validPassowrd = await bcryptjs.compare(password, hashedPw as string)

  // chechking if the password matched the records
  if (!validPassowrd) {
    res.status(403).json({
      status: "error",
      msg: "Wrong password",
    })
    return
  }

  // logging out all of the other sessions
  await Sessions.logOutAllSessionsByUserId(user.id)

  // creating the token
  const token = sign({ ...user, password: null }, process.env.JWT_SECRET as string, { expiresIn: TOKEN_MAX_AGE })

  // creating the session in the database
  const newSession = (await Sessions.create(user.id, token)) as Session

  // returning a cookie with the session id
  res.cookie("SESSID", newSession.id, {
    httpOnly: true,
    maxAge: TOKEN_MAX_AGE * 1000,
  })

  res.json({
    status: "success",
    data: { user, session: newSession },
    msg: "User logged in successfully",
  })
})

export default app
