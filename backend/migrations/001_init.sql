CREATE TABLE IF NOT EXISTS expenses (
  id          SERIAL PRIMARY KEY,
  description TEXT    NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  category    TEXT    NOT NULL CHECK (category IN ('food', 'transport', 'other')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
