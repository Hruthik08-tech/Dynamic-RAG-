# Dynamic RAG - Main Application Frontend 🎨

The user interface for the Dynamic RAG application, designed for real-time interaction and immersive visuals.

## ✨ Features

- **Real-time Chat/Updates**: Powered by `socket.io-client` for instant communication with the backend.
- **Dynamic Backgrounds**: Immersive visual effects using **Vanta.js** and **Three.js**.
- **Modern UI**: Built with **React** and **Vite** for speed and component-based architecture.
- **Responsive Design**: Optimized for various screen sizes.

## 🛠 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Real-time**: Socket.io-client
- **Visuals**: Vanta.js, Three.js
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites

- Ensure the **APP Backend** is running on port `3001`.

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser at the URL shown in the terminal (default: `http://localhost:5173`).

## 🔌 Configuration

The application expects the backend to be available at `http://localhost:3001` (or as configured in your environment).

## 📂 Structure

- `src/`: Main source code
  - `components/`: Reusable UI components
  - `pages/`: Application pages/routes
  - `assets/`: Static assets
