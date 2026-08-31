# DESIGN_PRD.md — Student Deadline Tracker

**Purpose:** defines HOW the product looks, behaves, and responds across devices — detailed enough for an AI coding agent (Google Antigravity) to implement UI without guessing.
**Intended audience:** Antigravity (implementation), and the product owner reviewing visual/interaction decisions.
**Source of truth:** `PRODUCT_PRD.md` (features, entities, flows this document gives visual form to) and the completed research phase (competitive design research, mobile UX research, accessibility research).
**Relationship to the other PRDs:** every screen and component here maps to a feature defined in `PRODUCT_PRD.md` — cross-references are marked **→ PRODUCT**. Technical implementation of any interaction (drag handling, offline indicators, etc.) is owned by `TECH_STACK_PRD.md`, marked **→ TECH**.

**A note on source material:** no screenshots of the current UI concept were received in this conversation — only the written description (dark theme, calendar view, deadline creation modal, categories, subjects, priority, reminders, recurrence, notes, dashboard statistics). §11 and §25 are written against that description plus the patterns research found across the competitor set, and are flagged as **provisional** — re-run those two sections once the actual screenshots are available, since a description cannot substitute for seeing the real hierarchy, spacing, and clutter problems.

---

## 1. Design Vision

**Desired qualities, and what each means concretely — not just adjectives:**
- **Premium:** restrained color use (one accent, used sparingly for action/selection, not decoration), generous whitespace at the cost of information density where the two conflict, no default-template component styling.
- **Modern:** current-generation dark-mode conventions (subtle surface elevation via lightness steps, not heavy shadows; real typographic hierarchy, not just bold/not-bold).
- **Calm:** never more than one urgent-colored (red/orange) element competing for attention on a screen at once outside the Deadlines list itself; risk and priority never both shout at full saturation on the same card.
- **Focused:** every screen answers one primary question (Today: "what now"; Calendar: "what's when"; Deadlines: "everything, filterable") — no screen tries to be a dashboard *and* a worklist *and* an analytics view at once.
- **Fast:** optimistic UI on every mutation (§18 loading states), skeletons over spinners, no blocking full-screen loaders for actions the user initiated.
- **Technically polished:** consistent 4px spacing grid, no ad-hoc pixel values, real focus states on every interactive element.
- **Student-friendly:** legible at a glance between classes — nothing requires sustained reading to parse (risk/priority are scannable via color+icon+short label, not paragraphs).
- **Trustworthy:** the offline/sync state (§19 Error States, **→ PRODUCT** §25) is always visible, never hidden — trust is earned by never letting the user wonder whether something saved.

