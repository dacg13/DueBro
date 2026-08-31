# Student Deadline Tracker — Product Research Report

*Research phase only — no implementation. Compiled from live web research (official product pages, help docs, G2/Capterra/Product Hunt reviews, GitHub, and review-aggregator sites) as of August 30, 2026. Pricing and feature claims are dated snapshots — verify against official pages before building.*

**A note on the attached screenshots:** none actually came through in this conversation (only the text prompt arrived). Section 23 is structured and ready, but needs the images to be useful — re-attach them and I'll fill it in.

---

## 1. Executive Summary

The student-deadline-tracking market has three distinct archetypes, and none of them fully solves the problem:

1. **Generic task managers retrofitted for students** — Todoist, TickTick, Notion, Microsoft To Do, Google Tasks. Powerful, well-funded, well-designed, but academically blind: no concept of a subject, a term, a rotating timetable, or exam weighting.
2. **Dedicated student planners** — MyStudyLife, Coursicle, myHomework, PowerPlanner, StuFocus. Academically aware but shallow: manual data entry (except Coursicle), dated interfaces, and — in MyStudyLife's case, the category leader — real signs of decline (recent redesign introduced crashes and reported data loss, and previously-free features moved behind a paywall; see §5).
3. **Premium AI-scheduling tools** — Motion, Reclaim.ai, Sunsama, Akiflow. The most technically advanced *deadline intelligence* (auto-scheduling, workload defense, risk-aware calendars) anywhere in this research — but priced for professionals ($15–45/month), built for knowledge-worker calendars full of meetings, and not designed around subjects, terms, or academic deadline clustering.

**The gap is specific and defensible:** nobody combines (a) genuine academic structure — subjects, terms, deadline types, rotating timetables — with (b) transparent, trustworthy deadline-risk intelligence (not a black box), (c) a premium mobile-first interface that doesn't look like a school worksheet, and (d) reminders that are honest about their own reliability limits (a real, unresolved, industry-wide problem — see §10).

**Recommendation in one sentence:** position this as a focused *deadline intelligence* product, not a full planner, LMS replacement, or Notion-style workspace. The smallest version that is genuinely useful beats the biggest version that is generically impressive — see §20's MVP cut.

---

## 2. Research Methodology

Research combined:
- Official product pages and pricing pages (Todoist, Reclaim.ai, MyStudyLife, Structured, Super Productivity, Vikunja).
- Review aggregators (Capterra, G2, GetApp, Product Hunt, SoftwareAdvice) for feature confirmation and verbatim-adjacent user sentiment.
- Independent review/comparison blogs, cross-checked across 2–4 sources per claim where a single source looked promotional.
- GitHub (topic pages, repo descriptions, and direct API queries where rate limits allowed) for open-source architecture references.
- Current (2026) technical comparison articles for the stack-decision sections.

**A methodological limitation worth stating plainly:** targeted `site:reddit.com` queries did not reliably surface raw Reddit threads through this research pipeline — the search layer consistently preferred aggregator/blog content over raw forum posts. Where the brief asked for "Reddit sentiment," this report relies on secondary sources that explicitly aggregate and quote App Store, Play Store, G2, and Product Hunt reviews (which is where most of the concrete complaint evidence below comes from), rather than raw subreddit threads. This is disclosed rather than papered over — treat community-sentiment claims below as *directionally reliable, not exhaustive*.

Throughout, claims are labeled:
- **FACT** — confirmed on an official page or a primary source.
- **USER FEEDBACK** — a pattern from reviews/ratings, paraphrased, never quoted at length (copyright discipline).
- **INFERENCE** — a reasonable read of the evidence, not directly stated by any source.
- **RECOMMENDATION** — this report's judgment call for your product.

---

## 3. Market Overview

| Segment | Representative products | Strength | Structural weakness for students |
|---|---|---|---|
| Generic task managers | Todoist, TickTick, Notion, MS To Do, Google Tasks | Mature, cheap/free, huge ecosystems | No subject/term/course model; calendar and tasks are often separate concepts |
| Dedicated student planners | MyStudyLife, Coursicle, myHomework, PowerPlanner | Academic structure built in | Mostly manual entry, dated UI, shallow "intelligence" (reminders only) |
| Premium AI scheduling | Motion, Reclaim.ai, Sunsama, Akiflow | Real workload/deadline logic | $15–45/mo, meeting-centric, not academically structured |
| Open-source self-hosted | Vikunja, Super Productivity, AppFlowy | Data ownership, no lock-in | Zero academic awareness; requires self-hosting know-how |

**FACT:** MyStudyLife advertises itself as trusted by "over 24 million students in 197 countries" on its App Store listing — it is the closest thing to an incumbent category leader for dedicated student planning.
**INFERENCE:** that incumbent is currently vulnerable. A 2025–2026 acquisition and redesign introduced stability problems and moved previously-free features behind a subscription, and multiple independent sources report crashes and even lost semester data after updates (detailed in §5). That is a genuine trust/timing opportunity, not a permanently defensible moat — MyStudyLife could stabilize at any point.
**FACT:** the AI-scheduling category has matured fast in 2025–2026: Reclaim.ai was acquired by Dropbox (2024) and now runs as "Reclaim.ai from Dropbox"; Motion expanded from a scheduler into an "AI SuperApp" with AI Employees and meeting notes; both moves drew mixed reactions from users who liked the original, narrower product better.

---

## 4. Competitor Analysis

### 4.1 Todoist (Doist)
- **Core purpose / audience (FACT):** general-purpose task manager, 30M+ users since 2007, used across personal, freelance, and light team contexts.
- **Pricing (FACT, Aug 2026 snapshot):** Free "Beginner" tier (5 active projects, no reminders, 3 filter views); Pro ~$5/mo annual ($60/yr) or $7/mo; Business ~$8/user/mo annual. Prices rose 25–40% in December 2025, which drew visible backlash.
- **Deadline/reminder handling (FACT):** reminders are a **Pro-only** feature — the free tier has none. This is one of the most-repeated complaints about Todoist across review sites.
- **Recurrence (FACT):** natural-language recurring dates ("every 2 weeks", "every weekday").
- **Student fit (INFERENCE):** reviewers explicitly note "families and students often find the Beginner plan adequate until they need more advanced reminders" — i.e., Todoist itself is positioned as *not quite enough* for students without paying.
- **Notable weakness (USER FEEDBACK):** intermittent, unexplained failures of desktop due-date notifications have been reported by long-time users (independent of the AI feature additions) — a reliability complaint, not a missing-feature complaint.
- **AI features (FACT):** "Ramble" — voice-to-task AI capture — and an AI assistant, added alongside the Dec-2025 price rise.

### 4.2 TickTick
- **Core purpose (FACT):** to-do list + calendar + Pomodoro timer + habit tracker bundled into one app.
- **Pricing (FACT):** Free tier is unusually generous (calendar view, Pomodoro, up to 5 habits); Premium ~$2.99–3.99/mo ($35.99/yr).
- **Strengths (USER FEEDBACK):** consistently rated as the best *value* bundle in the category — reviewers repeatedly note it includes things (calendar, Pomodoro, habits, Eisenhower matrix) that Todoist charges for or omits.
- **Weakness (USER FEEDBACK):** interface described as "dated," "cluttered," with "many buttons, many options, many menus" compared to cleaner competitors — a direct opening for a cleaner, premium-feeling product.
- **Student relevance:** free-tier limits (9 lists, 99 tasks/list) are workable for a single term but tight for a multi-subject, multi-semester history.

### 4.3 MyStudyLife — the incumbent student planner
- **Core purpose (FACT):** dedicated student planner: rotating timetables, homework, exams, grades, revision reminders.
- **Reach (FACT):** claims 24M+ users across 197 countries.
- **Strongest feature (FACT, corroborated across multiple reviews):** best-in-class support for rotating/complex timetables (Day A/B, Week 1/2) — no competitor in this research matched it.
- **2025–2026 changes (FACT, per a July 2026 independent comparison article):**
  - Acquired by a new (not widely publicized) owner; redesign shipped new features (AI "Schedule Scan" from a photo, "Xtra" for non-academic events, "Family Connect" for parents) alongside real instability.
  - **USER FEEDBACK, aggregated from App Store reviews:** "the app used to be reliable, but recent updates have made it unstable and harder to use"; some users report losing an entire semester's assignments/classes after an update.
  - Feature paywalling increased: task-type tagging (essay/group project/reading/etc.), grade tracking, widgets, dark mode, and the AI schedule scan are now MyStudyLife+ only ($4.99/mo or $29.99/yr).
  - **No LMS sync of any kind** (Canvas, Blackboard, Moodle) — every assignment is entered by hand. This is the single most-cited structural gap against it.
- **Recommendation-relevant read (INFERENCE):** MyStudyLife's rotating-timetable engine and its multi-type task model (assignment/revision/reading/etc.) are worth studying as *prior art*, but its reliability and trust problems are exactly what this product should differentiate on.

### 4.4 Coursicle
- **Core purpose (FACT):** college-focused planner whose headline feature is **LMS auto-sync** — Canvas, Google Classroom, Brightspace, Blackboard, Moodle, and Sakai — pulling assignments, quizzes, and due dates automatically.
- **Reach (FACT):** 2M+ users (App Store listing).
- **Rating signal (FACT):** 3.4/5 on 22 App Store ratings at time of research — a small, mixed sample, worth treating cautiously rather than as strong validation.
- **Significance:** this is the *only* product found in this research that has solved LMS ingestion at all. That makes it the most important single competitive reference for the "killer feature" analysis in §13 — and also shows the LMS-sync lane is real but thinly served (one small-scale player, US-college-centric).

