-- BCrypt hash mapping for 'password123' at cost factor 12: 
-- $2a$12$L7R2QoU1tNlsf7bQyWqJ/.s3.F0P8.eXYn0w.LWe6Yl1P0/VbB0hG

INSERT INTO users (id, name, email, password, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com', '$2y$12$1/yXY.j9xHIfs9Bv.UerVeyu/aLhL011bHj1V7w3l25J1P6Z7k4qS', NOW());

INSERT INTO projects (id, name, description, owner_id, created_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'Demo Project', 'A project for testing tasks', '00000000-0000-0000-0000-000000000001', NOW());

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'First Task in Todo', 'Description 1', 'todo', 'low', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-12-31', NOW(), NOW());

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000004', 'Second Task In Progress', 'Description 2', 'in_progress', 'medium', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-12-31', NOW(), NOW());

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000005', 'Third Task Done', 'Description 3', 'done', 'high', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-12-31', NOW(), NOW());
