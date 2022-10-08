import supertest from "supertest"
import pool from "../../db"
import { app } from "../../index"
import { Product, User } from "../../interfaces"
import Orders from "../../models/order.model"
import OrderProducts from "../../models/orderProducts.model"
import Products from "../../models/product.model"

const request = supertest(app)

const user = {
  firstName: "Test",
  lastName: "user",
  email: "testuser@gmail.com",
  password: "test123",
  isAdmin: false,
} as User

const admin = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@test.com",
  password: "test123",
  isAdmin: true,
} as User

const product = {
  name: "Test product",
  description: "test description",
  price: 50,
  category: "test",
} as Product

const sessId: { user: string | null; admin: string | null } = { user: null, admin: null }
let orderId: string

describe("Test the order products endpoints", () => {
  beforeAll(async () => {
    // register users
    const userRegisterResponse = await request.post("/api/register").set("Content-type", "application/json").send(user)
    const adminRegisterResponse = await request
      .post("/api/register")
      .set("Content-type", "application/json")
      .send(admin)

    user.id = userRegisterResponse.body.data.user.id
    admin.id = adminRegisterResponse.body.data.user.id

    // create admin
    const sql = `UPDATE users SET "isAdmin" = true WHERE id = $1`
    await pool.query(sql, [admin.id])

    // logging in the admin to get the new session id with "isAdmin" = true
    const adminLoginResponse = await request.post("/api/login").set("Content-type", "application/json").send(admin)

    sessId.user = userRegisterResponse.body.data.session.id
    sessId.admin = adminLoginResponse.body.data.session.id

    // creating an product
    const savedProduct = await Products.create(product.name, product.description, product.price, product.category)
    product.id = savedProduct.id

    // creaing an order
    const order = await Orders.create(user.id)
    orderId = order?.id as string
  })

  afterAll(async () => {
    const sql = `DELETE FROM order_products; DELETE FROM products; DELETE FROM orders; DELETE FROM sessions; DELETE FROM users`
    await pool.query(sql)
  })

  describe("Test the `POST /api/orders/:id/products` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.post(`/api/orders/${orderId}/products`)

      expect(res.status).toEqual(400)
    })

    it("Should create an order product", async () => {
      const res = await request
        .post(`/api/orders/${orderId}/products`)
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ productId: product.id, count: 5 })

      expect(res.status).toEqual(200)
      expect(res.body.data.orderId).toEqual(orderId)
      expect(res.body.data.productId).toEqual(product.id)
      expect(res.body.data.count).toEqual(5)
    })

    it("Should respond with status 401 if user tried to add an order product to an order he does not own", async () => {
      const newOrder = await Orders.create(admin.id)

      const res = await request
        .post(`/api/orders/${newOrder?.id}/products`)
        .set("Content-type", "application/json")
        .set("sessid", sessId.user as string)
        .send({ productId: product.id, count: 5 })

      expect(res.status).toEqual(401)

      await Orders.deleteById(newOrder?.id as string)
    })

    it("Should respond with status 409 if same products was added again", async () => {
      const res = await request
        .post(`/api/orders/${orderId}/products`)
        .set("Content-type", "application/json")
        .set("sessid", sessId.user as string)
        .send({ productId: product.id, count: 5 })

      expect(res.status).toEqual(409)
    })
  })

  describe("Test the `GET /api/orders/:id/products` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.get(`/api/orders/${orderId}/products`)

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if user tried to access an order he does not own", async () => {
      const newOrder = await Orders.create(admin.id)

      const res = await request.get(`/api/orders/${newOrder?.id}/products`).set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)

      await Orders.deleteById(newOrder?.id as string)
    })

    it("Should return all order products", async () => {
      const res = await request.get(`/api/orders/${orderId}/products`).set("sessid", sessId.admin as string)

      expect(res.status).toEqual(200)
      expect(res.body.data.products.length).toEqual(1)
    })
  })

  describe("Test the `GET /api/orders/:id/products/:pid` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.get(`/api/orders/${orderId}/products/${product.id}`)

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if user tried to access an order he does not own", async () => {
      const newOrder = await Orders.create(admin.id)

      const res = await request
        .get(`/api/orders/${newOrder?.id}/products/${product.id}`)
        .set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)

      await Orders.deleteById(newOrder?.id as string)
    })

    it("Should return order products", async () => {
      const res = await request
        .get(`/api/orders/${orderId}/products/${product.id}`)
        .set("sessid", sessId.admin as string)

      expect(res.status).toEqual(200)
      expect(res.body.data.product.id).toEqual(product.id)
    })
  })

  describe("Test the `PUT /api/orders/:id/products/:pid` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.put(`/api/orders/${orderId}/products/${product.id}`)

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.delete(`/api/orders/123/products/123`).set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should update order products", async () => {
      const res = await request
        .put(`/api/orders/${orderId}/products/${product.id}`)
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ count: 6 })

      const updatedOrderProduct = await OrderProducts.findByOrderIdAndProductId(orderId, product.id)

      expect(res.status).toEqual(200)
      expect(updatedOrderProduct?.count).toEqual(6)
    })
  })

  describe("Test the `DELETE /api/orders/:id/products/:pid` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.delete(`/api/orders/123/products/123`)

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.delete("/api/orders/123/products/123").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should delete product", async () => {
      const res = await request
        .delete(`/api/orders/${orderId}/products/${product.id}`)
        .set("sessid", sessId.admin as string)

      const deleteProduct = await OrderProducts.findByOrderIdAndProductId(orderId, product.id)

      expect(deleteProduct).toBeNull()
      expect(res.status).toEqual(200)
    })
  })
})
