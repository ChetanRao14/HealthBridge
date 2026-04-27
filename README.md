<div align="center">

<br />

# 🏥 HealthBridge

### *Bridging the gap between patients and quality healthcare*

**A modern, full-stack MERN telemedicine & appointment booking platform**  
with real-time chat, role-based access, and secure document verification.

<br />

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.1.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<br />

[✨ Features](#-features) &nbsp;·&nbsp;
[🚀 Getting Started](#-getting-started) &nbsp;·&nbsp;
[📁 Project Structure](#-project-structure) &nbsp;·&nbsp;
[🔐 Security](#-authentication--security) &nbsp;·&nbsp;
[🔄 API Reference](#-api-routes-overview)

<br />

</div>

---

## 📖 About The Project

**HealthBridge** is a comprehensive healthcare platform built on the MERN stack. It connects **Patients**, **Doctors**, and **Administrators** through a single, unified platform with dedicated dashboards for each role.

Patients can discover verified doctors, book appointments, chat in real time, and track prescriptions. Doctors manage their entire practice — from availability and consultation fees to appointments and patient reviews. Administrators ensure quality control by verifying doctor credentials before they go live on the platform.

> Built with security, scalability, and user experience at its core.

---

## ✨ Features

<details>
<summary><b>🧑‍💻 Patient Portal</b></summary>
<br />

- 🔐 Secure registration & login with JWT authentication
- 🔍 Search and filter doctors by specialty and location
- 📅 Book available appointment slots in real time
- 💬 Chat directly with doctors via Socket.IO
- 📋 View, download, and manage prescriptions
- ⭐ Leave ratings and reviews for completed appointments
- ⚙️ Update profile, contact, and personal settings

</details>

<details>
<summary><b>👨‍⚕️ Doctor Portal</b></summary>
<br />

- 📝 Register and submit verification documents (Cloudinary-powered)
- 🕐 Manage availability: set dates, time slots, and consultation fees
- 📆 Track and update incoming appointment statuses
- 💬 Real-time patient communication via Socket.IO
- 💊 Issue digital prescriptions linked to appointments
- ⭐ View patient reviews and ratings
- ⚙️ Full profile and consultation settings management

</details>

<details>
<summary><b>🛡️ Admin Dashboard</b></summary>
<br />

- 🔑 Secure login (admin account auto-seeded from environment variables)
- ✅ Review, approve, or reject doctor verification applications
- 🗂️ View detailed doctor and patient profiles
- 📊 Monitor all platform activity and registered users

</details>

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, React Router v6 |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth** | JWT Access & Refresh Tokens (httpOnly cookies) |
| **File Storage** | Cloudinary + Multer |
| **Security** | Helmet, bcrypt, express-rate-limit, express-validator |
| **Email** | Nodemailer |
| **Dev Tools** | Nodemon, Vite HMR |

---

## 📁 Project Structure

```
HealthBridge/
│
├── client/                          # ⚛️  React + Vite frontend
│   ├── components/
│   │   ├── TopBar.jsx               # Global navigation bar
│   │   ├── ProtectedRoute.jsx       # Role-based route guard
│   │   └── DobInput.jsx             # Date-of-birth input component
│   ├── context/                     # React context (auth state, etc.)
│   ├── hooks/                       # Custom React hooks
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── RoleLoginPage.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── PatientAppointmentsPage.jsx
│   │   ├── PatientSettingsPage.jsx
│   │   ├── PatientReviewPage.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── DoctorAppointmentsPage.jsx
│   │   ├── DoctorProfileSettingsPage.jsx
│   │   ├── DoctorConsultationSettingsPage.jsx
│   │   ├── DoctorReviewsPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminDoctorDetailsPage.jsx
│   │   ├── AdminPatientDetailsPage.jsx
│   │   ├── AdminProfileSettingsPage.jsx
│   │   ├── ChatPage.jsx
│   │   └── PrescriptionPage.jsx
│   ├── services/                    # Axios API service layer
│   ├── App.jsx                      # Root component & route definitions
│   └── main.jsx                     # Application entry point
│
└── server/                          # 🟢  Node.js + Express backend
    ├── config/                      # DB & Cloudinary configuration
    ├── controllers/                 # Business logic per resource
    ├── middlewares/                 # Auth guards, error handler, file upload
    ├── models/
    │   ├── Patient.js
    │   ├── Doctor.js
    │   ├── Admin.js
    │   ├── Appointment.js
    │   ├── Message.js
    │   └── Prescription.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── patientRoutes.js
    │   ├── doctorPublicRoutes.js
    │   ├── doctorPrivateRoutes.js
    │   ├── appointmentRoutes.js
    │   ├── messageRoutes.js
    │   ├── prescriptionRoutes.js
    │   └── adminRoutes.js
    ├── utils/                       # Helper functions & utilities
    ├── app.js                       # Express app setup & middleware
    └── server.js                    # HTTP server + Socket.IO initialization
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **MongoDB Atlas** account & cluster URI → [Sign up](https://www.mongodb.com/atlas)
- **Cloudinary** account → [Sign up](https://cloudinary.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/HealthBridge.git
cd HealthBridge
```

---

### 2. Configure Environment Variables

#### 🟢 Server — `/server/.env`

Create a `.env` file in the `server/` directory (reference: `server/.env.example`):

```env
# App
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/HealthBridge

# JWT
JWT_ACCESS_SECRET=your_strong_access_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CLIENT_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Default Admin (auto-seeded on first run)
DEFAULT_ADMIN_EMAIL=admin@healthbridge.com
DEFAULT_ADMIN_PASSWORD=ChangeMe123!
```

> ⚠️ **Important:** Never commit your `.env` file. It is already listed in `.gitignore`.

#### ⚛️ Client — `/client/.env`

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Install Dependencies & Run

Open **two terminals** — one for the server, one for the client.

**Terminal 1 — Backend**

```bash
cd server
npm install
npm run dev
```

> 🟢 API server starts at `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
cd client
npm install
npm run dev
```

> ⚛️ React app starts at `http://localhost:5173`

---

## 🔐 Authentication & Security

HealthBridge implements a production-grade security model:

| Feature | Implementation |
| :--- | :--- |
| **Token Strategy** | Short-lived JWT access tokens (15 min) + long-lived refresh tokens (7 days) |
| **Cookie Security** | Tokens stored in `httpOnly`, `Secure`, `SameSite` cookies (XSS-safe) |
| **Password Hashing** | `bcrypt` with salt rounds |
| **Route Protection** | Role-based middleware guards (`patient` / `doctor` / `admin`) |
| **Rate Limiting** | `express-rate-limit` on all API endpoints |
| **HTTP Headers** | `helmet` for security headers (CSP, HSTS, etc.) |
| **Input Validation** | `express-validator` on all incoming request bodies |

---

## 🔄 API Routes Overview

| Route Prefix | Access | Description |
| :--- | :--- | :--- |
| `POST /api/auth/register` | Public | Patient registration |
| `POST /api/auth/login` | Public | Login (all roles) |
| `POST /api/auth/logout` | Auth | Logout & clear cookies |
| `POST /api/auth/refresh` | Auth | Refresh access token |
| `GET/PUT /api/patients/me` | Patient | Profile management |
| `GET /api/doctors` | Public | Search & list verified doctors |
| `GET /api/doctors/:id` | Public | View doctor profile |
| `PUT /api/doctors/me` | Doctor | Update doctor profile |
| `GET/POST /api/appointments` | Auth | Book & view appointments |
| `PATCH /api/appointments/:id` | Auth | Update appointment status |
| `GET/POST /api/messages/:appointmentId` | Auth | Chat message history |
| `GET/POST /api/prescriptions` | Auth | Prescription management |
| `GET /api/admin/doctors` | Admin | List all doctors |
| `PATCH /api/admin/doctors/:id/verify` | Admin | Approve / reject doctor |
| `GET /api/admin/patients` | Admin | List all patients |

---

## 💬 Real-Time Chat

HealthBridge uses **Socket.IO** for live, bidirectional messaging between patients and doctors scoped to a specific appointment. The Socket.IO server runs alongside the Express HTTP server on the same port.

```
Client A (Patient) ──┐
                      ├──► Socket.IO Server ◄──► MongoDB (message persistence)
Client B (Doctor)  ──┘
```

---

## 👥 User Flow

```
🧑‍💻 Patient
  └── Register → Browse Doctors → Book Slot → Chat → Get Prescription → Leave Review

👨‍⚕️ Doctor
  └── Register → Upload Docs → [ Await Admin Approval ] → Set Availability → Manage Appointments → Chat → Write Prescription

🛡️ Admin
  └── Login → Review Pending Doctors → Approve / Reject → Monitor Platform
```

---

## 📦 Dependencies

<details>
<summary><b>Backend Dependencies</b></summary>
<br />

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `express` | ^4.18.2 | Web framework |
| `mongoose` | ^7.5.0 | MongoDB ODM |
| `socket.io` | ^4.7.2 | Real-time WebSocket server |
| `jsonwebtoken` | ^9.0.2 | JWT generation & verification |
| `bcrypt` | ^5.1.1 | Password hashing |
| `cloudinary` | ^1.40.0 | Cloud media storage |
| `multer` | ^1.4.5 | Multipart file upload handling |
| `nodemailer` | ^6.9.4 | Email sending |
| `helmet` | ^7.0.0 | HTTP security headers |
| `express-rate-limit` | ^6.10.0 | API rate limiting |
| `express-validator` | ^7.0.1 | Request input validation |
| `cookie-parser` | ^1.4.6 | Cookie parsing middleware |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^16.3.1 | Environment variable loader |

</details>

<details>
<summary><b>Frontend Dependencies</b></summary>
<br />

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | DOM rendering |
| `react-router-dom` | ^6.22.3 | Client-side routing |
| `axios` | ^1.6.7 | HTTP client |
| `socket.io-client` | ^4.7.2 | Real-time WebSocket client |
| `tailwindcss` | ^3.4.1 | Utility-first CSS framework |
| `libphonenumber-js` | ^1.11.7 | Phone number parsing & validation |
| `country-state-city` | ^3.2.1 | Location dropdown data |
| `vite` | ^5.1.4 | Frontend build tool & dev server |

</details>

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'Add: your feature description'`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please make sure your code follows the existing structure and is well-documented.

---

<div align="center">

Made with ❤️ by the HealthBridge Team

</div>
