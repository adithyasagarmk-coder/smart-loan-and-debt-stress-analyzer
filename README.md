# Smart Loan & Debt Stress Analyzer

A comprehensive web application for loan management and financial stress analysis.  
The platform helps users manage loans, simulate EMIs, analyze debt burden, and view a financial dashboard through a modern full-stack architecture using React, Node.js, Express, and MongoDB.

---

## Features

- Landing page with animated **LightRays** background
- User authentication:
  - User login
  - User registration
- Dashboard with financial overview
- Loan management module
- EMI simulation
- Debt stress analysis
- Responsive frontend with charts and analytics

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS v4
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB

### Authentication
- JWT (JSON Web Token)

### Visual Effects
- Custom LightRays WebGL background

---

## Project Structure

```bash
smart-loan-and-debt-stress-analyzer/
├── backend/
├── frontend/
├── test-voice.js
└── README.md
```

- `frontend/` – React + Vite client application
- `backend/` – Express server, APIs, authentication, database logic
- `test-voice.js` – Additional project script or testing utility

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- MongoDB (local installation or MongoDB Atlas)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/adithyasagarmk-coder/smart-loan-and-debt-stress-analyzer.git
cd smart-loan-and-debt-stress-analyzer
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory and add the following:

```env
PORT=5000
MONGODB_URI=mongodb://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-at-least-32-chars
FRONTEND_URL=https://your-frontend.vercel.app
```

### Environment Variable Description

- `PORT` – Port for backend server
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – Secret key used for JWT token generation
- `FRONTEND_URL` – Frontend deployment URL for CORS or integration

---

## MongoDB Atlas Setup

If you are using MongoDB Atlas, follow these steps:

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string, for example:

```env
mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
```

5. Replace `<username>`, `<password>`, and `<database>` with your actual values
6. Paste the final string into `MONGODB_URI` inside the `.env` file

---

## Running the Project

### Run backend

Open terminal 1:

```bash
cd backend
node server.js
```

### Run frontend

Open terminal 2:

```bash
cd frontend
npm run dev
```

After starting both servers, open the frontend development URL shown by Vite in your browser.

---

## Build for Production

To build the frontend for production:

```bash
cd frontend
npm run build
```

---

## Application Routes

| Path | Description |
|------|-------------|
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/dashboard` | Main dashboard |
| `/loans` | Loan management |
| `/simulation` | EMI simulation |
| `/analysis` | Debt stress analysis |

