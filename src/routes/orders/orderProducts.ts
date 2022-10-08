import express, { Request, Response } from "express"
import { adminOnly, authRequest } from "../../middleware"
import Orders from "../../models/order.model"
import OrderProducts from "../../models/orderProducts.model"
const app = express()

// ====================== get order products ======================
app.get("/orders/:id/products", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id: orderId } = req.params
  const { id, isAdmin } = req.user

  const order = await Orders.findById(orderId)
  const result = await OrderProducts.findAllByOrderId(orderId)

  res.status(isAdmin ? 200 : id === order?.userId ? 200 : 401).json(
    isAdmin
      ? {
          status: "success",
          data: result,
          msg: "Order products retrieved successfully",
        }
      : id === order?.userId
      ? {
          status: "success",
          data: result,
          msg: "Order products retrieved successfully",
        }
      : {
          status: "error",
          msg: "Unauthorized",
        },
  )
})

// ====================== get order product ======================
app.get("/orders/:id/products/:pid", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id: orderId, pid: productId } = req.params
  const { id, isAdmin } = req.user

  const order = await Orders.findById(orderId)
  const result = await OrderProducts.findByOrderIdAndProductId(orderId, productId)

  res.status(isAdmin ? 200 : id === order?.userId ? 200 : 401).json(
    isAdmin
      ? {
          status: "success",
          data: result,
          msg: "Order product retrieved successfully",
        }
      : id === order?.userId
      ? {
          status: "success",
          data: result,
          msg: "Order products retrieved successfully",
        }
      : {
          status: "error",
          msg: "Unauthorized",
        },
  )
})

// ====================== edit order product ======================
app.put("/orders/:id/products/:pid", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id, pid } = req.params
  const { productId, count } = req.body

  if (pid !== productId) {
    const orderProductsFound = await OrderProducts.findByOrderIdAndProductId(id, productId)
    if (orderProductsFound) {
      res.status(409).json({
        status: "error",
        msg: "Dublicate keys found",
      })
      return
    }
  }

  const result = await OrderProducts.updateByOrderIdAndProductId(id, pid, productId, +count)

  res.json({
    status: "success",
    data: result,
    msg: "Order product updated successfully",
  })
})

// ====================== create order product ======================
app.post("/orders/:id/products", authRequest, async (req: Request, res: Response): Promise<void> => {
  const { id: orderId } = req.params
  const { id, isAdmin } = req.user
  const { productId, count } = req.body

  const orderProductsFound = await OrderProducts.findByOrderIdAndProductId(orderId, productId)
  if (orderProductsFound) {
    res.status(409).json({
      status: "error",
      msg: "Dublicate keys found",
    })
    return
  }

  const order = await Orders.findById(orderId)

  if (!isAdmin && id != order?.userId) {
    res.status(401).json({
      status: "error",
      msg: "Unauthorized",
    })
    return
  }

  const result = await OrderProducts.create(orderId, productId, +(count || 1))

  res.json({
    status: "success",
    data: result,
    msg: "Order product created successfully",
  })
})

// ====================== delete order product by orderId and productId ======================
app.delete(
  "/orders/:id/products/:pid",
  [authRequest, adminOnly],
  async (req: Request, res: Response): Promise<void> => {
    const { id, pid } = req.params

    await OrderProducts.deleteByIdOrderIdAndProductId(id, pid)

    res.json({
      status: "success",
      msg: "Order product deleted successfully",
    })
  },
)

export default app
