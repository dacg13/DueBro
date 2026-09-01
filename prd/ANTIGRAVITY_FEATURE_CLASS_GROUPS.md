# Feature Build Prompt for Google Antigravity — Class Groups & Shared Deadlines

*This extends the already-completed Student Deadline Tracker app. Follow the existing codebase's conventions (folder structure, naming, layering, testing patterns) established during the original build per `TECH_STACK_PRD.md` — do not introduce a parallel architecture for this feature.*

---

## 0. Context

The app is built. This is an **additive feature**, not a rebuild. Read the existing `server/domain/`, `server/db/schema/`, and `components/` structure before writing anything, and match its conventions exactly (pure domain functions, Zod-validated Server Actions, RLS on every table, shadcn/ui components extended not forked).

---

## 1. Feature Summary

Students can add **Friends**. Friends who share a real class can form a **Class Group** for that class. Any member of a Class Group can add a **Shared Deadline** — it's created for every member automatically, so if one person forgets to log an assignment, anyone else in the group already has.

**Core mechanic:** a Shared Deadline is not one row visible to many people — it's a template that **fans out into a normal, individually-owned Deadline for every member**. Each member gets their own copy in their own Deadlines list, linked back to the shared origin. The *what/when/where* (title, type, due date, time, location) stays synced across everyone's copies if it's edited later. Each member's own priority, progress, effort estimate, notes, and reminders on their copy stay entirely their own — nothing about another member's personal tracking is ever touched.

This is a deliberate design choice: it means **zero changes to the existing `deadlines` table's RLS policy** (`user_id = auth.uid()` still governs all visibility) and zero changes to the Risk Engine, Smart Planning, or reminder logic — a fanned-out Deadline is just a normal Deadline with one extra nullable link field. Collaboration happens entirely through the fan-out mechanism, not through multi-tenant row access.

---

## 2. Explicit Scope Boundary — Read This Before Building Anything

This stays a **lightweight, flat peer feature**, consistent with the original product's Non-Goals (`PRODUCT_PRD.md` §30: *"not a general-purpose team collaboration/project-management tool"*). Specifically, this feature does **not** include:
- Roles, permissions, or an "admin"/owner with special power over other members — every member of a Class Group can do the same things.
- Comments, chat, @mentions, or any messaging surface.
- Task assignment ("you do this part, I do that part").
- A board/workspace view (no Kanban, no Trello-style anything).
- Real-time presence indicators ("Alex is typing").

If you find yourself building any of the above, stop — it's out of scope for this feature.

---

## 3. New Concepts / Fixed Terminology

Use these names exactly, everywhere (code, UI copy, database):
- **Friend** — a mutual, accepted connection between two users.
- **Class Group** — a persistent group of friends who've agreed they're in the same class. Not the same thing as a `Subject` — each member maps the group to *their own* personal `Subject` (they might name/color it differently).
- **Shared Deadline** — the origin record created inside a Class Group. Never shown to the user as a separate concept from a regular Deadline — a member's fanned-out copy just *is* a Deadline, with a small visual indicator that it's shared.

---

## 4. Data Model

New tables (additive only — no existing table is restructured, `deadlines` gets one new nullable column):

```
friendships
  id
  requester_id        -> users.id
  addressee_id         -> users.id
  status                enum: pending | accepted | declined | blocked
  created_at
  responded_at
  -- unique constraint on the unordered pair (requester_id, addressee_id)

class_groups
  id
  name
  created_by_user_id   -> users.id
  created_at
  updated_at

class_group_members
  id
  class_group_id       -> class_groups.id
  user_id               -> users.id
  local_subject_id     -> subjects.id (nullable until the member maps it)
  status                enum: active | left
  joined_at
  left_at              (nullable)
  -- unique on (class_group_id, user_id)

class_group_invites
  id
  class_group_id       -> class_groups.id
  invited_user_id       -> users.id
  invited_by_user_id   -> users.id
  status                enum: pending | accepted | declined
  created_at
  responded_at
  -- domain rule (enforced in code, not just UI): invited_user_id must already
  -- have an accepted friendship with invited_by_user_id

shared_deadlines
  id
  class_group_id        -> class_groups.id
  created_by_user_id    -> users.id
  last_edited_by_user_id -> users.id
  title
  type                  -- same enum as deadlines.type
  due_date
  due_time
  location
  shared_notes          (optional — distinct from a member's personal notes field)
  created_at
  updated_at

-- extend the existing deadlines table:
+ shared_deadline_id    -> shared_deadlines.id (nullable)
```

