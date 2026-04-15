-- V7: Fix test user password
-- The hash seeded in V2 was incorrect and V3 skipped insertion because the user already existed.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users 
SET password = crypt('password123', gen_salt('bf', 12)),
    failed_login_attempts = 0,
    locked_until = NULL
WHERE email = 'test@example.com';
