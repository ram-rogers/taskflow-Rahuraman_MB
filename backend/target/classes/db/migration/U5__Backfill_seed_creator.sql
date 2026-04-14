-- U5: Undo the creator_id backfill for seed tasks (requires Flyway Pro/Enterprise to run)
UPDATE tasks
SET creator_id = NULL
WHERE project_id = '00000000-0000-0000-0000-000000000002'
  AND creator_id = '00000000-0000-0000-0000-000000000001';
