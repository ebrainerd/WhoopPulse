# Receipts — Brand & Design System

> Name, logo direction, typography, color, and voice — one coherent identity
> across the app, the public media kit pages, and the marketing site.

---

## 1. Name

### 1.1 Primary recommendation: **Receipts**

Creator-internet slang, used exactly the way the product works: *receipts* are
proof. "Bring the receipts." "She's got receipts." The name covers all three
pillars in one word creators already use daily:

- **Prove** — the media kit *is* your receipts: verified numbers a brand can
  trust instead of screenshots.
- **Explain** — every claim in a weekly report is backed by its numbers; the
  expander that reveals the math is literally labeled *"Show the receipts."*
- **Archive** — receipts are records you keep. Instagram shreds yours after
  90 days; we file them forever.

It's fun without being unserious, it's memorable in a sentence ("send them
your Receipts"), and it gives marketing endless clean copy ("Never screenshot
your stats again — just send Receipts").

Practical notes:

- Domains: `getreceipts.app`, `receipts.so`, `keepreceipts.app`,
  `receiptshq.com` (verify availability at purchase time). Handles:
  `@getreceipts` / `@receiptshq`.
- App Store search for "receipts" surfaces expense-scanner apps, so the store
  listing title must be the compound **"Receipts — Creator Analytics"** and
  ASO keywords lean on "instagram analytics", "media kit", "creator".
- Trademark search needed in class 42 (SaaS); the word is common in
  expense-tracking (class overlap risk is the main thing counsel should
  check before launch spend).

### 1.2 Shortlist considered (kept as fallbacks)

| Name | For | Against |
| --- | --- | --- |
| **Receipts** | Creator slang for proof; covers all three pillars; endless good copy | Expense-app adjacency in store search; needs compound domain |
| **Heatcheck** | Fun basketball slang ("is this post hot?"); fits velocity alerts perfectly | Names only the breakout feature, not the kit/archive |
| **Bragsheet** | "Brag sheet" is literally what creators call a media kit; playful | Ignores the analytics half; slightly jokey for billing emails |
| **Hotstreak** | Energetic, memorable | Collides with a sports-betting brand; wrong-category vibes |
| **Sparkline** | Charming chart pun; data-native | Insider term; less fun to non-data people |

Decision rule applied: prefer a word creators already say, with the meaning we
want, over invented names. Receipts wins.

### 1.3 Tagline

Primary: **"Your growth. With receipts."**
Secondary/marketing: "Analytics that explain your Instagram — and prove it to
brands." Campaign line for the kit feature: "Never screenshot your stats
again."

---

## 2. Logo direction

Three concepts, in preference order (commission real marks from these briefs):

1. **The Receipt Tape (primary).** A rounded-top rectangle with a subtle
   zigzag perforated bottom edge — the universal receipt silhouette — holding
   a single rising spark-line inside it. Reads as receipt + growth chart in
   one glance, works at 16px favicon size, and gives the app icon a shape no
   analytics competitor has (they're all circles and gradient squares).
   Wordmark: lowercase `receipts` in the display face with the final **s**
   ending in a small tear-off notch.
2. **The Paid Stamp.** A slightly rotated rounded-rectangle outline stamp
   containing a checkmark-spark hybrid — the "verified" energy of the media
   kit. Strong on kit pages next to verified numbers; slightly weaker as a
   standalone app icon.
3. **The Tally.** A minimal five-bar tally where the fifth stroke is the
   brand-accent diagonal — record-keeping connotation. Cleanest monochrome
   behavior, weakest fun factor.

App icon: concept 1 mark, accent-on-ink (mint spark-line + off-white tape on
the near-black background), no wordmark, generous margins. Avoid gradients —
every competitor in this space (and Instagram itself) is gradient-heavy;
flat + dark is the differentiation. The receipt-paper texture idea also pays
off in the light theme (§3.2): kit pages render on a warm paper background,
so the brand metaphor is literal where brands see it.

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
**"Show the receipts"** (not "Learn more"); the paywall headline is **"Keep your
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
