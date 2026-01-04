# DYNAMIC RAG 🚀

An advanced project ecosystem combining a real-time RAG (Retrieval-Augmented Generation) application with a dedicated Multi-Factor Authentication (MFA) service.

## 📂 Project Structure

The project is organized into two main modules:

### 1. **APP** (Main Application)

The core application that handles:

- **Real-time Communication**: Powered by **Socket.io**.
- **RAG Capabilities**: Foundation for AI-driven retrieval and generation.
- **Frontend**: A React + Vite application with dynamic visuals (Vanta.js).
- **Backend**: An Express.js server with MongoDB integration.

### 2. **AUTHENTICATOR** (Security Service)

A standalone service dedicated to user security:

- **Multi-Factor Authentication (MFA)**.
- **JWT-based Auth**: Secure session management.
- **Email Notifications**: Using Nodemailer.
- **Frontend**: A React + Vite interface running on port 5000.
- **Backend**: An Express.js server handling auth logic.

---

## 🛠 Tech Stack

### **APP**

- **Frontend**: React, Vite, Socket.io-client, Vanta.js, Three.js
- **Backend**: Node.js, Express, Mongoose, Socket.io

### **AUTHENTICATOR**

- **Frontend**: React, Vite, Vanta.js, Three.js
- **Backend**: Node.js, Express, Mongoose, JWT, Bcrypt, Nodemailer

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (Latest LTS recommended)
- **MongoDB Atlas** account and connection string

### 1️⃣ Setting up the **APP** (Main Application)

#### Backend

1. Navigate to `APP/backend`.
2. Create a `.env` file with:
   ```env
   MONGO_URL_CHAT=your_mongodb_connection_string
   PORT=3001
   ```
3. Install and run:
   ```bash
   npm install
   npm start
   ```

#### Frontend

1. Navigate to `APP/frontend`.
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   > Runs on default Vite port (usually `http://localhost:5173`)

---

### 2️⃣ Setting up the **AUTHENTICATOR**

#### Backend

1. Navigate to `AUTHENTICATOR/backend`.
2. Create a `.env` file with your auth secrets (DB URL, JWT Secret, Email creds).
3. Install and run:
   ```bash
   npm install
   node index.js
   ```

#### Frontend

1. Navigate to `AUTHENTICATOR/frontend`.
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   > **Note:** Configured to run on **port 5000** (`http://localhost:5000`)

---
