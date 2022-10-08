CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description text NOT NULL,
  price int NOT NULL,
  category VARCHAR(255) NOT NULL
);