CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES users(id),
  token VARCHAR(1000) NOT NULL,
  "loggedOut" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "loggedOutAt" timestamp
);