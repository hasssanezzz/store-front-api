import supertest from "supertest"
import pool from "../../db"
import { app } from "../../index"
import { User } from "../../interfaces"
import Users from "../../models/user.model"

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

describe("Test the users endpoints", () => {
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
    const sql = `DELETE FROM sessions; DELETE FROM users`
    await pool.query(sql)
  })

  describe("Test the `GET /api/users` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.get("/api/users")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.get("/api/users").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should return users", async () => {
      const res = await request.get("/api/users").set("sessid", sessId.admin as string)

      expect(res.status).toEqual(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.data.length).toEqual(2)
    })

    it("Should not return users if the logged in user is not admin", async () => {
      const res = await request.get("/api/users").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })
  })

  describe("Test the `GET /api/users/admins` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.get("/api/users/admins")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.get("/api/users/admins").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should return admins", async () => {
      const res = await request.get("/api/users/admins").set("sessid", sessId.admin as string)

      expect(res.status).toEqual(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.data.length).toEqual(1)
    })
  })

  describe("Test the `GET /api/users/:id` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.get("/api/users/123")

      expect(res.status).toEqual(400)
    })

    it("Should not return a user if the logged in user is not admin and requested to view another user", async () => {
      const res = await request.get("/api/users/" + admin.id).set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should return user data", async () => {
      const res = await request.get("/api/users/" + admin.id).set("sessid", sessId.admin as string)

      expect(res.status).toEqual(200)
      expect(res.body.status).toEqual("success")
      expect(res.body.data.email).toEqual(admin.email)
    })
  })

  describe("Test the `PUT /api/users/make-admin`", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.put("/api/users/make-admin")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.put("/api/users/make-admin").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should make the user admin", async () => {
      const res = await request
        .put("/api/users/make-admin")
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ id: user.id })

      const admins = await Users.findAll(true)

      expect(res.status).toEqual(200)
      expect(admins.length).toEqual(2)
    })
  })

  describe("Test the `PUT /api/users/remove-admin`", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.put("/api/users/remove-admin")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.put("/api/users/remove-admin").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should remove admin", async () => {
      const res = await request
        .put("/api/users/remove-admin")
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ id: user.id })

      const admins = await Users.findAll(true)

      expect(res.status).toEqual(200)
      expect(admins.length).toEqual(1)
    })
  })

  describe("Test the `PUT /api/users/:id` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.put("/api/users/123")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.put("/api/users/123").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Should update any user", async () => {
      const newEmail = "testuser123@gmail.com"
      const res = await request
        .put("/api/users/" + user.id)
        .set("Content-type", "application/json")
        .set("sessid", sessId.admin as string)
        .send({ email: newEmail })

      const updatedUser = await Users.findByEmail(newEmail)

      expect(res.status).toEqual(200)
      expect(updatedUser).not.toBeNull()

      user.email = newEmail
    })
  })

  describe("Test the `PUT /api/users` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.put("/api/users/user")

      expect(res.status).toEqual(400)
    })

    it("Should logged in user", async () => {
      const newFirstName = "ihatetesting"
      const res = await request
        .put("/api/users")
        .set("Content-type", "application/json")
        .set("sessid", sessId.user as string)
        .send({ firstName: newFirstName })

      const updatedUser = await Users.findByEmail(res.body.data.email)

      expect(res.status).toEqual(200)
      expect(updatedUser?.firstName).toEqual(newFirstName)

      user.firstName = newFirstName
    })
  })

  describe("Test the `DELETE /api/users/:id` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.delete("/api/users/123")

      expect(res.status).toEqual(400)
    })

    it("Should respond with status 401 if the logged in user is not admin", async () => {
      const res = await request.delete("/api/users/123").set("sessid", sessId.user as string)

      expect(res.status).toEqual(401)
    })

    it("Shoud delete any user by id", async () => {
      const res = await request.delete("/api/users/" + user.id).set("sessid", sessId.admin as string)

      const deletedUser = await Users.findById(user.id)

      expect(deletedUser).toBeNull()
      expect(res.status).toEqual(200)
    })
  })

  describe("Test the `DELETE /api/users` endpoint", () => {
    it("Should respond with status 400 if sessid was not provided", async () => {
      const res = await request.delete("/api/users")

      expect(res.status).toEqual(400)
    })

    it("Should delete logged in user", async () => {
      const res = await request.delete("/api/users").set("sessid", sessId.admin as string)

      const deletedUser = await Users.findById(admin.id)

      expect(deletedUser).toBeNull()
      expect(res.status).toEqual(200)
    })
  })
})
