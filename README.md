# Storefront Backend Project

1. [Installation and setting up](#installation-and-setting-up)
1. [Database tables](#database-tables)
   - [Users](#users)
   - [Sessions](#sessions)
   - [Products](#products)
   - [Order](#orders)
   - [Order products](#order-products)
1. [Types](#types)
   - [User](#user)
   - [Session](#session)
   - [product](#product)
   - [Order](#order)
   - [Order product](#order-products)
1. [Routes](#routes)
   - [Users endpoints](#users-endpoints)
   - [Authentication endpoints](#authentication-endpoints)
   - [Products endpoints](#products-endpoints)
   - [Order endpoints](#orders-endpoints)
   - [Order endpoints products](#order-products-endpoints)

# Installation and setting up

Simply, run the followings command to run the project:

1. install required dependencies `npm i`
2. run the start script `npm start`
3. for developemnt run `npm run dev`


### Setup environment

First, create a `.env` file with all the required environment variables:

```bash
NODE_ENV=dev

DB_HOST=localhost
DB_USERNAME=<your_db_username>
DB_PASSWORD=<your_db_password>
DB_NAME=<your_db_name>
DB_NAME_TEST=<your_test_db_name>
DB_PORT=<your_db_port>

JWT_SECRET=<your_jwt_secret>
```

Next, you need to run the database migrations:

```bash
npm run migrations:up
```

## Running the application

Use the following command to run the application in watch mode:

```bash
npm run dev
```

Use the following command to run the application in using node:

```bash
npm start
```

The application will run on <http://localhost:5000/>.

## Running the unit tests

Use the following command to run the unit tests:

```bash
npm run test
```

## Built With

- [NodeJS](https://nodejs.org/) - The JavaScript runtime
- [db-migrate](https://db-migrate.readthedocs.io/en/latest/) - The database migration tool
- [Express](https://expressjs.com) - The web framework
- [TypeScript](https://www.typescriptlang.org/) - Types JS extension
- [Jasmine](https://jasmine.github.io/) - The unit testing framework


# Database tables

#### Users

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "isAdmin" boolean DEFAULT false NOT NULL
);
```

#### Sessions

```sql
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES users(id),
  token VARCHAR(1000) NOT NULL,
  "loggedOut" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "loggedOutAt" timestamp
);
```

#### Products

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description text NOT NULL,
  price int NOT NULL,
  category VARCHAR(255) NOT NULL
);
```

#### Orders

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status int DEFAULT 0 NOT NULL
);
```

#### Order products

```sql
CREATE TABLE order_products (
  id uuid DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  "orderId" uuid NOT NULL REFERENCES orders(id),
  "productId" uuid NOT NULL REFERENCES products(id),
  count int NOT NULL,
  PRIMARY KEY("orderId", "productId")
);
```

# Types

#### User:

```ts
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  password?: string | null
  isAdmin: boolean
}
```

#### Session:

```ts
export interface Session {
  id?: string
  token: string
  userId: string
  loggedOut: boolean
  createdAt: Date
  loggedOutAt: Date | null
}
```

#### Product:

```ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}
```

#### Order:

```ts
export interface Order {
  id: string
  userId: string
  createdAt: Date
  status: 0 | 1 | 2
  products?: Product[]
}
```

#### Order type:

```typescript
export interface OrderProduct {
  id: string
  orderId: string
  productId: string
  count: number
  product?: Product
  products?: Product[]
}
```

# Routes

### Users endpoints:

| #   | METHOD | URL                       | REQUEST BODY                   | DESCRIPTION                             | PRIVATE ROUTE | ADMINS ONLY |
| --- | ------ | ------------------------- | ------------------------------ | --------------------------------------- | ------------- | ----------- |
| [*] | GET    | `/api/users`              |                                | Get all users.                          | ✔             | ✔           |
| [*] | GET    | `/api/users/{user_id}`    |                                | Get one user data.                      | ✔             | X           |
| [*] | GET    | `/api/admins`             |                                | Get all admins.                         | ✔             | ✔           |
| [*] | PUT    | `/api/users/{user_id}`    | `{firtsName, lastName, email}` | Edit user details by id.                | ✔             | ✔           |
| [*] | PUT    | `/api/users`              | `{firtsName, lastName, email}` | Edit user details by logged in user id. | ✔             | X           |
| [*] | PUT    | `/api/users/make-admin`   | `{id}`                         | Set user as admin by id.                | ✔             | ✔           |
| [*] | PUT    | `/api/users/remove-admin` | `{id}`                         | Remove admin by id.                     | ✔             | ✔           |
| [*] | DELETE | `/api/users/{user_id}`    |                                | Delete user by id.                      | ✔             | ✔           |
| [*] | DELETE | `/api/users`              |                                | Delete user by logged in user id.       | ✔             | X           |

### Authentication endpoints:

| #   | METHOD | URL                    | REQUEST BODY                                 | DESCRIPTION                                                                          | PRIVATE ROUTE | ADMINS ONLY |
| --- | ------ | ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ | ------------- | ----------- |
| [*] | POST   | `/api/login`           | `{email, password}`                          | Logs in a user.                                                                      | ✔             | X           |
| [*] | POST   | `/api/register`        | `{firstName, lastName, email, password}`     | Register a new user.                                                                 | ✔             | X           |
| [*] | PUT    | `/api/update-password` | `{email, password, newPassowrd}`             | Reset user password.                                                                 | ✔             | X           |
| [*] | GET    | `/api/verify-session`  | `cookie: SESSID` or `request header: sessid` | It validate a session by reading the session id from the request headers or cookies. | ✔             | X           |

### Products endpoints:

| #   | METHOD | URL                          | REQUEST BODY                           | DESCRIPTION                        | PRIVATE ROUTE | ADMINS ONLY |
| --- | ------ | ---------------------------- | -------------------------------------- | ---------------------------------- | ------------- | ----------- |
| [*] | GET    | `/api/products`              |                                        | Get all products.                  | X             | X           |
| [*] | GET    | `/api/products/{product_id}` |                                        | Get product by id.                 | X             | X           |
| [*] | GET    | `/api/products/popular`      |                                        | Gets the top 5 purchased products. | X             | X           |
| [*] | PUT    | `/api/products/{product_id}` | `{name, description, price, category}` | Update products data by id.        | ✔             | ✔           |
| [*] | POST   | `/api/products`              | `{name, description, price, category}` | Create a new product.              | ✔             | ✔           |
| [*] | DELETE | `/api/products/{product_id}` |                                        | Delete product by id.              | ✔             | ✔           |

### Orders endpoints:

| #   | METHOD | URL                      | REQUEST BODY       | DESCRIPTION              | PRIVATE ROUTE | ADMINS ONLY |
| --- | ------ | ------------------------ | ------------------ | ------------------------ | ------------- | ----------- |
| [*] | GET    | `/api/orders`            |                    | Get all orders.          | ✔             | ✔           |
| [*] | GET    | `/api/orders/{order_id}` |                    | Get order by id.         | ✔             | X           |
| [*] | PUT    | `/api/orders/{order_id}` | `{userId, status}` | Update order data by id. | ✔             | ✔           |
| [*] | POST   | `/api/orders`            | `{userId}`         | Create a new order.      | ✔             | X           |
| [*] | DELETE | `/api/orders/{order_id}` |                    | Delete order by id.      | ✔             | X           |

### Order products endpoints:

| #   | METHOD | URL                                           | REQUEST BODY         | DESCRIPTION               | PRIVATE ROUTE | ADMINS ONLY |
| --- | ------ | --------------------------------------------- | -------------------- | ------------------------- | ------------- | ----------- |
| [*] | GET    | `/api/orders/{orderId}/products`              |                      | Get all order products.   | ✔             | X           |
| [*] | GET    | `/api/orders/{orderId}/products/{product_id}` |                      | Get order product.        | ✔             | X           |
| [*] | PUT    | `/api/orders/{orderId}/products/{product_id}` | `{productId, count}` | Update order product.     | ✔             | ✔           |
| [*] | POST   | `/api/orders/{orderId}/products`              | `{productId, count}` | Create order product.     | ✔             | X           |
| [*] | DELETE | `/api/orders/{orderId}/products/{product_id}` |                      | Delete all order product. | ✔             | X           |