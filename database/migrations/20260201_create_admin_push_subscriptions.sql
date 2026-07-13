-- Single row table for admin push subscription
CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
    id INTEGER PRIMARY KEY DEFAULT 1,
    subscription JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only ever allow 1 row
CREATE UNIQUE INDEX IF NOT EXISTS admin_push_sub_single ON admin_push_subscriptions (id);
