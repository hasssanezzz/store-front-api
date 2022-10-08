import Users from "../../models/user.model"
import pool from "../../db"
import { User } from "../../interfaces"
import { INVALID_ID } from "../../constants"

describe("User model", () => {
  describe("Test methods exist", () => {
    it("Should have a `create` method", () => {
      expect(Users.create).toBeDefined()
    })

    it("Should have a `findAll` method", () => {
      expect(Users.findAll).toBeDefined()
    })

    it("Should have a `findById` method", () => {
      expect(Users.findById).toBeDefined()
    })

    it("Should have a `findByEmail` method", () => {
      expect(Users.findByEmail).toBeDefined()
    })

    it("Should have an `updateProfie` method", () => {
      expect(Users.updateProfie).toBeDefined()
    })

    it("Should have an `updatePasswordByEmail` method", () => {
      expect(Users.updatePasswordByEmail).toBeDefined()
    })

    it("Should have a `setAdminById` method", () => {
      expect(Users.setAdminById).toBeDefined()
    })

    it("Should have a `deleteById` method", () => {
      expect(Users.deleteById).toBeDefined()
    })
  })

  describe("Test model logic", () => {
    afterAll(async () => {
      const sql = `DELETE FROM users`
      await pool.query(sql)
    })

    const user = {
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: "test123",
    } as User

    const admin = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      password: "test123",
    } as User

    describe("Test the create method", () => {
      it("Should Returns a user", async () => {
        const createdUser = await Users.create(user.firstName, user.lastName, user.email, user.password as string)
        expect(createdUser.firstName).toEqual(user.firstName)
        expect(createdUser.lastName).toEqual(user.lastName)
        expect(createdUser.email).toEqual(user.email)
        expect(createdUser.isAdmin).toEqual(false)

        user.id = createdUser.id
      })

      it("Should Returns an admin if `isAdmin` boolean is provided", async () => {
        const createdAdminUser = await Users.create(
          admin.firstName,
          admin.lastName,
          admin.email,
          admin.password as string,
          true,
        )

        expect(createdAdminUser.firstName).toEqual(admin.firstName)
        expect(createdAdminUser.lastName).toEqual(admin.lastName)
        expect(createdAdminUser.email).toEqual(admin.email)
        expect(createdAdminUser.isAdmin).toEqual(true)

        admin.id = createdAdminUser.id
      })
    })

    describe("Test the `findAll` method", () => {
      it("Should return all users", async () => {
        const result = await Users.findAll()
        expect(result.length).toEqual(2)
      })

      it("Should return all users if `admins` bool is provided", async () => {
        const result = await Users.findAll(true)
        expect(result.length).toEqual(1)
      })
    })

    describe("Test the `findById` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await Users.findById(INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return a user by id", async () => {
        const result = await Users.findById(user.id)

        expect(result?.firstName).toEqual(user.firstName)
        expect(result?.lastName).toEqual(user.lastName)
        expect(result?.email).toEqual(user.email)
        expect(result?.isAdmin).toEqual(false)
      })
    })

    describe("Test the `findByEmail` method", () => {
      it("Should return null if bad email was provided", async () => {
        const result = await Users.findByEmail(INVALID_ID)

        expect(result).toBeNull()
      })

      it("Should return a user by email", async () => {
        const result = await Users.findByEmail(user.email)

        expect(result?.firstName).toEqual(user.firstName)
        expect(result?.lastName).toEqual(user.lastName)
        expect(result?.email).toEqual(user.email)
        expect(result?.isAdmin).toEqual(false)
      })
    })

    describe("Test the `updateProfile` mehthod", () => {
      it("Should return null if bad id was provided", async () => {
        const result = await Users.updateProfie(INVALID_ID, user.firstName, user.lastName, user.email)

        expect(result).toBeNull()
      })

      it("Should returns updated user", async () => {
        // updating the local user
        user.firstName = "Testing"

        const result = await Users.updateProfie(user.id, user.firstName, user.lastName, user.email)

        expect(result?.firstName).toEqual(user.firstName)
        expect(result?.lastName).toEqual(user.lastName)
        expect(result?.email).toEqual(user.email)
        expect(result?.isAdmin).toEqual(false)
      })
    })

    describe("Test the `setAdminById` method", () => {
      it("Should returns null if bad id was provided", async () => {
        const result = await Users.setAdminById(INVALID_ID, true)

        expect(result).toBeNull()
      })

      it("Should return user with new `isAdmin` value", async () => {
        const result = await Users.setAdminById(user.id, true)

        expect(result?.firstName).toEqual(user.firstName)
        expect(result?.lastName).toEqual(user.lastName)
        expect(result?.email).toEqual(user.email)
        expect(result?.isAdmin).toEqual(true)

        // making the user not admin
        await Users.setAdminById(user.id, false)
      })
    })

    describe("Test the `udpatePasswordByEmail` method", () => {
      it("Should return a user and updates the password", async () => {
        const result = await Users.updatePasswordByEmail(user.email, "newPassword")

        expect(result?.email).toBe(user.email)
        expect(result?.password).toBe("newPassword")

        user.password = "newPassword"
      })
    })

    describe("Test the `deleteById` method", () => {
      it("Should delete user id", async () => {
        await Users.deleteById(user.id)
        const result = await Users.findById(user.id)

        expect(result).toBeNull()
      })
    })
  })
})
