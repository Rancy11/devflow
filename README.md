# DevFlow

A full-stack project management web app for developers. DevFlow lets you create projects, manage tasks on a Kanban-style board, invite collaborators via email, and track progress through an analytics dashboard — all wrapped in a clean, dark-themed UI.

---

## Features

- **Authentication** — Register and log in with JWT-based sessions (7-day expiry)
- **Projects** — Create, view, and delete projects; each project has an owner and a list of members
- **Tasks** — Create tasks within projects with statuses: `TODO`, `IN_PROGRESS`, and `DONE`
- **Personal Tasks** — A private task list separate from any project
- **Invitations** — Project owners can invite registered users by email; invitees receive a notification via [Resend](https://resend.com) and can accept or decline from within the app
- **Dashboard** — Overview of all projects, task counts, completion progress, and recent activity
- **Analytics** — Per-project task breakdowns, completion rates, and a task status summary
- **Protected Routes** — All app pages require authentication; unauthenticated users are redirected to login

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Axios, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB (via Mongoose) |
| Auth | JWT + bcrypt |
| Email | Resend API |
| Containerization | Docker, Docker Compose |

---

## Project Structure

```
devflow/
├── backend/
│   ├── src/
│   │   ├── config/        # MongoDB connection
│   │   ├── controllers/   # authController, projectController, taskController
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── models/        # User, Project, Task schemas
│   │   └── routes/        # authRoutes, projectRoutes, taskRoutes
│   ├── server.js
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Navbar, Sidebar, UI primitives
│   │   ├── context/       # AuthContext
│   │   └── pages/         # Dashboard, Projects, Project, Tasks, Analytics, Personal, Invitations
│   ├── index.html
│   └── Dockerfile
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose, **or** Node.js 18+ and a running MongoDB instance

### Run with Docker (recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/devflow.git
   cd devflow
   ```

2. Create `backend/.env` (see [Environment Variables](#environment-variables) below).

3. Start all services:
   ```bash
   docker compose up --build
   ```

4. Open the app at [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5000](http://localhost:5000).

### Run without Docker

**Backend:**
```bash
cd backend
npm install
# Make sure your .env is configured (see below)
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devflow
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key_here
```

> **Note:** The `RESEND_API_KEY` is required for invitation emails. You can get a free API key at [resend.com](https://resend.com). If the key is missing or invalid, invitations will still be created in the database — only the email notification will fail silently.

---

## API Reference

### Auth — `/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in and receive a JWT |

### Projects — `/projects`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/projects` | ✅ | Create a project |
| GET | `/projects` | ✅ | Get all projects you're a member of |
| DELETE | `/projects/:projectId` | ✅ | Delete a project (owner only) |
| POST | `/projects/:projectId/invite` | ✅ | Invite a user by email (owner only) |
| GET | `/projects/:projectId/invites` | ✅ | View pending invites for a project (owner only) |
| GET | `/projects/invites/me` | ✅ | View your own pending invitations |
| POST | `/projects/:projectId/invites/accept` | ✅ | Accept an invitation |
| POST | `/projects/:projectId/invites/decline` | ✅ | Decline an invitation |

### Tasks — `/tasks`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tasks` | ✅ | Create a task within a project |
| GET | `/tasks?projectId=<id>` | ✅ | Get all tasks for a project |
| PATCH | `/tasks/:taskId` | ✅ | Update a task's status |
| DELETE | `/tasks/:taskId` | ✅ | Delete a task |
| POST | `/tasks/personal` | ✅ | Create a personal task |
| GET | `/tasks/personal` | ✅ | Get your personal tasks |

All protected endpoints require a `Authorization: Bearer <token>` header.

---

## Data Models

**User** — `name`, `email`, `password` (hashed), `role` (`FREE` | `PRO`)

**Project** — `name`, `owner` (User ref), `members` (User refs), `pendingInvites` (user + invitedBy + invitedAt)

**Task** — `title`, `description`, `status` (`TODO` | `IN_PROGRESS` | `DONE`), `project` (nullable), `assignedTo` (User ref), `createdBy` (User ref)

---
