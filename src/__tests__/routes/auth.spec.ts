import supertest from "supertest"
import pool from "../../db"
import { app } from "../../index"
import { User } from "../../interfaces"

const request = supertest(app)

const user = {
  firstName: "Test",
  lastName: "user",
  email: "testuser@gmail.com",
  password: "test123",
  isAdmin: false,
} as User

let sessionId: string

describe("Test the authentication endpoints", () => {
  afterAll(async () => {
    const sql = `DELETE FROM sessions; DELETE FROM users`
    await pool.query(sql)
  })

  describe("Test the `POST /api/register` route", () => {
    it("It creates a user and returns a token", async () => {
      const res = await request.post("/api/register").set("Content-type", "application/json").send(user)

      expect(res.body.status).toEqual("success")
      expect(res.body.data.user.email).toEqual(user.email)
      expect(res.body.data.session.id).toBeDefined()
    })

    // error1 1: email already exists
    it("It responde with status 409 when the same email is provided again", async () => {
      const res = await request.post("/api/register").set("Content-type", "application/json").send(user)

      expect(res.body.status).toEqual("error")
      expect(res.status).toEqual(409)
    })
  })

  describe("Test the `POST /api/login` route", () => {
    // error 1: wrong passowrd
    it("It responde with status 403 when a wrong password was provided", async () => {
      const res = await request
        .post("/api/login")
        .set("Content-type", "application/json")
        .send({ email: user.email, password: user.password + "1" })

      expect(res.status).toEqual(403)
    })

    // error 2: email not found
    it("It responde with status 404 when a wrong email was provided", async () => {
      const res = await request
        .post("/api/login")
        .set("Content-type", "application/json")
        .send({ email: "123@gmail.com", password: user.password })

      expect(res.status).toEqual(404)
    })

    // success
    it("It logs in a user and returns a token", async () => {
      const res = await request
        .post("/api/login")
        .set("Content-type", "application/json")
        .send({ email: user.email, password: user.password })

      expect(res.body.status).toEqual("success")
      expect(res.body.data.user.email).toEqual(user.email)
      expect(res.body.data.session.id).toBeDefined()

      sessionId = res.body.data.session.id
    })
  })

  describe("Test the `GET /api/verify-session` route", () => {
    it("It responde with status 200", async () => {
      const res = await request.get("/api/verify-session").set("sessid", sessionId)

      expect(res.body.status).toEqual("success")
      expect(res.status).toEqual(200)
    })
  })

  describe("Test the `PUT /api/update-password` route", () => {
    it("It update a user password", async () => {
      const newPassword = "helloworld"
      const updatePasswordResponse = await request
        .put("/api/update-password")
        .set("Content-type", "application/json")
        .set("sessid", sessionId)
        .send({ email: user.email, password: user.password, newPassword })

      expect(updatePasswordResponse.body.status).toEqual("success")
      expect(updatePasswordResponse.status).toEqual(200)

      const loginResponse = await request
        .post("/api/login")
        .set("Content-type", "application/json")
        .send({ email: user.email, password: newPassword })

      expect(loginResponse.body.status).toEqual("success")
      expect(loginResponse.body.data.user.email).toEqual(user.email)
      expect(loginResponse.body.data.session.id).toBeDefined()
    })
  })
})
