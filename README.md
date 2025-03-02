# Fitness X - Project Setup

## Overview

Fitness X is a fitness management platform built as a monorepo containing three main applications:

- Backend API (NestJS)
- Client Portal (React/Vite)
- Admin Portal (UmiJS)

This README guides you through setting up the project for local development.

## Prerequisites

- Node.js (v18+)
- pnpm (v8+)
- MySQL database

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd fitness-x
```

2. Install dependencies:

```bash
pnpm install
```

## Environment Setup

### Backend

Create a `.env` file in the `packages/backend` directory:

```
# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=fitness_x
DB_SYNCHRONIZE=true

# JWT settings
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

# Optional: Port configuration (defaults to 3000)
PORT=3000
```

### Client Portal

Copy the example environment file in the client portal:

```bash
cd packages/client-portal
cp .env.example .env
```

The default configuration should work with the local backend:

```
# API URL Configuration (if not using Vite's proxy)
VITE_API_URL=http://localhost:3000

# Optional: Debug mode
VITE_DEBUG=true

# Optional: Environment designation
VITE_APP_ENV=development
```

### Admin Portal

Create a `.env` file in the `packages/admin-portal` directory:

```
API_URL=http://localhost:3000
```

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE fitness_x;
```

The database schema will be automatically created by TypeORM if `DB_SYNCHRONIZE=true` is set in the backend `.env` file.

## Running the Project

Start all applications at once:

```bash
pnpm start
```

Or start individual applications:

```bash
# Backend API
pnpm start:backend

# Client Portal
pnpm start:client

# Admin Portal
pnpm start:admin
```

## Access the Applications

- Backend API: [http://localhost:3000](http://localhost:3000)
- Swagger Documentation: [http://localhost:3000/swagger](http://localhost:3000/swagger)
- Client Portal: [http://localhost:5173](http://localhost:5173)
- Admin Portal: [http://localhost:8000](http://localhost:8000)

## Project Structure

```
fitness-x/
├── packages/
│   ├── backend/         # NestJS API
│   ├── client-portal/   # React frontend for clients
│   └── admin-portal/    # UmiJS admin dashboard
└── package.json         # Root package.json with workspace scripts
```

Each package has its own package.json with specific scripts and dependencies.
