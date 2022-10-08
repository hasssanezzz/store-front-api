import pool from "../db"
import { OrderProduct } from "../interfaces"
import { isValidId } from "../utils"

class OrderProductsModel {
  async create(orderId: string, productId: string, count: number): Promise<OrderProduct | null> {
    try {
      if (!isValidId(orderId) || !isValidId(productId)) return null

      const sql = `INSERT INTO order_products ("orderId", "productId", count) VALUES ($1, $2, $3) RETURNING *`
      const { rows } = await pool.query(sql, [orderId, productId, count])

      return rows[0] || null
    } catch (error) {
      throw new Error(`Could not create order product, error: ${error}`)
    }
  }

  async findAllByOrderId(id: string): Promise<OrderProduct | null> {
    try {
      if (!isValidId(id)) return null

      const sql = `SELECT op."orderId", JSON_AGG(JSONB_BUILD_OBJECT('id', p.id, 'name', p.name, 'description', p.description, 'price', p.price, 'category', p.category, 'count', op.count)) products FROM order_products op JOIN products p ON p.id = op."productId" WHERE op."orderId" = $1 GROUP BY op."orderId"`
      const { rows } = await pool.query(sql, [id])

      return rows[0] || null
    } catch (error) {
      throw new Error(`Could not find order products by order id: ${id}, error: ${error}`)
    }
  }

  async findByOrderIdAndProductId(orderId: string, productId: string): Promise<OrderProduct | null> {
    try {
      if (!isValidId(orderId) || !isValidId(productId)) return null

      const sql = `SELECT op.id id, op."orderId", p.id "productId", JSONB_BUILD_OBJECT('id', p.id, 'name', p.name, 'description', p.description, 'price', p.price, 'category', p.category) product, count FROM order_products op JOIN products p ON p.id = op."productId" WHERE op."orderId" = $1 AND op."productId" = $2`
      const { rows } = await pool.query(sql, [orderId, productId])

      return rows[0] || null
    } catch (error) {
      throw new Error(
        `Could not find order product by orderId: ${orderId} and productId: ${productId}, error: ${error}`,
      )
    }
  }

  async updateByOrderIdAndProductId(
    orderId: string,
    productId: string,
    newProductId: string,
    count: number | null,
  ): Promise<OrderProduct | null> {
    try {
      if (!isValidId(orderId) || !isValidId(productId)) return null

      const orderProduct = await this.findByOrderIdAndProductId(orderId, productId)

      if (orderProduct === null) {
        return null
      }

      const sql = `UPDATE order_products SET "productId" = $1, count = $2 WHERE "orderId" = $3 AND "productId" = $4 RETURNING *`
      const { rows } = await pool.query(sql, [
        newProductId || productId,
        typeof count === "number" ? count : orderProduct?.count,
        orderId,
        productId,
      ])

      return rows[0]
    } catch (error) {
      throw new Error(
        `Could not update order product by orderId: ${orderId} and productId: ${productId}, error: ${error}`,
      )
    }
  }

  async deleteByIdOrderIdAndProductId(orderId: string, productId: string): Promise<void> {
    try {
      if (!isValidId(orderId) || !isValidId(productId)) return

      const sql = `DELETE FROM order_products WHERE "orderId" = $1 AND "productId" = $2`
      await pool.query(sql, [orderId, productId])
    } catch (error) {
      throw new Error(
        `Could not delete order product by orderId: ${orderId} and productId: ${productId}, error: ${error}`,
      )
    }
  }
}

const OrderProducts = new OrderProductsModel()

export default OrderProducts
