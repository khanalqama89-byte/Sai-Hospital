# Sai Hospital Management System

A full-stack web application for hospital management, including patient appointments, lab records, IPD admissions, user management, and email notifications.

---

## 📁 Repository Structure

```
sai-hospital/
├── frontend/               # React 19 Web Client
│   ├── src/                # React components, routes & styles
│   ├── public/             # Static public assets
│   └── package.json        # Frontend dependencies & scripts
│
├── backend/                # Spring Boot Java 17 REST API
│   ├── src/                # Controllers, models, repositories, services
│   ├── database_setup.sql  # MySQL database table definitions
│   └── pom.xml             # Maven dependencies & build configuration
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup (`Spring Boot`)

1. Prerequisites: Java 17+, MySQL Server.
2. Setup MySQL Database:
   ```sql
   CREATE DATABASE saihospitaldb;
   ```
3. Run Backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   The backend API will run on `http://localhost:8080`.

---

### 2. Frontend Setup (`React`)

1. Prerequisites: Node.js 18+.
2. Install dependencies & run development server:
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The web application will open at `http://localhost:3000`.

---

## 🛠️ Features

- 🏥 **Appointment Booking**: Online booking portal with status management (Pending, Approved, Rejected).
- 🔬 **Lab Administration**: Pathology & lab record management.
- 🛌 **IPD Administration**: Patient admission, bed allocation, billing & discharge workflow.
- 🔐 **Authentication & Roles**: JWT-based authentication, role management (Doctor, Admin, Staff).
- 📧 **Automated Notifications**: Email OTP verification & appointment status updates.
