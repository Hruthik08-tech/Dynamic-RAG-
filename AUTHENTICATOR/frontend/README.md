# Authenticator Service - Frontend 🔒

The dedicated user interface for the Multi-Factor Authentication (MFA) service.

## ✨ Features

- **Secure Login/Signup**: Interfaces for user authentication.
- **MFA Verification**: UI for entering verification codes.
- **Visuals**: Enhanced with **Vanta.js** and **Three.js** for a premium feel.
- **Responsive**: Works across devices.

## 🛠 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Visuals**: Vanta.js, Three.js
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites

- Ensure the **AUTHENTICATOR Backend** is running.

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser at: `http://localhost:5000`
   > **Note:** This frontend is configured to run on port **5000** by default.

## 📂 Structure

- `src/`: Main source code
  - `components/`: Reusable UI components
  - `pages/`: Authentication pages (Login, Signup, Verify)
  - `assets/`: Static assets
