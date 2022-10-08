CREATE TABLE order_products (
  id uuid DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  "orderId" uuid NOT NULL REFERENCES orders(id),
  "productId" uuid NOT NULL REFERENCES products(id),
  count int NOT NULL,
  PRIMARY KEY("orderId", "productId")
);