**Indexes:** unique on `friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id))` to prevent duplicate/reverse pairs; unique on `class_group_members (class_group_id, user_id)`; index on `shared_deadlines (class_group_id, due_date)`; index on `deadlines (shared_deadline_id)` for propagation lookups.

**RLS:**
- `friendships` — visible where `auth.uid()` is `requester_id` or `addressee_id`.
- `class_groups`, `class_group_members`, `class_group_invites`, `shared_deadlines` — visible only via an active membership join (a user must have an `active` row in `class_group_members` for that `class_group_id`).
- `deadlines` — **no change.** The existing `user_id = auth.uid()` policy already covers fanned-out rows correctly, since each one is individually owned.

---

## 5. Domain Logic — Fan-Out and Propagation

New domain modules: `server/domain/friendships/` and `server/domain/class-groups/`. Keep the fan-out logic itself as a **pure, unit-testable function** — same pattern as the existing risk engine and scheduling engine (given a member list + core fields, return the set of per-member upserts; the caller handles the actual writes).

**Creating a Shared Deadline:**
1. Validate the creator is an `active` member of the Class Group.
2. Insert the `shared_deadlines` row.
3. For every `active` member (including the creator):
   - If they have a `local_subject_id` mapped, create a `deadlines` row for them: `subject_id` = their mapped subject, `title`/`type`/`due_date`/`due_time`/`location` copied from the shared deadline, `shared_deadline_id` set, `priority` = Medium (default), `progress` = 0, apply the **existing** type-based default reminders logic unchanged (no special-casing needed — reuse it as-is).
   - If they haven't mapped a subject yet, skip them for now and queue this deadline to backfill once they do (see "joining," below).
4. Fire a "group activity: deadline added" event (feeds notifications, §8).

**Editing a Shared Deadline's core fields (title/type/due date/time/location):**
- Any active member may edit.
- Propagate the changed fields to every member's linked `deadlines` row that's still `active` in the group.
- **Never touch** `priority`, `progress`, `estimatedEffortHours`, `notes`, or `reminders` on those rows — those remain each member's own.
- This naturally re-triggers the existing risk-recalculation hook, since `dueDate` changing is already a recalculation trigger — no new risk-engine code needed.
- Fire a lighter-weight "group activity: deadline updated" event — **in-app only by default, no push/email** (see §8 — avoid notification fatigue on routine edits).

