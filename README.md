# DYNAMIC RAG 🚀  
An AI-powered MERN stack application designed to support **Dynamic RAG (Retrieval-Augmented Generation)** and real-time communication using **Socket.io**.

> ⚠️ **NOTE:**  
> You must have **Node.js (latest version)** installed on your system before setting up this project.  
> Download Node.js from: https://nodejs.org

---

## 🧠 Project Overview

**DYNAMIC RAG** is a full-stack MERN application intended to:
- Support real-time features using **Socket.io**
- Connect to **MongoDB Atlas**
- Serve as a foundation for **AI-powered RAG features**
- Run in a **development environment**

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.io
- dotenv
- cors

### Frontend
- React
- Vite

---

## 📦 Prerequisites

Make sure you have the following installed:
- **Node.js (latest version)**
- **npm**
- **MongoDB Atlas account**
- A modern web browser

---

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── server/
│   │   └── index.js
│   ├── models/
│   ├── connections/
│   ├── rag/
│   ├── socket-utils/
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔐 Environment Variables (Backend)

Create a `.env` file inside the **backend** directory.

```env
MONGO_URL_CHAT=your_mongodb_atlas_connection_string
ORIGIN=http://localhost:5173
PORT=3001
```

⚠️ **Never commit `.env` files to GitHub.**

---

## 🗄 MongoDB Atlas Setup

1. Create a cluster on **MongoDB Atlas**
2. Create a database user
3. Whitelist your IP address
4. Copy the connection string
5. Paste it into `MONGO_URL_CHAT` in the `.env` file

---

## ▶️ Running the Application (Development)

### 1️⃣ Start the Backend (Required First)

Open a terminal and run:

```bash
cd backend
cd server
node index.js
```

- Backend runs on port **3001**
- Socket.io server initializes on the same port

### 2️⃣ Start the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs on **http://localhost:5173**

---

## 🔌 Socket.io Notes

- Backend must be running **first**
- Frontend connects to Socket.io at: `http://localhost:3001`

---

## 🤖 RAG (Retrieval-Augmented Generation)

- RAG-related logic lives inside the `backend/rag` directory
- AI integrations will be added in future updates
- Project structure is prepared for easy extension

---

## ❗ Common Issues & Fixes

### Backend not starting
- Check `.env` values
- Verify MongoDB Atlas connection string
- Ensure port **3001** is not in use

### Frontend not connecting
- Make sure backend is running
- Verify `ORIGIN` value in `.env`

---

## 🧪 Development Only

This project is currently configured for:
- ✅ Development use only
- ❌ No production build setup yet

---

## 📌 Final Notes

- Do **NOT** commit `node_modules`
- Do **NOT** commit `.env`
- Always start **backend before frontend**
- Keep Node.js updated



---

**Happy Coding! 🎉**
