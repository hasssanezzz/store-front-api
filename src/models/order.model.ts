import pool from "../db"
import { Order } from "../interfaces"
import { isValidId } from "../utils"

class OrderModel {
  async create(userId: string): Promise<Order | null> {
    try {
      if (!isValidId(userId)) return null

      const sql = `INSERT INTO orders ("userId") VALUES ($1) RETURNING *`
      const { rows } = await pool.query(sql, [userId])
      return rows[0]
    } catch (error) {
      throw new Error(`Could not create order, error: ${error}`)
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      const sql = `SELECT o.id AS id, o."userId", u.email as email, JSON_AGG(JSONB_BUILD_OBJECT('id', p.id, 'name', p.name, 'description', p.description,'category', p.category, 'price', p.price, 'count', op.count)) AS products, o.status AS status FROM orders AS o LEFT JOIN order_products AS op ON o.id = op."orderId" LEFT JOIN products AS p ON op."productId" = p.id LEFT JOIN users u ON o."userId" = u.id GROUP BY o.id, u.email, o.status`
      const { rows } = await pool.query(sql)

      return rows
    } catch (error) {
      throw new Error(`Could find all orders, error: ${error}`)
    }
  }

  async findAllByUserId(userId: string): Promise<Order[] | null> {
    try {
      if (!isValidId(userId)) return null

      const sql = `SELECT o.id AS id, o."userId", u.email as email, JSON_AGG(JSONB_BUILD_OBJECT('id', p.id, 'name', p.name, 'description', p.description,'category', p.category, 'price', p.price, 'count', op.count)) AS products, o.status AS status FROM orders AS o LEFT JOIN order_products AS op ON o.id = op."orderId" LEFT JOIN products AS p ON op."productId" = p.id LEFT JOIN users u ON o."userId" = u.id WHERE o."userId" = $1 GROUP BY o.id, u.email, o.status`
      const { rows } = await pool.query(sql, [userId])

      return rows
    } catch (error) {
      throw new Error(`Could not find all orders by user id: ${userId}, error: ${error}`)
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      if (!isValidId(id)) return null

      const sql = `SELECT o.id AS id, o."userId", u.email as email, JSON_AGG(JSONB_BUILD_OBJECT('id', p.id, 'name', p.name, 'description', p.description,'category', p.category, 'price', p.price, 'count', op.count)) AS products, o.status AS status FROM orders AS o LEFT JOIN order_products AS op ON o.id = op."orderId" LEFT JOIN products AS p ON op."productId" = p.id LEFT JOIN users u ON o."userId" = u.id WHERE o.id = $1 GROUP BY o.id, u.email, o.status`
      const { rows } = await pool.query(sql, [id])

      return rows[0] || null
    } catch (error) {
      throw new Error(`Could not find order by id: ${id}, error: ${error}`)
    }
  }

  async updateById(id: string, userId: string, status: number): Promise<Order | null> {
    try {
      if (!isValidId(id)) return null

      const order = await this.findById(id)

      const sql = `UPDATE orders SET "userId" = $1, status = $2 WHERE id = $3 RETURNING *`
      const { rows } = await pool.query(sql, [userId || order?.userId, status || order?.status, id])

      return rows[0]
    } catch (error) {
      throw new Error(`Could not update order by id: ${id}, error: ${error}`)
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      if (!isValidId(id)) return

      const sql = `DELETE FROM orders WHERE id = $1`
      await pool.query(sql, [id])
    } catch (error) {
      throw new Error(`Could not delete order by id: ${id}, error: ${error}`)
    }
  }
}

const Orders = new OrderModel()

export default Orders