**A member joining a Class Group (after accepting an invite and mapping a local Subject):**
- Backfill: for every `shared_deadlines` row in that group with `due_date >= today` (skip already-past ones — don't dump a pile of stale items on a late joiner), create their personal `deadlines` instance using the same logic as step 3 above.

**A member leaving a Class Group:**
- Set their `class_group_members.status = 'left'`.
- Their existing `deadlines` rows (even ones with `shared_deadline_id` set) are **untouched** — that's their own data now, permanently.
- Future fan-out/propagation simply excludes them, since it only ever queries `active` members.

---

## 6. Permission Model

Deliberately flat, per §2's scope boundary: every active member can invite (any existing Friend), add a Shared Deadline, and edit any Shared Deadline's core fields. There is no owner/admin override. The Class Group's `created_by_user_id` is stored for display ("started by X") only — it grants no special power.

---

## 7. UI Additions

Follow the existing design system exactly (`DESIGN_PRD.md` tokens, components, breakpoint rules) — extend existing components, don't fork new ones.

- **Friends:** reached from Settings (mobile) — matches how `Subjects` is already reached from Settings on mobile rather than getting its own tab. Add-friend (by email/username search), pending requests (incoming/outgoing), friends list. No new primary nav item, mobile or desktop.
- **"Share with classmates" action** on the existing Subject Detail screen — if the Subject has no mapped Class Group yet, this creates one (prompts for a name, pre-filled with the Subject's own name) and opens the invite-a-friend flow; if already mapped, it opens the Class Group screen.
- **Class Group screen (new):** header with group name + member list; a list of Shared Deadlines using the **existing** DeadlineRow/DeadlineCard component (extended, not replaced — see next point); an "Add shared deadline" action that opens the existing Add-Deadline sheet/modal in shared mode; an invite-more-friends action; a leave-group action.
- **DeadlineCard/DeadlineRow extension:** add a small shared-indicator (icon + "added by X" on wider layouts) when `shared_deadline_id` is set. At the tightest mobile width (320–375px), degrade to icon-only — the same pattern already used for the risk badge at that breakpoint (`DESIGN_PRD.md` §10). Never let this indicator push the card into a second line at the density the Deadlines list already relies on.
- **Add Deadline flow:**
  - Opened *from within* a Class Group screen → defaults to shared mode, with a visible banner ("Adding to [Group] — N members will see this").
  - Opened normally (FAB / Today / Deadlines) on a Subject that has a mapped Class Group → show an **off-by-default** toggle, "Also share with [Group name]," placed next to the Subject field (not buried under "More details") so it's a clear, deliberate, one-tap decision at the moment it matters. Off by default — sharing is never automatic for a normal personal deadline.

---

## 8. Notifications

Add one new category to the existing notification-settings pattern (`PRODUCT_PRD.md` §24's table):

| Category | Trigger | Default channels | Customizable? |
|---|---|---|---|
| Group activity | A Class Group member adds a Shared Deadline | Push + Email | Yes |
| *(Shared deadline edited — lighter weight)* | A Class Group member edits a Shared Deadline's core fields | In-app only | Yes |

Reuse the existing Inngest multi-channel dispatch mechanism (`TECH_STACK_PRD.md` §12) unchanged — this is a new event type feeding the same pipeline, not new notification infrastructure.

---

## 9. Realtime (fast-follow, not required for the initial build)

Ship this feature first with a normal fetch/refetch pattern (TanStack Query, refresh-on-focus) — that's enough for correctness. As an optional fast-follow once the above is working: subscribe to Supabase Realtime (already part of the existing stack — no new vendor) on `shared_deadlines` and the fanned-out `deadlines` rows scoped to a user's active Class Groups, so a newly shared deadline appears on Today/Calendar without a manual refresh. Don't block the rest of this feature on building this.

---

## 10. Build Phases

1. **Data model** — new tables, the one new `deadlines.shared_deadline_id` column, indexes, RLS. Migration.
2. **Domain layer** — `friendships` and `class-groups` modules; the fan-out/propagation logic as pure, unit-tested functions (boundary cases: unmapped member, a member who's left, an empty group, editing after a member left).
3. **Friends UI** — request/accept/decline, friends list, under Settings.
4. **Class Group UI** — "Share with classmates" on Subject Detail, the Class Group screen, invite/join/leave flows, the local-subject-mapping prompt.
5. **Add Deadline integration** — shared-mode banner, the off-by-default share toggle, the DeadlineCard/Row shared indicator.
6. **Notifications** — the new "Group activity" category wired through the existing dispatch pipeline, settings toggle.
7. *(Optional fast-follow)* **Realtime** — per §9.

Stop and summarize after each phase, same as the original build.

---

## 11. Testing

- Unit tests on the fan-out/propagation pure functions covering every boundary case named in Phase 2 above.
- RLS tests: a user who is **not** a member of a Class Group cannot see its `shared_deadlines`, its member list, or any other member's `deadlines` rows.
- E2E: Friend A creates a group and invites Friend B → B accepts and maps a Subject → A adds a Shared Deadline → B sees it in their own Deadlines list and Today with zero action on B's part, correctly attributed to their own mapped Subject, with default reminders already applied.
- E2E: A edits the shared deadline's due date → B's copy's due date updates, B's own priority/progress/notes on that copy are unchanged, B's copy's risk tier recalculates correctly against the new date.

---

## 12. Hard Constraints

- Do not weaken the existing `deadlines` RLS policy — collaboration works entirely through fan-out to individually-owned rows, never through shared row access.
- Do not add chat, comments, task assignment, or any role/permission tier beyond flat membership (§2).
- Do not let a Shared Deadline edit touch a member's personal `priority`, `progress`, `estimatedEffortHours`, `notes`, or `reminders`.
- Do not default the "share with group" toggle to on in the normal Add Deadline flow.
- Do not send push/email on every Shared Deadline edit — creation only, by default (§8).
- Do not fork new UI components where the existing DeadlineCard/DeadlineRow/BottomSheet/Dialog can be extended instead.
- Do not introduce any new color/visual language for the shared indicator — reuse existing design tokens (`DESIGN_PRD.md` §3).

---

## Assumptions Made (flag if any of these should change)
- Trust model is friend-request-based, not open invite links — you can only be added to a Class Group by someone already your accepted Friend.
- Permission model is intentionally flat — no group owner/admin power beyond attribution.
- Late-joiner backfill only covers upcoming (not past/overdue) Shared Deadlines.
- Realtime is explicitly a fast-follow, not a blocking requirement for this feature to ship.