### 4.5 myHomework / PowerPlanner
- **myHomework (FACT):** 6M+ users, simple planner, Premium is $4.99/**year** (far cheaper than MyStudyLife+'s $29.99/yr) but has no rotating-timetable support.
- **PowerPlanner (FACT):** standout feature is a "What If?" grade calculator; one-time $1.99 purchase, no subscription; supports rotating timetables.
- **Takeaway (INFERENCE):** both validate that students respond well to low/one-time pricing over subscriptions — a pricing-model signal worth weighing in §14.

### 4.6 Structured (iOS/Apple-only)
- **Core purpose (FACT):** visual timeline day planner — every task/event/habit rendered as a colored block on a single-day timeline, not a list.
- **Traction (FACT):** 400,000+ five-star ratings, 1.5M active users (App Store listing).
- **Positioning (FACT):** explicitly markets itself to "ADHD minds, busy professionals, and **students**."
- **Pricing (FACT):** free core app; Pro ~$27.99/yr (one-time-feeling annual price, cheap relative to the AI-scheduling category).
- **Weakness (USER FEEDBACK):** Apple-only (no Android/Windows); iCloud sync "often falters"; Android/web versions (where they exist) "lag far behind iOS"; not built for complex projects or teamwork.
- **Design takeaway (INFERENCE):** the *timeline-as-primary-view* pattern (rather than list-as-primary-view) is the most consistently praised UX idea in this whole competitor set — "most planners give you a blank page; Structured gives you a timeline." Directly relevant to your calendar-view design (§11).

### 4.7 Motion
- **Core purpose (FACT):** AI auto-scheduling — you add tasks with deadlines/priorities, Motion places them on your calendar automatically using "1,000+ parameters," and re-optimizes when meetings or priorities shift.
- **Pricing (FACT):** no free tier; $19–29/mo individual (annual/monthly), 7-day trial requiring a card upfront.
- **Strengths (USER FEEDBACK):** genuinely different from list-based planning; users who commit to it describe real behavior change.
- **Weaknesses (USER FEEDBACK, consistent across many independent reviews):**
  - Mandatory card-on-file trial and reports of being charged early are a recurring trust complaint.
  - Mobile apps described as "slow" and "buggy" by multiple reviewers — a mature product still losing on mobile.
  - "The AI sometimes makes strange choices" and creates "correction work" — full automation isn't free of cognitive overhead.
  - Schedules by deadline/availability only, with **no energy-awareness** — it will place hard cognitive work in an afternoon slump if that's the only free slot.
  - "Feature bloat" complaints since expanding into "AI Employees" / meeting notes / docs.
- **Relevance:** Motion is the most advanced deadline-*scheduling* engine researched, and its own user base is telling us exactly where full automation breaks trust — a direct input to the "explainable, not opaque" recommendation in §9 and §13.

### 4.8 Sunsama
- **Core purpose (FACT):** a *manual*, ritual-based daily planner — explicitly **not** AI-automated. You drag tasks onto your calendar yourself; the product's value is the structured daily/weekly review ritual, workload warnings, and a calm interface.
- **Pricing (FACT):** ~$20/mo ($17/mo annual), no free tier, 14-day trial.
- **Strengths (USER FEEDBACK):** calm, minimalist, praised for "workload warnings" that confront over-commitment honestly rather than silently letting you overbook.
- **Weaknesses (USER FEEDBACK):** price is the most common complaint ("at least 3x from where it would be worth its price"); mobile app is execution-only, not built for planning; no habit tracking, limited subtasks; slow feature velocity from a deliberately small team.
- **Relevance:** Sunsama is the strongest evidence in this research that **manual, transparent planning with honest workload warnings** is a viable, well-loved alternative to full AI automation — directly supports the "explainable risk, not black-box AI" positioning.

### 4.9 Reclaim.ai (from Dropbox)
- **Core purpose (FACT):** AI calendar defense — Focus Time, Habits, Tasks, Smart Meetings, and Scheduling Links, all auto-placed and defended against conflicts.
- **Pricing (FACT):** genuinely free "Lite" tier (5 AI agents, 1 calendar sync, unlimited tasks); Starter ~$10/user/mo (2026 pricing varies by source, $8–10 range); Business ~$15/user/mo. **Reclaim explicitly lists a Student Discount on its pricing page** — a strong signal that students are already a recognized buyer segment for this category.
- **Standout mechanism (FACT):** "Tasks" in Reclaim aren't checkboxes — the AI breaks a task into chunks and auto-schedules flexible blocks before its due date, rescheduling automatically around conflicts. This is the closest prior art to a genuine "deadline → study time" auto-scheduler.
- **Habits (FACT):** flexible recurring holds that "flex" around the calendar instead of rigidly blocking it — a pattern worth adapting for recurring academic commitments (weekly readings, lab prep) rather than hard-locking them.
- **Relevance:** the free tier + student discount + task-defense mechanic make Reclaim the single most directly comparable *mechanism* reference for a deadline-intelligence feature, even though it isn't student-specific in its UI.

### 4.10 Akiflow
- **Core purpose (FACT):** unified task inbox (pulls from 50+ tools) plus manual drag-and-drop time blocking; "AKI" is an optional AI layer on top.
- **Pricing (FACT):** ~$15–34/mo depending on plan/source, no free tier, card required for a 7-day trial.
- **Weakness (FACT):** no native subtask support; no time component on deadlines (a "very basic feature" one reviewer flags as missing); manual scheduling by default (AKI is additive, not the default experience).
- **Relevance:** confirms the pattern that the entire premium AI-scheduling tier is priced and structured for professionals with 5+ tools to consolidate — not a fit for a student's simpler, subject-centric world, and a validation that "unified inbox across many tools" is not the problem students actually have.

### 4.11 Amazing Marvin
- **Core purpose (FACT):** task manager built around behavioral psychology and procrastination, with 100+ toggleable "strategies" instead of one fixed workflow.
- **Pricing (FACT):** no free plan; ~$8–12/mo, 14-day trial, 50% student discount noted by one source.
- **Strength (USER FEEDBACK):** the only mainstream tool in this research explicitly designed *for* ADHD/executive-dysfunction workflows rather than around them.
- **Weakness (USER FEEDBACK):** the flexibility is also the complaint — "you spend your first week building a to-do app instead of using one." No collaboration, no built-in AI, dated aesthetic.
- **Relevance:** a clear example of a feature that sounds powerful (deep customization) but creates real onboarding friction — a direct input to §13's "avoid" list.

### 4.12 Notion (+ Notion Calendar)
- **Core purpose (FACT):** flexible databases (list/board/gallery/calendar/timeline views) that can be configured into a task/calendar system; Notion Calendar (from the 2023 Cron acquisition) is a separate, free calendar app that links to Notion databases.
- **Strength (USER FEEDBACK):** enormous flexibility, strong for people willing to build their own system.
- **Weakness (USER FEEDBACK, very consistent across dozens of G2/Capterra reviews):** "too hard to use," "overwhelming," database/relation learning curve, mobile experience repeatedly called out as weak, offline mode historically absent/limited.
- **Relevance:** the strongest cautionary tale in this whole research set for *flexibility as a liability* — a "build it yourself" database tool is the opposite of what most students, under deadline pressure, want to configure.

### 4.13 Everyday-default tools: Google Tasks, Microsoft To Do, Any.do, Things 3, Apple Reminders
- **Google Tasks (FACT):** deliberately minimal — lists, subtasks, due dates; tasks with dates auto-appear on Google Calendar; one-click task creation from Gmail. Free, no academic structure.
- **Microsoft To Do (FACT):** similarly minimal; standout is "My Day," a manually-curated daily focus list; Outlook flagged-email-to-task integration. Free.
- **Any.do (FACT):** positioned as the design middle ground between Microsoft To Do's simplicity and Todoist's structure; calendar view showing tasks+events together is its most-requested-elsewhere feature already built in. Premium ~$4.99/mo.
- **Things 3 (FACT):** Apple-only, one-time purchase per platform, widely regarded as the most beautifully designed task app in the category — and explicitly cited as *the* aesthetic bar competitors are measured against.
- **Relevance:** these are the "already installed, free, good enough" baseline your product is really competing with for a first-time user's attention — not Motion or Sunsama. Things 3's reputation is the clearest signal that **visual design quality alone is a legitimate competitive weapon** in this category, not just a nice-to-have.

---

## 5. User Pain Points — "what are existing products still failing to solve?"

Patterns that recur across independent sources (Capterra/G2/App Store reviews, Product Hunt, and dedicated comparison articles):

| Pain point | Where it shows up | Type |
|---|---|---|
| **No reliable LMS ingestion** | Every student-planner reviewed except Coursicle requires manual entry of every assignment | FACT/gap |
| **Reminder reliability itself is unreliable** | Todoist desktop notifications silently breaking for some users; MyStudyLife reminders "less reliable in recent versions" | USER FEEDBACK |
| **Notification/feature overwhelm** | Notion "too hard to use," Amazing Marvin's "100+ strategies" learning curve, TickTick called "cluttered" | USER FEEDBACK |
| **Mobile is the weak link, even for mobile-positioned apps** | Motion's mobile apps called "slow and buggy"; Structured's Android/web "lag far behind iOS"; Notion mobile repeatedly flagged; Sunsama mobile is execution-only | USER FEEDBACK |
| **Price backlash / trust erosion from pricing changes** | Todoist's Dec-2025 price hike (25–40%) drew visible backlash; MyStudyLife's paywall creep on previously-free features called a "bait-and-switch" | USER FEEDBACK |
| **Data loss / instability during redesigns** | MyStudyLife: reported crashes and lost semester data after its 2025–2026 redesign | USER FEEDBACK |
| **No deadline-clustering visibility** | Not one competitor in this research surfaces "you have 3 things due this week across different subjects" as a first-class warning — Sunsama's workload warning is the closest, and it's generic, not subject-aware | INFERENCE (absence, cross-checked across all 12 profiles above) |
| **Full-automation trust gap** | Motion: "AI sometimes makes strange choices," creates "correction work," "no energy awareness" | USER FEEDBACK |
| **Card-required trials** | Motion and Akiflow both require a card upfront for trials, and Motion users specifically report being charged early | USER FEEDBACK |
| **Procrastination / workload-blindness** | Amazing Marvin and Structured explicitly market to procrastination/ADHD audiences, implying mainstream tools don't address it | INFERENCE |

**RECOMMENDATION:** the deadline-clustering gap and the reminder-reliability gap are the two most defensible, least-contested openings — nobody has both, and one of them (reminders) is a genuine platform-level technical problem (§10) rather than just a product-design miss, meaning a competitor can't casually copy a fix.

---

## 6. Student Workflow Research

What makes student productivity structurally different from generic task management:

1. **Everything hangs off a subject/course, inside a bounded term.** A generic task app has "projects"; a student's mental model is "CS301 has 4 assignments, 1 midterm, and weekly labs, running Aug–Dec." Deadlines without a subject/term container lose the context that makes them plannable.
2. **Rotating timetables are common and generic calendar apps don't model them.** MyStudyLife's Day A/B / Week 1/2 support is the single most-praised feature in this research precisely because Google Calendar and most task apps have no concept of "this class meets on cycle day, not calendar weekday."
3. **Deadline *types* carry different planning needs, but shouldn't be different data models.** Assignments, exams, quizzes, presentations, labs, and readings all need slightly different fields (an exam needs a location/duration; a reading needs no submission mechanism) but should stay one underlying entity — MyStudyLife's own "7 task types" model is useful prior art (see §17's data-model recommendation to *not* fragment this into separate tables).
4. **Exam/deadline clustering is the actual crisis moment**, not any single deadline. Midterms and finals cluster by design (universities schedule them in windows), and no competitor surfaces this clustering as a first-class signal.
5. **Revision/study time is fundamentally different from "do the assignment."** It's not a discrete task with a single due date; it's recurring, has diminishing/uncertain effort, and needs to be scheduled *before* an exam, not completed *by* one. MyStudyLife's new "Scout" AI coach ("turns exams into revision plans") is the clearest signal in this research that this is now a recognized product surface, not a niche idea.
6. **Grade/GPA tracking is adjacent, not core.** PowerPlanner's "What If?" calculator and MyStudyLife's grade tracking are popular, but they're a different job-to-be-done (predicting outcomes) than deadline tracking (managing time). Treat as a V2+ feature, not core.

---

## 7. Feature Inventory

Legend for **Difficulty**: S = small, M = medium, L = large. **Value**: strategic value to this specific product's differentiation, not general usefulness.

### CORE (V1 candidates)
| Feature | What it does | Who has it | Why students need it | Difficulty | Value |
|---|---|---|---|---|---|
| Deadline CRUD w/ type | Create/edit assignments, exams, quizzes, projects, labs, readings with due date+time | MyStudyLife, Coursicle, most | Base of the whole product | S | Essential |
| Subject/Course container | Group deadlines by subject, with color | MyStudyLife, Coursicle, myHomework | Matches actual mental model (§6) | S | Essential |
| Priority | High/med/low or similar | Nearly everyone | Basic triage | S | Essential |
| Calendar view (month/week/agenda) | See deadlines in time | All | Spatial overview | M | Essential |
| Multi-channel reminders (push+email) | Notify before due | All, imperfectly (§10) | Core value prop | M | Essential |
| Basic recurrence (RRULE-based) | Weekly readings, recurring labs | Todoist, TickTick, MyStudyLife | Recurring academic work is constant | M | Essential |
| Dashboard / "what's due soon" | At-a-glance triage | All | First-open utility | S | Essential |
| Mobile-first responsive PWA | Fast on phone | Structured (native), most others (web) | Stated requirement; students live on phones | M | Essential |

### IMPORTANT (V1.5)
| Feature | What it does | Who has it | Why it matters | Difficulty | V1? |
|---|---|---|---|---|---|
| Deadline clustering / workload heatmap | Flags weeks with overlapping deadlines | **Nobody** (gap) | Addresses the #1 unaddressed pain point (§5) | M | No — 1.5 |
| Subtasks/checklists | Break a project into steps | Todoist, TickTick, Structured | Common, low-risk | S | No — 1.5 |
| Explainable risk badge (rule-based) | "At risk" flag from days-left vs. effort vs. free time | Motion/Reclaim do this as a black box; nobody does it *transparently* | Trust-building differentiator (§9) | M | No — 1.5 |
| Snooze / escalating reminders | Reminder intensity increases as due date nears | Reclaim (habits), Sunsama (warnings) | Reduces missed deadlines without spamming | M | No — 1.5 |
| Search & filter | Find/filter across subjects, types, status | All mature tools | Needed once data volume grows | S | No — 1.5 |
| CSV/ICS import | Bulk-load a syllabus | Nobody does this well except Coursicle (LMS-native) | Cheap partial LMS-gap fix (§20) | S–M | No — 1.5 |
| Notes on deadlines | Free-text notes per item | MyStudyLife, most | Low-cost, expected | S | No — 1.5 |

### ADVANCED (V2)
| Feature | What it does | Who has it | Difficulty | V1? |
|---|---|---|---|---|
| LMS integration (Canvas/Google Classroom/etc.) | Auto-pull deadlines | Coursicle only | L | No |
| Rotating timetable engine | Day A/B, Week 1/2 class scheduling | MyStudyLife only (best-in-class) | L | No |
| Study-session time blocking | Schedule *when* you'll work, not just what's due | Reclaim (Tasks), Sunsama, Motion | M–L | No |
| Grade/GPA "what-if" tracking | Predict outcome of future scores | PowerPlanner, MyStudyLife+ | M | No |
| Group project / shared deadlines | Multiple students see the same deadline | Nobody in student-planner category; Sunsama/Akiflow have generic sharing | L | No |
| Desktop app / native wrapper | Beyond responsive web | Structured, Sunsama, Akiflow | M | No |

### NICHE
| Feature | Notes |
|---|---|
| Pomodoro/focus timer | Common (TickTick, Structured, Super Productivity) but not differentiating; cheap to add later |
| Habit tracker | TickTick, Reclaim; adjacent to deadlines, not core |
| Widgets (home screen) | Expected polish item, not urgent |
| Location-based reminders | Any.do has it; low relevance for deadline-type work |

### EXPERIMENTAL
| Feature | Notes |
|---|---|
| AI-suggested study scheduling (auto-placed study blocks) | Reclaim/Motion prior art exists; **do this only after** the rule-based risk model earns trust (§9) — jumping straight to automation is what damages trust in Motion's reviews |
| Voice quick-add | Todoist "Ramble," Structured AI dictation exist; nice-to-have, not urgent |
| Photo-to-timetable scan | MyStudyLife's "Schedule Scan" — clever but high OCR/error-handling cost for a V1 team |

### NOT WORTH BUILDING
| Feature | Why not |
|---|---|
| 100+ toggleable "strategies" (Amazing Marvin style) | Explicitly cited by its own users as a barrier to entry — "spend your first week building a to-do app" |
| Gamification / NFT rewards | Seen in several toy student apps (Strive, StudyHouse); no evidence found of retention value, reads as gimmicky |
| Full LMS replacement / course catalog / registration system | Massive scope creep outside deadline tracking |
| Mandatory card-on-file trial | Actively damages trust per Motion's own reviews — avoid the acquisition pattern, not just the product feature |
| Building a general-purpose Notion-style database engine | Notion's own reviews show flexibility-as-liability; don't chase feature parity with a tool this differs from by design |

---

## 8. Feature Prioritization — the smallest set that wins

**RECOMMENDATION:** ship *only* the CORE table in §7 for V1, plus exactly two IMPORTANT items pulled forward because they are cheap and directly address the biggest researched gap:
- **Deadline clustering view** (even a simple "3+ deadlines this week" banner) — because §5 found this gap uncontested across all 12 competitors profiled.
- **Explainable, rule-based risk badges** — because §5 and §7 both show this is where trust is won or lost, and a rule-based version (days left, effort estimate, free time) is materially cheaper than Motion/Reclaim's ML approach while addressing the exact complaint their users have about opacity.

Everything else in IMPORTANT and all of ADVANCED should wait. This is a deliberate rejection of "biggest possible V1" in favor of a version that is *sharper* than every competitor at exactly one thing — deadline risk, honestly explained — before it tries to be broad.

---

## 9. Deadline Intelligence Research

**FACT — how the best tools currently do it:**
- **Motion** auto-schedules using "1,000+ parameters" (deadlines, priorities, durations, availability) and continuously re-optimizes — powerful but opaque, and its own users report it "makes strange choices" and creates correction work.
- **Reclaim.ai** treats a "Task" as a negotiation with the calendar: it chunks larger tasks, schedules flexible defended blocks before the due date, and reschedules automatically around conflicts (Proactive vs. Reactive Focus-Time modes).
- **Sunsama** deliberately does *none* of this automatically — it surfaces a **workload warning** when a day is overcommitted and lets the human decide. This manual-but-informed approach is explicitly the product's identity, not a missing feature.
- **MyStudyLife's "Scout"** (2025–2026 addition) is the first *academically-framed* attempt at this: "turns exams into revision plans" from a single instruction.

**INFERENCE:** none of these expose the *reasoning* behind a schedule or a risk flag to the user in a simple, auditable way. That absence — not the underlying math — is what damages trust in Motion's reviews ("AI sometimes makes strange choices").

**RECOMMENDATION — a genuinely useful, non-gimmicky model for V1:**
Build a **rule-based, fully explainable** risk score per deadline, not a model:
- Inputs: days remaining, a student-entered (or default) effort estimate, completion/progress state, and how many *other* deadlines fall in the same 7-day window (the clustering signal from §5/§8).
- Output: a simple tier (On track / Getting tight / At risk) **with a one-line reason** ("3 other deadlines due this week" or "no progress logged with 2 days left").
- Explicitly *not* auto-scheduling study time in V1 — surface the risk, let the student decide what to do about it, the way Sunsama's workload warning does. Graduate to opt-in auto-suggested study blocks only in V3, once the risk model itself has earned trust (this sequencing directly avoids Motion's trust problem).

---

## 10. Reminder Research

**FACT — comparison of reminder architectures found in research:**
| Pattern | Who does it | Note |
|---|---|---|
| Single fixed reminder | Basic apps (free tiers) | Minimal, misses nuance |
| Multiple/relative reminders (e.g., 1 day + 1 hour before) | Todoist (Pro), TickTick, MyStudyLife | Standard for mature apps |
| Flexible/defended recurring reminders ("Habits") | Reclaim.ai | Reschedule around conflicts rather than firing at a fixed, possibly-buried time |
| Manual workload warning (not a reminder per se) | Sunsama | A "you're overcommitted" signal, not a per-task nudge |
| Notification-channel control (Slack/email routing, full opt-out) | Sunsama | Explicit anti-fatigue design |
| Auto-decline conflicting bookings | Reclaim.ai | Protects defended time automatically |

**A critical, under-discussed technical fact for a mobile-first product (FACT, cross-checked across 6 independent 2026 technical sources):**
**iOS Safari web push for PWAs is fundamentally constrained**, even in 2026:
- Push only works if the PWA has been added to the Home Screen — a browser tab cannot receive push at all.
- No silent/background push, no Background Sync API — a service worker cannot reliably wake and act in the background the way a native app can.
- Subscriptions can silently expire or get cancelled (e.g., if a push event doesn't result in a displayed notification, or after long inactivity/device restarts), with no reliable way to detect this from the client.
- In the EU specifically, iOS 17.4+ removed standalone PWA support under the Digital Markets Act — installed PWAs there can lose push entirely and revert to opening in a Safari tab.
- Android Chrome push, by contrast, is mature and reliable (~96%+ browser support, closer to native reliability).

**RECOMMENDATION:** do not build a reminder system that assumes push notifications are reliable — because for a meaningful share of iPhone users, on current evidence, they simply are not guaranteed to be. Concretely:
1. **Multi-channel by default**, not push-only: web push (Android/desktop, reliable) + email (guaranteed delivery channel, works regardless of platform) as parallel, not sequential, channels for anything time-sensitive.
2. **A visible in-app "what's due" surface** that doesn't depend on notifications at all — an unread/urgent counter the student is guaranteed to see the next time they open the app, as one source explicitly recommends as the fallback of record.
3. **Prompt for Home Screen installation before prompting for notification permission** on iOS — the reverse order fails silently.
4. Treat SMS as a possible V2+ paid/opt-in channel for exam-day-critical reminders, given how unreliable push specifically is on iOS.
5. Build **escalating reminders tied to the deadline-risk tiers from §9** (e.g., a routine reminder at "On track," a more insistent one at "At risk"), rather than fixed offsets for every deadline — this is a differentiator no competitor in this research does end-to-end.

---

## 11. Calendar Research

**FACT — view patterns across competitors:**
- **List-first with a calendar as secondary view:** Todoist, TickTick, MyStudyLife, Coursicle.
- **Timeline-first (the day as a single visual block sequence):** Structured — the most consistently praised UX pattern in this whole research set ("most planners give you a blank page; Structured gives you a timeline").
- **Calendar-as-primary, tasks integrated into it:** Sunsama, Reclaim, Motion, Akiflow — tasks and calendar events share one surface, not two.

**RECOMMENDATION:** for a *deadline* tracker specifically (not a full daily planner), **agenda/list-by-day within a lightweight calendar shell** is the right default — closer to MyStudyLife/Todoist's model than Structured's full timeline — because deadlines are mostly point-in-time due dates, not scheduled work blocks, in V1 (study-session time-blocking is deliberately deferred to V2 per §8). Reserve the Structured-style timeline pattern for the V2 study-session-blocking feature, where it will actually earn its complexity.

**Drag-and-drop compliance note (carries into §22):** any drag-to-reschedule interaction must ship a single-pointer/keyboard alternative to satisfy WCAG 2.2's Dragging Movements criterion (2.5.7) — detailed in §22, but it constrains calendar design from day one, not as an afterthought.

**RECOMMENDATION — build vs. library:** given the "premium, not generic" design goal, avoid dropping in FullCalendar's default styling wholesale (it is comprehensive but visually generic out of the box and a heavy dependency for a mobile-first PWA). A lighter path: a headless date/recurrence library (date-fns, plus an RRULE library — see §17) driving a custom-styled agenda/week view, with `react-big-calendar` kept in reserve as an unstyled fallback if a fully custom build proves too costly for V1 timelines.

---

## 12. Mobile UX Research

**FACT — current (2026) best-practice consensus:**
- **Touch targets:** minimum 24×24 CSS px is now a WCAG 2.2 Level AA requirement; platform guidance goes further — Apple HIG recommends 44×44pt, Google Material 48×48dp. **RECOMMENDATION:** design primary actions to the 44–48px standard and treat 24px strictly as an absolute floor, not a target.
- **Thumb zone:** research cited in multiple 2026 UX sources puts ~75% of mobile interactions as thumb-driven, with the bottom third of the screen the most reachable area and top corners the least. This should directly drive nav placement (bottom tab bar, not a top hamburger, for primary navigation).
- **Bottom tab bar:** the right pattern for 3–5 primary destinations that are switched between frequently — matches this product's Home/Calendar/Deadlines/Settings shape (§21).
- **FAB (Floating Action Button):** should be reserved for the *single* most important action on a screen — for this product, that's "add deadline." Bottom-right placement is the most common (right-handed default); center placement is a more left-hand-inclusive alternative worth A/B-testing later, not a launch blocker.
- **Bottom sheets:** the standard pattern for the "add/edit deadline" flow on mobile — research cited shows bottom sheets get meaningfully higher engagement than full modals because they feel less disruptive and are easier to dismiss. This directly supersedes a full-screen modal for quick-add.
- **Gestures must supplement, never replace, visible controls** — e.g., swipe-to-complete is fine only if a visible "mark done" control also exists; this is both a UX best practice and (via the drag-and-drop WCAG rule) a compliance requirement.

### Breakpoint-specific recommendations
| Width | Context | What changes |
|---|---|---|
| 320–375px | Small phones (SE-class) | Single column everything; bottom tab bar (4 items max, icons-only or icon+micro-label); FAB overlaps content intentionally; calendar defaults to agenda/day list, not a grid month view (a 7-column month grid is cramped and low-value at this width) |
| 390–430px | Modern phones (iPhone 14–16 class, large Android) | Same structure as above with more breathing room; month-grid calendar becomes viable as a secondary view, agenda remains default |
| 768px | Tablet portrait / small laptop | Introduce a two-pane layout becomes optional (list + detail side by side) rather than full-screen push navigation; bottom tab bar can start transitioning to a side rail |
| 1024px | Tablet landscape / small desktop | Persistent left sidebar nav replaces bottom tab bar; calendar can default to week/month grid; FAB can become a labeled "+ Add deadline" button in the sidebar or header instead of a floating circle (FABs are a mobile-native pattern, not a desktop one) |
| 1280–1440px | Standard desktop | Three-pane layouts become viable (nav / list / detail) as seen in Sunsama, Akiflow; command-bar (⌘K) quick-add becomes the power-user equivalent of the mobile FAB |
| 1920px | Large desktop | Cap content width rather than stretching a calendar/list edge-to-edge — add a secondary panel (e.g., risk/workload summary) to use the space meaningfully rather than just enlarging existing elements |

---

## 13. Desktop UX Research

**FACT — patterns from Sunsama, Akiflow, Motion, Reclaim:**
- **Command bar / keyboard-first capture** (⌘K-style) is standard across the premium tier — Akiflow's command bar is repeatedly cited as a core strength ("capture at 10x the average speed").
- **Multi-pane layouts** (task list + calendar side by side) are universal at this tier — never a single full-width view on desktop.
- **Drag-to-schedule** from a task list directly onto the calendar is the dominant desktop interaction for turning a deadline into planned work time (Sunsama, Akiflow) — relevant once V2's study-session blocking ships, not for V1's simpler deadline CRUD.

**RECOMMENDATION:** desktop V1 should be a clean two-pane (deadline list + calendar) rather than attempting a command-bar power-user layer immediately — that's a natural V1.5/V2 addition once there's a keyboard-fluent user base to serve.

---

## 14. GitHub / Open Source Research

| Repository | Stack | License | Notable stats (FACT) | What to learn from it | What NOT to copy |
|---|---|---|---|---|---|
| **Vikunja** (go-vikunja) | Go backend, Vue frontend | AGPL-3.0 (core); GPL-3.0 (desktop) | ~4.5k GitHub stars per an independent review site; actively maintained | Clean multi-view (List/Kanban/Gantt/Table) task engine over one data model; a genuinely usable open-core boundary (admin/audit/time-tracking gated even self-hosted) | AGPL-3.0 is strong copyleft — do not vendor Vikunja code into a closed-source commercial product without legal review; its multi-view breadth is more than a focused deadline tracker needs |
| **Super Productivity** | Angular, IndexedDB (local-first), Electron/Capacitor/PWA from one codebase | MIT | Actively maintained, single-developer-led, large community | The strongest reference in this research for **offline-first, local-first architecture**: all data lives in IndexedDB by default, zero mandatory accounts, optional WebDAV/Dropbox sync, explicit documentation of PWA-vs-Electron background-throttling differences | Its plugin/integration breadth (Jira/GitLab/GitHub/Azure DevOps) is aimed at developers, not students — don't chase that surface area |
| **AppFlowy** | Dart/Flutter | Open source ("leading open-source Notion alternative") | 76k+ GitHub stars — by far the largest project touched in this research | Proof that a local-first, AI-integrated collaborative workspace can reach serious scale; useful as an architecture reference for future collaboration features (V2 group-project sharing) | Far too broad a scope (full Notion-style workspace) to use as a direct template for a focused deadline tracker |
| **Coursicle-style LMS sync** (no strong open-source equivalent found) | — | — | — | The LMS-ingestion problem (§4.4, §20) has **no mature open-source reference implementation** in this research — it's a genuine build-from-scratch problem, likely starting from each LMS's exposed ICS/calendar feed rather than a full OAuth integration | — |
| **Fragmented student-planner OSS space** (GitHub topics: `student-planner`, `study-planner`, `academic-planner`) | Mixed (MERN, Flutter, Kotlin, PyQt5, etc.) | Mixed | Dozens of small repos, mostly course projects or single-maintainer efforts; **no dominant, well-maintained "reference" project** was found | Confirms the greenfield opportunity: there is no open-source equivalent of Vikunja/Super Productivity for the student-planner category specifically | Don't assume any single one of these is production-grade; treat them as idea sources, not dependencies |

**RECOMMENDATION:** the closest thing to an architectural template for this product is **Super Productivity's local-first data model** (for offline reliability and multi-device sync patterns) combined with **Vikunja's clean single-entity-multi-view approach** (for how one "Task"/"Deadline" entity can support several views without fragmenting into per-type tables) — synthesized, not copied, and built fresh with academic structure (subjects/terms) neither project has.

---

## 15. Technology Stack Research

### Frontend
| Option | Fit assessment |
|---|---|
| **Next.js (App Router)** — RECOMMENDED | Best fit: mobile-first PWA support, server components for a fast first load on phones, easy Vercel deployment, largest 2026 ecosystem for the auth/ORM/UI choices below |
| Vue / Nuxt | Viable (Vikunja itself uses Vue) but smaller 2026 ecosystem for the specific shadcn/ui-style premium design tooling this product's aesthetic goals point toward |
| Svelte/SvelteKit | Excellent performance profile, smallest bundles (relevant to mobile) — a legitimate alternative if bundle size becomes a measured problem, but a smaller hiring/component-ecosystem pool in 2026 than Next.js |

### Backend
**RECOMMENDATION:** Next.js server actions/API routes for V1 (no separate backend service needed at this scale) — with a clear extraction point in mind: **reminder scheduling and dispatch should live in a background worker/queue from day one** (not inline in request handlers), because reminder fan-out is exactly the kind of workload that breaks a naive serverless-request model (§19).

### Database
**RECOMMENDATION: PostgreSQL** (via a managed provider like Supabase or Neon), not SQLite, because this product needs real multi-device sync from V1 (a student uses phone + laptop) — SQLite/local-first (Super Productivity's model) is the right choice for a single-device, privacy-maximalist tool, but not for a product whose core promise includes "see your deadlines everywhere."

### ORM: Drizzle vs. Prisma (FACT, cross-checked across 6 independent 2026 sources)
- **Prisma 7** (Nov 2025) rewrote its query engine from Rust to TypeScript/WASM, cutting bundle size roughly from ~14MB to ~1.6MB and closing much of the historical performance/cold-start gap with Drizzle. It remains the more "batteries-included" option: mature migrations (`prisma migrate`), Prisma Studio GUI, but requires a `prisma generate` step after every schema change that developers repeatedly cite as a friction point.
- **Drizzle** has no generation step, a smaller runtime footprint, and closer-to-SQL control; it is still pre-1.0 but has overtaken Prisma in weekly npm downloads by some 2026 trackers, with faster serverless/edge cold starts.
- **RECOMMENDATION:** Drizzle — the edge/serverless cold-start advantage matters directly for a reminder-dispatch worker that needs to wake up cheaply and often, and the lack of a generate step reduces friction for a small team iterating quickly on the domain model in §17. Prisma remains a perfectly defensible alternative if the team values its migration tooling and GUI more than the performance edge.

### Authentication (FACT, cross-checked across 6 independent 2026 sources)
The 2026 landscape has shifted since Auth.js/NextAuth was the default self-hosted answer:
- **Clerk**: fastest to ship, polished pre-built UI, but per-MAU pricing that becomes expensive at scale (~$0.02/MAU above the free tier in one source's breakdown).
- **Supabase Auth**: effectively free if already using Supabase for the database (which this stack's DB recommendation makes likely), with Postgres Row-Level Security integration — but a weaker B2B/organizations feature set (irrelevant here — this is a consumer product, not enterprise SaaS).
- **Better Auth**: the emerging 2026 self-hosted default — plugin-based, no per-user billing, and (per one source) **Auth.js/NextAuth is now maintained by the Better Auth team as a legacy option**, with new greenfield projects steered toward Better Auth instead.
- **RECOMMENDATION:** **Supabase Auth** if the DB choice above is Supabase (auth effectively "comes free" and RLS pairs naturally with per-student data isolation); **Better Auth** if a non-Supabase Postgres host (e.g., Neon) is chosen instead, to avoid per-MAU cost as the user base grows — a real consideration for a product whose users are, by definition, price-sensitive students. Clerk remains a reasonable "ship fastest" fallback for an early prototype if developer time is the tighter constraint than long-run cost.

### State management
**RECOMMENDATION:** TanStack Query for server state (deadlines, subjects — anything fetched from the API) + Zustand for small pieces of client-only UI state (e.g., which bottom sheet is open, active calendar view). This is the standard, low-friction 2026 pairing and avoids Redux's boilerplate for a product this size.

### UI
**RECOMMENDATION:** Tailwind + shadcn/ui + Radix primitives — Radix gives accessible modal/dialog/dropdown primitives for free (directly supporting the WCAG focus-management requirements in §22), and shadcn/ui's component style is a strong base for a premium dark-theme aesthetic without looking templated, provided real design-system work (typography, spacing, a considered dark-mode contrast pass) is layered on top rather than left at defaults.

### Notifications
**RECOMMENDATION (synthesizing §10's findings):**
- Web Push (VAPID) for Android/desktop — reliable, cheap, standard service-worker implementation.
- Email (a transactional provider like Resend or Postmark) as a parallel, not fallback-only, channel — given iOS PWA push's documented unreliability (§10), email is the only channel guaranteed to reach an iPhone user consistently.
- Reminder dispatch via a scheduled job queue (e.g., a managed cron/queue service, or BullMQ + Redis if self-managing) — never naive in-process `setTimeout`, which cannot survive serverless cold starts or deploys.

### Offline
**RECOMMENDATION:** PWA + IndexedDB (via Dexie.js for a friendlier API) for local caching of the current term's deadlines, following Super Productivity's local-first pattern (§14) — but as a *cache in front of* Postgres, not a replacement for it, since multi-device sync is a core requirement here in a way it wasn't for Super Productivity's single-user-focused design.

### Calendar
**RECOMMENDATION:** custom-built agenda/week view using a headless date library, informed by §11's finding that FullCalendar's default styling works against the "premium, not generic" design goal; `react-big-calendar` as an unstyled fallback if the custom build proves too costly for V1 timelines; a dedicated RRULE library (e.g., `rrule.js`, implementing the iCalendar RFC 5545 standard) for recurrence, rather than inventing custom recurrence fields (also directly informs §17's data model).

---

## 16. Architecture Research

**RECOMMENDATION — high-level shape:**
```
Next.js app (PWA, App Router)
  → Server actions / API routes (auth via Supabase Auth or Better Auth)
  → PostgreSQL (Drizzle ORM) — source of truth
  → Background worker (scheduled queue) — reminder job scheduling & dispatch
      → Web Push (Android/desktop)
      → Email (Resend/Postmark) — parallel channel, not fallback-only
  → IndexedDB (Dexie) client-side cache — offline read access to current-term data
```

**Key architectural decisions worth stating explicitly:**
- **Materialize reminders as jobs at creation/edit time**, not via polling "what's due soon" on a timer — more reliable and cheaper at scale (directly informed by §19's performance research).
- **Recurring deadlines should expand lazily within a bounded window** (e.g., the current term ± a few weeks), not pre-generate years of rows — a direct answer to a named risk in §19.
- Even though the product is "offline-first" in the caching sense, it is **not local-only** the way Super Productivity is — multi-device sync (phone + laptop) is core to the promise, so the server remains the source of truth (closer to Vikunja's model than Super Productivity's).

---

## 17. Domain Model Research (conceptual — not a schema yet)

**RECOMMENDATION — entities and the reasoning behind each:**

| Entity | Purpose | Key relationships | Reasoning |
|---|---|---|---|
| **User** | Account/auth identity | 1—many everything below | Standard |
| **AcademicTerm** (Semester) | A bounded time window (e.g., "Fall 2026") | 1—many Subjects | Everything in a student's life is term-bounded; without this, old deadlines and old subjects clutter every view forever |
| **Subject** (Course) | A class/course within a term | 1—many Deadlines, 1—many ClassMeetings | Central organizing entity per §6 — almost everything hangs off this |
| **ClassMeeting** | A recurring class-schedule slot, *separate from Deadline* | belongs to Subject | Needs its own entity because rotating timetables (§6, §17) use cycle-day/week-parity recurrence patterns that don't fit a normal RRULE weekday model cleanly — keeping it distinct from Deadline avoids polluting the deadline model with timetable-specific fields |
| **Deadline** | **One entity, not split per type** — assignment/exam/quiz/project/lab/reading/presentation/submission are a `type` enum on this single table, not separate tables | belongs to Subject; has many Reminders, optional Subtasks | This is the most important modeling call in this report: MyStudyLife's own "7 task types" share the same core fields (title, subject, due date, priority, status). Splitting them into separate tables would make cross-type queries (the deadline-clustering feature in §8!) needlessly expensive and complex. A `type` enum plus a small set of type-specific optional fields (e.g., `location` for an exam) is far more scalable |
| **Subtask** | Checklist items under a Deadline | belongs to Deadline | Simple, V1.5 per §7 |
| **Reminder** | A scheduled notification job tied to a Deadline | belongs to Deadline; has a channel (push/email), offset or absolute time | Needs to be its own entity (not just a field on Deadline) precisely because §10 recommends *multiple* reminders per deadline across *multiple* channels |
| **Notification** (delivery log) | Record of what was actually sent/delivered/failed | belongs to Reminder | Needed for debugging the exact reliability problem §10 identifies — without a log, you can't tell a silently-failed push from a student who just didn't see it |
| **Recurrence** | Stored as an RRULE string (RFC 5545), not custom fields | attached to Deadline or ClassMeeting | Reuse the iCalendar standard and a maintained library instead of inventing a bespoke recurrence model — every mature competitor researched (Todoist, TickTick) does some version of this |
| **Tag/Category** | Optional free-form labels, distinct from Subject | many—many with Deadline | Subject is mandatory structure; tags are optional and personal (e.g., "group work") |
| **CalendarEvent** (imported/external) | Events synced in from an external calendar/LMS feed, distinct from a Deadline the student owns | belongs to Subject (optional) | Keeping this distinct from Deadline avoids conflating "things I must submit" with "things on my calendar" — important once LMS/ICS import ships in V2 |
| **StudySession / TimeBlock** | Planned work time — explicitly a **V2** entity, not V1 | optionally linked to a Deadline | Deferred per §8/§11 — don't model it until the study-session-blocking feature actually ships |
| **Attachment** | File(s) on a Deadline | belongs to Deadline | Low priority; storage-cost and moderation overhead should keep this out of V1 |

**Scalability watch-outs (RECOMMENDATION, informed directly by §19):**
- Reminder fan-out: one Deadline × several Reminders × 2 channels can multiply fast across a full course load — design the worker for batch dispatch, not one job per reminder-channel pair fired independently.
- Recurring-deadline expansion: bound it to a rolling window, never materialize indefinitely.
- Don't split Deadline by type — the single biggest anti-pattern risk this research surfaced, visible in how many small student-planner GitHub projects (§14) hard-code separate "Assignment" and "Exam" models and then struggle to build any cross-type view.

---

## 18. Differentiation Opportunities

**5 underserved problems (grounded in §5):**
1. No affordable, reliable LMS-aware deadline ingestion outside one small US-college-focused app (Coursicle).
2. Deadline-risk intelligence exists only inside $15–45/mo professional tools, not built around subjects/terms.
3. Reminder reliability, especially on iOS, is an unresolved *platform-level* problem nobody in this category addresses honestly.
4. The category's most-trusted incumbent (MyStudyLife) is currently showing real cracks (crashes, data loss reports, paywall creep) — a trust vacuum with a real, if not permanent, time window.
5. Deadline clustering — the actual source of student overwhelm — is surfaced by zero competitors in this research as a first-class signal.

**5 differentiators (each traceable to a specific finding above):**
1. LMS-friendly but LMS-optional design — fast, pleasant manual entry as the default, not a "sorry, no sync" fallback.
2. Transparent, rule-based deadline-risk scoring instead of Motion-style opaque AI (§9).
3. Premium mobile-first visual design — Things 3 and Structured prove design quality alone is a competitive weapon in this category; most dedicated student planners are visually dated.
4. A pricing model that respects student budgets — contrast against Sunsama ($20/mo), Motion ($29/mo); myHomework's $4.99/**year** and PowerPlanner's $1.99 one-time purchase show what pricing students actually reward.
5. Reminder architecture that's honest about iOS limitations (multi-channel by design, not by apology) rather than over-promising push reliability like every competitor implicitly does.

**3 candidate "killer features":**
1. **Deadline clustering / workload heatmap** — directly answers the single most consistent gap found across all 12 competitor profiles.
2. **Explainable risk badges** — the trust-building counter-positioning to Motion's black-box complaint.
3. **Rotating-timetable-aware recurrence, done in a modern interface** — MyStudyLife proved the demand (best-in-class feature, 24M+ users) but is now the weakest link on execution (§4.3) — a real opening to out-execute the category leader on its own signature feature.

**3 features that sound impressive but are probably useless (for this product, at this stage):**
1. Full AI auto-scheduling of study sessions from day one — Motion's own reviews show this creates correction overhead and erodes trust before a product has any usage history to learn from.
2. Gamification/rewards (streaks-as-currency, NFTs, etc.) — present in several toy student apps found in research, no evidence of retention value, reads as gimmicky next to a premium positioning.
3. A fully general Notion-style configurable database layer — Notion's own review data shows this flexibility is a liability for most users, not an asset.

**3 features competitors have that should be intentionally avoided:**
1. Mandatory card-on-file trials (Motion, Akiflow) — a specific, named trust problem in their own reviews.
2. Aggressive paywalling of previously-free basic organizational features (MyStudyLife's task-type-tagging paywall) — cited explicitly as a "bait-and-switch."
3. Deep, unguided customization as the primary onboarding experience (Amazing Marvin's 100+ strategies) — praised by power users, but explicitly blamed by the same reviews for a steep first-week cost.

---

## 19. Product Positioning

- **Ideal target user:** a high-school or university student juggling multiple subjects/courses within a term, currently relying on some mix of memory, a paper planner, their LMS's own (buried) deadline list, and/or a generic task app that doesn't understand academic structure.
- **Primary problem:** deadlines are scattered across LMS portals, memory, and mismatched tools, so students discover risk (an overloaded week, an under-prepared exam) too late instead of early.
- **Product promise:** *see everything you owe, and know what's actually at risk, before it's too late* — not "plan every minute of your day" (that's Motion/Sunsama's job, and a heavier promise than most students want).
- **Unique value proposition:** the only student deadline tracker that pairs real academic structure (subjects, terms, rotating timetables) with transparent, explainable workload/deadline-risk visibility and reminders engineered around the actual limits of mobile notification delivery — without professional-tool pricing.
- **Positioning statement:** *For students who juggle multiple courses and can't afford to be surprised by a deadline, [Product] is the deadline tracker that shows you what's actually at risk — clearly, honestly, and before it's too late — unlike generic task apps that don't understand a semester, and unlike premium AI planners priced and built for professionals.*
- **One-sentence description:** a mobile-first deadline tracker that understands your subjects, your term, and exactly how much trouble you're in this week.
- **Elevator pitch:** *Todoist doesn't know what a subject is. MyStudyLife knows, but it's crashing and paywalling basic features. Motion and Sunsama have real deadline intelligence, but they cost $20–30 a month and don't know what a semester is either. [Product] is built specifically for a student's actual structure — subjects, terms, rotating timetables — with the same kind of workload-risk awareness the premium planners have, explained plainly instead of hidden behind an algorithm, for a price that doesn't assume you have a salary.*

**Category positioning — RECOMMENDATION:** lead with **(A) Deadline Tracker**, layered with the intelligence elements of **(E) smart scheduling** as the differentiator, deliberately *not* **(B) student planner** or **(C) academic productivity system**. Reasoning:
- "Student planner" (B) invites a feature-parity chase against MyStudyLife's sunk-cost feature set (grades, full timetable, extracurriculars/"Xtra") that a lean team shouldn't try to match feature-for-feature on day one.
- "Academic productivity system" (C) invites Notion-scale scope creep — exactly the flexibility-as-liability trap §4.12 documents.
- Staying narrowly "the deadline tracker that understands risk" is the smallest, most defensible wedge, consistent with §8's ruthless MVP philosophy — and it's the one lane in this whole research set that is genuinely open.

---

## 20. MVP Recommendation

**V1 — absolutely necessary** (mirrors §7's CORE table plus the two pulled-forward items from §8):
Deadline CRUD with type, Subject/term structure, priority, calendar view (agenda-first per §11), multi-channel reminders (push + email, per §10), basic RRULE recurrence, dashboard, **deadline clustering banner**, **rule-based explainable risk badge**, mobile-first PWA, dark premium theme, 2-device sync.

**V1.5 — high-value improvements:** subtasks/checklists, snooze/escalating reminders, search & filter, notes, CSV/ICS import (a *much* smaller lift than full LMS OAuth — most LMSs expose a per-student ICS calendar feed URL, which is a realistic phased first step toward §18's LMS-friendliness differentiator without Coursicle's full integration burden).

**V2 — advanced functionality:** full LMS OAuth integration (Canvas first, given its API maturity and Coursicle's proof of demand), rotating-timetable engine (ClassMeeting entity from §17), study-session time blocking (Structured-style timeline view from §11), grade/GPA "what-if" tracking, group-project/shared-deadline support, desktop app polish (command bar, multi-pane).

**V3 — experimental:** opt-in AI-suggested study-session scheduling (only after the rule-based risk model has earned trust, per §9's sequencing argument), habit/streak tracking, native app wrapper (Capacitor, informed by Super Productivity's cross-platform pattern in §14), voice quick-add, offline conflict-resolution sync for true multi-device offline editing.

---

## 21. Information Architecture

**Mobile (bottom tab bar, 3–5 items per §12):**
- Today/Home (dashboard, clustering banner, risk badges)
- Calendar (agenda/week/month)
- Deadlines (full filterable list)
- FAB (not a tab): Add deadline → bottom sheet
- Settings/Profile (subjects, terms, notification channels — tucked behind an icon, not a 5th tab, to keep the bar at 4 primary items)

**Desktop (persistent left sidebar per §13):**
- Dashboard/Today
- Calendar
- Deadlines
- Subjects (a dedicated view — worth its own nav item on desktop where space allows, unlike mobile)
- Settings
- "+ Add deadline" as a header button, with a command-bar (⌘K) shortcut as the power-user path, deferred to V1.5/V2 per §13

**Contextual (not in primary nav, either platform):** Subject detail page (reached from a deadline or the Subjects list), individual deadline detail/edit view, notification-channel settings, import/export.

**Hidden/advanced:** CSV/ICS import, data export, theme settings, term archive/history view.

---

## 22. UI/UX Analysis of Current Screenshots

No screenshots were received in this conversation — only the written concept (dark theme, calendar view, deadline creation modal, categories, subjects, priority, reminders, recurrence, notes, dashboard statistics) came through. Re-attach the images and I'll fill in this section against the same critique lens requested: what's already good, what feels generic/cluttered, hierarchy and spacing issues, mobile failure points, and accessibility/interaction problems — cross-referenced against the specific findings in §11 (calendar), §12 (mobile UX), and §22/accessibility below.

---

## 23. Accessibility

**RECOMMENDATION — mandatory baseline, grounded in current (WCAG 2.2, Level AA) requirements confirmed via the W3C spec and multiple 2026 implementation guides:**
- **2.5.7 Dragging Movements (new in 2.2):** any drag interaction (rescheduling a deadline on the calendar) must have a single-pointer alternative — e.g., a tap-to-open detail view with a date field, or up/down/move controls — not dragging as the *only* way to reschedule. This directly constrains the calendar design from §11, not as a retrofit.
- **2.5.8 Target Size (Minimum):** 24×24 CSS px is the AA floor; per §12, design primary actions to 44–48px and treat 24px as an absolute minimum, not a target.
- **Focus visibility & management:** modals (the deadline-creation bottom sheet/modal) must trap focus and restore it correctly on close — Radix primitives (already recommended in §15) handle this correctly out of the box, which is a real reason to prefer them over hand-rolled modal components.
- **Forms:** every input needs a properly associated label (not placeholder-as-label, a common failure), and validation errors need to be programmatically associated with their field, not just color-coded.
- **Color contrast in a dark theme:** a "near-black with glow-accent" aesthetic (the kind referenced in this workspace's prior projects) is a real contrast risk area — verify actual contrast ratios against WCAG AA thresholds (4.5:1 for normal text) rather than relying on how it looks by eye, especially for accent-colored text on dark backgrounds.
- **Keyboard navigation:** the entire deadline-creation and calendar-navigation flow should be fully operable without a mouse/touch — a baseline expectation, not an edge case, and directly relevant given how many interactions in this product (drag-to-reschedule, bottom sheets, calendar navigation) are naturally pointer-first by default.

---

## 24. Performance & Scalability

**RECOMMENDATION — bottlenecks to design around from day one, not retrofit later:**
| Risk area | Problem | Mitigation |
|---|---|---|
| Recurring deadlines | Naive pre-generation of every future occurrence bloats the database indefinitely | Expand lazily within a bounded rolling window (§16/§17) |
| Reminder fan-out | One deadline × several reminders × multiple channels multiplies fast across a full course load | Batch dispatch via a queue/worker, not per-request or per-reminder synchronous sends |
| Calendar rendering | Many events/deadlines in one view can degrade render performance, especially on mobile | Virtualize/window the rendered list; avoid rendering a full term's data at once |
| Search | Client-side scanning breaks down past a few hundred items (a realistic full-degree history) | Server-side search (Postgres full-text search is sufficient at this scale — no need for a dedicated search service in V1) |
| Offline sync conflicts | Multi-device edits can conflict | Last-write-wins is acceptable for V1 given single-user-owned data; defer CRDT-style conflict resolution to V3, matching §20's sequencing |
| Analytics/dashboard aggregation | Live-querying full history for dashboard stats on every load doesn't scale | Pre-compute/cache aggregates (e.g., nightly or on-write) rather than recomputing from raw rows on every dashboard view |

---

## 25. Security & Privacy

**RECOMMENDATION:** academic deadlines and notes are moderately sensitive personal data (not health or financial data), but still warrant real care:
- Encryption at rest via a managed Postgres provider's standard encryption (Supabase/Neon both provide this by default).
- Choose an auth provider with a real security track record (both Supabase Auth and Clerk carry SOC 2 posture per research in §15) rather than rolling custom session handling.
- Least-privilege API design — a student's data should never be queryable by another student without an explicit sharing relationship (relevant once V2's group-project sharing ships).
- No third-party analytics SDKs that resell behavioral data — a reasonable baseline expectation for a product marketed on trust, per §18's positioning.
- Clear data export and account deletion — students graduate and leave; make that easy and honest, which also reinforces the trust-based differentiation against MyStudyLife's paywall-creep reputation (§4.3).
- Rate-limit authentication endpoints against credential-stuffing, standard practice regardless of data sensitivity.
- If/when LMS OAuth integration ships (V2, §20): store tokens encrypted, scoped as narrowly as the LMS API allows, and short-lived/refreshable rather than long-lived where the provider supports it.

---

## 26. Competitive Feature Matrix

✓ = supported · ~ = partial/limited · — = not supported · ? = unclear from available sources

| Capability | Todoist | TickTick | MyStudyLife | Structured | Motion | Sunsama | Reclaim.ai | Notion | Coursicle | **Proposed product** |
|---|---|---|---|---|---|---|---|---|---|---|
| Free tier | ✓ | ✓ | ✓ (core) | ✓ (core) | — | — | ✓ | ✓ | ✓ | ✓ (generous, student-priced) |
| Subject/course structure | — | — | ✓ | ~ | — | — | — | ~ (DIY) | ✓ | ✓ |
| Rotating timetable | — | — | ✓ (best-in-class) | — | — | — | — | — | ~ | ~ (V2) |
| LMS auto-sync | — | — | — | — | — | — | — | — | ✓ | ~ (V1.5 ICS, V2 OAuth) |
| Calendar view | ~ | ✓ | ✓ | ✓ (timeline) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (agenda-first) |
| Reminders (free tier) | — (Pro only) | ✓ | ✓ | ✓ | ? | ~ | ✓ | ~ | ✓ | ✓ |
| Multi-channel reminders (push+email) | ~ | ~ | ~ | ~ | ? | ~ | ✓ | ~ | ? | ✓ (by design) |
| Deadline clustering / overload warning | — | — | — | — | ~ (implicit via AI) | ✓ (manual warning) | ~ | — | — | ✓ (explicit, V1) |
| Explainable risk scoring | — | — | ~ (Scout, opaque) | — | ~ (opaque AI) | ~ (manual) | ~ (opaque AI) | — | — | ✓ (rule-based, V1.5) |
| Recurring tasks | ✓ | ✓ | ✓ | ✓ | ✓ | ~ | ✓ (Habits) | ✓ | ~ | ✓ |
| Subtasks | ✓ | ✓ | ✓ | ✓ (recent) | ✓ | ~ | ~ | ✓ | ~ | ✓ (V1.5) |
| AI auto-scheduling | ~ (Ramble capture only) | — | ~ (Scout) | — | ✓ | — (by design) | ✓ | — | — | — (V1); ~ opt-in (V3) |
| Mobile-native quality | ✓ | ✓ | ~ (mixed) | ✓ (iOS only) | ~ (buggy per reviews) | ~ (execution-only) | ~ | ~ (weak) | ✓ | ✓ (core design goal) |
| Offline support | ✓ | ✓ | ✓ | ✓ | ? | ? | ? | ~ (improving) | ? | ✓ (PWA/IndexedDB) |
| Cross-platform (iOS/Android/web) | ✓ | ✓ | ✓ | ~ (iOS-strong) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Grade/GPA tracking | — | — | ✓ (paid) | — | — | — | — | ~ (DIY) | ✓ | — (V2) |
| Group/shared deadlines | ~ (generic sharing) | ~ | — | — | ~ | ~ | ~ | ✓ (generic) | — | — (V2) |
| Student-specific pricing | ~ | ~ | ✓ | — | — | — | ✓ (discount) | — | ✓ | ✓ (core positioning) |

---

## 27. Final Product Recommendation

1. **What the product should actually be:** a focused *deadline intelligence* tool for students — not a full planner, not an LMS replacement, not a Notion-style workspace. Its job is to show what's due, across every subject, and make workload risk visible and explainable before it becomes a crisis.
2. **Who it should be built for:** students juggling multiple subjects/courses within a term, currently underserved by generic task apps (no academic structure) and priced out of premium AI planners ($15–45/mo).
3. **10 most important features (V1):** subject/term-scoped deadlines with type, priority, agenda-first calendar view, multi-channel (push+email) reminders, RRULE-based recurrence, dashboard, deadline-clustering banner, rule-based explainable risk badges, mobile-first PWA, dark premium theme with real accessibility-verified contrast.
4. **10 features to *not* build initially:** LMS OAuth integration, rotating-timetable engine, study-session time-blocking, grade/GPA tracking, group/shared deadlines, full AI auto-scheduling, gamification/rewards, a general configurable-database layer, native desktop apps, deep 100+-toggle customization.
5. **5 strongest differentiators:** LMS-friendly-but-optional entry, transparent rule-based risk scoring (vs. everyone else's black box or nothing), premium mobile-first design in a category with dated interfaces, student-respecting pricing, and a reminder architecture that's honest about (and engineered around) iOS push limitations instead of quietly failing like the rest of the category.
6. **Recommended architecture:** Next.js PWA → server actions/API → PostgreSQL (source of truth) → background worker for reminder scheduling/dispatch → parallel push+email delivery → IndexedDB client cache for offline reads. Reminders materialized as jobs at creation time; recurrence expanded lazily within a bounded window.
7. **Recommended technology stack:** Next.js (App Router), PostgreSQL via Supabase or Neon, Drizzle ORM, Supabase Auth (if on Supabase) or Better Auth (if not), TanStack Query + Zustand, Tailwind + shadcn/ui + Radix, Web Push + email (Resend/Postmark) for notifications, PWA + Dexie.js for offline caching, a custom agenda/week calendar view backed by a headless date + RRULE library.
8. **Recommended navigation:** mobile bottom tab bar (Today, Calendar, Deadlines, Settings) with a FAB for quick-add; desktop persistent left sidebar (Dashboard, Calendar, Deadlines, Subjects, Settings) with a header add-button, command bar deferred to V1.5+.
9. **Recommended mobile UX:** bottom sheet for add/edit (not full modal), 44–48px primary touch targets, agenda-first calendar (month grid as secondary), thumb-zone-aware layout, gestures always paired with a visible fallback control.
10. **Recommended desktop UX:** two-pane (list + calendar) for V1; command bar and multi-pane richness deferred until there's a keyboard-fluent user base to justify it.
11. **Recommended data model:** a single `Deadline` entity with a `type` enum (not per-type tables), `Subject` and `AcademicTerm` as the organizing containers, a separate `ClassMeeting` entity for timetable recurrence (kept apart from `Deadline`), `Reminder` and `Notification` as distinct entities to support multi-channel delivery and reliability logging, RRULE strings (not custom fields) for all recurrence.
12. **Recommended reminder model:** multi-channel by default (push + email in parallel, not sequential fallback), escalating intensity tied to the deadline-risk tier, a guaranteed in-app "what's due" surface that doesn't depend on notifications firing at all, and installation-before-permission sequencing on iOS.
13. **Recommended deadline-risk model:** rule-based and fully explainable for V1/V1.5 (days remaining, effort estimate, progress, same-week clustering, one-line reason shown to the user) — explicitly deferring opaque or fully-automated scheduling to V3, after the simpler model has earned trust.
14. **Recommended MVP:** exactly §20's V1 list — nothing from ADVANCED, and only the two highest-leverage IMPORTANT items (clustering, risk badges) pulled forward.
15. **Biggest technical risks:** iOS PWA push notification unreliability (a platform limitation, not a bug you can fix — must be designed around, §10); reminder fan-out at scale if not queue-based from day one; recurring-deadline data growth if expansion isn't bounded; multi-device sync conflicts once offline editing matures past V1's simple caching.
16. **Biggest product risks:** scope creep toward "MyStudyLife feature parity" (grades, full timetable, extracurriculars) diluting the deadline-risk focus that's the actual differentiator; over-automating the risk/scheduling model too early and repeating Motion's trust problem; underestimating how much design-system discipline "premium, not generic" actually requires (Things 3 and Structured set a real bar).
17. **Biggest opportunities:** the deadline-clustering gap is uncontested across every competitor profiled in this research; MyStudyLife's current instability creates a real, if time-limited, trust vacuum in the one category-defining incumbent; and reminder reliability is a problem nobody in this category has addressed honestly — solving it credibly (not perfectly, since iOS itself limits what's possible) is a genuine, hard-to-copy trust advantage.

---

## 28. Sources

*Grouped by topic. Pricing/feature figures are dated snapshots as of research time (Aug 2026) — re-verify before build.*

**Competitors — official pages:** todoist.com/pricing · reclaim.ai · reclaim.ai/pricing · help.reclaim.ai (Features) · mystudylife.com · mystudylife.com/tour · super-productivity.com · vikunja.io

**Competitors — reviews/comparisons:** capterra.com (Todoist, TickTick, Motion, Notion, Akiflow listings) · getapp.com (TickTick) · softwareadvice.com (TickTick, Akiflow) · g2.com (Amazing Marvin, Notion) · producthunt.com (Sunsama reviews) · efficient.app (Sunsama, Akiflow, Motion reviews) · morgen.so/blog-posts (Todoist, Motion, Sunsama, Akiflow pricing breakdowns) · checkthat.ai (TickTick, Sunsama) · toolguide.io (TickTick, Motion, Sunsama, Structured, Akiflow) · buyersprint.com (Todoist pricing) · get-alfred.ai (Todoist pricing, Microsoft To Do alternatives) · usecarly.com (Todoist pricing) · thebusinessdive.com (Motion, Sunsama, Akiflow reviews) · hirekai.ai (Motion review) · lifestack.ai (Motion pricing) · agent-finder.co (Sunsama, Reclaim reviews) · gbrlife.com (Sunsama review) · makerstack.co (Amazing Marvin review) · blog.saner.ai (Amazing Marvin review) · toolradar.com (TickTick, Amazing Marvin) · alternativeto.net (MyHomework, iHomework, School Planner, Assignment Tracker alternatives) · apps.apple.com listings (MyStudyLife, Coursicle, Structured, Trackr, StuFocus, Homework Tracker) · play.google.com listings (MyStudyLife) · daveswift.com, calmevo.com (Structured reviews) · studytoolguide.com (MyStudyLife 2026 red-flags/alternatives comparison) · pipeline.zoominfo.com (Reclaim review/features) · workspace.google.com/marketplace (Reclaim listing) · toolstack.io (Reclaim pricing) · any.do/blog (to-do app comparison) · tasksboard.com, taskguru.so, taskford.com, toolfinder.com, goodday.work (Google Tasks / Microsoft To Do / Any.do / Things 3 comparisons) · aisotools.com, aiforbusinessautomation.com (Akiflow reviews)

**GitHub / open source:** github.com/topics/vikunja, /academic-planner, /study-planner, /student-planner, /course-planner, /fullcalendar-alternative · github.com/super-productivity/super-productivity (+ wiki) · dev.to/johannesjo (open-source productivity apps comparison) · opentechhub.io (Vikunja, Super Productivity architecture write-ups) · selfhostedprojectmanagement.com (Vikunja review) · repocloud.io, openapps.pro, deepwiki.com (Super Productivity architecture) · lpi.org (Vikunja blog)

**Technical/architecture:** makerkit.dev, dev.to/pockit_tools, encore.dev, designrevision.com, alexcloudstar.com, buildmvpfast.com, tech-insider.org (Drizzle vs. Prisma 2026) · turbostarter.dev, iloveblogs.blog, nodejs.tech, trybuildpilot.com, devtoolreviews.com, medium.com/better-dev-nextjs-react (auth landscape 2026) · dhtmlx.com, sourceforge.net, builder.io, blog.logrocket.com, bryntum.com, npm-compare.com (calendar library comparisons) · mobiloud.com, magicbell.com, edana.ch, webscraft.org, blog.codercops.com, docs.bswen.com, developer.apple.com/forums (iOS PWA push notification research)

**UX/accessibility:** uxpin.com, designstudiouiux.com, mobbin.com, plotline.so, deventiatech.com (mobile UX/FAB/bottom sheet research) · w3.org/TR/WCAG22, orases.com, testparty.ai, sparkbox.com, dequeuniversity.com, accessibilitychecker.org, sitearmor.net, freelock.com, edify.cr (WCAG 2.2 research)
