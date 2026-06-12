# SecureVault - Password Manager

SecureVault is a modern, premium, and highly responsive web application for managing passwords and credentials. It allows users to create a master vault password, unlock the vault, and perform full CRUD (Create, Read, Update, Delete) operations on their credentials with categorization (social, finance, work, shopping, entertainment, and other).

The application has been migrated from browser-based `localStorage` to a persistent, containerized MongoDB database backend via a Node.js Express server.

**Author**: Nabil

---

## Architecture Overview

- **Frontend**: React, TypeScript, TailwindCSS, Vite, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB (running in a Docker container on port `27000`).

---

## Setup Instructions

### 1. Database Setup (Docker)

To run a dedicated MongoDB instance for this application, a `docker-compose.yml` file is provided in the project root.

Run the following command to start the MongoDB container with a persistent volume:
```bash
docker-compose up -d
```
This will start a MongoDB container named `password-vault-db` running on port `27000`.

*(Alternatively, ensure your existing Docker MongoDB container is running and exposed on host port `27000`.)*

### 2. Backend Server Setup

Navigate to the `server` directory and configure the environment:
1. Change directory to `/server`.
2. Create or verify the `server/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27000/password_vault
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

### 3. Frontend App Setup

From the root directory of the project:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`. Vite is pre-configured to proxy `/api/*` requests automatically to the backend server.

---

## Features

- **Master Password Security**: Setup and unlock the vault using a master password.
- **Secure Storage**: Credentials and vault master hashes are saved in MongoDB.
- **Plaintext Data Matching**: Retains the original simplicity of storing credentials in plaintext matching the original `localStorage` behavior.
- **Dynamic Category Filtering**: Group credentials by category (finance, social, etc.) and filter them in real-time.
- **Visual Analytics**: View credential statistics on a rich, modern dashboard.
- **Responsive Layout**: Premium dark-mode glassmorphic interface, fully mobile-responsive with micro-animations.
