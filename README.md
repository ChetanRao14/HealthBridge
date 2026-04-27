<div align="center">



[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Overview

**HealthBridge** is a full-stack MERN telemedicine platform that connects patients, doctors, and administrators through a single, role-based interface. It features real-time chat, appointment booking, digital prescriptions, and an admin-controlled doctor verification system.

---

## Features

**Patient**
- Register, search verified doctors, and book appointment slots
- Chat with doctors in real time (Socket.IO, per-appointment scope)
- View and download digital prescriptions
- Rate and review completed consultations

**Doctor**
- Register, upload credentials for admin verification (Cloudinary)
- Set availability, consultation fees, and manage appointments
- Communicate with patients and issue digital prescriptions

**Admin**
- Review and approve or reject doctor verification requests
- Monitor all users and platform activity

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| Backend | Node.js, Express.js |
| Real-Time | Socket.IO |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (access + refresh tokens), httpOnly cookies |
| Storage | Cloudinary + Multer |
| Security | Helmet, bcrypt, express-rate-limit, express-validator |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Cloudinary](https://cloudinary.com/) account

### 1. Clone

```bash
git clone https://github.com/your-username/HealthBridge.git
cd HealthBridge
```

### 2. Environment Variables

**`server/.env`** (see `server/.env.example` for full reference)

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/HealthBridge

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

DEFAULT_ADMIN_EMAIL=admin@healthbridge.com
DEFAULT_ADMIN_PASSWORD=ChangeMe123!
```

> ⚠️ Never commit your `.env` file. It is covered by `.gitignore`.

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install & Run

**Backend**
```bash
cd server
npm install
npm run dev
# Runs at http://localhost:5000
```

**Frontend**
```bash
cd client
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## Project Structure

```
HealthBridge/
├── client/                  # React + Vite frontend
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/            # Axios API layer
│   ├── App.jsx
│   └── main.jsx
│
└── server/                  # Node.js + Express backend
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── utils/
    ├── app.js
    └── server.js
```

---

## Security

| Feature | Implementation |
|:---|:---|
| Token Strategy | JWT access tokens (15 min) + refresh tokens (7 days) |
| Cookie Security | `httpOnly`, `Secure`, `SameSite` — XSS-safe |
| Passwords | `bcrypt` hashing |
| Route Guards | Role-based middleware: `patient` / `doctor` / `admin` |
| Rate Limiting | `express-rate-limit` on all endpoints |
| HTTP Headers | `helmet` — CSP, HSTS, X-Frame-Options |
| Validation | `express-validator` on all request bodies |

---

## API Reference

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| POST | `/api/auth/register` | Public | Register a patient |
| POST | `/api/auth/login` | Public | Login (all roles) |
| POST | `/api/auth/logout` | Auth | Logout & clear cookies |
| POST | `/api/auth/refresh` | Auth | Refresh access token |
| GET/PUT | `/api/patients/me` | Patient | View / update profile |
| GET | `/api/doctors` | Public | List verified doctors |
| GET | `/api/doctors/:id` | Public | Doctor public profile |
| PUT | `/api/doctors/me` | Doctor | Update doctor profile |
| GET/POST | `/api/appointments` | Auth | List / book appointments |
| PATCH | `/api/appointments/:id` | Auth | Update appointment status |
| GET/POST | `/api/messages/:appointmentId` | Auth | Chat history / send message |
| GET/POST | `/api/prescriptions` | Auth | List / issue prescriptions |
| GET | `/api/admin/doctors` | Admin | List all doctors |
| PATCH | `/api/admin/doctors/:id/verify` | Admin | Approve or reject doctor |
| GET | `/api/admin/patients` | Admin | List all patients |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: description"`
4. Push and open a Pull Request
