ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expires_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_google_id ON users (google_id);