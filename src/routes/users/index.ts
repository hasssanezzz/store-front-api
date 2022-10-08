import express, { Request, Response } from "express"
import { adminOnly, authRequest } from "../../middleware"
import Sessions from "../../models/session.model"
import Users from "../../models/user.model"
const app = express.Router()

// ====================== find all users ======================
app.get("/users", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const result = await Users.findAll()
  res.json({
    status: "success",
    data: result,
    msg: "Users retrieved successfully",
  })
})

// ====================== find admins in users ======================
app.get("/users/admins", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const result = await Users.findAll(true)
  res.json({
    status: "success",
    data: result,
    msg: "Admins retrieved successfully",
  })
})

// ====================== find user by id ======================
app.get("/users/:id", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  // a user can't access another user's data if he is not an admin

  // checking if the user making the request is the same user in the url
  if (id == req.user.id) {
    const result = await Users.findById(id)
    res.json({
      status: "success",
      data: result,
      msg: "User retrieved successfully",
    })
    return
  }

  // if not, check if he is an admin
  if (req.user.isAdmin) {
    const result = await Users.findById(id)
    res.json({
      status: "success",
      data: result,
      msg: "User retrieved successfully",
    })
    return
  }

  // otherwise, he is not authorized
  res.status(401).json({
    status: "error",
    msg: "Unauthorized",
  })
})

// ====================== make a user admin ======================
app.put("/users/make-admin", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body

  if (!id) {
    res.status(400).json({
      status: "error",
      msg: "Please provide user id",
    })
    return
  }

  await Users.setAdminById(id, true)

  res.json({
    status: "success",
    msg: "User updated successfully",
  })
})

// ====================== remove admin ======================
app.put("/users/remove-admin", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body

  if (!id) {
    res.status(400).json({
      status: "error",
      msg: "Please provide user id",
    })
    return
  }

  await Users.setAdminById(id, false)

  res.json({
    status: "success",
    msg: "User updated successfully",
  })
})

// ====================== update any user profile by id ======================
app.put("/users/:id", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { firstName, lastName, email } = req.body

  const userWithSameEmail = await Users.findByEmail(email)

  if (userWithSameEmail) {
    res.status(409).json({
      status: "error",
      msg: "Email already exists",
    })
    return
  }

  const result = await Users.updateProfie(id, firstName, lastName, email)

  if (result) {
    res.json({
      status: "success",
      data: result,
      msg: "User updated successfully",
    })
  } else {
    res.status(400).json({
      status: "error",
      msg: "Please fill in all the inputs",
    })
  }
})

// ====================== update logged in user profile by session token ======================
app.put("/users", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.user
  const { firstName, lastName, email } = req.body

  const userWithSameEmail = await Users.findByEmail(email)

  if (userWithSameEmail) {
    res.status(409).json({
      status: "error",
      msg: "Email already exists",
    })
    return
  }

  const result = await Users.updateProfie(id, firstName, lastName, email)
  res.json({
    status: "success",
    data: result,
    msg: "User updated successfully",
  })
})

// ====================== delete any user by id ======================
app.delete("/users/:id", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  await Sessions.deleteUserSessionsByUserId(id)
  await Users.deleteById(id)

  res.json({
    status: "success",
    msg: "User deleted successfully",
  })
})

// ====================== delete logged in user by session token ======================
app.delete("/users", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.user
  await Sessions.deleteUserSessionsByUserId(id)
  await Users.deleteById(id)

  res.json({
    status: "success",
    msg: "User deleted successfully",
  })
})

export default app
