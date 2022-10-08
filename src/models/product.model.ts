import pool from "../db"
import { Product } from "../interfaces"
import { isValidId } from "../utils"

class ProductModel {
  async create(name: string, description: string, price: number, category: string): Promise<Product> {
    try {
      const sql = `INSERT INTO products (name, description, price, category) VALUES ($1, $2, $3, $4) RETURNING *`
      const { rows } = await pool.query(sql, [name, description, price, category])
      return rows[0]
    } catch (error) {
      throw new Error(`Could not create product, error: ${error}`)
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const sql = `SELECT * FROM products`
      const { rows } = await pool.query(sql)

      return rows
    } catch (error) {
      throw new Error(`Could not get products, error: ${error}`)
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      if (!isValidId(id)) return null

      const sql = `SELECT * FROM products WHERE id = $1`
      const { rows } = await pool.query(sql, [id])

      return rows[0] || null
    } catch (error) {
      throw new Error(`Could not get product by id: ${id}, error: ${error}`)
    }
  }

  async popular(): Promise<Product[]> {
    try {
      const sql = `SELECT p.id, p.name, p.description, p.price, p.category, COUNT(name) "orders" FROM products p JOIN order_products ON p.id = order_products."productId" GROUP BY p.id ORDER BY orders DESC limit 5;`
      const { rows } = await pool.query(sql)

      return rows
    } catch (error) {
      throw new Error(`Could not get popular products, error: ${error}`)
    }
  }

  async updateById(
    id: string,
    name: string,
    description: string,
    price: number,
    category: string,
  ): Promise<Product | null> {
    try {
      if (!isValidId(id)) return null

      const product = await this.findById(id)

      const sql = `UPDATE products SET name = $1, description = $2, price = $3, category = $4 WHERE id = $5 RETURNING *`
      const { rows } = await pool.query(sql, [
        name || product?.name,
        description || product?.description,
        price || product?.price,
        category || product?.category,
        id,
      ])

      return rows[0]
    } catch (error) {
      throw new Error(`Could not update product by id: ${id}, error: ${error}`)
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      if (!isValidId(id)) return

      const sql = `DELETE FROM products WHERE id = $1`
      await pool.query(sql, [id])
    } catch (error) {
      throw new Error(`Could not delete product by id: ${id}, error: ${error}`)
    }
  }
}

const Products = new ProductModel()

export default Products
