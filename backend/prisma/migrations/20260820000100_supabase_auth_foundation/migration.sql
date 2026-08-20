DROP TABLE IF EXISTS "auth_accounts";
DROP TABLE IF EXISTS "sessions";
DROP TYPE IF EXISTS "AuthProvider";

ALTER TABLE "users"
    DROP COLUMN IF EXISTS "password_hash",
    ADD COLUMN "full_name" VARCHAR(120),
    ADD COLUMN "avatar_url" VARCHAR(2048);
