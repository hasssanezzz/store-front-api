import { INVALID_ID } from "../../constants"
import pool from "../../db"
import { Product } from "../../interfaces"
import Products from "../../models/product.model"

describe("Product model", () => {
  describe("Test methods exist", () => {
    it("Should have a `create` method", () => {
      expect(Products.create).toBeDefined()
    })

    it("Should have a `findAll` method", () => {
      expect(Products.findAll).toBeDefined()
    })

    it("Should have a `findById` method", () => {
      expect(Products.findById).toBeDefined()
    })

    it("Should have a `popular` method", () => {
      expect(Products.popular).toBeDefined()
    })

    it("Should have an `updateById` method", () => {
      expect(Products.updateById).toBeDefined()
    })

    it("Should have a `deleteById` method", () => {
      expect(Products.deleteById).toBeDefined()
    })
  })

  const product = {
    name: "Test product",
    description: "test description",
    price: 50,
    category: "test",
  } as Product

  describe("Test model logic", () => {
    afterAll(async () => {
      const sql = `DELETE FROM products`
      await pool.query(sql)
    })

    describe("Test the `create` method", () => {
      it("Should return a product", async () => {
        const result = await Products.create(product.name, product.description, product.price, product.category)

        expect(result.name).toEqual(product.name)
        expect(result.description).toEqual(product.description)
        expect(result.price).toEqual(product.price)
        expect(result.category).toEqual(product.category)

        product.id = result.id as string
      })
    })

    describe("Test the `findAll` method", () => {
      it("Should return all products", async () => {
        const result = await Products.findAll()
        expect(result.length).toEqual(1)
      })
    })

    describe("Test the `findById` method", () => {
      it("Should return null if bad id was provided", async () => {
        const result = await Products.findById(INVALID_ID)
        expect(result).toBeNull()
      })

      it("Should return product by id", async () => {
        const result = await Products.findById(product.id)

        expect(result?.name).toEqual(product.name)
        expect(result?.description).toEqual(product.description)
        expect(result?.price).toEqual(product.price)
        expect(result?.category).toEqual(product.category)
      })
    })

    describe("Test the `updateById` method", () => {
      it("Should return null if bad id was provided", async () => {
        const result = await Products.updateById(
          INVALID_ID,
          product.name,
          product.description,
          product.price,
          product.category,
        )
        expect(result).toBeNull()
      })

      it("Should return updated product", async () => {
        product.name = "Test update"
        product.category = "Test category"

        const result = await Products.updateById(
          product.id,
          product.name,
          product.description,
          product.price,
          product.category,
        )

        expect(result?.name).toEqual(product.name)
        expect(result?.category).toEqual(product.category)
      })
    })

    describe("Test the `deleteById` method", () => {
      it("Should delete product id", async () => {
        await Products.deleteById(product.id)
        const result = await Products.findById(product.id)

        expect(result).toBeNull()
      })
    })
  })
})
