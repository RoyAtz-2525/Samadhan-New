# SAMADHAN - Civic Issue Reporting and Resolution Platform

## Project Overview
SAMADHAN is a comprehensive platform for reporting and resolving civic issues. It involves multiple roles: Citizens, Admins, Managers, Workers, and Super Admins.

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, React Router, Socket.IO, Mapbox, Lucide React, Recharts.
- **Backend**: Node.js, Express.js, PostgreSQL, Prisma, Socket.IO, Cloudinary, Redis, BullMQ, Razorpay.

## Directory Structure
- `/frontend`: React frontend built with Vite.
- `/backend`: Node.js + Express backend with Prisma ORM.
- `/docs`: Architecture documentation and guides.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

### Frontend
1. Navigate to the `frontend` directory: `cd frontend`
2. Copy `.env.example` to `.env` and fill the variables.
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

### Backend
1. Navigate to the `backend` directory: `cd backend`
2. Copy `.env.example` to `.env` and configure your database and API keys.
3. Install dependencies: `npm install`
4. Initialize the database: `npx prisma db push` (or `npx prisma migrate dev` when models are ready)
5. Start development server: `npm run dev`
