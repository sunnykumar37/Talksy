# Talksy Monorepo

Real-time chat application built with Next.js, Convex, and Clerk.

## Project Structure

- `frontend/`: Next.js 14 App Router application.
- `backend/`: Convex backend containing database schema and functions.

## Setup

### 1. Environment Variables

#### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk Dashboard -> API Keys
- `CLERK_SECRET_KEY`: From Clerk Dashboard -> API Keys
- `NEXT_PUBLIC_CONVEX_URL`: Found by running `npx convex dev` in `/backend` (it will print a URL like `https://happy-fox-123.convex.cloud`)

#### Backend (`backend/.env` - Optional)
- `CLERK_WEBHOOK_SECRET`: Optional, for user sync via webhooks.

### 2. Running Locally

**Terminal 1 (Backend):**
```bash
cd backend
npx convex dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Workspaces
This project uses npm workspaces. You can run commands globally if needed, e.g., `npm install` at the root will install dependencies for both packages.
