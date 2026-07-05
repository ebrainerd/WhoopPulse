# Baseline — Brand & Design System

> Name, logo direction, typography, color, and voice — one coherent identity
> across the app, the public media kit pages, and the marketing site.

---

## 1. Name

### 1.1 Primary recommendation: **Baseline**

The name *is* the product thesis. Everything in the app is measured against
the creator's own baseline — the z-score badges, the velocity bands, the
weekly report. It also carries the second meaning we want: *your* baseline,
your foundation, the numbers your career stands on. It's short, spellable,
pronounceable in every market, and it names a concept the user learns *from
using the product* — the brand teaches the mental model.

Practical notes:

- "Baseline" is a common English word; expect to brand as a compound domain:
  `getbaseline.app`, `usebaseline.com`, `baseline.so`, or `baselinehq.com`
  (verify availability at purchase time; also check App Store title collision
  — differentiate as **"Baseline — Creator Analytics"**).
- Social handles: `@getbaseline` / `@baselinehq`.
- Trademark search needed in class 42 (SaaS); "Baseline" appears in other
  categories (construction software, med-tech) which is generally survivable
  for a distinct class but needs a proper check before launch spend.

### 1.2 Shortlist considered (kept as fallbacks)

| Name | For | Against |
| --- | --- | --- |
| **Baseline** | Names the core mechanic; teachable; calm, credible | Generic word; compound domain needed |
| **Tidemark** | High-water mark metaphor fits archiving records | Softer meaning; less obvious |
| **Crest** | Peaks, momentum, clean 5 letters | Crowded trademark space; toothpaste adjacency |
| **Vantage** | Seeing clearly, elevated view | Heavily used across SaaS |
| **Prooflab** | Nails the media-kit/verification pillar | Ignores the analytics half; "lab" is startup-cliché |

Decision rule applied: prefer the name that describes the *user's mental
model* over names describing our features. Baseline wins.

### 1.3 Tagline

Primary: **"Know your numbers. Own your worth."**
Secondary/marketing: "Your Instagram history, explained — and turned into
proof brands trust."

---

## 2. Logo direction

Three concepts, in preference order (commission real marks from these briefs):

1. **The Rising Baseline (primary).** A horizontal line (the baseline) with a
   single point breaking above it — rendered as a small filled circle floating
   above the line's right end, like a data point going above baseline. Reads
   as: chart, typographic baseline, and "above your usual" all at once.
   Works at 16px favicon size. Wordmark version: lowercase `baseline` set in
   the display face, where the crossbar of the final **e** extends right as
   the line, with the dot above it.
2. **The Band.** Two parallel horizontal lines (the p25–p75 band from the
   velocity chart) with a bold stroke arcing above the top line. More
   distinctive, slightly more complex; strong app-icon potential.
3. **The Tally.** A minimal five-bar tally where the fifth stroke is the
   brand-accent diagonal — archive/record-keeping connotation. Cleanest
   monochrome behavior, weakest conceptual tie.

App icon: concept 1 mark, accent-on-ink (mint dot + off-white line on the
near-black background), no wordmark, generous margins. Avoid gradients —
every competitor in this space (and Instagram itself) is gradient-heavy;
flat + dark is the differentiation.

---

## 3. Color

Dark-first identity for the app (creators' tools live on OLED phones at
night); light professional theme for public media kits (brands read them in
office contexts). Both themes ship from day one — same tokens, two values.

### 3.1 Core palette

| Token | Hex | Usage |
| --- | --- | --- |
| `ink-950` (bg) | `#0B0C0E` | App background |
| `ink-900` (surface) | `#131519` | Cards, sheets |
| `ink-800` (surface-2) | `#1C1F24` | Elevated cards, inputs |
| `ink-700` (border) | `#2A2E35` | Hairlines, dividers |
| `fog-100` (text-primary) | `#F2F3F5` | Primary text on dark |
| `fog-400` (text-secondary) | `#9BA1AB` | Secondary text, labels |
| **`mint-400` (accent)** | **`#3DDC97`** | Brand accent: CTAs, the logo dot, positive deltas, "verified" |
| `mint-600` | `#1FA873` | Pressed/active accent, light-theme accent |
| `coral-400` | `#FF6B6B` | Negative deltas, destructive |
| `amber-400` | `#FFB454` | Warnings (token expiring), "watchlist" findings |
| `sky-400` | `#5AA9FF` | Informational, links inside reports |

Semantic mapping (the important part — color always means the same thing):

- **Mint = above your baseline / verified / go.**
- **Coral = below your baseline / destructive.**
- **Amber = attention needed / not yet significant.**
- Neutral z-scores (−1.5..1.5) stay fog — *most content is normal; the UI
  must not cry wolf.* Charts draw baseline bands in `ink-700` fills with
  `fog-400` median lines; only deviations get color.

### 3.2 Light theme (public kit + optional app theme)

| Token | Hex |
| --- | --- |
| bg | `#FAFAF8` (warm paper, not clinical white) |
| surface | `#FFFFFF` |
| border | `#E7E5E0` |
| text-primary | `#17181A` |
| text-secondary | `#5F6570` |
| accent | `mint-600 #1FA873` (better contrast on light) |

