import Orders from "../../models/order.model"
import { Product, User } from "../../interfaces"
import { INVALID_ID } from "../../constants"
import pool from "../../db"
import Users from "../../models/user.model"
import Products from "../../models/product.model"
import OrderProducts from "../../models/orderProducts.model"

describe("Order product model", () => {
  describe("Test methods exist", () => {
    it("Should have a `create` method", () => {
      expect(OrderProducts.create).toBeDefined()
    })

    it("Should have a `findAllByOrderId` method", () => {
      expect(OrderProducts.findAllByOrderId).toBeDefined()
    })

    it("Should have a `findByOrderIdAndProductId` method", () => {
      expect(OrderProducts.findByOrderIdAndProductId).toBeDefined()
    })

    it("Should have an `updateByOrderIdAndProductId` method", () => {
      expect(OrderProducts.updateByOrderIdAndProductId).toBeDefined()
    })

    it("Should have a `deleteByIdOrderIdAndProductId` method", () => {
      expect(OrderProducts.deleteByIdOrderIdAndProductId).toBeDefined()
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

    const product = {
      name: "Test product",
      description: "test description",
      price: 50,
      category: "test",
    } as Product

    let orderId: string
    const count = 4

    beforeAll(async () => {
      const createdUser = await Users.create(user.firstName, user.lastName, user.email, user.password as string)
      const createdProduct = await Products.create(product.name, product.description, product.price, product.category)
      const createdOrder = await Orders.create(createdUser.id)
      user.id = createdUser.id
      product.id = createdProduct.id
      orderId = createdOrder?.id as string
    })

    afterAll(async () => {
      const sql = `DELETE FROM order_products; DELETE FROM orders; DELETE FROM users; DELETE FROM products`
      await pool.query(sql)
    })

    describe("Test the `create` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await OrderProducts.create(INVALID_ID, INVALID_ID, count)
        expect(result).toBeNull()
      })

      it("Should return a new order product", async () => {
        const result = await OrderProducts.create(orderId, product.id, count)

        expect(result?.orderId).toEqual(orderId)
        expect(result?.productId).toEqual(product.id)
      })
    })

    describe("Test the `findAllByOrderId` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await OrderProducts.findAllByOrderId(INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return all order products by order id", async () => {
        const result = await OrderProducts.findAllByOrderId(orderId)

        expect(result?.products?.length).toEqual(1)
      })
    })

    describe("Test the `findByOrderIdAndProductId` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await OrderProducts.findByOrderIdAndProductId(INVALID_ID, INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return order product", async () => {
        const result = await OrderProducts.findByOrderIdAndProductId(orderId, product.id)

        expect(result?.orderId).toEqual(orderId)
        expect(result?.productId).toEqual(product.id)
        expect(result?.count).toEqual(count)
      })
    })

    describe("Test the `updateByOrderIdAndProductId` method", () => {
      it("Should return null if a bad id was provided", async () => {
        const result = await OrderProducts.updateByOrderIdAndProductId(INVALID_ID, INVALID_ID, INVALID_ID, 2)
        expect(result).toBeNull()
      })

      it("Should return updated order product", async () => {
        const result = await OrderProducts.updateByOrderIdAndProductId(orderId, product.id, product.id, 7)

        expect(result?.count).toEqual(7)
      })
    })

    describe("Test the `deleteByIdOrderIdAndProductId` method", () => {
      it("Should delete order product", async () => {
        await OrderProducts.deleteByIdOrderIdAndProductId(orderId, product.id)
        const result = await OrderProducts.findByOrderIdAndProductId(orderId, product.id)

        expect(result).toBeNull()
      })
    })
  })
})
