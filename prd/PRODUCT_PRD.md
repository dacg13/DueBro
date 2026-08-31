# PRODUCT_PRD.md — Student Deadline Tracker

**Purpose:** defines WHAT the product does — the complete functional specification, written for an AI coding agent (Google Antigravity) to build against without needing to infer intent.
**Intended audience:** Antigravity (implementation), and the product owner reviewing scope decisions.
**Source of truth:** the completed research phase (competitor analysis, user pain points, student workflow research, GitHub/OSS findings, deadline-intelligence and reminder research). Every major decision below is traceable to a specific research finding.
**Relationship to the other PRDs:** this document is upstream of `DESIGN_PRD.md` (how these features look/behave) and `TECH_STACK_PRD.md` (how they're engineered). Where this document defines a system (e.g., the Deadline Risk Engine), the other two PRDs must specify its visual treatment and technical implementation respectively — cross-references are called out inline as **→ DESIGN** / **→ TECH**.

---

## 1. Executive Summary

**Product description:** a premium, mobile-first web application that helps students track academic deadlines — assignments, exams, quizzes, projects, labs, readings, and recurring coursework — and, critically, understand *which of those deadlines are actually at risk* before it's too late to act.

**Product vision:** the deadline tracker a student trusts enough to stop checking five other places (their LMS, a paper planner, their memory) for what's due.

**Product mission:** replace last-minute deadline panic with early, honest visibility into workload — without the cost, complexity, or opacity of professional AI-scheduling tools.

**Target audience:** high-school and university students managing multiple subjects/courses within a term.
**Primary user:** a university student (research proxy: a multi-subject CS/engineering-type course load with hackathon/project deadlines layered on top of regular coursework) who currently relies on some mix of memory, their LMS's buried deadline list, and a generic task app.
**Secondary users:** high-school students with simpler, single-institution timetables; graduate students managing fewer but higher-stakes deadlines (thesis milestones, comprehensive exams).

**Core problem:** deadlines are scattered across tools that are either academically blind (Todoist, generic task apps — no concept of a subject or a term) or academically aware but shallow, dated, and increasingly untrustworthy (MyStudyLife's 2025–2026 stability and paywall issues), while the tools with genuine workload intelligence (Motion, Sunsama, Reclaim.ai) are priced and designed for salaried professionals.

**Product promise:** *see everything you owe, and know what's actually at risk, before it's too late.*

**Value proposition:** the only student deadline tracker that combines real academic structure (subjects, terms) with transparent, rule-based deadline-risk intelligence and a reminder system engineered around the real limits of mobile notification delivery — at a price and design quality that respects a student, not a corporate expense account.

**Positioning:** a focused **deadline tracker with a risk-intelligence layer** — not a full planner, not an LMS replacement, not a Notion-style workspace. See §14 (Product Positioning) in the research report for the full reasoning; the short version is that "planner" and "workspace" framings invite feature-parity chases this product should deliberately avoid.

**Why this product should exist despite Todoist, TickTick, Notion, and MyStudyLife:** each of those either doesn't know what a subject is (Todoist/TickTick/Notion) or knows but is currently the least trustworthy version of itself in years (MyStudyLife — see research §4.3: reported crashes, data loss, and paywalling of previously-free organizational features after its 2025–2026 redesign). None of the four surfaces deadline *clustering* — multiple courses colliding in the same week — as a first-class signal, and none offers Motion/Reclaim-grade workload intelligence in a way that's explainable rather than a black box.

---

## 2. Product Principles

| # | Principle | How it constrains decisions |
|---|---|---|
| 1 | **Mobile-first, not mobile-adapted** | Every feature is designed for a thumb on a 375–430px screen first; desktop is an expansion of that design, not the reference design shrunk down (research finding: every competitor's mobile app was its weakest surface — see research §5) |
| 2 | **Explainable intelligence, never a black box** | The risk engine and smart planning must always show *why*, in one line, in plain language. No feature is ever labeled "AI" if it's deterministic logic (directly addresses Motion's most common user complaint — research §4.7) |
| 3 | **Deadline clarity over feature breadth** | If a feature doesn't make "what's due and what's at risk" clearer, it doesn't belong in V1, regardless of how impressive it sounds (research §8, §18) |
| 4 | **Reliability over cleverness** | Reminders must degrade honestly (multi-channel, never push-only) rather than silently fail like every competitor researched implicitly risks doing on iOS (research §10) |
| 5 | **Low cognitive load** | Fast capture now, organization later (Inbox pattern) — a student under deadline pressure should never be blocked by a form |
| 6 | **Academically structured, not generically flexible** | Every deadline lives inside a Subject inside a Term. This is the opposite bet from Notion, whose own review data shows flexibility is a liability for most users (research §4.12) |
| 7 | **Proactive, not just archival** | The product should surface risk *before* a deadline is missed, not just log that it was missed |
| 8 | **Minimal feature bloat, ruthlessly** | Every V1 feature must trace to a specific researched pain point or a specific differentiation opportunity — "sounds useful" is not sufficient justification (research §7's NOT WORTH BUILDING list is a standing rule, not just a launch-day filter) |
| 9 | **Student-respecting cost and trust** | No mandatory card-on-file trials (a named trust complaint against Motion/Akiflow — research §5), no paywalling of core organizational features after the fact (MyStudyLife's complaint) |
| 10 | **Deterministic before automated** | Every intelligent feature ships as transparent rules first; automation is earned once the rules-based version has demonstrated trust, not assumed from day one |

---

## 3. Target Users and Personas

### Persona A — "The Overloaded Multi-Subject Student" (primary)
- **Profile:** university student, 4–6 concurrent subjects/courses per term, plus non-coursework deadlines (a hackathon submission, a club event, a personal project).
- **Goals:** never be blindsided by a deadline; know, at a glance, which of everything on their plate actually needs attention today.
- **Frustrations:** deadlines live in 3+ places (LMS, memory, a generic to-do app that doesn't understand "CS301"); discovers a bad week only once it's already bad; generic reminders fire at the same fixed offset regardless of how much work is actually left.
- **Current tools:** Google Calendar or Apple Calendar for the obvious stuff, their LMS's own assignment list (rarely checked proactively), Google Tasks or Todoist for the rest, and a lot of memory.
- **Important behaviors:** captures things in a rush between classes (quick capture matters more than perfect data entry); checks the app most heavily Sunday night and first thing on high-deadline days.
- **Biggest pain point:** deadline *clustering* — three things due the same week across different subjects — is invisible until it's already a crisis (research §5, §18: this is the single most consistently unaddressed gap across every competitor studied).
- **Relevant use cases:** quick-capture a deadline between classes; open "Today" each morning; get an honest answer to "am I actually behind?"

### Persona B — "The Exam-Cycle Planner" (secondary)
- **Profile:** any student in the run-up to a midterm/finals window, where the job shifts from tracking discrete assignments to planning revision time against a small number of high-stakes dates.
- **Goals:** know how much revision time is actually needed vs. available; not discover the week before an exam that three other exams cluster in the same window.
- **Frustrations:** generic task apps treat an exam like any other checkbox item with no concept of "revision work" as ongoing, uncertain-effort work rather than a single completable task.
- **Current tools:** MyStudyLife (if they have it) for the exam countdown; paper or a notes app for an actual revision plan.
- **Relevant use cases:** create an exam with a countdown; see workload warnings when exams cluster; (V2) get a suggested revision schedule.

*(A third, lighter persona — the high-school student with a simpler single-timetable setup — is acknowledged as a secondary market but not designed for explicitly in V1; the rotating-timetable feature in V2 is what extends real support to them.)*

---

## 4. Core User Jobs

| Job | Trigger | User Goal | Product Behavior | Success Criteria |
|---|---|---|---|---|
| Add a deadline quickly | Professor mentions a due date in class / sees it on the LMS | Capture it before forgetting, with minimal friction | Quick-capture accepts a bare title with everything else optional; full form available but never mandatory in the moment | Deadline exists and is retrievable in < 10 seconds of user effort |
| Know what's due today | Opens the app in the morning or between classes | A single, fast answer to "what do I need to touch today" | **Today** view surfaces due-today items, at-risk items, and any planned work, ranked by urgency not just chronology | User can answer "what's due today" without scrolling past irrelevant future items |
| Know what's most urgent | Has more open deadlines than time to think about prioritizing | Understand relative urgency, not just a flat list | Risk badges + priority are both visible on every deadline card, with risk explicitly separated from priority (§12) | User can distinguish "important but not urgent yet" from "urgent right now" without reading full descriptions |
| Prepare for an upcoming exam | Creates or opens an Exam-type deadline | Understand how much revision time is realistically needed and available | Exam detail shows a countdown, and (V2) a suggested revision-session breakdown | User can see days-remaining and (V2) a concrete session plan, not just a date |
| Break down a large assignment | Adds a deadline they know will take multiple sittings | Turn one intimidating item into manageable steps | Subtasks/checklist on the Deadline (V1.5); Smart Planning suggests a day-by-day effort breakdown (§14) | Progress is trackable at a sub-item level, not just "done/not done" |
| Plan study time | Has a deadline with real effort remaining and limited time before it's due | See a concrete, realistic plan rather than just a due date | Smart Planning outputs a deterministic day-by-day suggested-hours breakdown | Suggested plan never exceeds the user's configured daily capacity |
| Avoid missing a deadline | Ongoing, passive | Trust that the app will surface risk before it's too late | Escalating, multi-channel reminders tied to risk tier (§16); guaranteed in-app "what's due" surface independent of notifications | A student who only opens the app once a day still sees what's at risk |
| Recover from an overdue task | A deadline passes uncompleted | Get a clear next action, not shame or clutter | Overdue items surface distinctly (not silently buried); one-tap reschedule or mark-complete-late | Overdue items never silently disappear from view |
| Understand workload | Feels busy but can't quantify it | See workload per day/week/subject in concrete terms | Workload view (dashboard element, §15) shows planned vs. available hours | User can identify an overloaded day/week before committing to something new |
| Reschedule unfinished work | A planned work session didn't happen | Move the remaining work forward without losing track of it | Reschedule action on any incomplete work block/subtask, re-triggers risk recalculation | Rescheduled work correctly updates the risk tier and workload view |

---

## 5. Product Architecture — Modules

| Module | Purpose | Core V1 features | V1.5 / V2 additions | Status |
|---|---|---|---|---|
| **Today** | Answer "what should I work on today" | Due-today list, at-risk items, quick-complete | Planned work blocks, workload indicator | **V1** |
| **Deadlines** | Full, filterable record of everything owed | List of all deadlines, filter by subject/type/status, create/edit/complete | Saved filters, bulk actions | **V1** |
| **Calendar** | Spatial view of deadlines over time | Agenda + month view, tap-to-detail | Week view, drag-to-reschedule, time-block rendering | **V1** (agenda+month); week view and drag-reschedule **V1.5** |
| **Inbox** | Zero-friction quick capture | Freeform text capture, later triage into a full Deadline | Lightweight date/subject parsing from text | **V1** |
| **Subjects** | The organizing container for deadlines | Create/edit subject (name, color), see deadlines grouped by subject | Instructor/room/schedule metadata, per-subject stats | **V1** (basic); stats **V1.5** |
| **Exams** | Not a separate module — a Deadline `type`, with an enhanced detail view | Exam-type deadline with countdown, location field | Topics list, revision-session suggestions | **V1** (as a Deadline type + detail view); revision planning **V2** |
| **Study** | Planned work sessions / time blocks | — (not in V1) | Full time-blocking, Structured-style timeline | **V2** |
| **Analytics** | Retrospective insight into workload/completion | — (not in V1) | Completion rate, overdue rate, workload-by-subject | **V1.5** (basic); trends **V2** |
| **Notifications (settings)** | Control what/how the user is reminded | Category toggles, channel selection (push/email), quiet hours | Escalation tuning | **V1** |
| **Settings** | Account, terms, capacity configuration | Profile, terms, daily-capacity setting, data export | — | **V1** |

**Explicitly not a V1 module:** a standalone "Projects" section (a Deadline of type `project` with subtasks covers this without a parallel hierarchy — see §10) and a standalone "Exams" section (folded into Deadlines + a richer detail view, per the "avoid unnecessary hierarchy" principle in §2).

---

## 6. Deadline Object — Conceptual Model

| Field | Category | Notes |
|---|---|---|
| `title` | **REQUIRED** | The only field required to save from Quick Capture |
| `type` | **REQUIRED** | Enum: assignment, project, exam, quiz, presentation, lab, reading, submission, study_session, other. Defaults to `other` if uncategorized in Inbox |
| `dueDate` | **REQUIRED** (to leave Inbox / become a full Deadline) | Date only, required; a bare title with no date can exist transiently in the Inbox, not in the Deadlines list |
| `dueTime` | OPTIONAL | Many deadlines are "end of day" — don't force a time |
| `subjectId` | **REQUIRED** (to leave Inbox) | Every real Deadline belongs to exactly one Subject — see §8 |
| `priority` | OPTIONAL, defaults to Medium | See §12 — distinct from urgency |
| `status` | **REQUIRED**, system-managed | not_started / in_progress / completed / overdue — overdue is derived, not user-set |
| `progress` | OPTIONAL, defaults to 0 | 0–100, driven by subtasks or manual override — see §11 |
| `estimatedEffortHours` | OPTIONAL | Powers the risk engine (§13) and smart planning (§14); when absent, risk falls back to a time-only calculation |
| `notes` | OPTIONAL | Free text |
| `tags` | OPTIONAL | Personal, non-structural labels — distinct from `type` (structural) and `subjectId` (structural) |
| `reminders` | OPTIONAL, sensible default applied | See §16 |
| `recurrence` | OPTIONAL | RRULE-based — see §17 |
| `subtasks` | OPTIONAL | See §10, §11 |
| `attachments` | **ADVANCED — not V1** | Storage/moderation cost noted in research (§7); defer |
| `links` | OPTIONAL | e.g., a link to the assignment portal |
| `createdAt` / `updatedAt` | **REQUIRED**, system-managed | Standard audit fields |
| `completedAt` | OPTIONAL, system-managed | Set on completion; null otherwise |

**Explicitly rejected fields:** a separate `urgency` field (urgency is always computed, never stored — see §12), per-type custom field sets (e.g., a separate `examLocation` table) — a single optional `location` field on the shared Deadline model covers the exam/presentation case without fragmenting the model (research §17's central data-model recommendation: one entity, not per-type tables).

---

## 7. Categories

**Default `type` values (fixed enum, not a free-form list):** Assignment, Project, Exam, Quiz, Presentation, Lab, Reading, Submission, Study Session, Other.

**Customizable? No — not in V1.** These map directly to real academic structures found consistently across research (MyStudyLife's 7-type model, research §4.3/§6) and to the risk/reminder logic (an Exam gets a different reminder cadence than a Reading by default — see §16). Allowing arbitrary custom types would fragment that logic and reintroduce the "you spend your first week building a to-do app" problem cited against Amazing Marvin (research §4.11, §18). **Tags** (§6) exist precisely to give personal, unstructured flexibility without touching the structural `type` enum — this is the intentional pressure valve instead of custom categories.

---

## 8. Subjects / Courses

- **Structure:** a Subject belongs to exactly one Academic Term (§9's AcademicTerm concept, formalized in TECH_STACK_PRD) and has many Deadlines.
- **Metadata (V1):** name, color (for visual scanning — → DESIGN §5), archived/active flag (a Subject from a past term is archived, not deleted, so historical deadlines remain intact).
- **Metadata (V2):** instructor name, room/location, class schedule (recurring meeting times) — deferred because rotating-timetable support is a V2 feature (research §20) and these fields have no use without it.
- **Deadline relationship:** one-to-many, mandatory — a Deadline cannot exist outside a Subject once it leaves the Inbox (§18).
- **Exam relationship:** exams are Deadlines of `type = exam` belonging to a Subject like any other deadline — not a separate parent entity.
- **Statistics (V1.5):** count of open/completed deadlines, upcoming deadline count — feeds the Subjects module's stat display (→ DESIGN §15). Deeper workload-by-subject analytics is V2 (§5).
- **Color/icon behavior:** each Subject gets a user-assignable color; that color is the primary visual grouping cue across Calendar, Deadlines list, and Today (→ DESIGN §5, §10). No icon system in V1 — color alone, paired with the subject name as text, avoids relying on color alone for meaning (accessibility requirement, → DESIGN §21).

---

## 9. Exams

Exams are **not a separate entity** — they are Deadlines with `type = exam`, given a richer detail treatment because the job-to-be-done is different (§4: "prepare for an upcoming exam" vs. "complete an assignment").

- **Exam creation (V1):** same Deadline form, `type` set to Exam; unlocks an optional `location` field and a countdown display.
- **Exam detail (V1):** countdown (days/hours remaining), subject, date/time, location.
- **Topics (V2):** a simple checklist of topics to cover — effectively a specialized use of the existing Subtasks mechanism (§10), not a new data structure.
- **Weight (V2):** an optional "this counts for X% of your grade" field — deferred because grade tracking itself is explicitly out of V1 (§30 Non-Goals) and a weight field with nothing to weight is dead UI.
- **Revision planning (V2):** Smart Planning (§14) applied specifically to exam-type deadlines, generating suggested revision sessions rather than a single work block — this is the "Scout"-equivalent capability identified in research (§4.3, §9) but built as a deterministic extension of the same engine used for assignments, not a separate AI feature.
- **Study sessions (V2):** linked StudySession records tied to an exam — depends on the StudySession entity, which is explicitly V2 (§17 data model).
- **Reminders:** exams get a distinct default reminder cadence from other deadline types (§16) — this is the one place `type` directly changes system behavior, because "prepare for" and "submit by" are genuinely different jobs.

---

## 10. Task Hierarchy

**Deliberately flat.** The hierarchy is:

```
Deadline (assignment / project / exam / quiz / presentation / lab / reading / submission / study_session / other)
  └─ Subtask (optional, V1.5)
```

That's it. There is **no** separate "Task" entity distinct from Deadline, no separate "Project" entity (a `type = project` Deadline with subtasks *is* a project), and **StudySession/TimeBlock is a V2-only entity** that optionally links back to a Deadline but is not part of the core hierarchy in V1.

**Why this is the right call (research-grounded):** the research's central domain-model finding (§17) is that splitting deadline-like things into multiple parallel entities (Assignment vs. Exam vs. Project as separate tables, or Task vs. Deadline as separate concepts) is the single most common modeling anti-pattern observed across small student-planner projects on GitHub — it makes the exact feature this product is betting on (deadline clustering across types, §18) needlessly expensive to query and reason about. One entity, one `type` field, optional subtasks underneath. Nothing deeper.

---

## 11. Progress

- **System:** a single `progress` integer (0–100) per Deadline.
- **Two ways to move it:**
  1. **Subtask completion (default, when subtasks exist):** progress = (completed subtasks / total subtasks) × 100, recalculated automatically whenever a subtask is checked/unchecked.
  2. **Manual override (always available):** the user can directly set progress on a Deadline with no subtasks (e.g., "I'm about 40% through this reading"). Manual override is also allowed on a Deadline *with* subtasks — if the user manually overrides, the subtask-derived calculation is suspended for that Deadline until a subtask is next toggled, at which point automatic calculation resumes (avoids a confusing tug-of-war between the two systems, while keeping manual override genuinely available).
- **What happens when all subtasks are completed:** progress locks at 100, but the Deadline itself is **not** auto-marked `completed` — completion is a separate, explicit user action (a large assignment can be "100% drafted" but not yet submitted; conflating the two would make `status` lie).
- **Interaction with the Risk Engine (§13):** `progress` is a primary input to `effortRemaining` — see the formula in §13.

---

## 12. Priority

**Levels:** Low, Medium, High, Critical — a fixed 4-level enum, user-set, defaults to Medium.

**Priority ≠ Urgency — this is a hard product rule, not a naming nuance:**
- **Priority** is a *static, user-declared* judgment of importance ("this exam counts for a third of my grade") that does not change on its own as the due date approaches.
- **Urgency** is a *dynamic, system-computed* function of time and remaining work — it is never set by the user and is expressed through the Risk Engine's tier (§13), not through a separate field.

A deadline can be **High priority, low urgency** (an important final project due in six weeks with plenty of time) or **Low priority, high urgency** (a minor weekly reading due tomorrow that you've made zero progress on and that's now genuinely time-constrained). The product must always be able to show both independently — → DESIGN §10 specifies how a Deadline Card renders priority and risk as two distinct, non-conflated visual elements.

---

## 13. Deadline Risk Engine

**This is the product's primary differentiator (research §9, §18).** It must be fully deterministic and fully explainable in V1 — no ML, no "AI" labeling.

### Risk tiers (in order)
`On Track` → `Upcoming` → `Needs Attention` → `At Risk` → `Critical` → `Overdue`

### Signals used (V1, all deterministic)
| Signal | Definition |
|---|---|
| `daysRemaining` | `dueDate − today` |
| `effortRemaining` | `estimatedEffortHours × (1 − progress/100)` (falls back to a small default, e.g. 1 hour, when no estimate is given, so the engine still degrades gracefully rather than breaking) |
| `availableCapacity` | The user's configured daily study-capacity setting (§15) × remaining days, minus hours already committed to *other* deadlines due in that same window |
| `capacityRatio` | `effortRemaining ÷ availableCapacity` — the core "do I actually have enough time" signal |
| `clusterCount` | Number of *other* deadlines due within the same rolling 7-day window as this one (the deadline-clustering signal, research §5/§18/§8's differentiator) |

### Tier logic (illustrative deterministic thresholds — starting point for tuning, not a final tuned constant)
- **Overdue:** `dueDate < today` and `status ≠ completed`.
- **Critical:** `capacityRatio ≥ 1.0` (genuinely not enough time left at current pace), **or** (`daysRemaining ≤ 1` and `progress < 80`).
- **At Risk:** `capacityRatio ≥ 0.75`, **or** (`clusterCount ≥ 2` and `daysRemaining ≤ 3`), **or** (`daysRemaining ≤ 3` and `progress < 50`).
- **Needs Attention:** `capacityRatio ≥ 0.5`, **or** (`clusterCount ≥ 2` and `daysRemaining ≤ 7`), **or** (`daysRemaining ≤ 5` and `progress < 30`).
- **Upcoming:** `daysRemaining ≤ 7` and none of the above conditions are met.
- **On Track:** everything else.

### Explainability requirement
Every risk badge must render a **one-line, plain-language reason** derived from whichever condition triggered the tier — e.g.:
- *"Critical — 6h of estimated work remain but only 3h of study time are available before Friday."*
- *"At risk — 3 deadlines cluster in the next 7 days across your subjects."*
- *"Needs attention — no progress logged with 5 days remaining."*
- *"On track."*

This mirrors the exact explainability bar the research brief specified and directly counter-positions against Motion's "AI sometimes makes strange choices" complaint (research §4.7, §9) and against Sunsama's simpler-but-still-manual workload warning (research §4.8) — this product's version is automatic *and* explained.

### What is NOT in V1
Auto-scheduling based on risk (that's Smart Planning, §14, and it stays suggestion-only, not automatic placement, until V2 at the earliest). No ML model, no historical-behavior learning. **→ TECH** §10 covers caching/recalculation triggers; risk must recompute whenever `progress`, `estimatedEffortHours`, `dueDate`, or a sibling deadline in the same window changes — not just on a timer.

### Path to AI later (explicitly deferred, not designed now)
Once the deterministic model has run in production long enough to have real completion-vs.-estimate data, a V3 experiment could refine `estimatedEffortHours` defaults per student/subject based on their own historical accuracy (e.g., "your readings usually take 1.4× your estimate") — but this must remain an input-refinement layer underneath the same explainable tier logic, never a replacement of it with an opaque score.

---

## 14. Smart Planning

**Turns a deadline's remaining effort into a concrete, day-by-day suggestion.** Deterministic in V1/V1.5; suggestion-only (not automatic calendar placement) until V2.

**Example (matches the brief's own illustration):**
```
Database Project — Due Friday — Estimated effort: 6h
Recommended:
  Monday:    1h
  Tuesday:   2h
  Wednesday: 1h
  Thursday:  2h
```

### Inputs
`estimatedEffortHours` (or `effortRemaining` if progress > 0), `dueDate`, `priority`, the user's daily capacity setting, existing commitments from *other* deadlines in the same window (so two deadlines due the same week don't each independently claim the same hours).

### Algorithm (deterministic, V1.5)
1. Compute the number of days between now and `dueDate` (excluding the due date itself, unless it's due end-of-day).
2. For each day, compute **free capacity** = daily capacity setting − hours already claimed by other deadlines' suggested plans for that day.
3. Distribute `effortRemaining` across the available days using a **front-loaded weighting** (more hours suggested in the earlier-to-middle days, tapering toward the deadline) — this deliberately discourages cramming, rather than optimizing purely for minimum total sessions.
4. Never suggest more than a day's free capacity; if total free capacity across all remaining days is less than `effortRemaining`, the plan is generated anyway (showing the shortfall) — this shortfall is exactly what feeds `capacityRatio ≥ 1.0` in the Risk Engine (§13), so the two systems share one source of truth rather than disagreeing with each other.

### Outputs
A day-by-day hour suggestion, shown as text/list in the Deadline detail view (V1.5). **Not** written to the calendar as scheduled blocks in V1.5 — that requires the StudySession/TimeBlock entity and calendar placement UI, which is V2 (§5, §17).

### What can become AI-powered later (explicitly deferred)
V3: instead of a fixed front-loaded weighting, personalize the distribution curve based on the student's own observed working patterns (e.g., someone who reliably works evenings gets suggestions weighted there) — again, a refinement of inputs/weighting to the same deterministic distribution algorithm, not a replacement of it with an opaque scheduler. This directly avoids repeating Motion's most common complaint (research §4.7): "the AI sometimes makes strange choices" and "creates correction work."

---

## 15. Workload

- **Daily workload** = sum of hours suggested/claimed by Smart Planning (§14) for that day, across all deadlines.
- **Weekly workload** = sum across a rolling 7-day window.
- **Workload per subject** = daily/weekly workload grouped by `subjectId`.
- **Planned hours** = the workload figures above.
- **Available hours** = the user's configured daily capacity setting (Settings — a simple default, e.g., 2h/weekday and 4h/weekend, editable by the user; **not** inferred from calendar/LMS data in V1, since that inference is exactly the kind of "1,000+ parameter" complexity that produces Motion's opacity problem, research §4.7).
- **Overload definition:** a day is **overloaded** when `planned hours > available hours` for that day — the exact same `capacityRatio` concept used by the Risk Engine (§13), applied at the day level instead of the per-deadline level. One shared concept, two views onto it.
- **Workload warnings:** surfaced on Today and the dashboard when the current or upcoming week contains an overloaded day — modeled after Sunsama's honest, non-automated workload warning (research §4.8), not Motion's silent auto-scheduling.

---

## 16. Reminder System

**Grounded directly in research §10's finding that push notifications — especially on iOS PWAs — are not reliably deliverable, and that this is a platform limitation, not a product bug to quietly hope around.**

- **Reminder types (V1):** relative-to-due-date (e.g., "1 day before," "2 hours before") and absolute (a specific date/time) — both supported per Deadline.
- **Multiple reminders per Deadline:** yes, V1 — a Deadline can have more than one `Reminder` record (§6's `reminders` field is a collection, not a single value).
- **Default reminders by type (V1):** applied automatically when a Deadline is created, editable/removable by the user:
  - Assignment / Project / Submission: 1 day before + 2 hours before.
  - Exam: 1 week before, 3 days before, 1 day before, morning-of.
  - Reading / Study Session: the evening before.
  - Quiz / Lab / Presentation / Other: 1 day before.
- **Custom reminders:** the user can add/remove/edit any reminder on any Deadline beyond the defaults.
- **Recurring reminders:** a reminder on a recurring Deadline (§17) applies to each generated occurrence by default.
- **Channels (V1):** push (web push) and email, **sent in parallel, not as a fallback sequence** — because research (§10) found push delivery on iOS specifically cannot be assumed reliable, email is treated as an equally-primary channel, not a backup.
- **Escalation:** reminder *intensity* (not just frequency) increases as a Deadline's Risk tier (§13) worsens — a Deadline sitting at "At Risk" or "Critical" gets a more insistent reminder pattern than the same offset would produce for an "On Track" item. This ties reminders and risk into one coherent system rather than two independent ones.
- **Snooze:** available on any in-app reminder/notification, snoozes by a user-chosen short interval (not a fixed default) — does not change the underlying Deadline or its risk tier.
- **Missed reminders:** if a push notification fails to deliver (undetectable client-side per research §10) or is dismissed unopened, the **guaranteed fallback is the in-app "what's due" surface on Today** — the product never assumes a reminder was seen; Today always independently reflects true state.
- **Notification grouping:** multiple reminders firing close together (e.g., two deadlines both hitting "1 day before" the same morning) are grouped into a single notification where the platform supports it, to prevent notification fatigue (a named complaint pattern in research §5).
- **Sensible limits to prevent spam:** a hard cap of 3 active reminders per Deadline in V1 (beyond the defaults, a user can add at most one more); workload warnings (§15) fire at most once per day per user, not once per overloaded deadline.

**→ DESIGN** must specify exactly how the in-app "what's due" fallback surface is rendered so it's genuinely impossible to miss on open (§13 Today). **→ TECH** covers delivery architecture, retries, and idempotency (§12).

---

## 17. Recurring Deadlines

- **Patterns supported (V1):** daily, weekly, weekdays-only, biweekly, monthly, and a custom RRULE-equivalent (e.g., "every 3 weeks").
- **Storage:** an RRULE string (RFC 5545 standard) per research's technical recommendation (§17) — never bespoke recurrence fields.
- **Editing scope — standard iCalendar semantics:**
  - **This occurrence only:** creates an exception for that single date; the rest of the series is untouched.
  - **This and future occurrences:** ends the original series the day before this occurrence and starts a new series from this occurrence forward with the edited fields.
  - **Entire series:** edits the RRULE and shared fields for every occurrence, past exceptions preserved.
- **Completion behavior:** completing one occurrence marks only that occurrence complete; the series continues to generate future occurrences normally.
- **Skipping:** an occurrence can be explicitly skipped (distinct from completed) — it does not count toward completion-rate analytics (§23) as either done or missed; it's excluded.
- **Rescheduling one occurrence:** moves only that occurrence's date via an exception record; the series' underlying pattern is unaffected.
- **Generation window:** occurrences are generated lazily within a bounded rolling window (e.g., current term ± a few weeks), never pre-generated indefinitely — **→ TECH** §8/§16 covers the performance reasoning.

---

## 18. Inbox / Quick Capture

**The fastest possible path from "I just heard about a deadline" to "it's saved."**

- A single text field. Typing `"Submit Java assignment"` and saving is a complete, valid action — no other field is required at that moment.
- The saved item lands in the **Inbox**, not the main Deadlines list, until it has at minimum a `subjectId` and a `dueDate` — at which point it's "triaged" and moves into Deadlines proper. This mirrors the required/optional split in §6.
- **Parsing (V1):** none — the raw text becomes the `title` verbatim. **Parsing (V1.5):** lightweight, deterministic keyword/date detection (e.g., recognizing "tomorrow," "Friday," or a known Subject name already in the text) to pre-fill suggested fields the user can accept or override — explicitly *not* a full NLP/AI parser, consistent with the deterministic-first principle (§2).
- **Later organization:** the Inbox view lists un-triaged items with a lightweight "assign subject + date" action per item; nothing is auto-assigned.
- **Conversion into a complete Deadline:** once triaged, the item is a normal Deadline and behaves identically to one created via the full form — there is no lingering "quick-capture" flag or second-class status.

---

## 19. Calendar

- **Views (V1):** Agenda (default) and Month.
- **Views (V1.5):** Week.
- **Views (V2):** Day/Timeline (Structured-style single-day visual block sequence — deferred until Study Sessions/time blocks exist to actually populate it, per research §11's finding that timeline-first design earns its complexity once there's scheduled *work time*, not just point-in-time deadlines, to render).
- **Deadline rendering:** each Deadline appears on its due date as a colored (by Subject) entry with a type icon/label and, where risk is Needs-Attention-or-worse, a risk indicator (→ DESIGN §12).
- **Task rendering:** not applicable in V1 — there is no separate "task" surface on the calendar distinct from the Deadline itself (§10).
- **Duration:** most Deadlines render as a point-in-time marker (due date), not a block with duration — duration/time-blocks belong to the V2 StudySession entity.
- **Time blocks:** V2 only, once Study Sessions exist.
- **Drag/drop rescheduling:** V1.5 (Week view), always paired with a non-drag alternative per accessibility requirements (→ DESIGN §21; a Deadline's due date is always editable via the detail view's date field, not exclusively by dragging).
- **Recurring entries:** each generated occurrence (§17) renders individually; editing one via drag creates a this-occurrence-only exception, not a series-wide change (consistent with §17's scope rules).
- **Mobile vs. desktop:** mobile defaults to Agenda (a 7-column month grid is low-value at 320–430px per research §12); desktop can default to Month or Week once screen width supports it — **→ DESIGN** §12 owns the exact breakpoint behavior.

---

## 20. Today

**Answers exactly one question: "what should I work on today?"**

Composition (V1):
- Deadlines due today.
- Deadlines at "At Risk" or "Critical" tier (§13), even if not due today — this is deliberate: risk, not just due-date proximity, drives what surfaces here.
- Any overdue items (§4's "recover from an overdue task" job) — shown distinctly, never silently hidden.
- Quick actions: mark complete, snooze reminder, jump to detail.

Composition (V1.5/V2 additions):
- Planned work sessions/time blocks for today (once §14/§17's Smart Planning outputs and V2 Study Sessions exist).
- Available-capacity indicator for the day (§15).

This view is the single most important screen in the product — it is the direct answer to the "explainable, not overwhelming" positioning against Notion's dashboard complexity and Motion's opacity (research §4.7, §4.12). **→ DESIGN** §13 owns its exact visual hierarchy.

---

## 21. Focus / Pomodoro

**Decision: excluded from V1.** 

Reasoning: this is squarely in the research's **NICHE** feature tier (§7) — TickTick, Structured, and Super Productivity all already do timers well, and it is not connected to this product's specific differentiator (deadline-risk visibility, §13/§18). Including it in V1 would dilute build effort away from the risk engine and reminder architecture, which the research identifies as the actual defensible gap. If included later (V2/V3), it would attach to a Study Session (a V2 entity) as an optional execution aid — timer, custom intervals, breaks, time tracked back to that session's logged effort — rather than existing as a standalone, deadline-agnostic feature.

---

## 22. Search / Filters / Sorting

- **Global search (V1.5):** covers `title`, `subject` name, `type`, `tags`, `dueDate`, `status`, and `priority` — server-side (not client-side scanning, per performance research).
- **Quick filters (V1):** by Subject, by `type`, by `status` (open/completed/overdue) — available on the Deadlines list without needing full search.
- **Advanced filters (V1.5):** combine multiple quick filters, plus risk tier and date range.
- **Saved filters (V2):** persist a named filter combination for reuse — deferred, low-cost-but-not-urgent.
- **Sorting (V1):** by due date (default), by risk tier, by priority, by subject.

---

## 23. Analytics

**V1: none as a standalone module** — Today and the dashboard are operational surfaces, not analytics, and the research explicitly warns against "meaningless statistics cards" (§9 Dashboard guidance).

**V1.5 (the only metrics with clear, immediate value):**
- Completion rate (completed / total, current term).
- On-time completion vs. overdue rate.
- Upcoming workload (a simple forward-looking chart of planned hours over the next 1–2 weeks, reusing §15's workload concept — not a new calculation).

**V2:**
- Workload by subject over time.
- Completion trend across the term.
- Study time totals (once Study Sessions exist).

**Explicitly excluded at any stage:** vanity metrics with no actionable link back to a product behavior (e.g., a raw "deadlines created" counter shown to the user — that belongs in internal success metrics, §31, not user-facing analytics).

---

## 24. Notifications

| Category | Trigger | Default channels | User-customizable? |
|---|---|---|---|
| Upcoming deadline | Per-Deadline reminder offsets (§16) | Push + Email | Yes — per-category on/off, per-channel |
| Approaching critical deadline | Risk tier reaches Critical (§13) | Push + Email (escalated) | Yes |
| Overdue | Deadline passes uncompleted | Push + Email immediately, then a daily digest while still overdue | Yes |
| Exam reminder | Exam-type deadline's staged cadence (§16) | Push + Email | Yes |
| Daily planning digest | Opt-in, user-chosen time each morning | Email (push optional) | Opt-in, off by default |
| Workload warning | A day/week crosses the overload threshold (§15) | Push | Yes |

**User customization (V1):** per-category enable/disable, per-category channel selection, quiet hours (no push during a configured window; email is never subject to quiet hours since it's not an interruption in the same way). **V2:** SMS as an additional opt-in channel for exam-day-critical reminders specifically, given push's documented iOS unreliability (research §10) — held back from V1 due to the added cost/complexity of an SMS provider for a first release.

---

## 25. Offline and Synchronization

- **Online:** standard request/response against the server (source of truth — **→ TECH** §8/§13).
- **Offline:** the current term's data is cached client-side (IndexedDB); the user can view all cached Deadlines, create new ones, edit, and complete items while offline.
- **Save while offline:** writes are queued locally and applied optimistically to the UI immediately — the user is never blocked from acting because of connectivity.
- **Reconnect:** queued writes are synced to the server automatically; the UI shows a clear, unobtrusive "synced" state once complete (never a silent background process the user can't verify happened).
- **Conflict handling (V1):** last-write-wins — acceptable because this is single-user-owned data with a low realistic conflict rate (two devices editing the exact same Deadline within the offline window); CRDT-style resolution is explicitly deferred (research §24/§19) until multi-device concurrent editing is a demonstrated problem, not a hypothetical one.
- **Failure recovery:** a failed sync retries automatically with backoff; if a write ultimately cannot sync (e.g., the Deadline was deleted server-side in the meantime), the user is shown the specific conflicting item rather than a generic error — never a silent data loss, which is precisely the trust failure documented against MyStudyLife in research (§4.3, §5).

---

## 26. User Flows

**1. Onboarding**
Entry: first app open after signup. Steps: create account → create first Academic Term (name + date range) → create at least one Subject (name + color) → optional: set daily capacity (§15), defaults offered if skipped → land on Today (empty state, → DESIGN §17). Success: user has ≥1 Term and ≥1 Subject and reaches Today. Failure: user abandons before creating a Subject — Today's empty state must still offer a clear "add your first subject" path, not require restarting onboarding.

**2. Add deadline (full form)**
Entry: "+" action from any screen. Steps: enter title → select type → select subject → set due date (+ optional time) → optional: priority, effort estimate, notes, reminders → save. System behavior: default reminders applied per §16 unless changed; risk tier computed immediately (§13). Success: deadline appears in Deadlines/Today/Calendar as appropriate, confirmation shown. Failure: missing title or due date blocks save with inline validation (§29); offline save still succeeds locally (§25).

**3. Quick capture**
Entry: Inbox quick-add. Steps: type free text → save (single tap/enter). System behavior: item lands in Inbox untriaged (§18); no validation beyond non-empty text. Success: item visible in Inbox within the same interaction, no form ever appeared. Failure: none blocking — an empty submission is simply a no-op.

**4. Edit deadline**
Entry: tap any Deadline card/row. Steps: open detail → edit any field → save. System behavior: risk recalculates if `dueDate`, `estimatedEffortHours`, or `progress` changed (§13); reminders re-derive their absolute fire times if `dueDate` changed. Success: changes reflected everywhere the Deadline appears (Today, Calendar, Deadlines list) without requiring a manual refresh. Failure: same inline-validation rules as creation.

**5. Complete deadline**
Entry: quick-complete action (checkbox/swipe) from any list, or the detail view. Steps: mark complete → (optional) system may prompt nothing further — completion is a single action, not a flow. System behavior: `status` → completed, `completedAt` set, `progress` locks at 100, item leaves Today/at-risk surfaces, remains in Deadlines list with a completed state. Success: immediate visual confirmation, no confirmation dialog required for this low-risk action. Failure: n/a (undo is available via re-opening and reverting status).

**6. Create recurring deadline**
Entry: within the add/edit deadline flow, enable recurrence. Steps: choose pattern (daily/weekly/weekdays/biweekly/monthly/custom) → confirm. System behavior: RRULE generated and stored (§17); occurrences materialize within the rolling window (**→ TECH** §8). Success: the correct number of upcoming occurrences appear on Calendar/Deadlines within the visible window. Failure: an invalid custom pattern is rejected with inline validation before save.

**7. Create exam**
Entry: add-deadline flow with `type = exam` selected. Steps: same as flow 2, with the `location` field unlocked and the exam-specific reminder cadence (§16) applied by default. Success: exam appears with a countdown in its detail view (§9). Failure: same as flow 2.

**8. Create study session (V2)**
Entry: from a Deadline's Smart Planning suggestion (§14), "schedule this block." Steps: accept or adjust a suggested day/hour block → confirm placement on Calendar. System behavior: creates a StudySession record linked to the parent Deadline; contributes to workload (§15). *(Flagged V2 — not built in V1; specified here for downstream consistency.)*

**9. Use Today**
Entry: app open / Today tab. Steps: view due-today + at-risk + overdue → take a quick action (complete/snooze/open detail) directly from the list. Success: user can act on at least one item without leaving Today. Failure: an empty state (nothing due, nothing at risk) shows a calm confirmation, not a blank screen (→ DESIGN §17).

**10. Use Calendar**
Entry: Calendar tab. Steps: browse Agenda/Month (V1)/Week (V1.5) → tap any entry → view/edit detail. Success: user can locate a specific date's deadlines within two interactions from any starting view. Failure: an empty period shows a neutral empty state, not an error.

**11. Reschedule unfinished work (V2, Study Sessions)**
Entry: an incomplete Study Session's time passes. Steps: system flags it as unfinished (does not silently drop it) → user taps "reschedule" → picks a new slot (manually, or from a re-run Smart Planning suggestion). Success: the session's remaining hours are preserved and re-attributed to workload for the new date. *(V2.)*

**12. Handle overdue task**
Entry: a Deadline's due date passes with `status ≠ completed`. Steps: system sets `status = overdue` automatically → item surfaces distinctly on Today and Deadlines (§4, §20) → user either marks it complete (late), reschedules the underlying work if still relevant, or explicitly dismisses/archives it. Success: the item never simply vanishes from view without an explicit user action. Failure: n/a — the "failure" this flow is designed against is exactly the silent-disappearance pattern; there is no dead end.

**13. Search / filter**
Entry: search field or filter control (Deadlines list, V1.5 for full search / V1 for quick filters). Steps: enter a query or select a filter → results update. Success: matching items appear without a full page reload; zero results shows a clear "no matches" state, not a blank list indistinguishable from "nothing exists yet."

---

## 27. Navigation

### Mobile
- **Primary (bottom tab bar, 4 items):** Today, Calendar, Deadlines, Settings.
- **Quick add:** a floating action button, not a 5th tab — opens Quick Capture (§18) as a bottom sheet (→ DESIGN §7).
- **Secondary/contextual:** Subjects is reached from Settings or from a Deadline's subject chip — not a primary tab, to keep the bar at 4 items (research §21's information-architecture recommendation).
- **Search:** an icon in the Deadlines list header (V1.5), not a persistent global element in V1.

### Desktop
- **Primary (persistent left sidebar):** Today/Dashboard, Calendar, Deadlines, Subjects, Settings.
- **Quick add:** a header button ("+ Add deadline"), not a floating action button (FABs are a mobile-native pattern — research §12).
- **Command palette (V1.5):** a ⌘K-style shortcut for quick add + navigation + search, once there's a keyboard-fluent user base to justify the added surface (research §13).
- **Secondary/contextual:** Subject detail, Deadline detail — reached via click-through, not primary nav items.

---

## 28. MVP

### V1 — MUST HAVE
Deadline CRUD (all `type`s, §6/§7); Subjects + Academic Terms (§8); Priority (§12, no urgency field — computed only); Calendar (Agenda + Month, §19); multi-channel Reminders with sensible type-based defaults (§16); basic Recurrence via RRULE (§17); Today (§20); **Deadline Risk Engine, fully deterministic and explainable** (§13); **deadline-clustering signal feeding both Risk and Today** (§13/§18/§20); Inbox/Quick Capture, no parsing (§18); quick filters + sort on Deadlines (§22); mobile-first PWA with offline read/write + sync (§25); Notification category settings (§24); dark, premium visual design (→ DESIGN).

### V1.5 — HIGH VALUE
Subtasks/checklist (§10/§11); Smart Planning suggestions, text-only, no calendar placement (§14); Workload view on dashboard (§15); Week calendar view + drag-to-reschedule with a keyboard/tap alternative (§19); global search + advanced filters + saved-filter-adjacent quick filters (§22); basic Analytics — completion rate, overdue rate, upcoming workload (§23); lightweight quick-capture parsing (§18); CSV/ICS import (bulk syllabus load — a much smaller lift than full LMS OAuth, matches research §20's phased LMS strategy); Subject stats (§8); command palette on desktop (§27).

### V2 — ADVANCED
Full LMS OAuth integration, Canvas first (research §20); rotating-timetable support via a `ClassMeeting` entity (§8, kept explicitly separate from Deadline per research §17); StudySession/TimeBlock entity + calendar placement of Smart Planning output (§14/§19/§26 flow 8); exam Topics + revision-session generation (§9); grade/GPA "what-if" tracking (explicitly adjacent, not core — research §6); group-project/shared-deadline support; Day/Timeline calendar view (§19); full Analytics trends (§23); SMS reminder channel (§24).

### V3 — EXPERIMENTAL
Opt-in AI-refined effort estimation and personalized Smart Planning weighting, layered under the same explainable tier logic, never replacing it (§13, §14); habit/streak tracking; native app wrapper; true offline conflict-resolution sync for concurrent multi-device edits (§25); voice quick-add; photo-to-schedule scanning.

**Every V1 feature above traces to a specific research finding cited inline in this document — nothing in V1 is included on the basis of "sounds useful."**

---

## 29. Acceptance Criteria

**CREATE DEADLINE**
- Title is required; save is blocked with inline, field-level validation if empty.
- Due date is required to leave the Inbox and appear in Deadlines/Calendar/Today (§6, §18); a bare title with no date is valid *only* inside Inbox.
- Invalid input (e.g., a due date in an unparseable format) displays inline validation without losing already-entered field values.
- A valid Deadline saves and appears immediately in Deadlines, Today (if applicable by date/risk), and Calendar — no manual refresh required.
- Default reminders are created automatically per the `type`-based defaults in §16, visible and editable in the same save action's resulting detail view.
- Creating a Deadline while offline succeeds locally and is queued for sync (§25); the user sees no difference in perceived success between online and offline creation.
- The user receives a lightweight, non-blocking confirmation (e.g., a toast) on successful save.

**RISK ENGINE**
- Every Deadline with a `dueDate` displays a risk tier at all times — never a blank/undefined state.
- Every non-"On Track" risk badge displays a one-line explanation matching the specific condition that triggered it (§13).
- Risk recalculates immediately (not on a delayed timer) when `dueDate`, `estimatedEffortHours`, or `progress` changes on the Deadline itself, or when a sibling Deadline in the same 7-day window is created/completed/deleted (clustering signal).
- A Deadline past its due date with `status ≠ completed` always shows `Overdue`, overriding any other tier logic.

**RECURRING DEADLINES**
- Selecting "this occurrence" and editing a field affects only that date's instance; sibling occurrences are unchanged.
- Selecting "this and future" splits the series at the edited occurrence; prior occurrences retain original field values.
- Selecting "entire series" updates all occurrences, including already-generated future ones within the current materialization window.
- Completing one occurrence does not mark the series complete or prevent the next occurrence from generating.
- Skipping an occurrence excludes it from completion-rate analytics (§23) as neither done nor missed.

**REMINDERS**
- Every Deadline has at least the type-based default reminders applied unless explicitly removed by the user.
- A reminder fires on both enabled channels (push + email) in parallel, not sequentially — email delivery does not wait on push failure/success.
- A user can add, edit, and delete individual reminders on any Deadline, subject to the 3-reminder cap (beyond defaults) in §16.
- Regardless of notification delivery, the Deadline appears on Today if it is due today or at "At Risk"/"Critical" tier — the in-app surface never depends on a notification having fired.

**QUICK CAPTURE**
- A bare, non-empty text entry saves successfully with no other field required.
- An empty submission is a no-op — no error state, no empty item created.
- A captured item appears in Inbox immediately and is visually distinguishable from a fully-triaged Deadline.
- Triaging (adding subject + due date) moves the item out of Inbox into the standard Deadlines list without creating a duplicate record.

**OFFLINE / SYNC**
- All read operations on already-cached data succeed with no network connection.
- Create/edit/complete actions succeed locally while offline and are visually indistinguishable from an online success at the moment of the action.
- On reconnect, queued changes sync automatically without requiring user action.
- If a sync ultimately fails (not just delayed), the specific affected item is surfaced to the user with enough context to resolve it — never a silent loss.

---

## 30. Non-Goals

Explicitly **out of scope**, at any version, unless a future decision deliberately revisits it:
- **Not a full LMS replacement or grade/course-registration system** — LMS integration (V2) is limited to deadline ingestion, never grade submission, coursework upload, or LMS content browsing.
- **Not a grade/GPA calculator in V1 or V1.5** — deferred to V2 as an explicitly adjacent, non-core feature (§6 research finding, §9).
- **Not a general-purpose team collaboration/project-management tool** — no Jira/Asana/Trello-style board, no arbitrary team workspaces; V2's group-project support is scoped narrowly to sharing a specific Deadline with named collaborators, not building shared workspaces.
- **Not a generic note-taking app** — `notes` on a Deadline is a plain text field, not a rich document editor or a Notion-style database.
- **Not a habit tracker** in V1/V1.5 (may appear as a lightweight V3 experiment at most — §28).
- **Not a full personal-calendar replacement** — the product does not attempt to own social/personal events; V2's ICS import brings *external* events in read-only for context, it does not compete with Google/Apple Calendar as a primary personal calendar.
- **Not an auto-scheduling AI system in V1** — Smart Planning (§14) is a suggestion engine, never automatic calendar placement, until V2 at the earliest, and even then remains deterministic and explainable, never a black-box optimizer.
- **No gamification, streak currencies, badges, or rewards mechanics** — explicitly rejected in research (§7, §18) as evidenced-gimmicky with no demonstrated retention value in this category.
- **No mandatory card-on-file trial** — a named trust anti-pattern in research (§5, §18) this product deliberately avoids regardless of monetization model chosen later.

---

## 31. Success Metrics

- **Deadlines created per active user per week** — basic engagement signal.
- **On-time completion rate** (completed before due date ÷ total due) — the core outcome the product exists to improve.
- **Overdue-rate trend over time per user** — is the product actually reducing missed deadlines the longer someone uses it.
- **Risk-recovery rate** — the % of Deadlines that reach "At Risk" or "Critical" and are subsequently completed on time (i.e., the risk signal led to action, not just anxiety) — this is a differentiator-specific metric no competitor's public metrics research surfaced, directly testing whether §13 does its job.
- **Reminder effectiveness** — completion/action rate within a short window of a reminder firing, by channel (push vs. email) — also a direct, ongoing test of §10/§16's multi-channel design decision.
- **Today daily-open rate** — a proxy for whether the product has become the habitual "first check" the positioning promises (§1).
- **Weekly active users** and **term-boundary retention** (does a student return the following term) — the real test for an inherently cyclical, academic-calendar-bound product, distinct from generic productivity-app retention metrics.
- **Abandoned quick-capture rate** — text started, never saved — a direct signal on whether §18's zero-friction promise is actually being delivered.

---

## Decisions Made
- Single `Deadline` entity with a `type` enum — not per-type tables (§6, §10, §17 research).
- Priority and Urgency are explicitly separate concepts; urgency is never user-set (§12).
- Risk Engine is fully deterministic and explainable in V1, with concrete illustrative thresholds provided (§13).
- Smart Planning is suggestion-only (no calendar placement) until V2 (§14).
- Focus/Pomodoro explicitly excluded from V1 (§21).
- Exams and Projects are Deadline `type`s, not separate entities/modules (§5, §9, §10).
- Reminders are multi-channel by default (push + email in parallel), never push-only (§16).
- Analytics is not a V1 module (§23).

## Assumptions
- A "daily capacity" setting, self-reported by the student, is an acceptable proxy for available study time in V1 — no calendar-based auto-inference of free time.
- Students are willing to provide an `estimatedEffortHours` figure on at least some deadlines for the Risk Engine and Smart Planning to be useful; the system degrades gracefully (§13) when they don't, but is materially less useful.
- A single Academic Term model (start/end date) is sufficient structure for V1 — no support yet for irregular term structures (trimesters, block scheduling) beyond what a generic date range can express.

## Open Questions
- Exact default values for the daily-capacity setting (§15) and the illustrative risk-tier thresholds (§13) need real-user tuning once V1 is in use — these are specified as concrete starting points, not final constants.
- Whether Tags (§6/§7) should have any structural weight at all in V1.5 filtering, or remain purely cosmetic.
- Whether the 3-reminder cap (§16) is the right ceiling once real usage data exists.

## Risks
- If students consistently skip `estimatedEffortHours`, the Risk Engine's most powerful signal (`capacityRatio`) degrades to a weaker date-only heuristic — the UI must make entering an estimate low-friction enough that this isn't the common case.
- The deterministic Smart Planning algorithm's front-loaded weighting (§14) is a design guess, not research-validated against real student behavior — flagged for early user testing.
- Multi-channel reminders (§16) increase notification-infrastructure cost and complexity relative to a push-only competitor; this is a deliberate trade-off for reliability, not an oversight — see TECH_STACK_PRD for cost implications.

## Deferred Decisions
- Whether V2's LMS integration starts with a full OAuth flow or a lighter ICS-feed-URL import (research §20 flags ICS as the smaller near-term lift) — deferred to V1.5/V2 planning, not decided here.
- Exact SMS provider and cost model for the V2 SMS reminder channel.
- Whether group-project/shared-deadline support (V2) requires any real-time collaboration mechanics or is satisfied by simple shared-read access.
