import express, { Request, Response } from "express"
import { adminOnly, authRequest } from "../../middleware"
import Orders from "../../models/order.model"
import orderProductsRoute from "./orderProducts"

const app = express.Router()

// ====================== get all orders ======================
app.get("/orders", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id, isAdmin } = req.user

  // if the user is admin, return all orders in the database, if not, return orders ordered by logged in user only
  res.json({
    status: "success",
    data: isAdmin ? await Orders.findAll() : await Orders.findAllByUserId(id),
    msg: "Orders retrieved successfully",
  })
})

// ====================== get order by id ======================
app.get("/orders/:id", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id: orderId } = req.params
  const { id, isAdmin } = req.user

  const order = await Orders.findById(orderId)

  // if the user is admin, return the order, if not, check if the order is ordered by the logged in user
  res.status(isAdmin ? 200 : id === order?.userId ? 200 : 401).json(
    isAdmin
      ? {
          status: "success",
          data: order,
          msg: "Order retrieved successfully",
        }
      : id === order?.userId
      ? {
          status: "success",
          data: order,
          msg: "Order retrieved successfully",
        }
      : {
          status: "error",
          msg: "Unauthorized",
        },
  )
})

// ====================== update order data by id ======================
app.put("/orders/:id", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { userId, status } = req.body

  const result = await Orders.updateById(id, userId, +status)

  res.json({
    status: "success",
    data: result,
    msg: "Order updated successfully",
  })
})

// ====================== create a new order ======================
app.post("/orders", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body
  const { id, isAdmin } = req.user

  // if the user is admin, make userId in new order equal to req.body.id, if not, make userId in new order equal to req.user.id
  const result = await Orders.create(isAdmin ? userId || id : id)

  res.json({
    status: "success",
    data: result,
    msg: "Order created successfully",
  })
})

// ====================== delete order by id ======================
app.delete("/orders/:id", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id: orderId } = req.params
  const { id, isAdmin } = req.user

  const order = await Orders.findById(orderId)

  if (isAdmin || order?.userId === id) {
    await Orders.deleteById(orderId)
    res.json({
      status: "success",
      msg: "Order deleted successfully",
    })
  } else {
    res.status(401).json({
      status: "error",
      msg: "Unauthorized",
    })
  }
})

app.use("/", orderProductsRoute)

export default app
