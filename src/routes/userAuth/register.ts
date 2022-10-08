import express from "express"
import bcryptjs from "bcryptjs"
import { sign } from "jsonwebtoken"
import { TOKEN_MAX_AGE } from "../../constants"
import { Session, User } from "../../interfaces"
import Sessions from "../../models/session.model"
import Users from "../../models/user.model"

const app = express.Router()

app.post("/register", async (req, res): Promise<void> => {
  const { firstName, lastName, email, password } = req.body

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({
      status: "error",
      msg: "Please fill in all the inputs",
    })
    return
  }

  // making sure a user with this email does not exist
  const userWithSameEmail = (await Users.findByEmail(email)) as User

  if (userWithSameEmail) {
    res.status(409).json({
      status: "error",
      msg: "Email already exists",
    })
    return
  }

  // creating the hashed password
  const salt = await bcryptjs.genSalt(10)
  const hash = await bcryptjs.hash(password, salt)

  // creating and saving user in the database
  const user = (await Users.create(firstName, lastName, email, hash)) as User

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
    msg: "User registered successfully",
  })
})

export default app
