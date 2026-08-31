# Antigravity — Design Language
**Codename: Suspend · v1.0**

A system for an interface where nothing sits under a shadow. Objects don't rest on the page — they hang in it, held by glass instead of gravity.

---

## Contents

1. [Concept](#1-concept)
2. [Principles](#2-principles)
3. [Color](#3-color)
4. [Glass & elevation](#4-glass--elevation)
5. [Typography](#5-typography)
6. [Shape & iconography](#6-shape--iconography)
7. [Motion](#7-motion)
8. [Components](#8-components)
9. [Accessibility & internationalization](#9-accessibility--internationalization)
10. [Anti-patterns](#10-anti-patterns)
11. [Token reference](#11-token-reference)

---

## 1. Concept

The mark this system is built from shows three things stacked in a dark field: paper, held inside frosted glass, closed off by a checkmark that's lit from within rather than printed on top. Nothing in it is a hue — the entire object is built from black, white, and the gradients between them, with the one moment of emphasis rendered as light, not color.

Three decisions follow directly from that mark, and they hold for the whole product, not just the icon:

- **The background is a void, not a canvas.** Near-black isn't a dark mode toggle here — it's the default state matter returns to. Everything visible is either glass floating in it or light escaping from it.
- **Hierarchy is drawn with glass and light, never with color.** The mark has no accent hue anywhere. Depth comes from translucency and blur; emphasis comes from brightness. This is a harder constraint than it sounds, and it's the whole point — it's what keeps the product from reading as another dark-mode SaaS dashboard with a gradient stuck on top.
- **Completion is the only warm moment in the system**, and even that isn't warm in color — it's warm in *light*. The glow lives on the checkmark alone. It's a reward for finishing, not a decoration.

Everything below exists to protect those three facts under production pressure — when someone needs a fourth color for a chart, or a shadow because the glass "doesn't look elevated enough."

---

## 2. Principles

### Void as ground state
The base layer of every screen is near-black, not off-white with a dark theme bolted on. Content is designed for the dark canvas first; a light mode (if one ever exists) is the exception to justify, not the default to return to.

### Elevation is light, not shadow
Shadow means gravity — mass pressing down, blocking light beneath it. This product doesn't have that. Instead of stacking progressively darker drop-shadows to show what's "on top," elevation is shown by how much light a surface is catching: more blur, a brighter border, a wider glow, in that order. A raised panel looks like it's closer to a light source, not like it's casting a shadow on something under it.

### One signal, held in reserve
There is no accent color. Emphasis is achromatic — brightness and glow, not hue. The single functional exception is a muted red reserved only for destructive actions, because safety needs an unambiguous danger signal that grayscale genuinely can't provide. It appears nowhere else, for any reason, including "just to add some warmth" to a screen that feels flat. If a screen feels flat, fix it with light and space, not a new color.

### Glass describes structure, not mood
Every translucent surface should be answering a real question — what's a distinct layer, what's grouped, what's in front of what — the same way the icon's glass folder tells you it's a container, not a background flourish. Blur that isn't load-bearing gets removed.

### Weightless motion
Nothing bounces. A bounce is something falling and being caught — it implies gravity and mass, the two things this system is defined by their absence. Things drift, settle, and — when a task is finished — leave, the way the checkmark's glow reads like the item is about to lift off the page. See [§7](#7-motion) for the one moment this shows up fully.

---

## 3. Color

The palette below wasn't chosen from a swatch book — it was measured directly from the mark, then extended into a usable range. Every neutral in it carries a small, consistent cool bias (blue sits 4–12 values above red, with green in between). That bias is what keeps the grays from reading as flat "UI gray" — it's the difference between a graphite that looks considered and one that looks like a default. Keep it at every step; a neutral gray dropped into this system will look like a mistake, not a simplification.

### Void & graphite (structure)

| Token | Hex | RGB | Use |
|---|---|---|---|
| `void-950` | `#08080A` | 8, 8, 10 | App background. The canvas everything else floats in. |
| `void-900` | `#212025` | 33, 32, 37 | Deepest panel fill; shadow-adjacent depth without using black. |
| `void-850` | `#2B2C32` | 43, 44, 50 | Primary glass panel fill (measured from the mark's icon field). |
| `void-800` | `#3E3D42` | 62, 61, 66 | Raised glass panel fill; secondary surfaces. |
| `graphite-600` | `#504E54` | 80, 78, 84 | Borders on dark glass, dividers, disabled fills. |
| `graphite-400` | `#72727C` | 114, 114, 124 | Placeholder text, inactive icons. |
| `graphite-300` | `#9897A3` | 152, 151, 163 | Secondary text on dark surfaces. |

### Mist & paper (content surfaces)

| Token | Hex | RGB | Use |
|---|---|---|---|
| `mist-200` | `#BFC0CB` | 191, 192, 203 | Tertiary text, quiet UI chrome. |
| `mist-100` | `#D4D5DF` | 212, 213, 223 | Body text on dark; rules on light content cards. |
| `paper-50` | `#E7EBF2` | 231, 235, 242 | Document/content-card fill — the "paper" surfaces from the mark. |
| `signal-white` | `#FAFAFC` | 250, 250, 252 | Primary text, active icons, and the sole glow color. |

### The one exception

| Token | Hex | Use |
|---|---|---|
| `signal-danger` | `#E5484D` | Destructive actions and error states only. Never decorative, never a data-viz color, never a brand moment. |

**Rule of use:** if a design needs a fourth color to feel finished, the actual problem is almost always contrast or spacing, not palette. Reach for more void, more light, or more space before reaching for a color.

**Contrast baseline:** body text (`mist-100` or brighter) on `void-950`/`void-900` clears WCAG AA (>7:1) comfortably. Text placed directly on translucent glass must be checked against the *busiest* likely background behind it, not the glass color alone — glass is only as legible as what's floating underneath it.

---

## 4. Glass & elevation

This is the core technical idea in the system: elevation is expressed as *proximity to light*, not *stacked shadow depth*. Four levels, each one closer to the light source than the last.

```css
:root {
  /* Level 0 — Void: the base canvas. No blur, no border, no glow. */
  --surface-0-bg: var(--void-950);

  /* Level 1 — Resting glass: sidebars, base cards, containers */
  --surface-1-bg: rgba(80, 78, 84, 0.28);       /* graphite-600 @ 28% */
  --surface-1-blur: 20px;
  --surface-1-border: 1px solid rgba(250, 250, 252, 0.08);
  --surface-1-shadow: 0 8px 24px rgba(0, 0, 0, 0.24); /* grounding only — see note */

  /* Level 2 — Raised glass: popovers, dropdowns, hover-active cards */
  --surface-2-bg: rgba(114, 114, 124, 0.22);    /* graphite-400 @ 22% */
  --surface-2-blur: 32px;
  --surface-2-border: 1px solid rgba(250, 250, 252, 0.14);
  --surface-2-glow: 0 0 40px rgba(250, 250, 252, 0.06);

  /* Level 3 — Modal / command layer: the closest thing to the light */
  --surface-3-bg: rgba(152, 151, 163, 0.16);    /* graphite-300 @ 16% */
  --surface-3-blur: 40px;
  --surface-3-border: 1px solid rgba(250, 250, 252, 0.18);
  --surface-3-glow: 0 0 64px rgba(250, 250, 252, 0.10);

  /* Signal — focus rings and the completion state. Reused from the mark's checkmark. */
  --signal-glow: 0 0 24px rgba(250, 250, 252, 0.55);
}
```

**On that one grounding shadow:** a single soft, low-opacity dark shadow is permitted at Level 1 only, and only to keep glass readable when it sits directly against a busy background — not to imply weight. It does not get darker or larger at higher levels; light does that work instead. If a panel needs a heavier shadow to "look elevated," raise its level (more blur, brighter border, add glow) rather than deepening the shadow.

**Blur discipline:** blur radius should track information density behind the glass — a panel over a screenshot-dense background needs more blur than one over empty void. Never apply blur as a texture; if there's nothing underneath worth obscuring, the glass effect should be nearly invisible, not decorative.

---

## 5. Typography

### Typeface

**Inter** for all UI text and body content. It's a geometric, humanist grotesk with genuinely deep language coverage — Latin Extended, Cyrillic, Greek, Vietnamese — which matters directly for "international": a display serif or a trendy grotesk with thin Latin-only coverage will silently break or fall back to a system font the moment the product ships in a market it wasn't designed for. Inter degrades gracefully; most trend-driven typefaces don't.

**Non-Latin scripts (CJK, Arabic, Devanagari, etc.):** don't force Inter onto them by faking it with a fallback stack and hoping. Let the platform's native system font render those scripts — `-apple-system` / `PingFang SC` / `Noto Sans` / `Segoe UI` per platform and locale. A Latin grotesk stretched over CJK glyphs gets the stroke contrast and reading rhythm wrong every time; native rendering doesn't.

```css
--font-primary:
  "Inter", -apple-system, "Segoe UI", "PingFang SC", "Noto Sans",
  "Noto Sans Arabic", "Noto Sans Devanagari", sans-serif;
```

**Numerals:** use tabular (lining) figures wherever numbers appear in a list, table, or counter, so digits don't jitter or misalign as they update — `font-variant-numeric: tabular-nums`.

### Scale

A single family, weight and size doing the work of hierarchy — no second display face, no monospace bolted on for "data" labels.

| Role | Size / Line height | Weight | Notes |
|---|---|---|---|
| Display | 32px / 40px | 600 | Page-level titles only. Used rarely. |
| Title | 22px / 28px | 600 | Section and panel headers. |
| Body | 15px / 24px | 400 | Default reading size. Line length capped near 70–75 characters. |
| Body emphasis | 15px / 24px | 500 | In-line emphasis; never color, never italics for UI chrome. |
| Caption | 13px / 18px | 400 | Metadata, timestamps, secondary labels — set in `graphite-300`/`mist-200`, not by shrinking further. |

**Casing:** sentence case everywhere, including labels and buttons. All-caps labels are a default this system deliberately avoids — they read as generic dashboard chrome, and they're genuinely harder to read at small sizes in non-Latin scripts.

---

## 6. Shape & iconography

### Corner radius

The mark's rounded square is a continuous "squircle" curve (Apple-style superellipse), not a simple CSS border-radius arc — the corner tightens smoothly rather than snapping into a circular arc. Where a true superellipse isn't available, approximate with a slightly larger radius than feels natural; it reads closer to continuous than a small tight radius does.

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8px | Inputs, small buttons, tags |
| `radius-md` | 14px | Cards, list rows |
| `radius-lg` | 22px | Panels, modals |
| `radius-full` | 999px | Pills, avatars |

### Icon grid

24px grid, 1.5px stroke, outline style at rest. Icons live in `graphite-300` when inactive and step up to `signal-white` on activation — never introduce a colored icon state; brightness is the only signal for "active."

### The checkmark

The checkmark from the mark is the one motif that's allowed to repeat exactly, everywhere completion happens — never restyled, never recolored, always rendered in `signal-white` with `--signal-glow`. Overusing a brand mark dilutes it; this system deliberately restricts the glow treatment to that single symbol so it keeps meaning something when it appears.

---

## 7. Motion

### Rules

- **No bounce, no spring, no elastic overshoot.** Those curves simulate mass falling and being caught — the exact physical idea this product is defined against. Every curve here decelerates into stillness; nothing overshoots and corrects.
- **Motion answers an action.** Nothing animates on scroll or on load just to announce itself. If a person didn't do something, nothing should be moving.

```css
--ease-drift: cubic-bezier(0.22, 1, 0.36, 1);   /* default entrances, panel opens */
--ease-settle: cubic-bezier(0.4, 0, 0.2, 1);    /* hover, small state changes */
--ease-release: cubic-bezier(0.16, 1, 0.3, 1);  /* the completion moment, below */
```

### The signature moment: Release

This is the one place the system spends its full motion budget, and it's a direct extension of the mark's glowing checkmark — completing something should feel like the item is escaping the page, not just being crossed off.

1. **Ignite** (180ms) — the checkmark fills and `--signal-glow` blooms in at full strength.
2. **Hold** (120ms) — a beat of stillness so the glow actually registers before anything moves.
3. **Release** (420ms, `--ease-release`) — the row drifts upward ~14px, scales to 0.96, and fades to 0 simultaneously. It leaves; it doesn't collapse or slide sideways into a list gap.

This sequence is reserved for genuine completion — marking something done, sending something final. It's not a generic exit transition for dismissing panels or deleting items; those get a plain fade on `--ease-settle`, no glow.

---

## 8. Components

Brief patterns, not a full library — apply [§4](#4-glass--elevation) and [§3](#3-color) consistently rather than inventing new surface treatments per component.

**Buttons**
- Primary: `signal-white` fill, `void-950` text — the only place text sits on a light fill.
- Secondary: Level 1 glass, `mist-100` text, brightens border on hover (no fill-color change).
- Destructive: outline only in `signal-danger`; fills solid only on hover/press, never at rest — it should have to be reached for.

**Cards / list rows**
- Level 1 glass at rest. Hover raises to Level 2 — border and glow increase, background alpha stays close to flat. No hue shift, no scale-up on hover.

**Inputs**
- Level 1 glass fill, `graphite-600` border at rest, `signal-white` at 40% opacity on focus paired with `--signal-glow` — the same glow language as completion, at lower intensity, so focus reads as "lit up," not "outlined in a brand color."

**Navigation**
- Sits at Level 1 permanently; the active item is the only thing promoted to `signal-white` text with no background pill — brightness marks selection, not a filled shape.

---

## 9. Accessibility & internationalization

- **Focus states must survive on glass.** A thin colored outline can disappear against a translucent, blurred background. Focus is always the glow token (`--signal-glow`), not a border color alone — glow holds up against any busy content behind the glass; a 1–2px outline often doesn't.
- **Never rely on the danger red alone.** Error states pair `signal-danger` with an icon and text, never color by itself, both for colorblind users and because a muted red can read close to graphite at low-brightness screen settings.
- **RTL mirroring.** The glass folder / document motif and any directional motion (the Release drift is vertical, so it's unaffected) should mirror horizontally in RTL locales — check any left-anchored chrome (icons, nav) explicitly rather than assuming vertical motion is the only thing that matters.
- **Don't bake text into icons or the mark.** The document lines in the icon are abstract (blurred bars), not real text, specifically so the mark never needs a localized version.
- **Test contrast against real content, not the design file.** Glass panels are only as legible as the specific screen behind them; spot-check the busiest realistic background, not an empty void.

---

## 10. Anti-patterns

Explicit, because these are the specific defaults this system is defined against — if a screen starts drifting toward one of these, that's the signal to stop and check it against §2.

- Adding a second accent color "just for this one chart" or "to warm up" an empty state. Fix flatness with light and space, not hue.
- Stacking progressively darker drop-shadows to show layering. Use blur, border brightness, and glow instead — see [§4](#4-glass--elevation).
- Any bounce, spring, or elastic easing. It implies gravity; this system doesn't have any.
- All-caps labels, tracked-out "eyebrow" text above headings, or metadata strings joined with middle dots. These are generic dashboard chrome, not this product's voice.
- A monospace typeface for "data-looking" labels. Tabular numerals on the primary typeface do that job without introducing a second voice.
- Recoloring or restyling the checkmark motif for anything other than genuine completion.
- Blur applied as a texture with nothing meaningful behind it to obscure.
- A warm cream background, a terracotta/clay accent, or any near-black that isn't carrying the measured cool bias from [§3](#3-color) — a neutral gray dropped in flat will look like a placeholder, not a simplification.

---

## 11. Token reference

Consolidated for handoff — everything above, in one block.

```css
:root {
  /* Color — void & graphite */
  --void-950: #08080A;
  --void-900: #212025;
  --void-850: #2B2C32;
  --void-800: #3E3D42;
  --graphite-600: #504E54;
  --graphite-400: #72727C;
  --graphite-300: #9897A3;

  /* Color — mist & paper */
  --mist-200: #BFC0CB;
  --mist-100: #D4D5DF;
  --paper-50: #E7EBF2;
  --signal-white: #FAFAFC;

  /* Color — the one exception */
  --signal-danger: #E5484D;

  /* Surfaces / elevation */
  --surface-0-bg: var(--void-950);
  --surface-1-bg: rgba(80, 78, 84, 0.28);
  --surface-1-blur: 20px;
  --surface-1-border: 1px solid rgba(250, 250, 252, 0.08);
  --surface-1-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  --surface-2-bg: rgba(114, 114, 124, 0.22);
  --surface-2-blur: 32px;
  --surface-2-border: 1px solid rgba(250, 250, 252, 0.14);
  --surface-2-glow: 0 0 40px rgba(250, 250, 252, 0.06);
  --surface-3-bg: rgba(152, 151, 163, 0.16);
  --surface-3-blur: 40px;
  --surface-3-border: 1px solid rgba(250, 250, 252, 0.18);
  --surface-3-glow: 0 0 64px rgba(250, 250, 252, 0.10);
  --signal-glow: 0 0 24px rgba(250, 250, 252, 0.55);

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-full: 999px;

  /* Type */
  --font-primary: "Inter", -apple-system, "Segoe UI", "PingFang SC",
    "Noto Sans", "Noto Sans Arabic", "Noto Sans Devanagari", sans-serif;

  /* Motion */
  --ease-drift: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-settle: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-release: cubic-bezier(0.16, 1, 0.3, 1);
}
```
