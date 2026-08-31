# Build Prompt for Google Antigravity — Student Deadline Tracker

*Paste this as your task/steering prompt in Antigravity once `PRODUCT_PRD.md`, `DESIGN_PRD.md`, and `TECH_STACK_PRD.md` are present in the project workspace (repo root or `/docs`). This prompt orchestrates the build — it does not restate the specs; it tells you how to use them.*

---

## 0. Role and Context

You are building a **premium, mobile-first Student Deadline Tracker** web application — a production application, not a prototype or a demo. The product's full specification already exists across three documents in this workspace. Your job is to implement it precisely, not to redesign, reinterpret, or "improve" it as you go. Where you believe something in the specs is wrong or incomplete, flag it explicitly and ask — do not silently substitute your own judgment.

This is a real build for a real user base of students. Treat it with the same rigor you'd apply to any production codebase: typed, tested, reviewable in small increments.

---

## 1. Required Reading — Before You Write Any Code

Read, in full, in this order:
1. **`PRODUCT_PRD.md`** — what the product does. Pay special attention to §6 (Deadline object), §13 (Deadline Risk Engine), §14 (Smart Planning), §16 (Reminder System), §17 (Recurring Deadlines), §28 (MVP scope), and §29 (Acceptance Criteria).
2. **`DESIGN_PRD.md`** — how it looks and behaves. Pay special attention to §3 (Design System — exact color/spacing/type tokens), §6 (Responsive System), §11 (Add Deadline Experience), §21 (Accessibility), §22–23 (Component and Page Inventories).
3. **`TECH_STACK_PRD.md`** — how it's engineered. Pay special attention to §5 (Final Architecture), §6 (Repository Structure), §7 (Domain Modules), §8 (Database Architecture), §21–27 (Open-Source Reuse Strategy — read this fully before installing anything), §32 (Final Technology Decision), and §33 (Technical Implementation Order).

