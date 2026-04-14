-- V5: Backfill creator_id for existing seed tasks that were inserted before the creator column existed
UPDATE tasks
SET creator_id = '00000000-0000-0000-0000-000000000001'
WHERE creator_id IS NULL
  AND project_id = '00000000-0000-0000-0000-000000000002';
