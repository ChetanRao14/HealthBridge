<div align="center">
  <h1>🏥 HealthBridge</h1>
  <p>A modern, full-stack healthcare booking platform connecting patients and doctors.</p>
</div>

<br />

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?logo=tailwind-css&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime_Chat-010101?logo=socketdotio&logoColor=white)

## 📖 Overview

HealthBridge is a comprehensive MERN stack platform designed to streamline healthcare access. It features robust role-based access control (RBAC) allowing distinct experiences for **Patients**, **Doctors**, and **Admins**. 

With integrated real-time chat, secure document verification, and a streamlined booking system, HealthBridge delivers a premium telemedicine and clinic booking experience.

## ✨ Key Features

- 🔐 **Role-Based Authentication**: Secure JWT-based access and refresh tokens (httpOnly cookies) for Patients, Doctors, and Admins.
- 👨‍⚕️ **Doctor Portal**: Registration, document upload (Cloudinary integration), consultation fee & slot management, and appointment tracking.
- 🧑‍💻 **Patient Portal**: Search doctors by specialty/location, book appointments, and leave reviews.
- 🛡️ **Admin Dashboard**: Verification system to approve/reject doctors ensuring platform safety.
- 💬 **Real-time Consultation**: Built-in Socket.IO chat for patients and doctors to communicate regarding appointments.
- 🎨 **Modern UI**: Fully responsive, beautiful interface built with TailwindCSS and Vite.

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, React Router |
| **Backend** | Node.js, Express, Socket.IO, Multer |
| **Database** | MongoDB, Mongoose |
| **Services** | Cloudinary (Document/Image storage) |

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v18 or higher)
- MongoDB Connection URI (e.g., MongoDB Atlas)
- Cloudinary Account (for image/document uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/HealthBridge.git
cd HealthBridge
```

### 2. Environment Setup

The application is split into two directories: `client` and `server`. You need to set up environment variables for both.

**Server Setup (`/server/.env`)**
Create a `.env` file in the `server/` directory and add the following keys (see `server/.env.example` for reference):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DEFAULT_ADMIN_EMAIL=admin@healthbridge.com
DEFAULT_ADMIN_PASSWORD=admin
```

**Client Setup (`/client/.env`)**
*(If applicable, configure Vite variables)*
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Run

You'll need to run the server and client concurrently in separate terminal windows.

#### Start the Server
```bash
cd server
npm install
npm run dev
```
*The server will start on `http://localhost:5000`*

#### Start the Client
```bash
cd client
npm install
npm run dev
```
*The React app will start on `http://localhost:5173`*

## 🧑‍💼 User Roles & Flow

1. **Patients** 
   - Sign up and complete their profile details.
   - Search for verified doctors and book available time slots.
   - Initiate real-time chats with doctors for active appointments.
2. **Doctors** 
   - Register and upload strict verification documents via their dashboard.
   - Wait for Admin approval (Booking endpoints are securely gated).
   - Set up custom consultation fees, available dates, and specific time slots.
3. **Administrators** 
   - Auto-seeded on startup if `DEFAULT_ADMIN_*` variables are provided.
   - Manage doctor verifications (Approve/Reject).

## 🛡️ License

This project is licensed under the MIT License.