**Do not proceed to setup or code until you have read all three completely.** These three documents are cross-referenced and consistent with each other (verified in `TECH_STACK_PRD.md`'s Cross-Document Consistency Check) — if anything you encounter while building appears to contradict one of them, stop and surface the contradiction rather than picking a side yourself.

**Terminology is fixed across all three documents and must stay fixed in code:** `Deadline` (never `Task`), `Subject` (the entity name, even though "course" appears interchangeably in prose), `AcademicTerm`, the six risk tiers exactly as named (`On Track`, `Upcoming`, `Needs Attention`, `At Risk`, `Critical`, `Overdue`), the four priority levels (`Low`, `Medium`, `High`, `Critical`). Do not introduce synonyms.

---

## 2. Technology Stack — Hard Constraints

Use exactly the stack decided in `TECH_STACK_PRD.md` §32. Do not substitute an alternative (e.g., Prisma instead of Drizzle, Clerk instead of Supabase Auth, FullCalendar instead of a custom calendar) without explicitly flagging why and asking first — every choice in that table has documented reasoning in §4 of the same document, and substituting one changes downstream decisions (e.g., Supabase Auth's choice depends on the Postgres-via-Supabase decision).

**One explicit version caveat to honor:** Drizzle ORM is on a `1.0.0-rc` track as of the last research pass. Install the **current stable 0.x release**, not the RC — check `npm view drizzle-orm versions` before installing and pick the latest non-prerelease version, not whatever `@latest` happens to resolve to if that tag has moved to the RC by the time you build.

**Verify at install time, don't assume, for anything the spec explicitly flagged as unpinned:** exact TypeScript patch, exact Vitest patch, exact Sentry SDK version (`TECH_STACK_PRD.md` §3 names these explicitly as "verify at scaffold time" rather than guessing — do the same).

### Suggested install commands (verify each version against its registry before running)

```bash
# Framework
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias "@/*"

# Core data/validation layer
npm install drizzle-orm drizzle-zod zod
npm install -D drizzle-kit

# Auth + backend services
npm install @supabase/supabase-js @supabase/ssr

# Client state
npm install @tanstack/react-query zustand

# Forms
npm install react-hook-form @hookform/resolvers

# Date, recurrence, offline
npm install date-fns date-fns-tz rrule dexie

# Notifications / background jobs
npm install inngest web-push

# UI primitives (shadcn/ui is generated in, not just installed — see §5 below)
npm install lucide-react
npx shadcn@latest init
# then: npx shadcn@latest add <component> per-component as needed (button, input, dialog, sheet, select, checkbox, etc.)

# PWA / offline shell
npm install @serwist/next serwist

# V1.5 additions (install when you actually reach that phase, not upfront)
npm install @dnd-kit/core recharts cmdk

# Testing
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test @axe-core/playwright

# Monitoring
npm install @sentry/nextjs
```

Do not add any dependency beyond this list without checking it against `TECH_STACK_PRD.md` §20's dependency rules first (no duplicate libraries solving the same problem; prefer actively maintained packages; verify Next.js 16 / React 19 compatibility before adding anything UI-adjacent).

---

## 3. Build Phasing — Follow This Order

Build in exactly the sequence specified in `TECH_STACK_PRD.md` §33, reproduced here as literal checkpoints. **Stop after each phase and summarize what you built, what you tested, and what's next — do not silently chain multiple phases together without a checkpoint.** This keeps changes small and reviewable, per the "AI Coding Agent Compatibility" principles in `TECH_STACK_PRD.md`.

| # | Phase | Gate before moving on |
|---|---|---|
| 1 | Repo scaffold, TypeScript strict mode, ESLint/Prettier, folder structure (§6 of TECH_STACK_PRD) | Structure matches §6 exactly; empty app builds and runs |
| 2 | Tooling — Drizzle Kit, Vitest, Playwright wired up | A placeholder test passes in CI-equivalent local run |
| 3 | Database schema — `users`, `academic_terms`, `subjects`, `deadlines`, `subtasks` first (core entities); `reminders`/`notifications`/`recurrence_*` follow | Migration applies cleanly to a dev Supabase project; indexes from §8 present from the start, not retrofitted |
| 4 | Auth — Supabase Auth end-to-end, RLS policies on every table **the moment it's created** | Sign up / log in / session works; a manual check confirms one user cannot query another's rows |
| 5 | Domain layer — `deadlines` and `subjects` modules (pure functions, unit-tested) | Unit tests pass with zero UI existing yet |
| 6 | Deadline UI — Add/Edit flow (bottom sheet mobile / modal desktop per DESIGN_PRD §11), Deadlines list | Matches DESIGN_PRD §11/§22/§23; acceptance criteria in PRODUCT_PRD §29 "CREATE DEADLINE" all pass |
| 7 | Subjects — screen + detail + Academic Term management | Onboarding flow (PRODUCT_PRD §26 flow 1) completable end-to-end |
| 8 | Risk engine — `risk-engine` domain module, boundary-condition unit tests, **then** surfaced in UI | All boundary cases from TECH_STACK_PRD §10 tested before any RiskBadge renders |
| 9 | Today screen | Assembles Deadlines + Risk Engine output exactly per PRODUCT_PRD §20 / DESIGN_PRD §9 |
| 10 | Reminders — domain module, Inngest scheduling/dispatch, notification settings UI | Multi-channel parallel delivery verified (not sequential fallback); idempotency test passes |
| 11 | Recurrence — RRULE integration, three edit scopes, DST-transition test fixtures | All three edit-scope acceptance criteria (PRODUCT_PRD §29) pass |
| 12 | Calendar — Agenda + Month views | Matches DESIGN_PRD §12's density/breakpoint rules |
| 13 | Inbox / Quick Capture | Bare-text save works with zero required fields; triage flow works |
| 14 | Smart Planning (V1.5) — `scheduling-engine` module | Deterministic distribution algorithm unit-tested including the shortfall case |
| 15 | Workload view (V1.5) | Consumes scheduling-engine output, does not re-derive it |
| 16 | Offline — Serwist + Dexie | Create/edit while offline, verify sync on reconnect, verify last-write-wins conflict behavior |
| 17 | Search/filters (V1.5) | Postgres full-text search wired, quick filters (already present from phase 6) extended |
| 18 | Analytics (V1.5) | Last feature phase — depends on real completed-deadline data existing |
| 19 | Accessibility + E2E hardening | axe-core pass on every screen; Playwright covers every flow in PRODUCT_PRD §26 |
| 20 | Deployment | Vercel + Supabase + Inngest + Resend production config; CI/CD from TECH_STACK_PRD §18 finalized; Sentry confirmed operational |

**Do not build V1.5/V2/V3 features ahead of their dependencies.** If you find yourself wanting to build Study Sessions (V2) while still in Phase 6, stop — that's a sign you've drifted from the sequence.

---

## 4. Open-Source Repository and Package Usage — Read Before Installing Anything

`TECH_STACK_PRD.md` §21–27 already did the license and maintenance research. **Do not re-derive these classifications yourself and do not treat any repository as safe to copy from without checking this section first.** Four categories, applied strictly:

### 4a. SAFE DEPENDENCY — install normally via npm, no further review needed
`rrule`, `dexie`, `date-fns` / `date-fns-tz`, Radix primitives (installed underneath shadcn/ui), `inngest` SDK, `web-push`, `@dnd-kit/core` (V1.5), `recharts` (V1.5), `cmdk` (V1.5), `react-hook-form`, `@tanstack/react-query`, `zustand`, `zod`, `drizzle-orm` (stable line, §2 above), `@supabase/supabase-js` / `@supabase/ssr`, `lucide-react`.

These are ordinary dependencies. Install, import, use per their own documentation. No source-level scrutiny needed beyond normal dependency hygiene (§20 of TECH_STACK_PRD).

### 4b. SAFE SELECTIVE CODE REUSE
- **shadcn/ui components** — generated via `npx shadcn add <component>` directly into `components/ui/`. Once generated, this code is **yours** — first-party, MIT-licensed, fully editable. Modify it freely to match `DESIGN_PRD.md`'s design system (§3) — do not leave shadcn's default styling unmodified where it conflicts with the specified tokens (colors, radii, spacing).
- **Cal.diy** (github.com — the 2026 MIT-relicensed Cal.com spinoff) — may inform specific UI *patterns* at the component level (e.g., a booking-flow interaction that might usefully inform the Add Deadline flow, per TECH_STACK_PRD §23's caveat) if you genuinely find something directly relevant. This is optional and narrow — you are not building a scheduling/booking tool, so most of Cal.diy is irrelevant; do not go looking for reasons to use it.

### 4c. REFERENCE ONLY — study the architecture, never copy the source
**Vikunja, Super Productivity, Plane, Cal.com, and FullCalendar's Premium/Scheduler package.** These are AGPL-3.0-or-similarly-copyleft-licensed (or, for FullCalendar Premium, AGPLv3-or-paid-commercial-license) and/or built on an incompatible framework (Vikunja: Vue/Go; Super Productivity: Angular). You may:
- Read their public documentation, architecture write-ups, and README files to understand a *pattern* (e.g., Vikunja's single-entity-multiple-views approach, which directly informed this project's own single-`Deadline`-entity decision in PRODUCT_PRD §6/§10; Super Productivity's local-first IndexedDB sync-queue *concept*, which informs this project's own offline architecture in TECH_STACK_PRD §13).
- Describe that pattern in your own words in a code comment or design note.
- Implement it fresh, in this project's own stack, from that understanding.

You may **not**:
- View their source code with the intent of copying, adapting, or closely paraphrasing any function, component, or algorithm.
- Paste, retype-with-minor-changes, or "port" any code block from these repositories into this project.
- Use any of their branding, icons, wordmarks, or copy text anywhere in this product (a standing rule, not scoped only to these four repos).

**FullCalendar Standard** (the MIT-licensed core package, not Premium/Scheduler) is technically a SAFE DEPENDENCY (§4a-equivalent) but is **intentionally not the chosen approach** for this project's calendar (TECH_STACK_PRD §4/§24) — build the custom Agenda/Month/Week component instead. Only fall back to installing FullCalendar Standard if you hit a specific, genuine blocker building the custom calendar that you cannot resolve — and flag that decision explicitly rather than silently reaching for it.

**Do not use FullCalendar Premium/Scheduler at all** unless a commercial license has been explicitly purchased and confirmed — using it without one, in a closed-source product, creates a real licensing violation (AGPLv3 obligations), not just a style mismatch.

### 4d. LICENSE REVIEW REQUIRED — do not use in any form
**Helium / HeliumEdu** (`github.com/HeliumEdu/platform` and `github.com/HeliumEdu/frontend`). No LICENSE file was independently confirmed during research despite the project's own marketing describing it as "open source." **Do not read this repository's source code at all, for any purpose, until a human has independently confirmed its license terms.** Its product *behavior* (grade alerts, drag-and-drop calendar, iCal sync) is already described secondhand in `TECH_STACK_PRD.md` §21/§23 — that description is sufficient for any product-behavior context you might need; you do not need to visit the repository yourself to get value from it.

---

## 5. Coding Standards and Architectural Rules

Enforce these without exception — they exist specifically to keep an AI-agent-built codebase coherent across many sessions (`TECH_STACK_PRD.md`'s "AI Coding Agent Compatibility" section):

- **Layering is one-directional:** `app/` → `server/actions/` → `server/domain/` → `server/db/`. Never import `server/db/` directly from `app/` or from a React component. Configure an ESLint import-boundary rule enforcing this in Phase 1, not as an afterthought.
- **Business logic lives in exactly one place:** `server/domain/`. Server Actions are thin — authenticate, validate with Zod, call one domain function, return. If you find yourself writing an `if` statement that encodes a product rule (a risk threshold, a reminder default, a recurrence exception rule) anywhere outside `server/domain/`, stop and move it.
- **The risk engine and scheduling engine are pure functions.** No database calls, no side effects, inside `risk-engine` or `scheduling-engine`. Callers fetch data and pass it in. This is what makes them independently unit-testable — do not compromise it for convenience.
- **Every domain module gets a test file as you write it, not after.** Follow the existing pattern once one exists rather than deciding fresh each time whether/how to test new logic.
- **No global mutable state** outside TanStack Query's cache (client-side) and the database (server-side).
- **Strict TypeScript throughout** — no `any` without an explicit, commented reason. Every Server Action input is Zod-validated before it reaches domain logic.
- **Small, focused changes.** Per the phasing in §3 above, most individual pieces of work should touch a handful of files (a domain function, its test, a Server Action, a UI component) — if a single change is touching a much wider surface, that's a signal to break it up.

---

## 6. Design Fidelity Rules

Implement `DESIGN_PRD.md` precisely — this is a premium product, and design discipline is part of the specification, not a finishing pass:

- Use the exact color tokens from `DESIGN_PRD.md` §3 (dark near-black surfaces, single restrained accent `#5B6EF5`, semantic priority/risk palettes). **Do not add glow/neon effects, decorative gradients, or glassmorphism beyond the one explicitly permitted use** (the modal/bottom-sheet backdrop blur, §3/§20 of DESIGN_PRD) — this is an explicit instruction from the product owner, not a style suggestion.
- Typography: Inter, with `tabular-nums` applied to every countdown/stat/numeric display without exception (§4 of DESIGN_PRD) — verify this in code review; a jittering countdown is a specifically named failure mode.
- Priority and Risk indicators always pair color with an icon and a text label — never color alone (§5/§21 of DESIGN_PRD, a hard accessibility requirement, not a nice-to-have).
- Mobile: bottom sheet for add/edit, never a modal (§11 of DESIGN_PRD). Bottom tab bar with exactly 4 items + a FAB (§7). Desktop: persistent sidebar + header button, no FAB above 1024px (§8).
- Accessibility per `DESIGN_PRD.md` §21 is mandatory, not aspirational: real contrast verification with tooling (not by eye) against the dark palette specifically, full keyboard operability, Radix-based focus trapping in modals/sheets, 44×44px minimum touch targets, a single-pointer/keyboard alternative to every drag interaction (WCAG 2.2 Dragging Movements).
- Do not invent components outside the inventory in `DESIGN_PRD.md` §22 without checking whether something already covers the need — extend/compose the existing inventory rather than creating one-off parallel components.

---

## 7. Testing and Definition of Done

A phase (§3 above) is not complete until:
- Relevant unit tests pass (Vitest) — especially boundary conditions for the risk engine (§10 of TECH_STACK_PRD) and the scheduling engine's capacity constraints (§11).
- Relevant integration tests pass against a real (test) Postgres instance, not just mocked data.
- Relevant Playwright E2E coverage exists for any user-facing flow completed in that phase, cross-referenced against `PRODUCT_PRD.md` §26's flow list.
- Relevant acceptance criteria from `PRODUCT_PRD.md` §29 pass explicitly — check them off, don't assume.
- An axe-core accessibility check passes on any new screen.
- `tsc --noEmit` and lint pass with zero errors.

Recurrence, timezones/DST, and offline sync get extra scrutiny per the "special attention areas" named explicitly in `TECH_STACK_PRD.md` §17 — do not skip the DST-transition test fixtures for a "we'll get to it later."

---

## 8. Hard Constraints — Do Not Do These

- Do not copy code from Vikunja, Super Productivity, Plane, Cal.com, or FullCalendar Premium (§4c above).
- Do not read or use Helium/HeliumEdu source code in any form (§4d above).
- Do not use FullCalendar Premium/Scheduler without a confirmed purchased commercial license.
- Do not copy any competitor's branding, icons, wordmarks, or written copy — this product's UI, copy, and visual identity must be original, informed by patterns but never a clone (this applies to every product researched, not only the OSS repositories above: Todoist, TickTick, MyStudyLife, Structured, Motion, Sunsama, Notion included).
- Do not introduce a second library solving a problem already solved by a chosen dependency (e.g., a second date library alongside `date-fns`, a second calendar-recurrence library alongside `rrule`).
- Do not substitute a different technology than the one decided in `TECH_STACK_PRD.md` §32 without explicitly flagging the substitution and the reason first.
- Do not build V1.5/V2/V3 features ahead of their sequencing in §3 above.
- Do not add glow/neon/heavy-gradient/glassmorphism styling beyond what §6 above explicitly permits.
- Do not skip writing tests "to move faster" — the phase gates in §3 exist specifically to prevent this.
- Do not silently resolve an apparent contradiction between the three PRDs yourself — surface it.

---

## 9. When You're Unsure

If a requirement is genuinely ambiguous or the PRDs are silent on something you need to decide to proceed:
1. Check all three documents first — the answer is very often in one of them, cross-referenced from another (they were written to be consistent, per `TECH_STACK_PRD.md`'s Cross-Document Consistency Check).
2. If still unresolved, make the smallest, most reversible reasonable assumption, implement it, and **flag the assumption explicitly** in your phase summary rather than silently deciding and moving on.
3. Never resolve ambiguity by reaching for a generic SaaS-dashboard default, a competitor's exact pattern, or an opaque "AI-powered" shortcut for something the specs explicitly require to be deterministic and explainable (the Risk Engine and Smart Planning, above all — this is the product's core differentiator; getting this wrong is the single most damaging mistake you could make).

---

## 10. First Task

Start at Phase 1 in §3. Confirm you have read all three PRD documents in full, then scaffold the repository exactly per `TECH_STACK_PRD.md` §6's folder structure, get the empty app building and running, and stop for review before touching the database schema.