Kit pages may take a creator-chosen accent from a curated set of 8 (all
pre-checked for WCAG AA on the paper background) — personalization without
letting kits become unreadable.

### 3.3 Categorical chart palette (formats)

Reels `#5AA9FF` · Carousels `#B78AF7` · Images `#FFB454` · Stories `#4DD6CE`.
Colorblind-checked (no red/green pair carries meaning alone; deltas always
pair color with ▲/▼ glyphs and sign).

### 3.4 Accessibility

All text pairs meet WCAG AA (fog-100 on ink-950 ≈ 15:1; fog-400 on ink-900 ≈
5.5:1; mint-400 reserved for ≥ 18px or bold on dark). Hit targets ≥ 44px.
Every metric badge readable by screen readers as words ("2.1 times your
typical carousel reach"), never just "×2.1".

---

## 4. Typography

| Role | Face | Weights | Notes |
| --- | --- | --- | --- |
| Display / headings / wordmark | **Space Grotesk** | 500, 700 | Geometric with just enough personality; free (Google Fonts), loads via `@expo-google-fonts/space-grotesk` |
| Body / UI | **Inter** | 400, 500, 600 | The readability workhorse; excellent at small sizes on mobile |
| Numbers & data | **Inter with `tabular-nums`** (feature setting), fallback **IBM Plex Mono** for dense tables/CSV-ish views | 400, 600 | Tabular figures are non-negotiable — every column of metrics must align; mono is used sparingly (post-detail metrics table, export previews) |

Type scale (mobile-first, 4pt grid): Display 28/34 · H1 22/28 · H2 18/24 ·
Body 15/22 · Caption 13/18 · Micro 11/14. Headings in Space Grotesk 700 use
−1% letterspacing; ALL-CAPS labels (Micro, fog-400, +6% tracking) mark section
headers inside cards.

Public kit pages use the same pair — brand consistency between the app a
creator sees and the artifact a brand receives is deliberate: a brand that
later signs up for the brand-side surface should recognize the design language.

---

## 5. Component language

- **Cards**: `ink-900`, 16px radius, 1px `ink-700` border, no shadows on dark
  (elevation via border + surface step); 20px padding.
- **The z-score badge** (signature element): pill, 12px radius, Space Grotesk
  600; `×2.1 ▲` mint-tinted background (`mint-400` at 12% alpha, text
  `mint-400`); neutral = fog on `ink-800`; negative = coral equivalents. Same
  component everywhere: Library rows, post detail, report findings.
- **The verified badge**: small shield-check glyph + "Verified" in mint,
  always accompanied by the freshness timestamp ("updated 2h ago"). Never
  shown on hand-entered data (rates, collabs) — the visual distinction between
  verified and self-reported is a trust feature, keep it strict.
- **Charts**: 2px data strokes, baseline bands as translucent fills, no
  gridlines heavier than `ink-700`, dots only on the latest point. Spark
  charts in cards are 48px tall, axis-free.
- **Buttons**: primary = mint-400 fill with ink-950 text (high-energy, used
  once per screen); secondary = `ink-800` fill; destructive = coral outline.
- Motion: 150–200ms ease-out; the only "celebration" animation in the app is
  the breakout alert card (single pulse) — restraint everywhere else.

---

## 6. Voice & tone

Principles: **plain-spoken, numbers-cited, never hype.** The product's
credibility is the product.

| Situation | We say | We never say |
| --- | --- | --- |
| Positive finding | "Your under-20s reels averaged 41% retention vs 24% for longer ones (9 posts, last 60 days)." | "Your short reels are CRUSHING it! 🚀🔥" |
| Insufficient data | "Posting time: no reliable pattern yet — about 3 more weeks of data needed." | Fabricated confidence |
| Underperformance | "This post reached 0.4× your usual. Its hook cluster has run below baseline in 4 of 5 uses." | Blame or cheerleading |
| Billing | "Your trial ends Friday. No card on file — nothing will be charged." | Urgency theater, fake countdowns |

Emoji: only in push notifications, only 🔥 (breakout) and 👀 (kit contact),
never in reports or the kit. Exclamation marks: budget of ~one per screen.

Microcopy details that carry the brand: the report's expander is labeled
**"Show the math"** (not "Learn more"); the paywall headline is **"Keep your
history running"** (not "Upgrade now"); the cancellation screen's final button
is simply **"Cancel subscription"** — one tap, works, no guilt copy beneath it.

---

## 7. Asset checklist (pre-launch)

- [ ] Domain + handles secured; trademark search (class 42)
- [ ] Logo concept 1 commissioned/executed: mark, wordmark, app icon (iOS
      light/dark/tinted variants), favicon, OG-image template for kit pages
- [ ] Font licenses: Space Grotesk + Inter (OFL — free, verify embedding in
      PDF exports is covered)
- [ ] Tailwind/NativeWind token file generated from §3 tables (single source
      of truth: `tailwind.config.js` extends from `brand/tokens.json`)
- [ ] Kit accent set (8 colors) contrast-verified
- [ ] App Store screenshots template in brand style (dark, mint accents,
      real-data screenshots from seeded demo account)
