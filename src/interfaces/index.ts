export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  password?: string | null
  isAdmin: boolean
}

export interface Session {
  id?: string
  token: string
  userId: string
  loggedOut: boolean
  createdAt: Date
  loggedOutAt: Date | null
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

export interface Order {
  id: string
  userId: string
  createdAt: Date
  status: 0 | 1 | 2
  products?: Product[]
}

export interface OrderProduct {
  id: string
  orderId: string
  productId: string
  count: number
  product?: Product
  products?: Product[]
}
