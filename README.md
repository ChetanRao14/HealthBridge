# HealthBridge

HealthBridge is a MERN stack healthcare booking platform with role-based access for **Patients**, **Doctors**, and **Admins**.

## Tech Stack

- Client: React + Vite + TailwindCSS
- Server: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT access + refresh tokens (httpOnly cookie)
- Uploads: Multer + Cloudinary (doctor verification documents)
- Realtime: Socket.IO (chat)

## Project Structure

- `client/` - React frontend
- `server/` - Express API + Socket.IO

## Prerequisites

- Node.js 18+
- MongoDB connection string
- (Optional) Cloudinary account for document uploads

## Environment Variables

Create these files locally (do **not** commit real secrets):

- `server/.env` (see `server/.env.example`)
- `client/.env` (see `client/.env.example`)

## Install

### 1) Server

```bash
npm install
```

```bash
npm run dev
```

Server runs on `http://localhost:5000` and exposes API under `http://localhost:5000/api`.

### 2) Client

```bash
npm install
```

```bash
npm run dev
```

Client runs on `http://localhost:5173`.

## Roles & Flow

- **Patient**: registers with profile details and can book appointments.
- **Doctor**: registers with profile details first. Verification documents are uploaded **after signup** from the Doctor Dashboard.
- **Admin**: can approve/reject doctors and manage the platform.

## Default Admin (optional)

If you provide `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` in `server/.env`, the server will seed a default admin on startup.

## Notes

- Doctor appointment endpoints are gated by approval status.
- Doctor dashboard supports uploading documents even when status is `pending`/`rejected`.
