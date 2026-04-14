-- V3: Re-seed test data using pgcrypto for correct bcrypt hash generation
-- This ensures compatibility with Spring Security's BCryptPasswordEncoder

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert test user only if not already present
INSERT INTO users (id, name, email, password, created_at)
SELECT
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Test User',
    'test@example.com',
    crypt('password123', gen_salt('bf', 12)),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'test@example.com'
);

-- Insert demo project owned by test user
INSERT INTO projects (id, name, description, owner_id, created_at)
SELECT
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Demo Project',
    'A sample project to explore TaskFlow features.',
    '00000000-0000-0000-0000-000000000001'::uuid,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE id = '00000000-0000-0000-0000-000000000002'::uuid
);

-- Insert 3 tasks with different statuses
INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
SELECT
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Set up project structure',
    'Initialize repo, configure Docker, and set up CI.',
    'done',
    'high',
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    CURRENT_DATE + INTERVAL '7 days',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tasks WHERE id = '00000000-0000-0000-0000-000000000003'::uuid
);

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
SELECT
    '00000000-0000-0000-0000-000000000004'::uuid,
    'Build authentication API',
    'Implement JWT login and registration endpoints.',
    'in_progress',
    'high',
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    CURRENT_DATE + INTERVAL '14 days',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tasks WHERE id = '00000000-0000-0000-0000-000000000004'::uuid
);

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
SELECT
    '00000000-0000-0000-0000-000000000005'::uuid,
    'Design Kanban board UI',
    'Create drag-and-drop task columns with status grouping.',
    'todo',
    'medium',
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    CURRENT_DATE + INTERVAL '21 days',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tasks WHERE id = '00000000-0000-0000-0000-000000000005'::uuid
);
