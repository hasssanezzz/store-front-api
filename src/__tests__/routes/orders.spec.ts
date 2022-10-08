import supertest from "supertest"
import pool from "../../db"
import { app } from "../../index"
import { User } from "../../interfaces"
import Orders from "../../models/order.model"

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

const sessId: { user: string | null; admin: string | null } = { user: null, admin: null }
let orderId: string

describe("Test the orders endpoints", () => {
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
  })

  afterAll(async () => {
    const sql = `DELETE FROM orders; DELETE FROM sessions; DELETE FROM users`
    await pool.query(sql)
  })

  describe("Test the `POST /api/orders` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.post("/api/orders")

      expect(res.status).toEqual(400)
    })

    it("Should create a product", async () => {
      const res = await request
        .post("/api/orders")
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ userId: user.id })

      expect(res.status).toEqual(200)
      expect(res.body.data.userId).toEqual(user.id)
      expect(res.body.data.status).toEqual(0)

      orderId = res.body.data.id
    })
  })

  describe("Test the `GET /api/orders` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.get("/api/orders")

      expect(res.status).toEqual(400)
    })

    it("Should return all orders", async () => {
      const res = await request.get("/api/orders").set("sessid", sessId.admin as string)

      expect(res.status).toEqual(200)
      expect(res.body.data.length).toEqual(1)
    })
  })

  describe("Test the `GET /api/orders/:id` endpoint", () => {
    it("Should return product data", async () => {
      const res = await request.get("/api/orders/" + orderId).set("sessid", sessId.admin as string)

      expect(res.status).toEqual(200)
      expect(res.body.data.id).toEqual(orderId)
      expect(res.body.data.userId).toEqual(user.id)
    })
  })

  describe("Test the `PUT /api/orders/:id` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.put("/api/orders/123")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.put("/api/orders/123").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should update product data", async () => {
      const status = 2
      const res = await request
        .put("/api/orders/" + orderId)
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ status: 2 })

      const updatedOrder = await Orders.findById(orderId)

      expect(res.status).toEqual(200)
      expect(updatedOrder?.status).toEqual(status)
    })
  })

  describe("Test the `DELETE /api/orders/:id` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.delete("/api/orders/123")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.delete("/api/orders/123").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should respond with status 401 if user tried to delete an order he does not own", async () => {
      const newOrder = await Orders.create(admin.id)

      const res = await request.delete("/api/orders/" + newOrder?.id).set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should delete product", async () => {
      const res = await request.delete("/api/orders/" + orderId).set("sessid", sessId.admin as string)

      const deleteProduct = await Orders.findById(orderId)

      expect(deleteProduct).toBeNull()
      expect(res.status).toEqual(200)
    })
  })
})
