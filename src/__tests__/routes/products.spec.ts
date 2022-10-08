import supertest from "supertest"
import pool from "../../db"
import { app } from "../../index"
import { Product, User } from "../../interfaces"
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

describe("Test the products endpoints", () => {
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
    const sql = `DELETE FROM products; DELETE FROM sessions; DELETE FROM users`
    await pool.query(sql)
  })

  describe("Test the `POST /api/products` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.post("/api/products")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.post("/api/products").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should create a product", async () => {
      const res = await request
        .post("/api/products")
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send(product)

      expect(res.status).toEqual(200)
      expect(res.body.data.name).toEqual(product.name)
      expect(res.body.data.description).toEqual(product.description)

      product.id = res.body.data.id
    })
  })

  describe("Test the `GET /api/products` endpoint", () => {
    it("Should return all products", async () => {
      const res = await request.get("/api/products")

      expect(res.status).toEqual(200)
      expect(res.body.data.length).toEqual(1)
    })
  })

  describe("Test the `GET /api/products/:id` endpoint", () => {
    it("Should return product data", async () => {
      const res = await request.get("/api/products/" + product.id)

      expect(res.status).toEqual(200)
      expect(res.body.data.id).toEqual(product.id)
    })
  })

  describe("Test the `PUT /api/products/:id` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.put("/api/products/123")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.put("/api/products/123").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should update product data", async () => {
      const newName = "newname"
      const res = await request
        .put("/api/products/" + product.id)
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ name: "newname" })

      const updatedProduct = await Products.findById(product.id)

      expect(res.status).toEqual(200)
      expect(updatedProduct?.name).toEqual(newName)

      product.name = newName
    })
  })

  describe("Test the `DELETE /api/products/:id` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.delete("/api/products/123")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.delete("/api/products/123").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should delete product", async () => {
      const res = await request.delete("/api/products/" + product.id).set("sessid", sessId.admin as string)

      const deleteProduct = await Products.findById(admin.id)

      expect(deleteProduct).toBeNull()
      expect(res.status).toEqual(200)
    })
  })
})
