import Orders from "../../models/order.model"
import { User } from "../../interfaces"
import { INVALID_ID } from "../../constants"
import pool from "../../db"
import Users from "../../models/user.model"

describe("Order model", () => {
  describe("Test methods exist", () => {
    it("Should have a `create` method", () => {
      expect(Orders.create).toBeDefined()
    })

    it("Should have a `findAll` method", () => {
      expect(Orders.findAll).toBeDefined()
    })

    it("Should have a `findById` method", () => {
      expect(Orders.findById).toBeDefined()
    })

    it("Should have a `findAllByUserId` method", () => {
      expect(Orders.findAllByUserId).toBeDefined()
    })

    it("Should have an `updateById` method", () => {
      expect(Orders.updateById).toBeDefined()
    })

    it("Should have a `deleteById` method", () => {
      expect(Orders.deleteById).toBeDefined()
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

    let orderId: string

    beforeAll(async () => {
      const createdUser = await Users.create(user.firstName, user.lastName, user.email, user.password as string)
      user.id = createdUser.id
    })

    afterAll(async () => {
      const sql = `DELETE FROM orders; DELETE FROM users`
      await pool.query(sql)
    })

    describe("Test the `create` method", () => {
      it("Should return null if bad id was provided", async () => {
        const result = await Orders.create(INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return an order", async () => {
        const result = await Orders.create(user.id)

        expect(result?.userId).toEqual(user.id)
        expect(result?.status).toEqual(0)

        orderId = result?.id as string
      })
    })

    describe("Test the `findAll` method", () => {
      it("Should return all products", async () => {
        const result = await Orders.findAll()
        expect(result.length).toEqual(1)
      })
    })

    describe("Test the `findById` method", () => {
      it("Should return null if bad id was provided", async () => {
        const result = await Orders.findById(INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return product by id", async () => {
        const result = await Orders.findById(orderId)

        expect(result?.id).toEqual(orderId)
        expect(result?.userId).toEqual(user.id)
        expect(result?.status).toEqual(0)
      })
    })

    describe("Test the `updateById` method", () => {
      it("Should return null if bad id was provided", async () => {
        const result = await Orders.updateById(INVALID_ID, user.id, 0)
        expect(result).toBeNull()
      })

      it("Should return updated product", async () => {
        const result = await Orders.updateById(orderId, user.id, 1)

        expect(result?.status).toEqual(1)
      })
    })

    describe("Test the `deleteById` method", () => {
      it("Should delete order id", async () => {
        await Orders.deleteById(orderId)
        const result = await Orders.findById(orderId)

        expect(result).toBeNull()
      })
    })
  })
})