**Explicitly avoid (per direct instruction, overriding any generic "modern dark app" default):**
- Excessive glassmorphism — backdrop blur is reserved *only* for the modal/bottom-sheet scrim (§20), never applied to cards or persistent surfaces.
- Excessive gradients — gradients are not used for backgrounds or cards; at most, a single subtle gradient may appear on the risk-tier accent bar (§10) to communicate a *scale*, never decoratively.
- Neon-heavy design — the accent color (§3) is a confident, moderately saturated blue-indigo, not a glowing/neon tone; no glow/bloom effects on any element.
- Card-everything layouts — lists use rows with clear dividers where density matters (Deadlines list, §22 DeadlineList), reserving true "cards" for contexts that need visual separation (Today's grouped sections, Subject tiles).
- Visual clutter — a Deadline row/card shows only what's defined in §10 as visible at that breakpoint; nothing extra "because there's room."
- Unnecessary decorative UI — no illustrations, mascots, or empty-state art beyond a single simple icon (§17).

---

## 2. Competitive Design Principles

*(UX principles adopted, not visual identity — no colors, logos, or component styling from any of these is reused.)*

| Source | Principle adopted | Why (research-grounded) |
|---|---|---|
| **Structured** | Timeline/agenda-as-primary over list-as-blank-page for the day view | Most consistently praised UX pattern found in competitor research — "gives you a timeline, not a blank page" |
| **Sunsama** | Calm, honest workload warnings instead of automated silence or opaque AI | Directly informs how risk/workload is surfaced (§9, §13) — confront, don't hide, and don't pretend to auto-fix |
| **MyStudyLife** | Subject color as the primary wayfinding cue across every view | The one thing MyStudyLife gets right structurally even amid its other 2025–26 problems — color-coding by subject is how students actually scan a busy week |
| **Linear** (general 2026 premium-SaaS reference, not a competitor in this category) | Information density done *cleanly* — restrained color, real hierarchy, fast perceived performance | Counter-example to Notion's overwhelm and TickTick's "many buttons, many menus" clutter (research §4.6, §4.12) |
| **Todoist / TickTick** | Clear list hierarchy and instantly scannable due-date/priority markers | Baseline competence bar for the Deadlines list — these are the "already good enough" defaults being beaten on trust and clarity, not on basic list legibility |
| **Motion** *(anti-pattern, explicitly rejected)* | — | Its opaque, unexplained AI scheduling is exactly what this product's risk visualization (§9) must *not* resemble — every colored risk state must always be one tap from its plain-language reason (**→ PRODUCT** §13) |

---

## 3. Design System

### Colors
| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#0B0B0E` | App background |
| `bg-surface` | `#131318` | Raised surface (cards, list rows) |
| `bg-elevated` | `#1C1C23` | Modals, bottom sheets, popovers |
| `border-default` | `rgba(255,255,255,0.08)` | Default dividers/borders |
| `border-hover` | `rgba(255,255,255,0.16)` | Hover/active border state |
| `text-primary` | `#F5F5F7` | Primary text |
| `text-secondary` | `#A0A0AC` | Secondary/metadata text |
| `text-tertiary` | `#6B6B76` | Disabled/placeholder text |
| `accent` | `#5B6EF5` | Primary actions, selection, focus rings, links — used sparingly |
| `accent-subtle` | `rgba(91,110,245,0.14)` | Accent-tinted backgrounds (selected row, active nav item) |

### Semantic colors (Priority — a saturated dot/chip, small and consistent)
| State | Color |
|---|---|
| Low | `#6B6B76` (neutral gray) |
| Medium | `#5B6EF5` (same family as accent) |
| High | `#E0A030` (amber) |
| Critical | `#E5484D` (red) |

### Semantic colors (Risk tier — always paired with an icon + text label, never color alone, per §21)
| Tier | Color | Icon |
|---|---|---|
| On Track | `#3FB56E` (green) | check-circle |
| Upcoming | `#5B6EF5` (accent blue) | clock |
| Needs Attention | `#E0A030` (amber) | alert-triangle (outline) |
| At Risk | `#E8783D` (orange) | alert-triangle (filled) |
| Critical | `#E5484D` (red) | alert-octagon |
| Overdue | `#B23A3E` (deep red, distinct from Critical) | alert-octagon (filled) + "Overdue" text always shown, never icon-only |

### System semantics
| State | Color |
|---|---|
| Success | `#3FB56E` |
| Warning | `#E0A030` |
| Error | `#E5484D` |
| Info | `#5B6EF5` |

**Rule: color is never the sole carrier of meaning.** Every priority chip and risk badge always pairs color with a distinct icon *and* a text label (§21) — this is a hard requirement, not a nice-to-have, because Priority and Risk (**→ PRODUCT** §12) must remain visually distinguishable from each other even for color-blind users, and they use overlapping color families (both use amber/orange/red ranges) by necessity of a limited semantic palette.

### Surfaces, spacing, radii, shadows, blur, opacity
- **Spacing unit:** 4px base; scale = 4, 8, 12, 16, 24, 32, 48, 64.
- **Radii:** cards/sheets 16px; buttons/inputs 10px; chips/badges fully rounded (pill); bottom-sheet top corners 20px.
- **Shadows:** minimal by design — dark-theme elevation is communicated primarily through `bg-surface` → `bg-elevated` lightness steps, not shadow. The **one** permitted shadow is on modals/bottom sheets floating over content: `0 8px 24px rgba(0,0,0,0.4)`.
- **Blur:** reserved exclusively for the modal/bottom-sheet backdrop scrim — `backdrop-filter: blur(8px)` over a 60%-opacity black scrim. Never applied to cards, nav bars, or persistent surfaces (this is the explicit anti-glassmorphism rule from §1 made concrete).
- **Opacity:** disabled elements at 40% opacity of their normal state; hover/pressed states use the `border-hover` token and a 4%–8% white overlay, never opacity changes on text (which would fail contrast).

### Icon sizing
16px (inline/metadata icons within text), 20px (default UI icons — nav, buttons), 24px (primary actions — FAB icon), 32px (empty-state icon, §17).

### Component sizing
Primary button height: 44px (mobile) / 36px (desktop, compact contexts allowed). Input height: 48px (mobile) / 40px (desktop). Minimum touch target: 44×44px on any interactive element on mobile, per §21/§12 research — never below this regardless of visual icon size.

---

## 4. Typography

- **Recommended font:** **Inter** (variable font) — chosen for legibility at small sizes, excellent numeral/tabular-figure support (critical for countdowns and stats that must not visually jitter as digits change), wide platform availability, and zero licensing cost or complexity for an AI-agent-built stack.
- **Numerals:** `font-variant-numeric: tabular-nums` applied to all countdowns, stat figures, and calendar date numbers — non-negotiable, since a jittering countdown reads as unpolished.

| Role | Mobile | Desktop | Weight |
|---|---|---|---|
| Greeting / display (Today header) | 28px / 34 line-height | 34px / 40 | Semibold (600) |
| H1 (page title) | 22px / 28 | 26px / 32 | Semibold (600) |
| H2 (section header) | 17px / 24 | 18px / 26 | Semibold (600) |
| Body | 15px / 22 | 15px / 22 | Regular (400) |
| Label / metadata (subject name, due date on a card) | 13px / 18 | 13px / 18 | Medium (500) |
| Caption / micro (section labels, e.g., "TODAY") | 11px / 16, uppercase, +0.04em tracking | 11px / 16 | Medium (500) |
| Statistics (dashboard numbers) | 24px / 28, tabular-nums | 28px / 32 | Semibold (600) |
| Calendar cell text | 12px / 16 | 13px / 18 | Regular (400) |

---

## 5. Color Semantics

Already specified in full in §3 (Priority table, Risk tier table, System semantics table) — repeated here only as a summary cross-reference per the requested document structure:
- **Priority** (Low/Medium/High/Critical) and **Risk** (On Track/Upcoming/Needs Attention/At Risk/Critical/Overdue) use visually distinguishable treatments — Priority renders as a small solid dot or short pill chip; Risk renders as a left-border accent + icon + label on the card, never as a same-shape chip as Priority, specifically to prevent the two systems from being visually confused with each other (**→ PRODUCT** §12's "Priority ≠ Urgency" rule made visual).
- **Never color alone:** every priority/risk indicator carries an icon and/or text label alongside color (§21).

---

## 6. Responsive System

**Not a shrink — a set of deliberate layout changes at each range.**

| Width | Layout behavior |
|---|---|
| **320–375px** | Single column. Bottom tab bar with icon + 10px micro-label (4 items, **→ PRODUCT** §27). Calendar defaults to **Agenda**, month grid not shown (a 7-column grid is cramped and low-value at this width — research §12). FAB overlaps content intentionally, bottom-right. Deadline cards show only: title, subject color bar, due date/countdown, risk icon (priority chip hidden — tap into detail to see it). |
| **390–430px** | Same structure, more breathing room. Deadline cards now also show the priority chip. Month grid becomes an available secondary Calendar view (swipeable from Agenda), but Agenda remains the default. |
| **768px** | Two-pane becomes *optional*, not forced: Deadlines list can show a detail panel alongside the list instead of full-screen push navigation, if the orientation is landscape/wide-portrait. Bottom tab bar persists in portrait; begins transitioning toward a side rail in landscape. |
| **1024px** | Persistent left sidebar replaces the bottom tab bar entirely (**→ PRODUCT** §27 desktop nav). Calendar can default to Week or Month. The FAB is replaced by a labeled "+ Add deadline" button in the sidebar/header — FABs are not used above this breakpoint (mobile-native pattern, research §12). |
| **1280–1440px** | Three-pane layouts become viable: sidebar nav / list / detail, simultaneously visible (Deadlines and Calendar both support this). Command palette (⌘K, V1.5) is the desktop equivalent of the mobile FAB for quick-add. |
| **1920px** | Content width is capped (max ~1440px content column, centered or left-aligned with generous margin) rather than stretching lists/calendar edge-to-edge. The reclaimed space is used for a persistent secondary panel (e.g., the Workload summary, **→ PRODUCT** §15) rather than simply enlarging existing elements. |

---

## 7. Mobile Navigation

- **Bottom navigation:** 4 items — Today, Calendar, Deadlines, Settings (**→ PRODUCT** §27). Active item uses `accent` color + filled icon variant; inactive items use `text-secondary` + outline icon variant.
- **Top bar:** minimal — screen title (left-aligned) + one contextual action (right-aligned, e.g., search icon on Deadlines, term selector on Today). Never a hamburger menu — all primary destinations live in the bottom bar.
- **Floating add action:** a single circular FAB, bottom-right, `accent` background, 56px diameter, 24px "+" icon, sits above the tab bar with enough offset to never overlap tab-bar taps. Opens Quick Capture (**→ PRODUCT** §18) as a bottom sheet.
- **Quick capture:** the bottom sheet (§20) contains a single auto-focused text input and a "Save" action; expanding to full fields is a secondary, clearly optional action within the same sheet, never a forced next step.
- **Search:** an icon in the Deadlines top bar (V1.5, **→ PRODUCT** §22) — not a persistent global search in V1.
- **Account/settings:** the Settings tab itself, not a separate profile icon — avoids a 5th nav concept.
- **Swipe behavior:** swipe-to-complete and swipe-to-snooze are available on Deadline rows, but every swipe action **always** has an equivalent tappable control visible on the row (e.g., a checkbox) — swipe is an accelerator, never the only path, per §21/research §12.

---

## 8. Desktop Navigation

- **Sidebar:** persistent left sidebar (fixed ~240px width at ≥1024px), containing: logo/wordmark, Today/Dashboard, Calendar, Deadlines, Subjects, Settings — in that order, matching **→ PRODUCT** §27's desktop nav. Active item: `accent-subtle` background + `accent` text/icon.
- **Top bar:** contains the current section's title, the "+ Add deadline" button (right-aligned), and — once V1.5 ships — the command-palette trigger.
- **Collapse behavior:** the sidebar can collapse to icon-only (~64px) via a persistent toggle at its base, for users who want more content width; collapsed state persists per-user (a preference, not a one-time session state).
- **Command palette (V1.5):** ⌘K opens a centered overlay (not a sidebar element) for quick-add, navigation jump, and search — modeled on the *pattern*, not the visual style, of Akiflow's command bar (research §13/§21).
- **Keyboard shortcuts (V1.5):** `n` new deadline, `/` focus search, `g` then `t/c/d` to jump to Today/Calendar/Deadlines (Linear-style go-to shortcuts) — documented in Settings, discoverable via the command palette's own listing.
- **Secondary navigation:** Subject detail and Deadline detail are reached by click-through from their parent list, never duplicated in the sidebar itself.

---

## 9. Dashboard (= Today, per **→ PRODUCT** §20)

**Exact hierarchy, top to bottom:**
1. **Greeting** — "Good morning, [name]" or time-appropriate variant, display-scale type (§4). Small, quiet — one line, no decoration.
2. **Urgency overview** — a single compact strip: count due today, count at-risk/critical, count overdue (if any). Rendered as three small stat clusters, not full "stat cards" — the research explicitly warns against meaningless statistics cards (research §9), so these numbers exist only because they're immediately actionable (tapping "3 at risk" filters straight into that list).
3. **Overdue section** (only rendered if non-empty) — shown first among lists, distinct deep-red left border, never silently omitted (**→ PRODUCT** §4/§20).
4. **Due today** — the primary list, Deadline cards in due-time order.
5. **At risk / critical (not due today)** — a secondary list, visually separated by a section label, so the user understands *why* something not due today is showing up here (ties to **→ PRODUCT** §20's deliberate risk-driven inclusion).
6. **Workload indicator** (V1.5) — a single compact bar showing today's planned-vs-available hours (**→ PRODUCT** §15), only shown once Smart Planning exists.
7. **Quick actions** — not a separate section; each Deadline row itself carries its quick actions (complete, snooze) inline, per §10.

**Avoided:** a grid of generic stat cards (completion streak, total tasks ever created, etc.) — none of that belongs on Today; anything retrospective lives in Analytics (V1.5+, **→ PRODUCT** §23), not here.

---

## 10. Deadline Cards

**Full field set (never all shown at once — see breakpoint table below):** title, category/type icon, subject (color + name), due date/countdown, priority chip, risk badge (color + icon + short label), progress (thin bar, only if subtasks exist or progress > 0), effort estimate (only in detail/expanded view, never on the compact card).

| Field | Mobile (320–430px) | Tablet (768px) | Desktop (≥1024px) |
|---|---|---|---|
| Title | ✓ (1 line, truncate) | ✓ | ✓ |
| Type icon | ✓ (small, left of title) | ✓ | ✓ |
| Subject color bar + name | Color bar only (375px); + name at 390px+ | ✓ | ✓ |
| Due date / countdown | ✓ (compact, e.g. "2d") | ✓ (full, e.g. "Due Fri, 2 days") | ✓ |
| Priority chip | Hidden at 320–375px; shown 390px+ | ✓ | ✓ |
| Risk badge | ✓ (icon-only at 320px if space-constrained, icon+label 375px+) | ✓ (icon + label) | ✓ (icon + label) |
| Progress bar | Only if progress > 0 | Only if progress > 0 | Only if progress > 0 |
| Quick-complete control | ✓ (leading checkbox, always visible — never swipe-only, §7) | ✓ | ✓ |

**Layout:** a single-line-title row on mobile (Deadlines list density), expanding to a two-line card only on Today (where fewer items are shown and more context is warranted). Desktop Deadlines list stays row-dense (Linear-style, §2) rather than card-heavy, to preserve information density per §24's design rules.

---

## 11. Add Deadline Experience *(provisional — see note at top of document)*

### Current problems (inferred from the described concept, not a screenshot — flagged accordingly)
Based on the initial concept as described (a single deadline-creation modal covering categories, subjects, priority, reminders, recurrence, and notes all at once) and the patterns research found repeatedly across competitors:
- A single flat modal exposing every field at once (title, type, subject, date, time, priority, reminders, recurrence, notes) risks exactly the "too much setup" complaint research found against Notion and, to a lesser extent, TickTick (research §5) — especially damaging on mobile, where a tall single-scroll form is slow to complete under the "capture between classes" pressure the personas describe (**→ PRODUCT** §3, §18).
- If the modal is desktop-shaped (fixed width, centered) and simply reused on mobile at smaller width, it likely violates the mobile-first principle (§1) — a modal is the wrong mobile pattern regardless of content; a bottom sheet is required instead (research §12's explicit finding on bottom-sheet engagement).
- No visible distinction, in the concept as described, between fields that are required to save vs. optional — this conflicts directly with **→ PRODUCT** §6's REQUIRED/OPTIONAL/ADVANCED field categorization, which must be visually legible in the form, not just true in the data model.

### Proposed solution

**Desktop:**
- A modal (not full-screen), fixed max-width ~560px, `bg-elevated` surface.
- **Grouped, progressively revealed sections**, top to bottom: (1) Title + Type — always visible; (2) Subject + Due date/time — always visible, both required to leave Inbox (**→ PRODUCT** §6); (3) "More details" — collapsed by default, expands to Priority, Effort estimate, Notes, Tags; (4) "Reminders" — collapsed by default, pre-filled with the type-based defaults (**→ PRODUCT** §16) shown as removable chips, not empty fields to fill in; (5) "Repeat" — collapsed by default, off unless explicitly enabled.
- **Field order** deliberately mirrors the REQUIRED → OPTIONAL → ADVANCED categorization from **→ PRODUCT** §6 top to bottom — the form's visual order *is* the data model's priority order, not an arbitrary designer choice.
- Primary action ("Save") is always visible/sticky at the bottom of the modal regardless of scroll position within expanded sections.

**Mobile:**
- **Bottom sheet**, not a modal — opens from the FAB (§7), initial height covers ~60% of the screen (title + type + subject + date only), expandable to full-height by dragging or tapping "More options."
- **Progressive disclosure** identical in structure to desktop's grouped sections, but each "more" section is a full-width expand within the sheet rather than an inline collapse, to keep touch targets generous.
- **Sticky action bar:** "Save" button pinned to the bottom of the sheet, always reachable by thumb regardless of scroll position within the sheet (one-handed-use requirement, research §12).
- Field order: identical required-first ordering as desktop.

**Validation and save behavior (both platforms):** inline, field-level validation only (no full-form error summary) — an invalid/missing required field shows its error directly beneath that field the moment the user attempts to save or moves focus away from it; already-valid fields are never re-validated or re-flagged. Save is optimistic (§18) — the sheet/modal closes immediately on tapping Save, with the new Deadline appearing in the relevant list before server confirmation completes (**→ TECH** covers the rollback-on-failure case).

---

## 12. Calendar

**Views:** Agenda (default, mobile + V1), Month (V1), Week (V1.5), Day/Timeline (V2, **→ PRODUCT** §19).

| Aspect | Specification |
|---|---|
| Event height (Month view) | Compact — a colored dot (subject color) + truncated title on cells with ≤2 items; a "+N more" affordance beyond that, tapped to reveal the full day in Agenda |
| Event height (Agenda) | Full-width row matching the Deadline Card mobile spec (§10) |
| Density | Month view favors density (dots/count) over detail; Agenda favors detail over density — this split is deliberate, not a compromise |
| Labels | Subject color always shown; type icon shown at Agenda density, omitted at Month-cell density |
| Deadline indicators | A colored left-border on Agenda rows, a colored dot on Month cells — consistent with the Deadline Card system (§10), not a separate visual language |
| Risk indicators | Only rendered when a Deadline is "Needs Attention" or worse (**→ PRODUCT** §13) — an additional small icon beside the dot/border; On Track/Upcoming items show no risk marker at all, keeping the calendar calm by default (§1) |
| Today state | `accent`-colored date number + a subtle `accent-subtle` background on today's column/cell — never a full-saturation fill, which would compete with risk colors |
| Selected state | `border-hover` outline + slightly elevated background (`bg-elevated`), distinct from "today" styling so the two states never visually collide |
| Overflow | Month cells cap visible items at 2–3 depending on breakpoint; overflow uses "+N more," never silent truncation with no indication more exists |

---

## 13. Today

*(Full hierarchy specified in §9 — this section covers interaction/visual detail not already stated there.)*
- **Timeline:** not used in V1 (no time-blocked visual timeline until V2 Study Sessions exist, **→ PRODUCT** §19/§21) — Today is a grouped list, not a timeline, in V1.
- **Task blocks:** n/a in V1 for the same reason.
- **Deadlines:** rendered per §10's Deadline Card, mobile-density variant, within their respective sections (§9).
- **Completion:** leading checkbox on every row (§7); tapping it triggers an optimistic strike-through + fade transition (200ms) before the row leaves the list — long enough to register the action, short enough not to feel sluggish.
- **Rescheduling:** V2 (Study Sessions) — in V1, "rescheduling" a Deadline is simply editing its due date via the detail view, not a Today-specific interaction.
- **Workload indicators:** per §9 item 6 — a single compact horizontal bar, V1.5 only.
- **Timeboxing:** V2, deferred with Study Sessions.

---

## 14. Exams

- **Countdown:** rendered prominently in the exam's detail view — large tabular-nums figure ("12 days"), not buried in metadata text.
- **Exam cards:** identical structural treatment to the standard Deadline Card (§10) with `type = exam` — the countdown additionally appears inline on the card itself (replacing the generic "due date" text with a countdown when `type = exam`, since "prepare for" framing matters more than a bare date for this type — **→ PRODUCT** §9).
- **Detail screen:** countdown → subject/date/time/location → notes → (V2) topics checklist → (V2) revision-session list.
- **Topics (V2):** rendered using the same Subtask component (§22) already used for regular Deadlines — no new component invented for this.
- **Revision plan / study sessions (V2):** rendered as a list of suggested/scheduled blocks beneath the topics — visually consistent with how Smart Planning output renders on any other Deadline (§11's "More details" pattern extended).

---

## 15. Subjects

- **Subject cards (V1):** a compact tile — color swatch, name, open-deadline count. Grid layout on the Subjects screen (2 columns mobile, 3–4 desktop).
- **Colors:** user-assigned from a fixed, accessible palette (8–10 pre-selected hues tuned for sufficient contrast against `bg-base` and against each other when adjacent — not a full color-picker in V1, to avoid a student accidentally choosing two near-identical colors for different subjects, which would defeat the entire wayfinding purpose of §2's MyStudyLife-derived principle).
- **Icons:** none in V1 (**→ PRODUCT** §8) — color + name text only.
- **Statistics (V1.5):** open/completed count and next-upcoming-deadline date, shown on the subject detail screen, not the compact tile.
- **Subject detail:** header (color + name + archive action) → filtered Deadlines list (reuses the standard DeadlineList component, §22) → (V1.5) stats block.

---

## 16. Search *(V1.5)*

- **Search field:** appears from the Deadlines top-bar icon (§7/§8); on mobile, expands into a full-width overlay with an auto-focused input; on desktop, can also be triggered via the command palette.
- **Search results:** rendered using the standard Deadline Card/row component (§10) — search never invents a separate result-item design.
- **Filtering:** search results respect any currently-active quick filters (**→ PRODUCT** §22) rather than searching the entire unfiltered dataset silently.
- **Keyboard interaction (desktop):** arrow keys move selection through results, `Enter` opens the selected item, `Esc` closes search.
- **Command palette:** search is one mode within the broader ⌘K palette (§8), which also handles navigation and quick-add — visually unified as a single overlay with mode-appropriate result rendering.
- **Recent searches:** shown as the default state of the search overlay before any query is typed (V1.5, simple — last 5 queries, no ranking complexity).

---

## 17. Empty States

Each uses a single small icon (32px, §3), one line of primary text, one line of secondary guidance text, and — where relevant — a single primary action button. No illustration/mascot artwork (§1).

| Screen | Message | Action |
|---|---|---|
| Today (nothing due/at-risk) | "Nothing urgent today" | (none required — a calm confirmation, not a call to action) |
| Deadlines (no deadlines yet) | "No deadlines yet" | "Add your first deadline" → opens quick capture |
| Calendar (empty period) | "Nothing scheduled this week" | (none — neutral, not an error) |
| Exams (no exams — filtered Deadlines view) | "No exams on the calendar" | "Add an exam" → opens add-deadline pre-set to `type = exam` |
| Subjects (no subjects yet) | "Add your first subject to get started" | "Add subject" → required before any Deadline can leave Inbox (**→ PRODUCT** §6/§26 flow 1) |
| Inbox (empty) | "Inbox is clear" | (none — a positive state, framed as achievement not absence) |
| Analytics (V1.5, no data yet) | "Insights appear once you've completed a few deadlines" | (none) |

---

## 18. Loading States

- **Skeletons, not spinners,** for any list/card content (Today, Deadlines, Calendar) — gray `bg-surface`-toned placeholder shapes matching the real component's geometry, never a generic centered spinner for content that has a known shape.
- **Optimistic updates:** every mutation (create, edit, complete, reorder) updates the UI immediately, before server confirmation; on failure, the change reverts with a brief, specific error (§19) rather than silently staying wrong.
- **Progressive rendering:** Today and Deadlines render whatever's already cached locally (**→ PRODUCT** §25) instantly, then reconcile with server data as it arrives — never a blank screen while waiting on network, even on a fresh cold load if any cache exists.
- **Avoided:** spinners on button presses for fast actions (complete, snooze) — these are optimistic and instant; a spinner is reserved only for actions with a genuinely unpredictable duration (e.g., the initial app load before any cache exists).

---

## 19. Error States

- **Validation errors:** inline, field-level, red text directly beneath the offending field (§11) — never a toast or a top-of-form summary for form validation specifically.
- **Network errors:** a non-blocking toast ("Couldn't reach the server — showing your last saved data") — the app remains fully usable against cached data (**→ PRODUCT** §25), never a full-screen error blocking the whole UI.
- **Save failures:** the specific item that failed to save is visually flagged (a small warning icon on that row/card) with a tap-to-retry action — never a generic "something went wrong" with no path forward.
- **Offline state:** a persistent, quiet indicator (a small dot + "Offline" label in the top bar, not a disruptive banner) — visible whenever the app is offline, disappears the moment connectivity returns, with a brief "Synced" confirmation (§18) when queued changes finish syncing.
- **Notification failures:** not surfaced as an error to the user directly (a failed push notification is often undetectable client-side, per research §10) — instead, this is precisely why the in-app Today surface is the guaranteed fallback (**→ PRODUCT** §16/§20); no error UI is designed around notification delivery specifically, by design.

---

## 20. Interaction Design

| State | Treatment |
|---|---|
| Hover (desktop only) | `border-hover` + subtle 4% white background overlay; 120ms transition |
| Focus (keyboard) | A visible 2px `accent`-colored outline, offset 2px from the element — never removed/suppressed, on any interactive element including custom components |
| Pressed | Background darkens slightly (8% black overlay) + scale(0.98), 80ms — a tactile, immediate response on tap |
| Active/selected | `accent-subtle` background + `accent` text/icon (matches nav active state, §7/§8) |
| Disabled | 40% opacity (§3), pointer-events removed, no hover/pressed states apply |
| Drag (Week calendar reschedule, V1.5) | Dragged item lifts with the modal shadow token (§3) and 1.02 scale; drop targets highlight with `accent-subtle` background while dragging over them |
| Swipe (mobile list rows, §7) | Reveals the equivalent action's icon/color as the row translates; always has a non-swipe equivalent control visible on the row at rest |
| Keyboard (desktop) | Every interactive element reachable via Tab in a logical order; shortcuts per §8 |

**Animation principles:** every animation exists to communicate a state change (item completing, sheet opening, sync finishing) — never purely decorative. Durations stay short (80–250ms) and use standard ease-out curves; nothing loops or draws attention to itself outside of an active loading state. **Reduced motion:** when the OS-level reduced-motion preference is set, all transform/scale animations are replaced with simple opacity crossfades, and the drag-lift/scale effects above are disabled (§21).

---

## 21. Accessibility

- **Contrast:** all text/background pairs verified against WCAG AA (4.5:1 normal text, 3:1 large text) — the dark palette in §3 must be checked against real contrast tooling before implementation is considered complete, not approved by eye; this is a specifically named risk given the near-black/accent-blue combination (research §22's direct warning about dark-theme contrast risk).
- **Keyboard navigation:** full app operable without a mouse/touch — every flow in **→ PRODUCT** §26 must be completable via keyboard alone on desktop.
- **Focus management:** modals and bottom sheets trap focus while open and restore it to the triggering element on close (via Radix primitives at the implementation layer, **→ TECH**).
- **Modal accessibility:** proper `role="dialog"`, labelled by its heading, `Esc` closes, focus starts on the first field.
- **Screen reader behavior:** risk badges and priority chips always have a text alternative equal to their visible label (never an icon-only `aria-hidden` state) — directly enforcing the "never color alone" rule (§5) for assistive technology, not just sighted color-blind users.
- **Reduced motion:** per §20's animation principles — respected via `prefers-reduced-motion`.
- **Touch target sizes:** minimum 44×44px on any mobile interactive element (§3), even where the visual icon is smaller — hit area extends beyond the icon's visual bounds where needed.
- **Semantic structure:** proper heading hierarchy per screen (one H1 per page title, §4), list semantics (`<ul>`/`<li>` or ARIA-list-role equivalents) for Deadline lists, not generic `<div>` soup.
- **Drag-and-drop (Week calendar reschedule, V1.5):** per WCAG 2.2's Dragging Movements criterion (research §22), every drag-to-reschedule interaction has a single-pointer/keyboard alternative — specifically, opening the Deadline's detail view and editing the date field directly always works as a full substitute for dragging, satisfying compliance without requiring a parallel "click to move" micro-interaction to be separately designed.

---

## 22. Component Inventory

| Component | Purpose | Variants | States | Responsive behavior | Key interactions |
|---|---|---|---|---|---|
| **Button** | Primary/secondary/tertiary actions | primary, secondary, ghost, destructive | default, hover, pressed, disabled, loading | 44px mobile / 36px desktop height | See §20 |
| **Input** | Text entry | default, with-icon, error | default, focus, error, disabled | 48px mobile / 40px desktop | Inline validation on blur |
| **Select** | Single-choice from a fixed list (e.g., `type`) | default | default, open, disabled | Native on mobile (system picker), custom on desktop | — |
| **Combobox** | Searchable single choice (e.g., Subject picker once many subjects exist) | default | default, open, filtering, empty-result | Full-width sheet on mobile, inline dropdown desktop | Type-to-filter |
| **DatePicker** | Due date entry | default | default, open, error | Native on mobile where possible, custom calendar popover desktop | — |
| **TimePicker** | Optional due time entry | default | default, open | Native on mobile | — |
| **Dialog** (modal) | Desktop add/edit deadline, confirmations | default | open/closed | Not used < 1024px (bottom sheet instead, §11) | Traps focus, `Esc` closes (§21) |
| **BottomSheet** | Mobile add/edit deadline, quick capture | partial-height, full-height | collapsed, expanding, expanded | Mobile-only pattern | Drag handle to expand/dismiss, swipe-down to close |
| **DeadlineCard / DeadlineRow** | Represents one Deadline | card (Today), row (Deadlines list, dense) | default, completing (transition), overdue, offline-pending | Field visibility per §10's table | Tap opens detail, swipe/checkbox completes |
| **DeadlineList** | Renders a filtered collection of Deadlines | grouped (Today's sections), flat (Deadlines list) | loading (skeleton), empty (§17), populated | Virtualized once list length is large (**→ TECH** §16 performance) | Scroll, pull-to-refresh (mobile) |
| **ProgressBar** | Visualizes `progress` (**→ PRODUCT** §11) | thin (card), full (detail) | 0–100%, indeterminate (not used — progress is always known) | — | — |
| **PrioritySelector** | Sets `priority` in the add/edit form | segmented control (4 options) | default, selected | — | Single-select |
| **RiskBadge** | Visualizes the computed risk tier | icon+label (card), expanded (detail, with reason text) | one per tier (§3/§5) | Icon-only fallback only at the tightest mobile width (§10) | Tap/hold reveals the one-line explanation if not already shown |
| **ReminderChip** | Represents one configured reminder | default, removable | default, editing | — | Tap to edit, × to remove |
| **Calendar** | Month/Week/Agenda rendering | month, week, agenda | loading, populated, empty-period | Per §6/§12 breakpoint behavior | Tap date/event, drag (V1.5 week) |
| **Timeline** | V2 only — single-day time-blocked view | — | — | — | *(deferred, not specified further here)* |
| **Stats** | Compact numeric display (Today's urgency overview, §9; Subject stats) | inline-cluster, tile | — | — | Tappable where it links to a filtered view |
| **SubjectCard** | Represents one Subject | tile | default, archived | Grid columns per breakpoint (§15) | Tap opens Subject detail |
| **ExamCard** | DeadlineCard variant for `type = exam` | — | inherits DeadlineCard states | — | Same as DeadlineCard, plus countdown emphasis |
| **Toast** | Non-blocking transient feedback | success, info, error | appearing, visible, dismissing | — | Auto-dismiss, swipe to dismiss (mobile) |
| **EmptyState** | Per §17 | one per screen listed in §17 | — | — | Optional single CTA |
| **CommandPalette** | Desktop ⌘K overlay (V1.5) | — | closed, open, searching | Desktop-only | Keyboard-navigable |
| **Search** | Search input + results (V1.5) | overlay (mobile), inline (desktop) | default, searching, results, empty-result | Per §16 | — |
| **FilterBar** | Quick filters on Deadlines list | chip-row | default, active-filter(s) applied | Horizontally scrollable on mobile | Tap to toggle |

---

## 23. Page Inventory

| Screen | Purpose | Layout | Key components | User actions | Loading / Empty / Error |
|---|---|---|---|---|---|
| **Onboarding** | First-run setup (**→ PRODUCT** §26 flow 1) | Single-column, step-by-step | Input, Button, PrioritySelector-style single-select for capacity presets | Create term, create subject, set capacity | No loading state needed (all local until final save); no empty state (this *is* the empty-state resolver) |
| **Today** | "What should I work on today" | Grouped sections (§9) | Stats, DeadlineList (grouped), DeadlineCard, ProgressBar (V1.5 workload) | Complete, snooze, tap-to-detail | Skeleton on cold load; empty state per §17; error toast on sync failure (§19) |
| **Calendar** | Spatial view of deadlines | Agenda/Month/Week toggle + list or grid | Calendar, DeadlineRow (Agenda) | Switch view, tap date/event, (V1.5) drag to reschedule | Skeleton; empty-period state (§17); error toast |
| **Deadlines** | Full filterable record | List + FilterBar (+ Search, V1.5) | DeadlineList (flat), FilterBar, Search | Filter, sort, tap-to-detail, quick-complete | Skeleton; empty state (§17); error toast |
| **Deadline Detail** | View/edit one Deadline | Single column, sectioned like the add form (§11) | Input, Select, DatePicker, PrioritySelector, ProgressBar, ReminderChip list, RiskBadge (expanded) | Edit any field, complete, delete, (V1.5) add subtasks | Skeleton on direct-link open; error toast on save failure |
| **Exam Detail** | ExamCard's detail view (**→ PRODUCT** §9) | Same structure as Deadline Detail + countdown emphasis | Stats (countdown), ExamCard fields, (V2) Subtask list for topics | Same as Deadline Detail + (V2) manage topics/revision sessions | Same pattern as Deadline Detail |
| **Inbox** | Quick-captured, untriaged items | Flat list | DeadlineRow (untriaged variant — visually distinct, §18) | Triage (assign subject+date), delete | Skeleton; empty state (§17, framed positively) |
| **Subjects** | Manage subjects | Grid of tiles | SubjectCard | Add subject, tap to open detail, archive | Skeleton; empty state (§17) |
| **Subject Detail** | One subject's deadlines + stats | Header + filtered DeadlineList | SubjectCard header, Stats (V1.5), DeadlineList | Edit subject, archive, tap-to-detail on its deadlines | Reuses Deadlines screen states |
| **Analytics** *(V1.5)* | Retrospective insight | Sectioned stat blocks | Stats, simple bar/line rendering | View only in V1.5 (no interactive drill-down yet) | Empty state (§17) until enough completed data exists |
| **Settings** | Account, terms, capacity, notifications | Sectioned list | Input, Select, toggle rows | Edit capacity, manage terms, notification category toggles (**→ PRODUCT** §24), data export | No loading/empty states meaningfully apply |

---

## 24. Design Rules

- Do not use a card for every element — rows are used wherever list density matters (Deadlines, Subject detail); cards are reserved for Today's grouped context and Subject tiles.
- Do not use gradients decoratively — the sole permitted use is the risk-tier scale accent described in §1, and even that is optional/subtle.
- Do not rely on color alone — every priority/risk indicator pairs color with icon and/or text (§5, §21) without exception.
- Preserve information density on desktop — desktop is not "mobile with more padding"; the Deadlines list specifically stays row-dense (§10) rather than inflating to card-per-item at wide widths.
- Simplify rather than shrink on mobile — Month calendar is hidden, not shrunk, at 320–375px (§6); the add-deadline form uses progressive disclosure, not a smaller font for the same amount of content (§11).
- Essential actions must remain discoverable — quick-complete is always a visible tap target, never swipe-only (§7); Save is always sticky/reachable in the add form regardless of scroll (§11).
- Maintain consistent spacing — the 4px grid (§3) is applied without ad-hoc exceptions.
- Use animation purposefully — every transition communicates a state change, per §20's animation principles; nothing is decorative-only.
- Never let risk and priority visually collide — they use different shapes (badge vs. chip) specifically so a card showing both High priority and At Risk doesn't read as one confused double-red blob (§5, §10).
- The offline/sync state is always visible when relevant, never hidden behind a settings screen (§19).

---

## 25. Screenshot Evolution *(provisional — see note at top of document)*

Since no screenshots were received, this section compares the **described initial concept** against the proposals in this document, rather than an actual pixel comparison. Re-run this section properly once screenshots are provided.

| Dimension | Described current concept | Proposed in this document | Reasoning |
|---|---|---|---|
| Hierarchy | A dashboard with "statistics," a calendar, and a creation modal described as parallel, undifferentiated concepts | A single primary screen (Today) with a strict content hierarchy (§9); other views are visually and functionally subordinate to it, not siblings competing for primacy | Avoids the "meaningless statistics cards" and dashboard-overload pattern research warns against (research §9 guidance) |
| Spacing | Unknown — flag for review once screenshots arrive | A strict 4px-based spacing system (§3) with generous whitespace favored over density on mobile (§1) | Premium feel requires deliberate spacing, not default framework spacing |
| Typography | Unknown — flag for review | A defined 8-role type scale using Inter with tabular numerals for all countdowns/stats (§4) | Prevents the "jittering countdown" and inconsistent hierarchy common in quickly-built dashboards |
| Calendar | Described as present but undifferentiated by view | Explicit Agenda-first mobile default, Month/Week/Day staged by version, each with defined density rules (§6, §12) | Matches research's strongest single UX finding (Structured's timeline-first pattern, research §11) while staying appropriately scoped for V1 |
| Creation flow | A single modal covering all fields at once (categories, subjects, priority, reminders, recurrence, notes) | Progressive disclosure, required-fields-first ordering, bottom sheet on mobile (§11) | Directly addresses the "too much setup" pain point pattern (research §5) |
| Navigation | Not described in detail | Explicit 4-item mobile bottom tab bar + FAB; persistent sidebar desktop (§7, §8) | Establishes IA discipline the original description doesn't specify |
| Risk visibility | Not present in the described concept at all (categories/subjects/priority/reminders/recurrence/notes/stats — no risk system mentioned) | A first-class, always-visible Risk Badge system (§3, §5, §10) | This is the product's core differentiator (**→ PRODUCT** §13/§18) — its absence from the original concept is expected, since the concept predates the research phase, not a flaw to critique |
| Progress | Not described | Explicit thin progress bar tied to subtasks/manual override (§10, **→ PRODUCT** §11) | Same reasoning as risk visibility above |
| Mobile UX | Unknown — flag for review once screenshots arrive, but a "dashboard + calendar + modal" description strongly suggests a desktop-first design later adapted down, which is the exact anti-pattern §1/§6 are written to prevent | Mobile-first from first principles per §1, §6, §7 | — |

---

## Decisions Made
- Single accent color (`#5B6EF5`), used sparingly — no neon/glow, per explicit instruction (§1).
- Inter as the sole typeface, with tabular numerals mandatory for all numeric displays (§4).
- Priority and Risk use visually distinct treatments (chip vs. badge) to prevent the two systems from visually merging (§5, §10).
- Bottom sheet (not modal) is the mandatory mobile pattern for add/edit deadline; modal is desktop-only (§11).
- No card-per-item on desktop Deadlines list — row density preserved (§10, §24).
- Backdrop blur reserved exclusively for the modal/sheet scrim — explicit anti-glassmorphism rule (§1, §3).

## Assumptions
- Inter is an acceptable default typeface pending any brand-specific typography decision the product owner may want to make later.
- The 8–10 hue Subject color palette (§15) is sufficient for a realistic V1 course load (4–8 subjects); a student with more subjects than available hues is an edge case to revisit, not a V1 blocker.
- A single "daily capacity" figure is sufficient input for the Workload indicator's visual design (§9/§13) — no per-day-of-week capacity UI in V1.

## Open Questions
- §11 and §25 need to be re-done against the actual screenshots once available — everything in those two sections is currently reasoned from the written concept description only.
- Whether the risk-tier color ramp (§3) needs adjustment once tested against real device displays and actual contrast auditing tooling (§21) — the values given are a starting point.
- Exact icon set/library to standardize on for the icon sizing system in §3 (a specific icon library choice is a **→ TECH** concern, but the sizing/usage rules here assume a consistent single-library icon set).

## Risks
- The Priority/Risk color overlap (both systems use amber/orange/red ranges out of a limited accessible palette) requires the icon+label pairing rule (§5, §21) to be followed without exception during implementation, or the two systems will become visually indistinguishable in practice despite the design intent.
- Dark-theme contrast (§21) is a named, research-flagged risk area — the specific hex values in §3 must be verified with real contrast-checking tools before sign-off, not approved by eye.
- Progressive disclosure in the add-deadline flow (§11) trades a small amount of desktop information density for mobile-first speed — if desktop power users push back on the extra taps to reach "More details," the collapse/expand default may need revisiting.

## Deferred Decisions
- Full Day/Timeline calendar view visual design (§6/§12/§19) — deferred to V2 alongside the Study Session entity it depends on.
- Command palette (§8/§16) detailed interaction design — specified at a principle level only, pending V1.5 scoping.
- Exact empty-state and loading-state copy voice (playful vs. neutral) — the tone shown in §17's example copy is a placeholder direction, not final copywriting.
