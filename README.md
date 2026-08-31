# DueBro — Student Deadline Tracker & Intelligent Academic Workload Planner

> **A focused, aesthetic, and intelligent academic deadline manager engineered specifically for students.**  
> Built with Next.js 16 (React 19, Turbopack, Tailwind CSS v4), Supabase Auth, Drizzle ORM, Dexie.js Offline Sync, and Inngest.

---

## 🌟 Key Features & Architectural Highlights

### 1. Flagship "Today View" & Daily Capacity Meter
- **Daily Capacity Utilization Gauge**: Compares planned study effort against student's configured daily capacity (weekday $2.0\text{h}$, weekend $4.0\text{h}$).
- **Overload & 3-Day Workload Congestion Alerts**: Proactively detects multi-deadline clustering ($\ge 3$ deadlines or $>8\text{h}$ effort within 3 days).
- **Algorithmic Focus Queue**: Prioritizes today's tasks by dynamic Risk Score, Overdue status, and Due Date.
- **1-Click Quick Time Logging**: Record progress without navigating away from the dashboard.

### 2. Multi-Tier Algorithmic Risk Engine
- **Pure Domain Calculation**: Evaluates remaining effort against available study capacity windows.
- **Dynamic Multipliers**: Applies priority weighting and exam proximity escalations ($1.5\times$ within 7 days).
- **6 Discrete Risk Tiers**: `Safe` (Green), `Low` (Indigo), `Medium` (Amber), `High` (Orange), `Critical` (Crimson), and `Overdue` (Burgundy).

### 3. Smart Planning & Workload Distribution Engine (V1.5)
- **Deterministic Workload Smoothing**: Evenly allocates remaining study effort across lead days.
- **Priority Preemption**: High and Critical tasks claim earlier daily study slots first.
- **Explicit Shortfall Detection**: Identifies overloaded tasks whose effort exceeds cumulative capacity before their due date and provides actionable guidance.
- **Interactive Capacity Tuner**: Real-time weekday and weekend slider controls with instant 14-day timeline recalculations.

### 4. Month & Week Calendar Planners
- **Month Calendar Grid**: 7-column matrix starting on Monday with course color pills, status strikethroughs, and workload intensity flame indicators ($>4.0\text{h}$ or $\ge 3$ tasks).
- **Week Calendar Planner**: Day-level workload density headers and quick task completion checkboxes.
- **Accessible Rescheduling Fallback (WCAG 2.2 Dragging Movements)**: Full keyboard and 1-tap alternative to drag-and-drop.

### 5. Inbox & Quick Capture
- **Zero Required Fields NLP Parser**: Instant bare-text capture parsing dates (`"tomorrow"`, `"Friday"`, `"in 3 days"`), times (`"5pm"`, `"11:59pm"`), task types (`exam`, `quiz`, `lab`, `reading`), effort estimates (`"2h"`, `"45m"`), and course tags (`[CS101]`, `#math201`).
- **1-Tap Course & Date Triage**: Converts raw inbox thoughts into structured academic milestones.

### 6. Recurrence Engine & 60-Day Lazy Materialization
- **Materialized Occurrences**: Real rows in `deadlines` table for independent subtasks and progress tracking.
- **Rule Splitting**: Supports editing/deleting "This and future occurrences" cleanly without corrupting past historical records.

### 7. Offline-First Architecture & Last-Write-Wins (LWW)
- **IndexedDB via Dexie.js**: Seamless offline creation and updates with persistent local mutations.
- **LWW Conflict Resolution**: Timestamp-based deterministic conflict resolution upon network reconnection.
- **Reactive Status Pill**: Non-intrusive banner indicating offline status, syncing progress, and synced states.

### 8. Data Portability & RFC 5545 iCalendar Feeds
- **iCalendar (.ics) RFC 5545**: Live feed generation and parser compatible with Apple Calendar, Google Calendar, and Canvas LMS.
- **CSV & JSON Exports**: Complete spreadsheet and JSON workspace archives for data ownership.

### 9. Study Insights & Workload Analytics (V1.5)
- **Velocity Metrics**: On-time completion rate, punctuality %, remaining effort hours, and average task effort.
- **Visual Breakdowns**: 6-tier risk distribution stacked chart and course-by-course effort progress gauges.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router, React 19) |
| **Styling** | Tailwind CSS v4 + Curated Dark Theme (`#0B0B0E`, `#131318`, `#1C1C23`, `#5B6EF5`) |
| **Database & ORM** | PostgreSQL + Drizzle ORM (Pinned `0.45.2`) |
| **Authentication** | Supabase Auth (SSR Server, Client, and Middleware Session Sync) |
| **Background Jobs** | Inngest (Multi-channel notification and reminder engine) |
| **Offline Storage** | Dexie.js (IndexedDB + FIFO Sync Queue + LWW Resolution) |
| **Testing** | Vitest (87+ unit tests), Playwright (E2E journeys), Axe-Core (WCAG 2.2 AA) |
| **Date Math** | date-fns (Strict ISO UTC parsing & calculations) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `20.x` or later
- PostgreSQL instance (or Supabase local/hosted project)

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and populate the required keys:

```bash
cp .env.example .env.local
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/duebro
INNGEST_EVENT_KEY=your-inngest-key
INNGEST_SIGNING_KEY=your-signing-key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Database Migrations
```bash
npm run db:generate
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite & Quality Verification

```bash
# 1. Type Check (Strict TypeScript)
npm run typecheck

# 2. Lint (ESLint Architectural Boundary Rules)
npm run lint

# 3. Vitest Unit & Integration Tests (91 tests across 13 test suites)
npm test

# 4. Playwright End-to-End & Axe-Core Accessibility Audits
npx playwright test

# 5. Production Optimization Build
npm run build
```

---

## 📂 Project Structure

```
DueBro/
├── app/                      # Next.js App Router Pages & API routes
│   ├── (auth)/               # Login & Signup authentication routes
│   ├── (dashboard)/          # Authenticated app views
│   │   ├── today/            # Flagship Daily Planner & Capacity meter
│   │   ├── calendar/         # Month & Week Planners (WCAG 2.2 Rescheduling)
│   │   ├── workload/         # V1.5 Workload Smart Planner
│   │   ├── analytics/        # V1.5 Study Insights & Risk Breakdowns
│   │   ├── deadlines/        # Deadlines List & Kanban views
│   │   ├── subjects/         # Course & Term Management
│   │   ├── inbox/            # Quick Capture & Triage Flow
│   │   └── settings/         # Notifications & Data Portability
│   └── api/inngest/          # Inngest Background Cron & Notification Workers
├── components/               # UI Primitives and Shared Components
├── features/                 # Modular Feature-Level Components
├── lib/                      # Offline Sync, Export/Import, Supabase SSR, Utils
├── server/
│   ├── actions/              # Next.js Server Actions
│   ├── db/schema/            # Drizzle ORM Schema Models & RLS
│   └── domain/               # Pure Business Logic & Algorithmic Engines
│       ├── risk/             # Risk Engine & Clustering
│       ├── scheduling-engine/# Deterministic Workload Distribution & Shortfall
│       ├── reminders/        # Notification Scheduling & Quiet Hours
│       ├── recurrence/       # 60-day Materialized Lazy Occurrences
│       ├── quick-capture/    # Zero-field NLP Parser
│       ├── analytics/        # Study Insights & Punctuality Engine
│       └── deadlines/        # Effort Formulas & Progress Recalculations
└── tests/                    # Vitest Unit Tests & Playwright E2E Specs
```

---

## 📄 License & Attribution
MIT © DueBro Team. Crafted with care for student academic success.
