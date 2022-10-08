import { INVALID_ID } from "../../constants"
import pool from "../../db"
import { Session, User } from "../../interfaces"
import Sessions from "../../models/session.model"
import Users from "../../models/user.model"

describe("Session model", () => {
  describe("Test methods exist", () => {
    it("Should have a `create` method", () => {
      expect(Sessions.create).toBeDefined()
    })

    it("Should have a `findById` method", () => {
      expect(Sessions.findbyId).toBeDefined()
    })

    it("Should have a `logOutAllSessionsByUserId` method", () => {
      expect(Sessions.logOutAllSessionsByUserId).toBeDefined()
    })

    it("Should have a `getUserSessionsByUserId` method", () => {
      expect(Sessions.getUserSessionsByUserId).toBeDefined()
    })

    it("Should have a `deleteUserSessionsByUserId` method", () => {
      expect(Sessions.deleteUserSessionsByUserId).toBeDefined()
    })
  })

  describe("Test model logic", () => {
    const user = {
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: "test123",
      isAdmin: false,
    } as User

    beforeAll(async () => {
      const createdUser = await Users.create(user.firstName, user.lastName, user.email, user.password as string)
      user.id = createdUser.id
    })

    const session = {
      userId: user.id,
      token: "token",
      createdAt: new Date(),
      loggedOut: false,
      loggedOutAt: null,
    } as Session

    afterAll(async () => {
      const sql = `DELETE FROM sessions; DELETE FROM users`
      await pool.query(sql)
    })

    describe("Test the `create` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await Sessions.create(INVALID_ID, session.token)

        expect(result).toBeNull()
      })

      it("Should return a new session", async () => {
        const result = await Sessions.create(user.id, session.token)

        expect(result?.userId).toEqual(user.id)
        expect(result?.token).toEqual(session.token)
        expect(result?.createdAt).toBeDefined()
        expect(result?.loggedOut).toBeFalse()
        expect(result?.loggedOutAt).toBeNull()

        session.id = result?.id
      })
    })

    describe("Test the `findbyId` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await Sessions.findbyId(INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return a session by id", async () => {
        const result = await Sessions.findbyId(session.id as string)

        expect(result?.id).toEqual(session.id)
        expect(result?.token).toEqual(session.token)
        expect(result?.userId).toEqual(user.id)
        expect(result?.loggedOut).toBeFalse()
        expect(result?.loggedOutAt).toBeNull()
      })
    })

    describe("Test the `getUserSessionsByUserId` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await Sessions.getUserSessionsByUserId(INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return sessions by user id", async () => {
        const result = await Sessions.getUserSessionsByUserId(user.id)

        expect(result?.length).toEqual(1)
      })
    })

    describe("Test the `getUserSessionsByUserId` method", () => {
      it("Should not through an error", async () => {
        expect(async () => await Sessions.logOutAllSessionsByUserId(user.id)).not.toThrowError()
      })
    })

    describe("Test the `getUserSessionsByUserId` method", () => {
      it("Should not deletes all session by user id", async () => {
        await Sessions.deleteUserSessionsByUserId(user.id)
        const result = await Sessions.getUserSessionsByUserId(user.id)

        expect(result?.length).toEqual(0)
      })
    })
  })
})
