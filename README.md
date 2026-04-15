# TaskFlow

TaskFlow is a minimal, beautifully designed task management system with authentication, project management, and task boards.

## 1. Overview
TaskFlow allows users to register, log in, create projects, and manage tasks within a dynamic Kanban-style interface. 
It uses a modern tech stack featuring:
- **Backend**: Java 17, Spring Boot 3.2, Spring Security, Data JPA, PostgreSQL, Flyway.
- **Frontend**: React 18, TypeScript, Vite, React Router DOM.
- **Design System**: A fully custom vanilla CSS system prioritizing modern glassmorphism, gradient accents, responsive design, and smooth micro-animations.

## 2. Architecture Decisions
- **Modularity**: The backend follows a layered architecture (Controllers, Services, Repositories). The frontend utilizes a feature-based folder structure with shared Context, API services, and View components.
- **State Management**: Uses React `useContext` for global authentication state, keeping the bundle size small by avoiding heavy state management libraries.
- **Design System**: Custom CSS variables are used to maintain a consistent, performant, and unique UI without the overhead of external component libraries.
- **Security**: Stateless JWT-based authentication ensures backend scalability. Input validation is enforced via Jakarta Validation API.
- **Database Migrations**: Flyway manages schema evolution. Note: While `U` (undo) scripts are provided for development convenience, they are not intended for production rollback; production migrations should always be additive.

## 3. Running Locally

Make sure you have Docker and Docker Compose installed.

```bash
# Clone the repository
git clone <repository-url>
cd taskflow

# Copy environment variables
cp .env.example .env

# Ensure VITE_API_URL in your .env points to the backend
# VITE_API_URL=http://localhost:4000

# Build and start all services
docker compose up
```
The Frontend app corresponds to [http://localhost:3000](http://localhost:3000)
The Backend API runs at [http://localhost:4000](http://localhost:4000)

## 4. Running Migrations
Migrations are handled automatically by Flyway upon application start. Docker-compose runs the Postgres database and Spring Boot initializes the schema automatically. Schema definitions, seed data, and schema updates (`V1` through `V7`) are included in `backend/src/main/resources/db/migration`.

**Schema Summary:**
- `V1` — Initial schema
- `V2` — Legacy seed data
- `V3` — Reseed test data (using pgcrypto)
- `V4` — Add creator to tasks
- `V5` — Backfill test data
- `V6` — Add login attempts to users
- `V7` — Fix test user password hash

## 5. Test Credentials
A user is seeded into the database for immediate testing:
```
Email:    test@example.com
Password: password123
```

## 6. API Reference

All protected endpoints require `Authorization: Bearer <jwt-token>`.

### Authentication
- `POST /auth/register` - body: `{name, email, password}` -> returns `{token, user}`
- `POST /auth/login` - body: `{email, password}` -> returns `{token, user}`

### Projects
- `GET /projects` - requires Auth -> returns `{ projects: [...] }`
- `POST /projects` - body: `{name, description}` -> returns created project
- `GET /projects/:id` - returns project details with tasks appended
- `PATCH /projects/:id` - update optionally `{name, description}`
- `DELETE /projects/:id` - deletes project and nested tasks

### Tasks
- `GET /projects/:id/tasks` - fetch tasks for project with filters `?status=` `?assignee=`
- `POST /projects/:id/tasks` - body: `{title, description, status, priority, assignee_id, due_date}`
- `PATCH /tasks/:id` - update a task with optionally provided attributes
- `DELETE /tasks/:id` - deletes a specific task

## 7. What You'd Do With More Time
- **Real-time updates**: Implement WebSocket or SSE to push task changes to all connected clients without polling.
- **Pagination**: Add cursor-based or offset pagination to the `/projects` and `/tasks` endpoints for large datasets.
- **Integration tests**: Use JUnit 5 + TestContainers on the backend and React Testing Library on the frontend to cover core auth and task flows.
- **Role-based access control**: Add a `member` role column to allow fine-grained permissions (viewer vs. editor) per project.
- **Email notifications**: Send assignment and due-date reminder emails via JavaMail or SendGrid.
- **File attachments**: Allow users to attach files to tasks using S3-compatible storage.
- **Observability**: Integrate SLF4J/Logback with an ELK stack or similar for centralized logging and structured error tracking.
