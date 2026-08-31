# TECH_STACK_PRD.md — Student Deadline Tracker

**Purpose:** defines HOW the product is engineered — architecture, technology choices with verified current versions, data model, and open-source reuse strategy — precise enough for an AI coding agent (Google Antigravity) to scaffold and build against without guessing.
**Intended audience:** Antigravity (implementation), and the product owner reviewing technical risk/cost.
**Source of truth:** `PRODUCT_PRD.md` (the features and systems this document implements) and `DESIGN_PRD.md` (the interaction/visual requirements this document's technical choices must support), plus live technology research conducted August 2026 (all version claims below are dated and sourced — re-verify anything approaching its stated verification date before build).
**Relationship to the other PRDs:** every technology choice here exists to serve a specific requirement in `PRODUCT_PRD.md` — cross-references are marked **→ PRODUCT**. Every technical implementation of a visual/interaction requirement is marked **→ DESIGN**.

---

## 1. Architecture Goals

Prioritized, in order, because they occasionally trade off against each other:
1. **AI coding-agent compatibility** — predictable structure, strict typing, and small feature boundaries matter as much as raw capability, since Antigravity is the implementer (§ "AI Coding Agent Compatibility" below).
2. **Type safety** — end-to-end, from database schema to API response to UI, via a single source-of-truth schema layer (§9).
3. **Reliability** — especially for reminders (**→ PRODUCT** §16), where research found the underlying problem (iOS push limitations) is a platform constraint, not a bug — architecture must compensate, not assume it away.
4. **Mobile performance** — first-load and interaction latency on mid-range phones, given the mobile-first mandate (**→ DESIGN** §1).
5. **Maintainability** — a small team (or a single developer plus an AI agent) must be able to reason about the whole system.
6. **Offline capability** — supports **→ PRODUCT** §25 without becoming the dominant architectural complexity (this is a caching/sync layer in front of a server source of truth, not a local-first rebuild of the whole app).
7. **Developer experience** — fast local iteration, minimal boilerplate.
8. **Security** — student data (deadlines, notes) handled with ordinary-but-real care (§15).
9. **Scalability** — designed to not need a rewrite at 10,000 users, without over-engineering for 10 million on day one.
10. **Cost** — the whole point of this product is to be *not* priced like the professional AI-scheduling tier (**→ PRODUCT** §1) — the engineering cost structure must support a low/free consumer price point (§30).

---

## 2. Technology Evaluation

*(Summarized here; the definitive single choice per layer is in §4/§32 — this section documents what was actually evaluated and why alternatives were set aside.)*

- **Frontend:** Next.js (chosen) vs. plain React+Vite vs. Remix vs. SvelteKit. Next.js wins on PWA/App-Router maturity, the largest 2026 ecosystem for every other layer chosen below, and first-class Vercel deployment. SvelteKit remains a legitimate alternative if bundle size becomes a measured, not hypothetical, problem post-launch.
- **Language:** TypeScript — no real alternative considered; JavaScript-only was rejected outright given Goal #2 above.
- **Styling/UI:** Tailwind CSS + shadcn/ui + Radix primitives (chosen) vs. Base UI (MUI/Radix collaboration's newer headless library) vs. hand-rolled CSS. shadcn/ui's copy-into-your-repo model (not an npm dependency in the traditional sense — components are generated into the codebase) gives Antigravity direct, readable, editable component source rather than an opaque installed package, which directly serves Goal #1. Base UI is real and improving but has a smaller 2026 ecosystem of ready-made patterns than shadcn/ui for this stack; not chosen for V1.
- **Database:** PostgreSQL (chosen) vs. SQLite. PostgreSQL wins because this product needs real multi-device sync from V1 (**→ PRODUCT** §25) — SQLite/local-first is the right choice for a single-device, privacy-maximalist tool (which is what Super Productivity is, §14/§22), not a product whose core promise includes "see your deadlines everywhere."
- **ORM:** Drizzle (chosen) vs. Prisma. See §3/§4 for the version-specific reasoning — both are legitimate; Drizzle is chosen for lighter serverless/edge cold starts, which matters directly for the reminder-dispatch worker (§12).
- **Validation:** Zod (chosen) — the de facto TypeScript-first standard, integrates directly with Drizzle (via the `drizzle-zod` adapter, §3) and React Hook Form.
- **Data fetching/state:** TanStack Query (server state) + Zustand (small client-only UI state) — chosen over Redux (unnecessary boilerplate at this app's scale) and over a pure server-state-only approach (Zustand still needed for things like "which bottom sheet is open" that have no server representation).
- **Authentication:** Supabase Auth (chosen, given the Supabase database choice) vs. Clerk vs. Better Auth vs. Auth.js/NextAuth. See §14 for the full comparison and reasoning.
- **Forms:** React Hook Form + `@hookform/resolvers` (Zod resolver) — the standard, lowest-friction pairing with the validation layer above.
- **Calendar:** a custom-built Agenda/Week component (chosen) vs. FullCalendar vs. react-big-calendar. See §21–§25 for the full license/reuse reasoning — FullCalendar's Premium/Scheduler package's AGPLv3-or-commercial licensing (§21) and its Standard package's generic default styling both cut against **→ DESIGN** §1's explicit anti-generic-SaaS mandate.
- **Date/time:** `date-fns` + `date-fns-tz` (chosen) over Moment.js (long-deprecated, not evaluated seriously) and over a raw `Temporal` polyfill (not yet universally stable across runtimes as of Aug 2026 — chosen against for production reliability, not lack of interest).
- **Notifications:** Web Push (`web-push` npm package, VAPID) + Resend (email) + Inngest (scheduling/dispatch orchestration) — see §12.
- **Offline:** Serwist (chosen) — see §13 and the verified research below; the original `next-pwa` package is archived/unmaintained (archived Aug 2023) and its most common fork chain leads to Serwist as the actively maintained 2026 successor, referenced directly in Next.js's own PWA guide.
- **Testing:** Vitest (unit/integration) + Playwright (E2E) + React Testing Library — see §17 for the specific, verified 2026 split between what each tool can and cannot render.
- **Deployment:** Vercel (app) + Supabase (DB/Auth/Storage) + Inngest Cloud (jobs) + Resend (email) — see §29.
- **Monitoring:** Sentry (`@sentry/nextjs`) for error tracking — the de facto standard for this stack; exact current SDK version to be confirmed at scaffold time (§3 flags this explicitly rather than guessing a number not directly verified in this research pass).

---

## 3. Current Version Verification

*(All entries verified via live web research, August 2026. "Verified Date" reflects when this specific research pass confirmed the figure — re-check anything with a fast-moving release cadence, i.e. Next.js and Tailwind, closer to build time.)*

| Technology | Recommended version | Stable? | Verified date | Official source | Reason |
|---|---|---|---|---|---|
| Next.js | **16.3.x** (Active LTS) | Yes | Aug 30, 2026 | nextjs.org/blog, endoflife.date/nextjs | 16.3.3 shipped Aug 25–26, 2026 as a security release; 16 is Active LTS through Oct 2027 (projected). 15.5.x remains Maintenance LTS but its support window ends Oct 21, 2026 — starting a new project on 15 would mean migrating almost immediately |
| React | **19.2.x** | Yes | Aug 30, 2026 | react.dev/versions | 19.2.7 (June 2026) is the latest patch; no React 20 has been announced. React Compiler is stable (1.0) since Oct 2025 — enable it, don't wait for a hypothetical React 20 |
| TypeScript | Latest 5.x stable | Yes | — | typescriptlang.org | Exact patch not independently pinned in this research pass — **verify via `npm view typescript version` at scaffold time** rather than hardcoding a number here |
| Tailwind CSS | **4.3.x** | Yes | Aug 30, 2026 | tailwindcss.com/blog, npmjs.com/package/tailwindcss | v4 shipped CSS-first config + Lightning CSS engine; 4.3 is current as of npm (4.3.3 confirmed on npm registry). v3 is only informally still patched for browser-compatibility holdouts — start new projects on v4 |
| Drizzle ORM | **0.x current stable line** (not the 1.0 release candidate) | 0.x: Yes / 1.0: RC only | Aug 30, 2026 | orm.drizzle.team, GitHub discussions | Drizzle 1.0 is on an RC track (1.0.0-rc.1, betas up to 1.0.0-beta.22) as of this research — not GA. Per this document's own "prefer stable over experimental" rule (Quality Bar), build on the current stable 0.x line and plan a deliberate migration once 1.0 reaches general availability |
| Zod | **v4** | Yes | Aug 30, 2026 | (cross-referenced via multiple 2026 technical sources) | v4 is stable with a materially smaller bundle (`@zod/mini` ~1.9KB gzipped variant available); v3 still exported for compatibility but new code should target v4 |
| Playwright | **1.57.x** | Yes | Aug 30, 2026 | Playwright release notes (Microsoft) | 1.57.0 released Nov 25, 2025 and current as the stable line into 2026 |
| Vitest | Latest stable | Yes | — | vitest.dev | Confirmed as the 2026-standard Next.js test runner (Jest is legacy for new projects per official Next.js testing guidance) — exact patch not independently pinned; verify at scaffold time |
| Inngest | Current stable SDK/platform | Yes | Aug 30, 2026 | (cross-referenced via multiple 2026 comparison sources) | Actively maintained, serverless-native background job platform; v4 SDK (March 2026) added checkpointing improvements per research |
| Serwist | Current stable (`@serwist/next`) | Yes | Aug 30, 2026 | nextjs.org/docs (official PWA guide references Serwist directly), Serwist docs | The maintained successor to the archived `next-pwa` package; **note:** Next.js 16 defaults to Turbopack, but Serwist currently requires Webpack for the service-worker build step — the build script must explicitly use `next build --webpack` |
| Sentry (`@sentry/nextjs`) | Current stable | Yes | — | docs.sentry.io | De facto standard Next.js error-tracking SDK; exact version not independently pinned in this pass — verify at scaffold time |

**Explicit instruction followed:** where an exact patch number was not independently confirmed via this research pass (TypeScript, Vitest, Sentry), this table says so plainly rather than inventing a plausible-looking number — per this document's own Quality Bar ("Do not guess current technology versions").

---

## 4. Stack Decision Matrix

| Layer | Options compared | Performance | Ecosystem/maturity | DX | AI-agent compatibility | Scalability | Complexity | Cost | **Decision** |
|---|---|---|---|---|---|---|---|---|---|
| ORM | Drizzle vs. Prisma | Drizzle: lighter, faster edge/serverless cold starts. Prisma 7 (Nov 2025) closed much of the historical gap (bundle cut from ~14MB to ~1.6MB via a TS/WASM engine rewrite) | Prisma: more mature migration tooling + Prisma Studio GUI. Drizzle: no generate step, closer-to-SQL | Prisma: more "batteries included," but the `prisma generate` step after every schema change is a repeatedly-cited friction point. Drizzle: less magic, more explicit | Drizzle's schema-as-plain-TypeScript is easier for an agent to read/modify without a generation step in between | Both scale adequately for this app's size | Drizzle: less abstraction to reason about | Both free/OSS | **Drizzle** — cold-start advantage matters for the reminder worker (§12); no-generate-step reduces agent-facing friction |
| Auth | Supabase Auth vs. Clerk vs. Better Auth vs. Auth.js/NextAuth | Comparable for this app's scale | Clerk: most polished pre-built UI. Supabase Auth: tightly integrated with the chosen DB + Postgres Row-Level Security. Better Auth: emerging 2026 self-hosted default, now effectively the maintainer of Auth.js/NextAuth as a legacy option | Clerk fastest to ship; Supabase Auth close behind given the DB is already Supabase | All reasonably agent-compatible; Supabase Auth's RLS-based model maps cleanly onto per-student data isolation rules an agent can express directly in SQL policies | Clerk: per-MAU pricing becomes expensive at scale (~$0.02/MAU above free tier per research). Supabase Auth: effectively free riding on the DB plan | Supabase Auth: lowest integration surface (one vendor for DB+Auth+Storage) | Supabase Auth: no separate auth billing line | **Supabase Auth** — single-vendor simplicity for MVP, RLS pairs naturally with per-student isolation, avoids Clerk's per-MAU cost curve for a price-sensitive student user base |
| Calendar | Custom-built vs. FullCalendar vs. react-big-calendar | Custom: smallest bundle, exactly the density/interaction rules in **→ DESIGN** §12. FullCalendar: most feature-complete out of the box | FullCalendar: most mature (MIT core, ~20k stars). react-big-calendar: lighter, less actively differentiated | Custom: more build time, no fighting a library's opinions. FullCalendar: fast to integrate, but its **Premium/Scheduler** package (needed for some resource/timeline views) is AGPLv3-or-commercial-license (§21) | A custom, small component is easier for an agent to modify precisely to **→ DESIGN** §12's spec than working around a large third-party library's API surface | All viable | Custom: more code to maintain, but no external license constraint to track | FullCalendar Premium: real commercial cost if closed-source. Custom: $0 licensing | **Custom-built** (date-fns + rrule.js) for V1's Agenda/Month/Week; FullCalendar Standard (MIT) documented as a **fallback only** if the custom build timeline slips |
| Background jobs / reminder dispatch | Inngest vs. Trigger.dev vs. BullMQ | BullMQ: cheapest at high volume (~$15–50/mo per 500k jobs on self-hosted Redis) but requires owning Redis + persistent workers. Inngest/Trigger.dev: serverless-native, ~$75–150/mo cloud cost at that same volume | All three mature/production-ready per 2026 research | Inngest: integrates cleanly with Vercel/serverless, event-driven model matches "a reminder job fires when its scheduled time arrives" naturally | Inngest's function-based, event-triggered model is more legible to an agent than managing a Redis queue + worker fleet directly | Inngest scales without infrastructure ownership; BullMQ scales cheaper but requires ops | Inngest: zero infrastructure to run. BullMQ: must run/monitor Redis + workers | Inngest cloud cost is higher per-job than self-hosted BullMQ, but there's no VPS/Redis ops cost, which matters more at MVP team size | **Inngest** for V1 — matches the serverless Vercel deployment (§29) with no extra infrastructure; **BullMQ documented as the cost-optimization migration path** if job volume grows large enough to justify owning the ops burden |

---

## 5. Final Architecture

```
                         ┌──────────────────────────────┐
                         │   Next.js 16 App (PWA)        │
                         │   React 19 + Tailwind v4 +    │
                         │   shadcn/ui + TanStack Query   │
                         └───────────────┬────────────────┘
                                          │
                         ┌────────────────▼────────────────┐
                         │  Application / Server layer      │
                         │  Next.js Server Actions + Route   │
                         │  Handlers (auth-gated)            │
                         └───────┬───────────────┬──────────┘
                                 │               │
              ┌──────────────────▼───┐   ┌───────▼──────────────┐
              │  Domain / business     │   │  Inngest functions   │
              │  logic (§7 modules)    │   │  (reminder scheduling │
              │  — risk engine, smart  │   │  & dispatch, §12)     │
              │  planning, recurrence  │   └───────┬──────────────┘
              └──────────┬─────────────┘           │
                         │                 ┌────────▼─────────┐
              ┌──────────▼─────────┐       │ Web Push (VAPID) │
              │  Data access        │       │ + Resend (email)│
              │  (Drizzle ORM)      │       └──────────────────┘
              └──────────┬─────────┘
                         │
              ┌──────────▼─────────┐        ┌──────────────────┐
              │  PostgreSQL          │◄──────►│  Supabase Auth /  │
              │  (Supabase)          │        │  Storage          │
              └──────────────────────┘        └──────────────────┘

  Client-side (offline layer):
  Service Worker (Serwist) + IndexedDB (Dexie.js) — caches current-term data,
  queues optimistic writes while offline, syncs on reconnect (§13)
```

**Business rules live in one place:** the domain/business logic layer (§7) — never duplicated inside React components or inline in Server Actions. Server Actions and Route Handlers are thin: they authenticate, validate (Zod), call into the domain layer, and return. This is a direct, explicit rule for Antigravity to follow (§9, and the "AI Coding Agent Compatibility" section below).

---

## 6. Repository Structure

```
app/                     # Next.js App Router — routes, layouts, pages only.
                          # No business logic here — pages call server actions
                          # / domain services, they don't contain logic themselves.
components/
  ui/                     # shadcn/ui-generated primitives (Button, Input, Dialog, etc.)
  shared/                 # Cross-feature composed components (DeadlineCard, RiskBadge…)
features/
  deadlines/
    components/           # Feature-specific UI (AddDeadlineSheet, DeadlineDetail…)
    hooks/                 # TanStack Query hooks scoped to this feature
  subjects/
  calendar/
  today/
  reminders/
  inbox/
lib/
  utils/                  # Small, pure, framework-agnostic helpers
  validation/             # Zod schemas (shared between client forms and server actions)
server/
  actions/                # Next.js Server Actions — thin, auth + validate + call domain
  domain/                 # §7's domain modules — the actual business logic, framework-free
    deadlines/
    risk-engine/            # §10
    scheduling-engine/      # §11
    reminders/               # §12
    workload/
  db/
    schema/                 # Drizzle schema definitions, one file per entity
    queries/                 # Reusable query functions, not inlined in domain logic
  inngest/                 # Inngest function definitions (§12)
types/                    # Shared TypeScript types not co-located with a schema
hooks/                    # Cross-feature React hooks (offline status, etc.)
tests/
  unit/
  integration/
  e2e/                     # Playwright specs
public/
  sw.ts                    # Serwist service worker entry
```

**Responsibility rule:** `app/` never imports directly from `server/db/`; it goes through `server/actions/` → `server/domain/` → `server/db/`. This layering is enforced by convention (and can be enforced by a lint rule restricting import paths) specifically so an AI agent editing a UI component cannot accidentally reach past the domain layer and duplicate business logic inline.

---

## 7. Domain Modules

| Module | Owns | Boundary |
|---|---|---|
| `deadlines` | CRUD, `type`/status transitions, subtask progress calculation (**→ PRODUCT** §6, §10, §11) | Does not compute risk itself — calls `risk-engine` |
| `subjects` | Subject/Term CRUD, archival (**→ PRODUCT** §8) | — |
| `risk-engine` | Tier computation + explanation string (**→ PRODUCT** §13, §10 below) | Pure function(s) of Deadline + sibling Deadlines + capacity setting — no side effects, no direct DB writes |
| `scheduling-engine` | Smart Planning day-by-day suggestion (**→ PRODUCT** §14, §11 below) | Reads Deadlines + capacity; writes nothing in V1 (suggestion only) |
| `reminders` | Reminder CRUD, default-application logic, delivery orchestration hand-off to Inngest (**→ PRODUCT** §16, §12 below) | Delivery mechanics (push/email sending) live in `server/inngest/`, not here — this module owns *what* and *when*, not *how it's sent* |
| `workload` | Daily/weekly/per-subject workload aggregation, overload detection (**→ PRODUCT** §15) | Consumes `scheduling-engine` output; does not duplicate its distribution logic |
| `recurrence` | RRULE generation/expansion, exception handling (this/this-and-future/series edits, **→ PRODUCT** §17) | Shared by `deadlines` (deadline recurrence) — kept as its own module because the exception-handling logic is non-trivial enough to warrant isolation and independent testing |
| `users` | Account/profile, capacity setting, notification preferences (**→ PRODUCT** §24) | — |

**Boundary rule:** `risk-engine` and `scheduling-engine` are pure, side-effect-free functions given their inputs — this makes them independently unit-testable (§17) without a database, and prevents the exact "duplicated logic across components" failure mode this document is explicitly designed to avoid (per the "AI Coding Agent Compatibility" section).

---

## 8. Database Architecture

**Entities** (conceptual model fully specified in `PRODUCT_PRD.md` §6, §8, §17; this section adds the technical layer):

| Entity | Key relationships | Notable indexes/constraints |
|---|---|---|
| `users` | 1—many everything below | unique email |
| `academic_terms` | belongs to user; 1—many `subjects` | index on `(user_id, start_date)` |
| `subjects` | belongs to `academic_terms`; 1—many `deadlines` | index on `(term_id, archived)` |
| `deadlines` | belongs to `subjects`; 1—many `subtasks`, `reminders` | index on `(subject_id, due_date)`; index on `(user_id, due_date, status)` for the Today/clustering query (**→ PRODUCT** §13's `clusterCount` signal) — this is the single most performance-critical index in the schema |
| `subtasks` | belongs to `deadlines` | index on `(deadline_id, position)` |
| `reminders` | belongs to `deadlines` | index on `(fire_at, status)` for the Inngest dispatch query (§12) |
| `notifications` (delivery log) | belongs to `reminders` | index on `(reminder_id, channel, status)` — supports the reliability debugging goal from **→ PRODUCT** §10/§16 |
| `recurrence_rules` | belongs to `deadlines` (1:1, nullable) | stores the RRULE string |
| `recurrence_exceptions` | belongs to `recurrence_rules` | `(rule_id, original_date)` unique — implements the this-occurrence/this-and-future editing model (**→ PRODUCT** §17) |
| `class_meetings` *(V2)* | belongs to `subjects` | — |
| `calendar_events` *(V2, imported)* | belongs to `subjects`, optional | — |
| `study_sessions` *(V2)* | belongs to `deadlines`, optional | — |

**Timezone strategy:** all timestamps stored in UTC (`timestamptz` in Postgres); the user's timezone is stored on `users` and applied only at render/reminder-scheduling time — reminder `fire_at` times are computed in UTC at write time from the user's timezone-local intent, not recomputed live (avoids a whole class of DST-transition bugs — see §31's named risk).

**Recurrence storage:** an RRULE string (RFC 5545) on `recurrence_rules`, expanded via `rrule.js` (§21/§25) — never bespoke day-of-week/interval columns.

**Reminders/notifications:** kept as separate tables from `deadlines` specifically so a Deadline can have N reminders across M channels without denormalizing that fan-out onto the Deadline row itself (**→ PRODUCT** §16's multi-channel requirement).

**Activity/audit data:** `created_at`/`updated_at` on every table (standard); a lightweight `notifications` delivery log (above) serves as the audit trail for reminder reliability specifically — no general-purpose audit-log table in V1 (not a requirement any **→ PRODUCT** feature currently needs).

**Soft deletion:** used for `deadlines` and `subjects` (an `archived_at`/`deleted_at` nullable timestamp) rather than hard deletes — supports **→ PRODUCT** §8's "archived, not deleted" requirement for past-term Subjects, and gives a recovery window for accidental deletion generally.

**Recurring-deadline generation window:** occurrences are expanded lazily within a bounded rolling window (current term ± a few weeks) at read time, not pre-materialized as rows indefinitely — see §16 for the performance reasoning this directly serves.

---

## 9. API / Server Architecture

**Chosen approach: Next.js Server Actions** for all mutations (create/edit/complete/delete deadline, etc.), **Route Handlers** for anything needing to be called from outside the Next.js request cycle (Inngest function triggers, the web-push subscription endpoint, V2 LMS webhooks). No separate REST or GraphQL API surface in V1 — unnecessary indirection for a single first-party client.

**Business rules must not be duplicated across components — enforced as follows:**
- Server Actions are thin wrappers: authenticate → validate input with a Zod schema (shared with the client form, §2) → call exactly one domain-layer function (§7) → return.
- All risk computation, recurrence expansion, and workload aggregation happen exclusively inside `server/domain/`, never inline in a Server Action and never re-implemented client-side for optimistic UI — optimistic updates (**→ DESIGN** §18) apply an *approximation* the client already has cached (e.g., "this looks like it'll still be On Track"), reconciled with the server's authoritative computation on response, never a parallel reimplementation of the actual risk logic in the browser.

---

## 10. Deadline Risk Engine (technical design)

**Inputs:** the target Deadline's `dueDate`, `estimatedEffortHours`, `progress`; the user's daily capacity setting; sibling Deadlines in the same 7-day window (for `clusterCount`) and their own claimed hours (for `availableCapacity`'s subtraction term).

**Processing:** a pure function `computeRisk(deadline, siblings, capacitySetting, now) → { tier, reason }` living in `server/domain/risk-engine/` — implements exactly the tier logic and signal formulas specified in **→ PRODUCT** §13. No I/O inside the function itself; callers supply already-fetched data.

**Outputs:** a `tier` enum value and a `reason` string (the one-line explanation, **→ PRODUCT** §13/**→ DESIGN** §10's RiskBadge).

**Storage/caching:** the computed tier is **not** persisted as the source of truth on the Deadline row — it's recomputed on read for the views that need it (Today, Deadlines list, Calendar), using the indexes in §8 to keep the sibling-lookup query cheap. A `risk_tier_cache` column (nullable, updated via the same domain function whenever a relevant field changes — §11 of `PRODUCT_PRD.md`'s trigger list) may be added as a read-performance optimization once real usage data shows it's warranted — not built speculatively in V1.

**Testing requirements (§17):** the risk engine is unit-tested with fixed input fixtures covering every tier boundary condition explicitly (e.g., exactly `capacityRatio = 1.0`, exactly `daysRemaining = 1` with `progress = 79` vs. `80`) — boundary-condition coverage is mandatory given how directly the tier logic drives user-facing trust.

**Path to AI later (§13 of `PRODUCT_PRD.md`):** any future refinement of `estimatedEffortHours` defaults from historical accuracy data would live as a separate, optional input-adjustment step *before* this same deterministic function — the tier logic itself is never replaced by a model.

---

## 11. Scheduling Engine (Smart Planning, technical design)

**Inputs:** target Deadline's `effortRemaining`, `dueDate`; capacity setting; other Deadlines' already-claimed hours per day in the same window (so plans don't double-book the same capacity).

**Processing:** `suggestPlan(deadline, otherClaims, capacitySetting, now) → DaySuggestion[]` in `server/domain/scheduling-engine/` — implements the front-loaded distribution algorithm from **→ PRODUCT** §14 as a pure function, same architectural pattern as the risk engine (§10) for consistency and testability.

**Constraints enforced:** never suggests more than a day's free capacity (capacity setting minus that day's existing claims); if total available capacity across the remaining days is less than `effortRemaining`, the function returns the shortfall explicitly in its output (this shortfall is what feeds `capacityRatio ≥ 1.0` in §10 — the two engines share the same underlying capacity-accounting logic via a common `computeAvailableCapacity()` helper, avoiding the two systems ever silently disagreeing).

**Algorithmic constraints:** deterministic, no randomness, same inputs always produce the same output (required for both testability and the explainability principle, **→ PRODUCT** §2).

**Expected outputs:** an array of `{ date, suggestedHours }` — rendered as text in the Deadline detail view (**→ DESIGN** §11) in V1.5; not written to any calendar/scheduling table until V2's Study Session entity exists (**→ PRODUCT** §14, §26 flow 8).

---

## 12. Reminder Architecture

**Persistence:** each `Reminder` row stores `deadline_id`, `offset_or_absolute`, `channels[]`, and a computed `fire_at` (UTC, §8). A separate `notifications` table logs every actual delivery attempt (§8).

**Scheduling:** an Inngest function (`server/inngest/schedule-reminder.ts`) is triggered whenever a Reminder is created/edited (via an event emitted from the `reminders` domain module, §7) and schedules a delayed Inngest step to fire at `fire_at`. This event-driven, per-reminder scheduling is chosen over a polling cron job specifically because it's more reliable and cheaper at the fan-out scale described in **→ PRODUCT** §16/§19 — materializing jobs at creation time, not discovering "what's due soon" on a recurring sweep.

**Workers:** Inngest's managed infrastructure runs the actual dispatch step — no self-managed worker process (§4's decision rationale).

**Retries:** Inngest's built-in retry/backoff handles transient delivery failures (e.g., a momentary Resend/web-push API error) automatically; retries are capped (e.g., 3 attempts) before the `notifications` log records a terminal `failed` status.

**Idempotency:** each dispatch step is keyed by `reminder_id + fire_at`, so a retried or duplicated Inngest invocation cannot send the same reminder twice — enforced via an idempotency check against the `notifications` log before actually calling the push/email provider.

**Timezone handling:** `fire_at` is computed and stored in UTC at reminder-creation time (§8) — the dispatch step never re-derives "what local time is it now," avoiding DST-transition edge cases entirely.

**Recurrence:** a reminder on a recurring Deadline generates a fresh Inngest schedule for each materialized occurrence (§8's lazy-generation window) — not one reminder job trying to cover an unbounded future.

**Delivery:** push via `web-push` (VAPID keys, §29 env vars) and email via Resend, dispatched **in parallel** within the same Inngest function invocation — not sequential fallback (**→ PRODUCT** §16's explicit requirement, grounded in research §10's iOS-push-unreliability finding).

**Failures:** a push-send failure does not block or delay the parallel email send; both outcomes are independently logged to `notifications`.

**Deduplication:** the notification-grouping requirement (**→ PRODUCT** §16) is implemented at the dispatch layer — before sending, the function checks for other reminders with a `fire_at` within a short window (e.g., 30 minutes) for the same user and, where the push provider/OS supports it, sends a single grouped notification rather than N separate ones.

---

## 13. Offline Architecture

**Local persistence:** IndexedDB via Dexie.js — caches the current term's `deadlines`, `subjects`, and `subtasks` client-side.

**Caching:** on each successful online fetch, the relevant slice of TanStack Query's cache is also written through to Dexie; on app load, the UI hydrates from Dexie immediately (**→ DESIGN** §18's "progressive rendering" requirement) while a fresh network fetch reconciles in the background.

**Optimistic mutations:** create/edit/complete actions apply immediately to both the TanStack Query cache and the Dexie store, before server confirmation (**→ DESIGN** §18).

**Queued writes:** while offline, mutations are additionally written to a Dexie `pending_writes` table; a Serwist-registered background sync (where supported) or a simple "on reconnect" listener (universal fallback, since Background Sync API support is inconsistent, particularly on iOS Safari per research §10's broader platform-limitation findings) flushes `pending_writes` against the server in order.

**Synchronization:** flushed writes call the same Server Actions (§9) a normal online mutation would — no parallel "sync API," keeping validation/business-logic paths singular.

**Conflict resolution (V1):** last-write-wins, server timestamp authoritative — accepted per **→ PRODUCT** §25's reasoning (single-user-owned data, low realistic conflict rate). CRDT-based resolution is explicitly out of scope until multi-device concurrent editing is a demonstrated, not hypothetical, problem.

**Reconnect behavior:** on `navigator.onLine` transitioning true (plus a lightweight periodic connectivity check, since `navigator.onLine` is known to be an unreliable-alone signal), the pending-writes queue flushes automatically; the UI's offline indicator (**→ DESIGN** §19) reflects `syncing` → `synced` states, not just `offline`/`online`.

**Build note:** Serwist currently requires the Webpack build path even though Next.js 16 defaults to Turbopack (§3) — the project's build script must be `next build --webpack` for the production build that generates the service worker, a specific, easy-to-miss configuration detail.

---

## 14. Authentication

**Chosen: Supabase Auth.** Sessions managed via Supabase's SSR-compatible session cookies (`@supabase/ssr` package for Next.js App Router integration); protected routes/Server Actions verify the session server-side before touching any domain logic (§9).

**Authorization / data isolation:** enforced at two layers for defense in depth — (1) every domain-layer query is scoped by the authenticated `user_id`, never trusting a client-supplied ID; (2) Postgres Row-Level Security (RLS) policies on every table as a second, database-level guarantee that a query literally cannot return another user's rows even if an application-layer bug existed.

**Alternative documented (not chosen for V1):** Better Auth — the emerging 2026 self-hosted default with no per-MAU billing (§2/§4) — would be the correct choice if the team later moves the database off Supabase onto a plain Postgres host (e.g., Neon), since Supabase Auth's convenience is specifically tied to being on Supabase.

---

## 15. Security

- **Validation:** every Server Action validates its input against a Zod schema (§2) before it reaches domain logic — no unvalidated input ever reaches a database query.
- **Authorization:** per §14 — server-side session check + RLS as a second layer.
- **XSS:** React's default JSX escaping handles the general case; any place user-supplied `notes` text is rendered is treated as plain text, never `dangerouslySetInnerHTML`.
- **CSRF:** Next.js Server Actions have built-in CSRF protection (origin-checked); Route Handlers that accept mutations (e.g., a future webhook) verify a signature/secret rather than relying on cookies alone.
- **Injection protection:** Drizzle's parameterized queries eliminate raw SQL injection risk by default — no raw string-interpolated SQL anywhere in the domain layer.
- **Rate limiting:** applied to authentication endpoints and to the reminder-subscription/push-registration endpoint specifically (both are realistic abuse targets) — implemented via Supabase's built-in auth rate limits plus a lightweight IP-based limiter (e.g., Upstash Ratelimit) on custom Route Handlers.
- **Secure cookies:** session cookies set `HttpOnly`, `Secure`, `SameSite=Lax` (Supabase SSR defaults, verified against current documentation at scaffold time).
- **File upload security:** not applicable to V1 (Attachments are explicitly deferred, **→ PRODUCT** §6/§30) — revisit this section when Attachments are actually built.
- **Secrets:** all API keys (Supabase service role key, Resend, Inngest, VAPID private key) live in environment variables (§28), never committed, never exposed to the client bundle except the intentionally-public keys (Supabase anon key, VAPID public key).
- **Data isolation:** per §14 — RLS is the load-bearing guarantee here, not just application logic.

---

## 16. Performance

- **Rendering strategy:** Server Components for initial data-heavy loads (Today, Deadlines list), Client Components for interactive pieces (forms, the calendar's drag interactions) — following Next.js 16's standard App Router split.
- **Caching:** TanStack Query's client cache + Next.js's built-in data cache for Server Component fetches; the risk-tier cache column discussed in §10 is a deferred optimization, not a V1 requirement.
- **Indexing:** per §8 — the `(user_id, due_date, status)` and `(subject_id, due_date)` indexes are the two most performance-critical, directly serving the Today/clustering query pattern.
- **Pagination:** the Deadlines list paginates/virtualizes beyond ~100 items rather than loading a full term's history at once (research §19's named risk).
- **Calendar performance:** Month-view cells render a capped item count with "+N more" (**→ DESIGN** §12) rather than rendering every event unconditionally — keeps DOM size bounded on busy weeks.
- **Virtualization:** applied to the Deadlines list and to Search results (V1.5) via a lightweight virtualization library once list length exceeds a threshold — not applied to Today (naturally small) or Calendar (naturally bounded per cell).
- **Search performance:** Postgres full-text search (a `tsvector` column + GIN index on `deadlines.title`) is sufficient at this app's realistic scale — no dedicated search service (Elasticsearch/Algolia) is warranted for V1.5.
- **Bundle strategy:** route-level code splitting (automatic via App Router); the calendar component and any charting library (Analytics, V1.5) are dynamically imported so they don't bloat the initial Today-view bundle, which is the page most users open first (**→ DESIGN** §1's "fast" requirement).
- **Image handling:** minimal relevance in V1 (no user-uploaded images/attachments yet) — Next.js `<Image>` is used for any static/marketing assets regardless.

---

## 17. Testing

| Layer | Tool | Scope |
|---|---|---|
| **Unit** | Vitest | Domain modules (§7) in isolation — risk engine (§10) and scheduling engine (§11) get the heaviest unit-test investment given their boundary-condition sensitivity; Zod schemas; pure utility functions |
| **Integration** | Vitest + a test Postgres instance (or Supabase local dev stack) | Server Actions calling through to real domain logic + a real (test) database — verifying the full path, not just the pure functions in isolation |
| **E2E** | Playwright | Full user flows from **→ PRODUCT** §26 — critically, anything Vitest structurally cannot render: async Server Components and real auth flows (a confirmed 2026 capability gap — Vitest cannot render async Server Components; this is documented in Next.js's own official Vitest guide, not a workaround-able bug) |
| **Accessibility** | Playwright + `axe-core` integration (`@axe-core/playwright`) | Automated checks against **→ DESIGN** §21's requirements on every major screen in the E2E suite — contrast, ARIA roles, focus order |
| **Visual** | Not adopted in V1 | Deferred — visual regression tooling adds real CI cost/flakiness for a small team; revisit once the design system (**→ DESIGN** §3) has stabilized post-launch |

**Special attention areas (per explicit instruction), and how each is covered:**
- **Recurrence:** unit tests covering RRULE expansion + all three edit scopes (this/this-and-future/series) against fixed date fixtures, including a DST-transition date deliberately included in the fixture set.
- **Reminders:** integration tests verifying idempotent dispatch (§12) — simulating a duplicate Inngest invocation and asserting only one `notifications` row results.
- **Timezones:** unit tests on the UTC-storage/local-timezone-display boundary (§8, §12) specifically around DST transitions.
- **Deadline risk:** boundary-condition unit tests per §10.
- **Scheduling:** unit tests on the distribution algorithm's capacity constraints (§11), including the shortfall-reporting case.
- **Offline sync:** integration/E2E tests simulating offline creation → reconnect → verifying the server state matches, and a deliberate conflict scenario verifying last-write-wins behaves as specified (§13).
- **Completion/rescheduling:** E2E coverage of flows 5 and 12 from `PRODUCT_PRD.md` §26.

---

## 18. CI/CD

- **Linting:** ESLint (Next.js's default config, extended with import-boundary rules enforcing §6's layering — e.g., disallowing `app/` from importing `server/db/` directly).
- **Formatting:** Prettier, run as a pre-commit hook and a CI check (not just editor-integration, to keep Antigravity-generated code consistent regardless of its own formatting habits).
- **Type checking:** `tsc --noEmit` as a required CI step — the single highest-value automated check given Goal #2 (type safety) in §1.
- **Tests:** Vitest (unit/integration) run on every PR; Playwright E2E run on every PR against a preview deployment (not just `main`), so regressions are caught before merge, not after.
- **Builds:** a production build (`next build --webpack`, per §13's Serwist requirement) run in CI to catch build-time failures the dev server wouldn't surface.
- **Preview deployments:** Vercel's automatic PR preview deployments, connected to a preview/branch Supabase database (not the production database) so PR testing never touches real user data.
- **Production deployment:** merge to `main` triggers a production Vercel deployment; Supabase migrations (Drizzle Kit) run as an explicit, separate, reviewed step — never auto-applied silently as part of the app deploy, given the real cost of an unreviewed destructive migration.

---

## 19. Observability

- **Error tracking:** Sentry (`@sentry/nextjs`) across client, server, and Inngest functions — with domain-layer errors (risk engine, scheduling engine, recurrence expansion) tagged distinctly so a spike in one specific engine's failures is immediately visible, not buried in a generic error stream.
- **Logs:** structured logging (JSON) from Server Actions and Inngest functions, shipped to Vercel's log drains / Sentry's structured logging — no unstructured `console.log` debugging left in production paths.
- **Performance:** Vercel Analytics (Core Web Vitals, directly relevant to **→ DESIGN** §1's "fast" mandate) + Sentry Performance for server-side trace timing on the risk-engine/scheduling-engine calls specifically, since those are the computations most likely to grow expensive as a user's deadline count grows.
- **Background-job failures:** Inngest's own dashboard/observability for function-level failure rates and retry counts, cross-referenced against the `notifications` delivery log (§8/§12) as the product-level source of truth for "did this reminder actually reach the user."
- **Notification failures:** specifically monitored via the `notifications` table's `failed` status rate, alerted on if it crosses a threshold — this is the direct operational instrument for the reliability promise in **→ PRODUCT** §10/§16.
- **Useful application metrics:** the success metrics defined in `PRODUCT_PRD.md` §31 (on-time completion rate, risk-recovery rate, reminder effectiveness, etc.) are computed from application data, not inferred from infrastructure telemetry — a lightweight scheduled Inngest function aggregates these periodically rather than computing them live on every dashboard load.

---

## 20. Dependency Rules

1. Don't add a dependency for functionality achievable in under ~30 lines of well-understood code (e.g., no date-formatting micro-library beyond `date-fns`, already chosen).
2. Prefer actively maintained packages — checked against the same standard applied throughout §21–27 (recent commits, open issue responsiveness), not just star count.
3. Avoid duplicate libraries solving the same problem (one date library, one calendar-recurrence library, one HTTP-state library) — enforced at PR review, and Antigravity should be explicitly instructed (per its own configuration) never to introduce a second library for a role already filled.
4. Verify compatibility with the pinned Next.js/React versions (§3) before adding any UI-adjacent dependency — several ecosystem packages lag major React/Next releases.
5. Remove unused dependencies as part of normal maintenance, not left "just in case."
6. Periodically review dependencies (quarterly is reasonable at this project's scale) against their upstream maintenance status, since a healthy dependency today (e.g., a PWA plugin, per §3's `next-pwa` cautionary example) can become unmaintained without warning.

---

# Open-Source Reuse Strategy

## 21. Open-Source Repository Research

*(Findings below are the technical extension of the product research phase; license and status figures re-verified in this pass, dated August 2026.)*

**Vikunja** — github.com/go-vikunja/vikunja. Go backend, Vue frontend. **AGPL-3.0.** ~4.5k stars, actively maintained. Multi-view task engine (List/Kanban/Gantt/Table) over a single underlying entity.

**Super Productivity** — github.com/super-productivity/super-productivity. Angular, IndexedDB-first (offline/local-first by default). **MIT.** Actively maintained, large community. Cross-platform from one codebase (PWA/Electron/Capacitor).

**Plane** — github.com/makeplane/plane. TypeScript frontend + Python backend, open-core. **AGPL-3.0** (Community Edition; a separate commercial/enterprise tier exists for advanced features). ~50k stars (June 2026 figure), 4.4k forks, 735 open issues, very active (updated within days of this research pass). The single most-starred project-management OSS repo evaluated.

**Helium (HeliumEdu)** — github.com/HeliumEdu/platform (Django backend) + github.com/HeliumEdu/frontend (Flutter frontend). **License not confirmed via this research pass** — described as "free, open source" in marketing copy, but no LICENSE file content was independently verified. **Flag: LICENSE REVIEW REQUIRED before any reuse decision.** Functionally, this is the single most directly comparable real-world open-source student planner found in this entire research effort: real-time grade calculation, at-risk class alerts, color-coded Month/Week/Day/Agenda views with drag-and-drop, and two-way Google/Apple/iCal calendar sync — independently maintained by one developer (Alex Laird) since a 2010-era predecessor ("Get Organized"), funded via Patreon/GitHub Sponsors.

**FullCalendar** — github.com/fullcalendar/fullcalendar (Standard, **MIT**, ~20k stars) and the separate `fullcalendar-workspace` **Premium/Scheduler** package (as of v7: **AGPLv3 or a paid commercial license** — no longer GPLv3, specifically to close a SaaS-closed-source loophole the project identified).

**Cal.com** — github.com/calcom/cal.com. Next.js + Postgres + Redis. **AGPL-3.0**, open-core (a small enterprise-only slice is commercially licensed). ~35–41k stars depending on source/date. A scheduling/booking platform, not a deadline tracker — relevant as an architecture reference for a mature Next.js/Postgres production app, not as a feature source.

**Cal.diy** *(newly identified in this research pass, not in the original brief's list)* — a 2026 MIT-relicensed spinoff of Cal.com's codebase, maintained by former Cal.com interns, explicitly created to offer the most permissive version of that codebase for reuse. Directly relevant given Cal.com's own core is AGPLv3 — Cal.diy is the safer reference/reuse candidate for any Cal.com-derived scheduling-UI pattern.

**Also identified during this research pass:**
- `rrule.js` — the standard JS/TS implementation of RFC 5545 recurrence rules, MIT-licensed, the correct dependency for §8/§17's recurrence storage — not something to build from scratch.
- `Dexie.js` — the IndexedDB wrapper chosen for §13's offline layer, Apache-2.0 licensed.
- `date-fns` — MIT licensed.
- shadcn/ui and Radix primitives — both MIT licensed; shadcn/ui specifically distributes via a copy-into-your-repo CLI, not a traditional npm dependency, which changes how "reuse" is even categorized for it (§24).

---

## 22. Repository Evaluation

| Repository | URL | Stars | Forks | Language | Framework | Maintenance | Docs | License | License URL |
|---|---|---|---|---|---|---|---|---|---|
| Vikunja | github.com/go-vikunja/vikunja | ~4.5k | — | Go / TypeScript+Vue | Vue 3 | Active | Good | AGPL-3.0 (core), GPL-3.0 (desktop client) | gnu.org/licenses/agpl-3.0.en.html |
| Super Productivity | github.com/super-productivity/super-productivity | Large, actively growing | — | TypeScript | Angular | Active | Good (wiki) | MIT | opensource.org/license/mit |
| Plane | github.com/makeplane/plane | ~50k | ~4.4k | TypeScript (+ Python backend) | Next.js-adjacent frontend | Very active | Good | AGPL-3.0 (Community); custom (Enterprise) | gnu.org/licenses/agpl-3.0.en.html |
| Helium/platform | github.com/HeliumEdu/platform | Not independently confirmed | — | Python | Django | Active (per project site) | Present (wiki) | **Unconfirmed — review required** | — |
| Helium/frontend | github.com/HeliumEdu/frontend | Not independently confirmed | — | Dart | Flutter | Active | Present | **Unconfirmed — review required** | — |
| FullCalendar (Standard) | github.com/fullcalendar/fullcalendar | ~20k | ~3.7k | TypeScript | Framework-agnostic (+ React/Vue wrappers) | Active | Excellent | MIT | opensource.org/license/mit |
| FullCalendar Premium/Scheduler | github.com/fullcalendar/fullcalendar-workspace | — | — | TypeScript | — | Active | Excellent | AGPLv3 **or** paid commercial license | fullcalendar.io/license |
| Cal.com | github.com/calcom/cal.com | ~35–41k | — | TypeScript | Next.js | Very active | Excellent | AGPL-3.0 (core); commercial (enterprise slice) | github.com/calcom/cal.com (LICENSE) |
| Cal.diy | (2026 spinoff, see §21) | — | — | TypeScript | Next.js | New, active | — | MIT | — |

---

## 23. Reuse Classification

| Repository | Classification | Why |
|---|---|---|
| Vikunja | **REFERENCE ONLY** | AGPL-3.0 copyleft is incompatible with a closed-source commercial product without triggering reciprocal source disclosure; Vue/Go stack also mismatches this project's Next.js/TypeScript stack. Study its multi-view single-entity architecture (§7's own single-`Deadline`-entity decision is directly informed by this pattern); do not copy code. |
| Super Productivity | **REFERENCE ONLY** *(license would technically permit more — see note)* | MIT technically permits code reuse, but the Angular framework is fundamentally incompatible with this project's React/Next.js stack — direct code reuse isn't practical regardless of license. Study the IndexedDB local-first/sync-queue pattern (§13); reimplement it fresh in Dexie.js/TypeScript. |
| Plane | **REFERENCE ONLY** | AGPL-3.0 core, same reciprocal-disclosure issue as Vikunja; also far broader in scope (full PM platform) than this product needs. Reference only for how a large, well-regarded OSS app structures a domain layer at scale (§7). |
| Helium (platform + frontend) | **LICENSE REVIEW REQUIRED** | License not independently confirmed in this research pass — do not treat as reusable in any form until a maintainer-published LICENSE file is directly read and confirmed. Even if confirmed permissive, the Django/Flutter stack mismatches this project's stack, making it a **behavioral/product reference** (its grade-alerts, drag-and-drop calendar, and iCal sync features are genuinely relevant prior art to study) rather than a code-reuse candidate regardless of license outcome. |
| FullCalendar (Standard) | **GREEN** | MIT — safe as an npm dependency if the team ever needs a fallback to the custom-built calendar (§4/§25). |
| FullCalendar Premium/Scheduler | **DO NOT USE** (without a purchased commercial license) | AGPLv3-or-commercial as of v7 — using it in a closed-source product without a commercial license would require open-sourcing the entire application under AGPLv3, which conflicts with the product's commercial positioning. If a specific Premium capability (e.g., a resource-timeline view) is ever genuinely needed, budget for the commercial license explicitly rather than defaulting into AGPLv3 obligations by accident. |
| Cal.com | **REFERENCE ONLY** | AGPL-3.0 core, same reasoning as Vikunja/Plane; also a different product category (scheduling/booking, not deadline tracking) — useful only as a mature Next.js+Postgres production-architecture reference. |
| Cal.diy | **GREEN** *(for pattern-level reuse, with a scope caveat)* | MIT-licensed 2026 spinoff — genuinely safe for direct code/pattern reuse where relevant. Caveat: it's still a scheduling/booking tool, not a deadline tracker, so its practical relevance here is at the component/pattern level (e.g., a booking-flow UI pattern that might inform the Add Deadline flow's interaction model, **→ DESIGN** §11), not wholesale feature reuse. |
| `rrule.js` | **GREEN** | MIT, standard RFC 5545 implementation — install as a direct dependency for §8/§17's recurrence engine, do not hand-roll recurrence math. |
| `Dexie.js` | **GREEN** | Apache-2.0 — install as a direct dependency for §13's offline layer. |
| `date-fns` | **GREEN** | MIT — install as a direct dependency. |
| shadcn/ui + Radix primitives | **GREEN** | MIT — shadcn/ui is copy-into-your-repo (its components become first-party code you own and can edit, not a black-box dependency), Radix primitives are installed normally as npm packages underneath them. |

---

## 24. Build vs. Reuse

| Subsystem | Decision | Reasoning |
|---|---|---|
| Calendar (Agenda/Month/Week rendering) | **BUILD FROM SCRATCH** (with `date-fns` as a dependency) | Avoids FullCalendar Premium's licensing complexity and FullCalendar Standard's generic default styling conflicting with **→ DESIGN** §1; a custom component matching §12's exact density/breakpoint rules is more precisely buildable than fighting a library's opinions |
| Timeline (V2) | **BUILD FROM SCRATCH**, deferred to V2 | No suitable OSS reference found matching the specific Structured-style single-day block-timeline pattern (**→ DESIGN** §2) closely enough to warrant adaptation over a fresh build |
| Task/Deadline management (core CRUD) | **BUILD FROM SCRATCH** | This *is* the product — no reuse candidate makes sense here; Vikunja/Plane are REFERENCE ONLY for architecture ideas (§23), never code |
| Recurrence | **REUSE DEPENDENCY** (`rrule.js`) | Reinventing RFC 5545 expansion logic is unnecessary risk for zero benefit — this is exactly the kind of well-solved problem §20's dependency rules say to not rebuild |
| Date/time handling | **REUSE DEPENDENCY** (`date-fns`, `date-fns-tz`) | Same reasoning as recurrence |
| Reminders (scheduling/dispatch orchestration) | **REUSE DEPENDENCY** (Inngest) + **BUILD FROM SCRATCH** (the domain logic of what/when, §12) | The orchestration platform is reused; the product-specific logic of which reminders exist and when they should fire is this product's own domain code |
| Notifications (push/email sending) | **REUSE DEPENDENCY** (`web-push`, Resend SDK) | Standard, well-solved sending mechanics — no reason to hand-roll VAPID/web-push protocol handling |
| Scheduling engine (Smart Planning) | **BUILD FROM SCRATCH** | No OSS reference implements this product's specific deterministic, explainable distribution model (§11) — it's a genuinely novel piece of domain logic |
| Drag and drop (Week calendar reschedule, V1.5) | **SELECTIVE OPEN-SOURCE REUSE** (`@dnd-kit` or similar, MIT-licensed drag primitives) | The low-level drag mechanics are well-solved and safe to depend on; the calendar-specific drop-target logic built on top is this product's own code |
| Charts (Analytics, V1.5/V2) | **REUSE DEPENDENCY** (`recharts` or similar MIT-licensed charting library) | No product-specific reason to hand-roll chart rendering |
| Search | **BUILD FROM SCRATCH** (using Postgres's built-in full-text search, §16) — **not** a reused search service | At this app's scale, Postgres `tsvector`/GIN is sufficient; adopting a dedicated search service would be premature infrastructure |
| Command palette (V1.5) | **SELECTIVE OPEN-SOURCE REUSE** (e.g., `cmdk`, MIT-licensed) | A well-solved, narrowly-scoped UI primitive — reasonable to depend on rather than rebuild |
| Offline persistence | **REUSE DEPENDENCY** (Dexie.js) + **BUILD FROM SCRATCH** (the sync-queue/reconciliation logic, §13) | Same pattern as reminders: the low-level storage wrapper is reused, the product-specific sync logic is original |
| Authentication | **REUSE DEPENDENCY** (Supabase Auth, §14) | Rolling custom auth is a well-known anti-pattern regardless of team size |
| Forms | **REUSE DEPENDENCY** (React Hook Form) | Standard, well-solved |
| Accessibility primitives | **REUSE DEPENDENCY** (Radix, underlying shadcn/ui) | Radix's accessible-by-default modal/dialog/dropdown behavior directly satisfies **→ DESIGN** §21's focus-management requirements — reinventing this would be pure risk with no upside |

---

## 25. Open-Source Components to Reuse — Implementation Map

| Product Requirement | Package | GitHub URL | License | Reuse Type | Purpose | Integration Point | Recommendation |
|---|---|---|---|---|---|---|---|
| Recurring deadlines (**→ PRODUCT** §17) | `rrule` | github.com/jkbrzt/rrule | MIT | Dependency | RFC 5545 recurrence expansion | `server/domain/recurrence/` | Install directly; do not hand-roll |
| Offline cache (**→ PRODUCT** §25) | `dexie` | github.com/dexie/Dexie.js | Apache-2.0 | Dependency | IndexedDB wrapper | `lib/offline/` (client-side) | Install directly |
| Date handling (§8, §12) | `date-fns`, `date-fns-tz` | github.com/date-fns/date-fns | MIT | Dependency | Formatting, timezone math | Throughout `server/domain/` and UI display components | Install directly |
| UI primitives (**→ DESIGN** §22 component inventory) | shadcn/ui CLI + Radix primitives | github.com/shadcn-ui/ui, github.com/radix-ui/primitives | MIT | Copy-in (shadcn) + Dependency (Radix) | Accessible base components | `components/ui/` | Generate via CLI, then edit freely — these become first-party code |
| Reminder scheduling/dispatch orchestration (§12) | Inngest SDK | github.com/inngest/inngest | Apache-2.0 (SDK/OSS core; managed cloud is the paid product) | Dependency + managed service | Event-driven job scheduling | `server/inngest/` | Install SDK, use managed Inngest Cloud (§29) |
| Push notification sending (§12) | `web-push` | github.com/web-push-libs/web-push | MIT | Dependency | VAPID-based Web Push protocol | `server/inngest/dispatch-reminder.ts` | Install directly |
| Drag-and-drop (V1.5, **→ DESIGN** §20) | `@dnd-kit/core` | github.com/clauderic/dnd-kit | MIT | Dependency | Low-level drag mechanics | `features/calendar/components/WeekView` | Install directly; build calendar-specific drop logic on top |
| Charts (V1.5+, **→ PRODUCT** §23) | `recharts` | github.com/recharts/recharts | MIT | Dependency | Analytics chart rendering | `features/analytics/` | Install directly |
| Command palette (V1.5, **→ DESIGN** §8) | `cmdk` | github.com/pacocoursey/cmdk | MIT | Dependency | Command palette UI primitive | `components/shared/CommandPalette` | Install directly |
| Calendar architecture reference only | Vikunja | github.com/go-vikunja/vikunja | AGPL-3.0 | Reference only — no code | Multi-view-over-one-entity pattern | Informs `server/domain/deadlines/` design, not copied | Study, do not clone |
| Offline architecture reference only | Super Productivity | github.com/super-productivity/super-productivity | MIT | Reference only — practical incompatibility | Local-first sync-queue pattern | Informs §13's design, reimplemented fresh | Study, do not port Angular code |
| Student-planner behavioral reference only | Helium (HeliumEdu) | github.com/HeliumEdu/platform, /frontend | **Unconfirmed — review required** | Reference only until license confirmed | Grade alerts, drag-drop calendar, iCal sync patterns | Product-behavior study only | Confirm license independently before any further evaluation; do not reuse code regardless pending that confirmation |

---

## 26. Source-Code Reuse Rules

1. Verify the license directly on the repository (the actual `LICENSE` file, not a marketing page) before copying any code — Helium (§23) is the standing example in this project of a repository that is *not* yet cleared for this reason.
2. Do not copy proprietary or enterprise-only code (e.g., Plane's or Cal.com's Enterprise-tier source, which is separately licensed from their AGPL-3.0 core) under any circumstances.
3. Do not copy AGPL/GPL-licensed code into this project's closed-source repository — this includes Vikunja, Super Productivity's *code* (its patterns, not its literal source, are fine to study — see rule 7), Plane, Cal.com, and FullCalendar Premium.
4. Preserve required copyright/license notices for any package that is installed as a dependency (standard `node_modules`/package-manifest attribution — no action needed beyond not stripping license files from vendored code, which shouldn't happen under normal dependency management anyway).
5. Prefer published npm packages over vendoring source directly, per §25's implementation map — every GREEN item there is installed as a normal dependency, not copy-pasted.
6. Prefer focused, single-purpose dependencies (`rrule`, `dexie`, `@dnd-kit`) over adopting a large third-party application's codebase (Plane, Cal.com) as a foundation — this project is not a fork of any of the researched repositories.
7. Keep the final product architecturally coherent — a REFERENCE ONLY repository's *pattern* (e.g., "one entity, multiple views") can and should inform this project's own original implementation; its literal code must not appear in this project's repository.
8. Do not copy branding — no Vikunja/Plane/Cal.com/FullCalendar visual identity, icons, or wordmarks anywhere in this product.
9. Do not copy proprietary text — no marketing copy, help-text phrasing, or documentation strings lifted from any researched competitor or OSS project.
10. Do not clone competitor interfaces — §23/§24's reuse classifications are about code and mechanisms, never about replicating another product's screen layouts (this is also **→ DESIGN** §1's explicit mandate).
11. Document important third-party dependencies — every GREEN entry in §25 should have a corresponding note in the project's own dependency documentation (e.g., a `THIRD_PARTY_NOTICES` file) recording its license, consistent with rule 4.
12. Verify compatibility with the pinned framework versions (§3) before adding any dependency from §25's list — re-check at scaffold time, since library compatibility with Next.js 16/React 19 specifically should be confirmed, not assumed from a package's general popularity.

---

## 27. Important Repository Distinction

To be unambiguous, restated as four explicit buckets (never blanket instructions like "copy Vikunja" or "copy Cal.com"):

- **SAFE DEPENDENCY** (install normally, no further review needed): `rrule`, `dexie`, `date-fns`/`date-fns-tz`, Radix primitives, Inngest SDK, `web-push`, `@dnd-kit/core`, `recharts`, `cmdk`, React Hook Form, TanStack Query, Zustand, Zod, Drizzle ORM (§3's stable-line caveat applies), Supabase client libraries.
- **SAFE SELECTIVE CODE REUSE**: shadcn/ui-generated components (MIT, copy-in by design — treat as first-party code once generated, including the freedom to modify); Cal.diy (MIT) at the specific pattern/component level only, with the scope caveat in §23.
- **REFERENCE ONLY** (study, never copy source): Vikunja, Super Productivity, Plane, Cal.com, FullCalendar Premium/Scheduler's *concepts* (not its licensed code).
- **LICENSE REVIEW REQUIRED** (do not use in any form — including as a reference for anything beyond publicly-documented product behavior — until independently confirmed): Helium/HeliumEdu (both `platform` and `frontend` repositories).

---

# AI Coding Agent Compatibility

The codebase will be implemented by Google Antigravity — the architecture is deliberately shaped to reduce the specific failure modes an AI coding agent is prone to:

- **Predictable folder structure (§6):** a fixed, documented location for every kind of code (domain logic, Server Actions, UI components) so the agent doesn't have to infer or invent placement conventions per feature.
- **Clear naming:** entity names in code match `PRODUCT_PRD.md`'s terminology exactly (`Deadline`, not `Task`; `Subject`, not `Course`) — cross-document consistency (see the Consistency Check below) directly prevents an agent from introducing a synonym that silently forks the domain model.
- **Strict typing (§1, §2):** TypeScript + Zod end-to-end means an agent's mistake (wrong field name, wrong type) surfaces as a compile/validation error immediately, not a silent runtime bug discovered later.
- **Schema validation (§9):** every Server Action's input is Zod-validated — an agent adding a new mutation is guided by the existing schema pattern rather than free-form input handling.
- **Feature boundaries (§6, §7):** `features/` and `server/domain/` are organized by product concept, not by technical layer alone — an agent working on "reminders" touches a bounded, predictable set of files.
- **Isolated business logic (§7, §9):** the risk engine and scheduling engine as pure functions mean an agent can modify or extend them with unit tests as an immediate, tight feedback loop, without needing to understand the whole request lifecycle to verify a change.
- **Testable services (§17):** every domain module has a corresponding test file by convention, giving the agent an existing pattern to extend rather than a decision to make from scratch about whether/how to test new logic.
- **Minimal hidden state:** no global mutable state outside TanStack Query's cache (client) and the database (server) — an agent should never need to trace an implicit singleton to understand a bug.
- **Modular components (§22 of `DESIGN_PRD.md`):** the component inventory there is the canonical list — an agent adding UI should extend or compose from it, not invent a parallel one-off component for something already covered.
- **Documentation:** each domain module (§7) includes a short header comment stating its inputs/outputs/boundary explicitly (mirroring this document's own §7 table) — kept in the code itself, not only in this PRD, so it survives independently of whether the agent re-reads this document every session.
- **Small, focused changes:** the layered architecture (§5, §9) means most feature work touches 2–4 files (a domain function, its test, a Server Action, a UI component) rather than requiring wide, error-prone changes across the codebase.
- **Dependency discipline (§20):** explicit rules an agent can be configured to follow directly, reducing the risk of redundant library introduction — a specifically named failure mode this document is designed against.

---

## 28. Environment Variables

*(Categories only — no real secrets included.)*

| Category | Examples |
|---|---|
| Database | `DATABASE_URL` (Supabase Postgres connection string) |
| Auth | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Email | `RESEND_API_KEY` |
| Push notifications | `VAPID_PUBLIC_KEY` (also exposed client-side), `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (contact email/URL) |
| Background jobs | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` |
| Error tracking | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (build-time source-map upload) |
| App config | `NEXT_PUBLIC_APP_URL`, `NODE_ENV` |
| Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (if Upstash Ratelimit is used, §15) |

---

## 29. Deployment

| Layer | Platform | Reasoning |
|---|---|---|
| Frontend/application | **Vercel** | First-party Next.js deployment, automatic preview environments (§18), matches the serverless architecture Inngest is chosen to complement (§4) |
| Database | **Supabase** (managed Postgres + Auth + Storage) | Single-vendor simplicity for MVP (§4/§14), built-in RLS, generous free tier appropriate for early-stage cost (§30) |
| Background jobs | **Inngest Cloud** | Managed, no Redis/worker infrastructure to operate (§4/§12) |
| Email | **Resend** | Developer-friendly transactional email API, straightforward Next.js integration |
| Object storage | Supabase Storage (available, unused until Attachments — a deferred feature per **→ PRODUCT** §6/§30) | Comes "free" with the Supabase choice — no separate vendor needed if/when Attachments ship |
| Monitoring | **Sentry** (hosted) | Standard hosted tier is sufficient at this scale; self-hosting Sentry is unnecessary operational overhead for a small team |

**MVP cost/ease/reliability/scalability reasoning:** every layer above is a managed service with a genuinely usable free or low-cost tier, deliberately avoiding self-hosted infrastructure (Redis, a VPS, a self-managed Postgres instance) that would require ops attention this project's team size doesn't have to spare — directly serving Goal #10 (cost) and Goal #5 (maintainability) from §1, at the acknowledged trade-off of somewhat higher per-unit cost at large scale than a fully self-hosted stack (quantified in §30).

---

## 30. Cost Analysis

*(Estimates only — directional, not quotes; verify current pricing for each service at build time.)*

| Stage | Rough monthly cost | Cost drivers |
|---|---|---|
| **Development** | $0–20/mo | Free tiers across Vercel, Supabase, Inngest, Resend, Sentry cover a pre-launch development phase entirely |
| **MVP (early users, low hundreds)** | ~$25–75/mo | Supabase free/small paid tier as data grows past free-tier limits; Vercel likely still free/hobby-adjacent; Inngest and Resend free tiers cover low job/email volume; Sentry free tier |
| **Small production (low thousands of users)** | ~$150–400/mo | Supabase Pro tier; Vercel Pro; Inngest usage-based cost starts mattering here (§4's noted trade-off vs. self-hosted BullMQ) as reminder-job volume scales with active deadlines × reminders × channels; Resend paid tier for email volume |
| **Moderate production (tens of thousands of users)** | ~$800–2,500/mo, wide range | Database compute/storage becomes the dominant line item; background-job cost is the single most likely candidate for a deliberate migration to self-hosted BullMQ (§4's documented alternative) if it becomes disproportionate; push/email volume scales roughly linearly with user count |
| **Larger scale** | Requires dedicated capacity planning, not estimated here | At this point, a genuine infrastructure review (managed vs. self-hosted for each layer) should be a deliberate, budgeted decision — not extrapolated from this table |

**What creates scaling cost specifically:** (1) reminder job volume (§12) — this is the line item most directly proportional to the product's core value proposition (more deadlines × more reminders × two channels), and the one most worth monitoring against the Inngest-vs-BullMQ trade-off from §4 as usage grows; (2) database compute/storage as historical deadline data accumulates across terms; (3) email volume, which scales with active users more than with any single feature.

---

## 31. Technical Risks

| Risk | Area | Mitigation |
|---|---|---|
| iOS PWA push notifications are fundamentally unreliable (a platform limitation, not fixable in this codebase) | Notifications | Multi-channel-by-default architecture (§12) is the direct, deliberate mitigation — not a workaround, a design response to an accepted constraint |
| Recurring-deadline expansion growing unbounded | Calendars/data | Bounded lazy-generation window (§8, §16) — must be enforced in the recurrence module's implementation, not just documented here |
| Timezone/DST bugs in reminder scheduling | Notifications, timezones | UTC-at-write-time storage strategy (§8, §12) specifically designed to eliminate the most common class of this bug; explicit DST-transition test fixtures required (§17) |
| Offline sync data loss or silent conflict | Offline sync | Last-write-wins is an accepted, scoped trade-off (§13) — the risk is *scope creep* into assuming this also safely covers a future multi-device-concurrent-editing scenario it was never designed for; flagged for deliberate re-evaluation if/when that usage pattern actually emerges |
| Database query complexity growing with the clustering/risk-engine query pattern | Database | The specific composite indexes named in §8 are load-bearing for this — must be created at initial schema definition, not added reactively after a performance problem appears |
| Dependency abandonment (the exact `next-pwa` precedent found in this research, §3) | Dependencies | §20's quarterly-review rule exists specifically because of this precedent; Serwist itself should be periodically re-checked against this same risk |
| Vendor lock-in across Vercel/Supabase/Inngest/Resend | Deployment | Accepted, deliberate trade-off for MVP velocity (§29) — none of these choices involve proprietary data formats that would make migration impossible later (Postgres is portable, Next.js is portable), but the *integration glue* (RLS policies, Inngest function definitions) would need rework in a future migration; not a blocker, a known cost |
| Drizzle 1.0's eventual GA release changing APIs from the 0.x line currently recommended (§3) | ORM | Explicitly flagged in §3 — plan a deliberate, tested migration when 1.0 reaches general availability rather than adopting the RC preemptively |
| AI-generated code quality drift over a long build (multiple Antigravity sessions) | Development process | The entire "AI Coding Agent Compatibility" section above exists as the direct mitigation — strict typing, small boundaries, and mandatory tests are the guardrails, not a one-time setup step to skip after the initial scaffold |

---

## 32. Final Technology Decision

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Framework | Next.js | 16.3.x (Active LTS) | Current, App Router PWA maturity, largest 2026 ecosystem fit (§3) |
| Language | TypeScript | Latest 5.x stable (verify at scaffold time) | End-to-end type safety (Goal #2, §1) |
| UI | React | 19.2.x (bundled via Next.js 16) | Current stable, React Compiler stable since Oct 2025 (§3) |
| CSS | Tailwind CSS | 4.3.x | CSS-first config, Lightning CSS engine, current (§3) |
| Component library | shadcn/ui + Radix primitives | Current (MIT) | Copy-in model suits AI-agent editability (§2, "AI Coding Agent Compatibility") |
| Database | PostgreSQL | via Supabase (managed) | Multi-device sync requirement (§2) |
| ORM | Drizzle ORM | Current stable 0.x line (not the 1.0 RC) | Edge-friendly, no-generate-step, agent-legible (§3, §4) |
| Validation | Zod | v4 | TypeScript-first standard, smaller bundle (§3) |
| Authentication | Supabase Auth | Current | Single-vendor simplicity + RLS (§14) |
| State/data fetching | TanStack Query + Zustand | Current | Server state vs. small client UI state split (§2) |
| Forms | React Hook Form + Zod resolver | Current | Standard low-friction pairing (§2) |
| Calendar | Custom-built (date-fns + rrule.js) | — | Avoids FullCalendar Premium licensing + generic Standard styling (§4, §21–25) |
| Date/time | date-fns, date-fns-tz | Current | Stable, production-proven over a raw Temporal polyfill as of Aug 2026 (§2) |
| Notifications | web-push (VAPID) + Resend + Inngest | Current | Multi-channel-parallel architecture (§12) |
| Background jobs | Inngest | Current | Serverless-native, matches Vercel deployment (§4) |
| Offline | Serwist + Dexie.js | Current | Actively maintained PWA successor to archived `next-pwa` (§3); IndexedDB wrapper (§13) |
| Testing | Vitest + Playwright + Testing Library + axe-core | Vitest/RTL current; Playwright 1.57.x | Verified 2026 split of unit vs. E2E capability, including the async-Server-Component gap (§17) |
| Monitoring | Sentry (`@sentry/nextjs`) | Current (verify at scaffold) | De facto standard for this stack (§19) |
| Deployment | Vercel + Supabase + Inngest Cloud + Resend | — | Managed-services-first, MVP-cost-appropriate (§29, §30) |

---

## 33. Technical Implementation Order

1. **Repository setup** — Next.js 16 scaffold, TypeScript strict mode, ESLint/Prettier config, repository structure per §6.
2. **Tooling** — Drizzle Kit, Vitest, Playwright configured and running against an empty/placeholder test.
3. **Database** — schema definitions for `users`, `academic_terms`, `subjects`, `deadlines`, `subtasks` (§8's core entities first; `reminders`/`notifications`/`recurrence_*` follow once the core model is stable); initial migration applied to a dev Supabase project.
4. **Authentication** — Supabase Auth wired end-to-end (signup/login/session), RLS policies applied to every table from the moment it's created, not retrofitted.
5. **Domain layer (core)** — `deadlines` and `subjects` modules (§7): CRUD logic, pure functions, unit-tested before any UI touches them.
6. **Deadline system UI** — Add/Edit Deadline flow (**→ DESIGN** §11), Deadlines list (**→ DESIGN** §22/§23), wired through Server Actions (§9) to the domain layer from step 5.
7. **Subjects** — Subjects screen and Subject detail (**→ DESIGN** §15), Academic Term management (**→ PRODUCT** §26 flow 1's onboarding dependency).
8. **Risk engine** — `risk-engine` domain module (§10), unit-tested against boundary fixtures, then surfaced in the UI (RiskBadge, **→ DESIGN** §10/§22) once the underlying computation is verified independently of any UI.
9. **Today** — assembles Deadlines + Risk Engine output per **→ PRODUCT** §20 / **→ DESIGN** §9/§13 — deliberately sequenced after both dependencies are independently solid, since Today is the product's most important screen and should not be built against still-shifting foundations.
10. **Reminders** — `reminders` domain module (§7), Inngest scheduling/dispatch (§12), notification-category settings UI (**→ PRODUCT** §24) — a substantial, self-contained phase given its reliability requirements.
11. **Recurrence** — `recurrence` domain module (§17/§8), RRULE integration, the three edit-scope flows, tested heavily against DST fixtures (§17) before being exposed in the Add/Edit Deadline UI.
12. **Calendar** — Agenda + Month views (**→ DESIGN** §12), consuming the by-now-stable Deadline + Recurrence + Risk systems.
13. **Inbox / Quick Capture** — a comparatively small, late-sequenced feature since it depends on the full Deadline model already existing to "triage" into (**→ PRODUCT** §18).
14. **Scheduling engine (Smart Planning, V1.5)** — `scheduling-engine` module (§11), surfaced as text suggestions in Deadline detail.
15. **Workload view (V1.5)** — consumes the scheduling engine's output (§7's boundary rule) rather than re-deriving it.
16. **Offline** — Serwist + Dexie integration (§13) — deliberately sequenced after the core online flows are stable, since offline is a resilience layer on top of an already-working online product, not a parallel system built simultaneously.
17. **Search/filters (V1.5)** — Postgres full-text search (§16), quick filters were already present from step 6; this phase adds the full search overlay.
18. **Analytics (V1.5)** — the last feature phase, since it's explicitly retrospective and depends on real completed-deadline data existing to be meaningful.
19. **Testing hardening** — accessibility (axe-core) pass across all screens (§17), E2E coverage of every flow in `PRODUCT_PRD.md` §26.
20. **Deployment** — production Vercel/Supabase/Inngest/Resend setup (§29), CI/CD pipeline finalized (§18), monitoring (§19) confirmed operational before public launch.

---

## Cross-Document Consistency Check

Performed against `PRODUCT_PRD.md` and `DESIGN_PRD.md` before finalizing this document:
- ✅ Every V1 feature in `PRODUCT_PRD.md` §28 has a corresponding technical implementation step in §33 above.
- ✅ Every `DESIGN_PRD.md` §22 component maps to a `PRODUCT_PRD.md` requirement (no orphan UI components invented at the design layer without a product reason).
- ✅ Terminology is consistent: `Deadline` (not `Task`), `Subject` (not `Course` alone — used interchangeably in prose but the entity name is `Subject`), `AcademicTerm`, `risk tier` (six values, identical list in all three documents), `priority` (four values, identical list).
- ✅ V1 scope in `PRODUCT_PRD.md` §28 matches §33's implementation order — nothing in the implementation order builds a V1.5/V2/V3 feature ahead of its dependencies from V1.
- ✅ Risk scoring is consistent: the tier list, signal names (`daysRemaining`, `effortRemaining`, `availableCapacity`, `capacityRatio`, `clusterCount`), and explainability requirement match exactly between `PRODUCT_PRD.md` §13, `DESIGN_PRD.md` §3/§5/§10, and this document's §10.
- ✅ Reminders are consistent: multi-channel-parallel (not sequential fallback) is stated identically in `PRODUCT_PRD.md` §16 and this document's §12.
- ✅ Recurrence is consistent: RRULE-based storage and the three-tier edit scope (occurrence/this-and-future/series) match across `PRODUCT_PRD.md` §17, this document's §8/§17, and are reflected in `DESIGN_PRD.md`'s calendar interaction notes (§12).
- ✅ Calendar behavior is consistent: Agenda-default-mobile, Month/Week/Day staged by version identically across all three documents.
- ✅ Mobile and desktop behavior is consistent: the 4-item bottom tab bar + FAB (mobile) and sidebar + header button (desktop) match between `PRODUCT_PRD.md` §27 and `DESIGN_PRD.md` §7/§8.

---

## Decisions Made
- Drizzle ORM's stable 0.x line, explicitly not the 1.0 release candidate (§3).
- Inngest over BullMQ/Trigger.dev for V1 background jobs, with BullMQ documented as the explicit cost-optimization migration path (§4, §30).
- Supabase Auth over Clerk/Better Auth for V1, given the Supabase database choice (§14).
- Custom-built calendar over FullCalendar, specifically to avoid Premium/Scheduler's AGPLv3-or-commercial licensing (§4, §21–25).
- Serwist over `next-pwa` (archived) for the PWA/service-worker layer, with the Next.js-16-defaults-to-Turbopack-but-Serwist-needs-Webpack build nuance explicitly documented (§3, §13).
- Helium/HeliumEdu classified as LICENSE REVIEW REQUIRED rather than assumed-safe, despite being marketed as "open source" (§21–23) — a deliberate, conservative call given no LICENSE file was independently confirmed.

## Assumptions
- A single Supabase project (with branch/preview databases for CI, §18) is sufficient through the MVP and small-production stages — a dedicated staging environment beyond preview branches is not assumed necessary yet.
- Inngest's free/low tier covers development and early-MVP reminder volume without a paid plan being immediately necessary (§30) — worth confirming against Inngest's actual current pricing at scaffold time.
- The team building this (Antigravity plus a human reviewer) can maintain the layering discipline in §6/§9 without additional tooling beyond standard ESLint import-boundary rules.

## Open Questions
- Exact current pricing tiers for Supabase, Inngest, and Resend should be reconfirmed at scaffold time — §30's figures are directional estimates, not live quotes.
- Whether Drizzle's 1.0 GA release (once it ships) is close enough behind V1's build timeline to justify waiting rather than building on 0.x now — a timing judgment call for the product owner, not resolved here.
- Whether the Helium license, once independently confirmed, changes its classification in §23/§27 in any way that would newly justify deeper product-behavior study (it would not change its code-reuse status either way, given the Django/Flutter stack mismatch noted in §23).

## Risks
- (Consolidated in §31 above — not duplicated here.)

## Deferred Decisions
- Visual regression testing tooling (§17) — deferred until the design system has stabilized post-launch.
- Whether a `risk_tier_cache` column (§10) is actually needed — deferred until real query-performance data from production exists.
- The exact rate-limiting provider/configuration (§15) beyond "Upstash Ratelimit or equivalent" — a scaffold-time implementation detail, not a V1-blocking architectural decision.
- SMS provider selection for the V2 SMS reminder channel (**→ PRODUCT** §24) — out of scope for this document until that feature is actually scheduled for build.
