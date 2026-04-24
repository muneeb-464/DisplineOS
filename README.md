# DisciplineOS

A productivity and time-tracking web app built with React, TypeScript, and Node.js. Plan your day, log actual hours, track Islamic prayers (Namaz), score your productivity, and review trends over time.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Available Scripts](#available-scripts)
- [Pages & Routes](#pages--routes)
- [Scoring System](#scoring-system)
- [Google OAuth Setup](#google-oauth-setup)

---

## Features

- **Day Planner** — create planned time blocks by hour
- **Log Screen** — log actual time spent vs planned
- **Dashboard** — daily score ring, stats, and Namaz tracker
- **Analytics** — multi-day charts and trend breakdowns
- **Reflect** — daily journaling and reflection entries
- **Namaz Tracker** — track 5 daily prayers with bonuses/penalties
- **Settings** — configure scoring rules, name, and rank
- **Google OAuth** — sign in with Google (optional, guest mode available)
- **Dark Mode** — default dark theme via next-themes
- **PDF Export** — export analytics reports via jsPDF
- **Offline First** — all state saved to localStorage, no backend required for basic use

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| shadcn/ui (Radix UI) | Component primitives |
| Zustand | Global state management |
| React Router v6 | Client-side routing |
| Recharts | Charts and analytics graphs |
| React Query (TanStack) | Server state (auth) |
| next-themes | Dark/light mode |
| jsPDF | PDF report export |
| Zod + React Hook Form | Form validation |

### Backend (Optional — for Google Auth & cloud sync)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Passport.js | Google OAuth 2.0 |
| JWT (jsonwebtoken) | Session tokens via HTTP-only cookies |

---

## Project Structure

```
DisciplineOS/
├── public/                     # Static assets
│   ├── placeholder.svg
│   └── robots.txt
│
├── screenshot/                 # Reference screenshots (mobile issues)
│
├── server/                     # Express backend
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   ├── models/
│   │   ├── User.js             # User schema (Google profile)
│   │   ├── DayData.js          # Synced day data schema
│   │   └── UserSettings.js     # User settings schema
│   ├── routes/
│   │   ├── auth.js             # Google OAuth + /me + /logout
│   │   └── data.js             # Day data sync routes
│   ├── index.js                # Server entry point
│   └── package.json            # Server dependencies
│
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (Button, Dialog, etc.)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Main layout wrapper
│   │   │   └── Sidebar.tsx     # Navigation sidebar
│   │   ├── timeline/
│   │   │   ├── Timeline.tsx         # Hourly timeline grid
│   │   │   └── BlockCreationPanel.tsx
│   │   ├── NamazTracker.tsx    # Prayer completion UI
│   │   ├── ScoreRing.tsx       # Circular score display
│   │   ├── StatCard.tsx        # Stats display card
│   │   ├── SignInModal.tsx      # Google sign-in modal
│   │   ├── GuestBanner.tsx     # Guest mode banner
│   │   ├── ProtectedRoute.tsx  # Auth route guard
│   │   └── ThemeToggle.tsx     # Dark/light toggle
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state provider
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Mobile breakpoint hook
│   │   └── use-toast.ts        # Toast notification hook
│   │
│   ├── lib/
│   │   ├── store.ts            # Zustand store (all app state)
│   │   ├── types.ts            # TypeScript type definitions
│   │   ├── utils.ts            # Date helpers, uid(), formatters
│   │   ├── namaz.ts            # Prayer window & status logic
│   │   └── reporting.ts        # Analytics aggregate builder
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx       # /  — score ring + daily stats
│   │   ├── Planner.tsx         # /planner — plan time blocks
│   │   ├── LogScreen.tsx       # /log — log actual hours
│   │   ├── Analytics.tsx       # /analytics — charts & trends
│   │   ├── Reflect.tsx         # /reflect — daily journal
│   │   ├── SettingsPage.tsx    # /settings — scoring config
│   │   ├── LoginPage.tsx       # /login — Google sign-in
│   │   └── NotFound.tsx        # * — 404 page
│   │
│   ├── test/
│   │   ├── example.test.ts     # Placeholder test
│   │   └── setup.ts            # Vitest setup (matchMedia mock)
│   │
│   ├── App.tsx                 # Routes + providers
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles + Tailwind
│
├── .env                        # Environment variables (not committed)
├── .gitignore
├── components.json             # shadcn/ui config
├── eslint.config.js
├── index.html                  # HTML entry point
├── package.json                # Frontend dependencies
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (only needed for Google Auth)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/disciplineos.git
cd disciplineos
```

### 2. Install frontend dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

---

## Environment Variables

Create a `.env` file in the **root** of the project (next to `package.json`):

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/disciplineos

# JWT secret — use a long random string
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
CLIENT_URL=http://localhost:8080
SERVER_URL=http://localhost:3000
```

> **Note:** The `.env` file is already in `.gitignore` — never commit it.

---

## Running the App

### Frontend only (no auth, guest mode)

```bash
npm run dev
```

App runs at **http://localhost:8080**

---

### Frontend + Backend (with Google Auth)

Run both together:

```bash
npm run dev:all
```

Or run separately in two terminals:

**Terminal 1 — Frontend:**
```bash
npm run dev
```

**Terminal 2 — Backend:**
```bash
cd server
npm run dev
```

- Frontend: **http://localhost:8080**
- Backend API: **http://localhost:3000**

---

## Available Scripts

### Root (Frontend)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at http://localhost:8080 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Development build with sourcemaps |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on all `.ts` / `.tsx` files |
| `npm run test` | Run all tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run dev:all` | Run frontend + backend concurrently |

### Server

| Command | Description |
|---|---|
| `npm start` | Start server with Node.js |
| `npm run dev` | Start server with nodemon (auto-restart) |

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Daily score ring, stats, Namaz tracker |
| `/planner` | Planner | Create planned time blocks, load templates |
| `/log` | LogScreen | Log actual time spent per hour |
| `/analytics` | Analytics | Multi-day charts, trends, PDF export |
| `/reflect` | Reflect | Daily journal — what went well, what to improve |
| `/settings` | SettingsPage | Configure scoring rules, name, rank |
| `/login` | LoginPage | Google OAuth sign-in |
| `*` | NotFound | 404 page |

---

## Scoring System

A day's score is only calculated if the user pressed **"Start Day"** for that date. Un-started days show as **Neutral**.

| Event | Points |
|---|---|
| Productive hour | `+pointsPerHour` |
| Deep Work hour | `+pointsPerHour × 2` |
| Routine hour | `+pointsPerHour` |
| Wasted hour | `-pointsPerHour` |
| Namaz completed | `+namazBonus` per prayer |
| Missed Namaz | `-namazPenalty` per prayer |
| Unmet productive target | `-dailyTargetPenalty` |

All values are configurable in **Settings**.

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add Authorized redirect URI:
   ```
   http://localhost:3000/auth/google/callback
   ```
7. Copy the **Client ID** and **Client Secret** into your `.env` file

> Google Auth is optional. The app works fully offline in guest mode with localStorage persistence.
