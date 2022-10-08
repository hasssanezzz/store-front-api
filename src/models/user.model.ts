import pool from "../db"
import { User } from "../interfaces"
import { isValidId } from "../utils"

class UserModel {
  async create(firstName: string, lastName: string, email: string, password: string, isAdmin?: boolean): Promise<User> {
    try {
      const sql = `INSERT INTO users ("firstName", "lastName", email, password, "isAdmin") VALUES ($1, $2, $3, $4, $5) RETURNING *`
      const { rows } = await pool.query(sql, [firstName, lastName, email, password, isAdmin || false])

      return rows[0]
    } catch (error) {
      throw new Error(`Could not create user, error: ${error}`)
    }
  }

  async findAll(admins?: boolean): Promise<User[]> {
    try {
      const sql = admins ? `SELECT * FROM users WHERE "isAdmin" = true` : `SELECT * FROM users`
      const { rows } = await pool.query(sql)

      return rows
    } catch (error) {
      throw new Error(`Could not get all users, error: ${error}`)
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!isValidId(id)) return null

      const sql = "SELECT * FROM users WHERE id = $1"
      const { rows } = await pool.query(sql, [id])

      return rows.length ? rows[0] : null
    } catch (error) {
      throw new Error(`Could not get user by id: ${id}, error: ${error}`)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const sql = "SELECT * FROM users WHERE email = $1"
      const { rows } = await pool.query(sql, [email])

      return rows.length ? rows[0] : null
    } catch (error) {
      throw new Error(`Could not get user by email: ${email}, error: ${error}`)
    }
  }

  async updateProfie(id: string, firstName: string, lastName: string, email: string): Promise<User | null> {
    try {
      if (!isValidId(id)) return null

      const user = await this.findById(id)
      const sql = `UPDATE users SET "firstName" = $1, "lastName" = $2, "email" = $3 WHERE id = $4 RETURNING *`
      const { rows } = await pool.query(sql, [
        firstName || user?.firstName,
        lastName || user?.lastName,
        email || user?.email,
        id,
      ])

      return rows[0]
    } catch (error) {
      throw new Error(`Could not update user profile by id: ${id}, error: ${error}`)
    }
  }

  async setAdminById(id: string, admin: boolean): Promise<User | null> {
    try {
      if (!isValidId(id)) return null

      const sql = `UPDATE users SET "isAdmin" = $1 WHERE id = $2 RETURNING *`
      const { rows } = await pool.query(sql, [admin, id])

      return rows[0]
    } catch (error) {
      throw new Error(`Could not set user as ${admin} admin by id: ${id}, error: ${error}`)
    }
  }

  async updatePasswordByEmail(email: string, password: string): Promise<User> {
    try {
      const sql = `UPDATE users SET password = $1 WHERE email = $2 RETURNING *`
      const { rows } = await pool.query(sql, [password, email])

      return rows[0]
    } catch (error) {
      throw new Error(`Could not update user password by email: ${email}, error: ${error}`)
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      if (!isValidId(id)) return

      const sql = "DELETE FROM users WHERE id = $1"
      await pool.query(sql, [id])
    } catch (error) {
      throw new Error(`Could not delete user by id: ${id}, error: ${error}`)
    }
  }
}

const Users = new UserModel()

export default Users
