import pool from "../db"
import { Session } from "../interfaces"
import { isValidId } from "../utils"

// TODO: id error handling

class SessionModel {
  async create(userId: string, token: string): Promise<Session | null> {
    try {
      if (!isValidId(userId)) return null

      const sql = `INSERT INTO sessions ("userId", token, "createdAt") VALUES ($1, $2, $3) RETURNING *`
      const { rows } = await pool.query(sql, [userId, token, new Date()])

      return rows[0]
    } catch (error) {
      throw new Error(`Could not create session, error: ${error}`)
    }
  }

  async findbyId(id: string): Promise<Session | null> {
    try {
      if (!isValidId(id)) return null

      const sql = `SELECT * FROM sessions WHERE id = $1`
      const { rows } = await pool.query(sql, [id])

      return rows.length ? rows[0] : null
    } catch (error) {
      throw new Error(`Could not find session by id: ${id}, error: ${error}`)
    }
  }

  async logOutAllSessionsByUserId(userId: string): Promise<void> {
    try {
      if (!isValidId(userId)) return

      const sql = `UPDATE sessions SET "loggedOut" = true, "loggedOutAt" = $1 WHERE "loggedOut" = false AND "userId" = $2`
      await pool.query(sql, [new Date(), userId])
    } catch (error) {
      throw new Error(`Could not log out all sessions by user id: ${userId}, error: ${error}`)
    }
  }

  async getUserSessionsByUserId(userId: string): Promise<Session[] | null> {
    try {
      if (!isValidId(userId)) return null

      const sql = `SELECT * FROM sessions WHERE "userId" = $1`
      const { rows } = await pool.query(sql, [userId])

      return rows
    } catch (error) {
      throw new Error(`Could not get session by user id: ${userId}, error: ${error}`)
    }
  }

  async deleteUserSessionsByUserId(userId: string): Promise<void> {
    try {
      if (!isValidId(userId)) return

      const sql = `DELETE FROM sessions WHERE "userId" = $1`
      await pool.query(sql, [userId])
    } catch (error) {
      throw new Error("Could not delete user sessions by user id " + userId)
    }
  }
}

const Sessions = new SessionModel()

export default Sessions
