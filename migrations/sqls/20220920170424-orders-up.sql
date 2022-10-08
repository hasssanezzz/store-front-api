CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES users(id),
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status int DEFAULT 0 NOT NULL
);