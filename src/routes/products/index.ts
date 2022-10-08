import express, { Request, Response } from "express"
import { Product } from "../../interfaces"
import { adminOnly, authRequest } from "../../middleware"
import Products from "../../models/product.model"
const app = express.Router()

// ====================== find all products ======================
app.get("/products", async (req: Request, res: Response): Promise<void> => {
  const products = await Products.findAll()

  res.json({
    status: "success",
    data: products,
    msg: "Products retrieved successfully",
  })
})

// ====================== find product by id ======================
app.get("/products/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  const product = await Products.findById(id)

  res.json({
    status: "success",
    data: product,
    msg: "Product retrieved successfully",
  })
})

// ====================== find popular products ======================
app.get("/products/popular", async (req: Request, res: Response): Promise<void> => {
  const results = await Products.popular()

  res.json({
    status: "success",
    data: results,
    msg: "Products retrieved successfully",
  })
})

// ====================== update product data ======================
app.put("/products/:id", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { name, description, price, category } = req.body

  const result = await Products.updateById(id, name, description, +(price || 0), category)

  res.json({
    status: "success",
    data: result,
    msg: "Product updated successfully",
  })
})

// ====================== create a new product ======================
app.post("/products", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, category } = req.body

  if (!name || !description || !price || !category) {
    res.status(400).json({
      status: "error",
      msg: "Please fill in all the inputs",
    })
    return
  }

  const productData = (await Products.create(name, description, +(price || 0), category)) as Product

  res.json({
    status: "success",
    data: productData,
    msg: "Product created successfully",
  })
})

// ====================== delete a product ======================
app.delete("/products/:id", [authRequest, adminOnly], async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  await Products.deleteById(id)

  res.json({
    status: "success",
    msg: "Product deleted successfully",
  })
})

export default app
