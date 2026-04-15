-- U7: Undo migration for V7
-- Cannot easily revert an encrypted password to its previously unknown broken hash state,
-- so we just leave it or set it to an invalid hash to simulate the broken state.
UPDATE users SET password = 'invalid_hash_rollback' WHERE email = 'test@example.com';
