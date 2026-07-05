# Receipts — Technical Specification

> Name: **Receipts** (see `03-brand-and-design.md` for naming rationale and
> alternatives). A read-only Instagram performance co-pilot for creators with
> 5K–500K followers, delivered as a **mobile app** (iOS + Android). Three
> pillars: **Archive** (keep every metric forever, past Instagram's 90-day
> wall), **Explain** (plain-English diagnosis against the creator's own
> baselines), **Prove** (a live, API-verified media kit and rate card that
> turns the data into brand-deal income).

---

## 1. Product scope

### 1.1 What the app does

1. Connects a creator's Instagram **Business or Creator** account via Meta's
   official Graph API (read-only permissions).
2. Backfills all available media and lifetime metrics, then snapshots account
   and per-post metrics on a schedule — building a permanent archive that
   Instagram itself deletes after 90 days.
3. Computes per-format personal baselines and surfaces every post's performance
   as a deviation from that baseline ("2.1× your typical carousel reach").
4. Tracks first-24-hour velocity on new posts and sends push alerts when a post
   is breaking out (or dying) versus the creator's typical curve.
5. Generates a **weekly report**: a deterministic stats engine finds what
   deviated and what correlates; an LLM narrates only those computed findings,
   with every claim citing its numbers.
6. Publishes a **live media kit** at a public URL: verified stats, audience
   demographics, top content, past collaborations, and a tiered rate card, with
   view/click tracking.

### 1.2 What the app deliberately does NOT do

- **No posting, scheduling, or account management.** Read-only keeps Meta App
  Review light, eliminates the "it double-posted" support category that
  dominates competitor complaints, and is a security selling point.
- **No follower-list access or competitor scraping.** The Graph API does not
  expose follower lists or arbitrary public-account data; tools that offer this
  violate Meta ToS. We stay compliant.
- **No hashtag research, caption generation, or content AI** (v1). The insight
  layer explains performance; it does not produce content.

### 1.3 Platform targets

**Mobile-only for creators: iOS and Android from a single Expo codebase.**
There is no web dashboard. The one web surface is the **public media kit
page** viewed by brands — a small, separate Next.js service (§8.4), because
kit links must open in any browser, unfurl with OG previews, and print to PDF.
This split keeps the app codebase focused and lets kit pages be
server-rendered without dragging the whole app onto the web.

---

## 2. Infrastructure

| Layer | Choice | Rationale |
| --- | --- | --- |
| Mobile app | **Expo SDK 54, React Native, TypeScript** — iOS + Android only | Single codebase; SDK 54 works with App Store Expo Go for free device testing; EAS Build for store binaries |
| Routing | **Expo Router** (file-based) | Deep links (`receipts://post/[id]`) from push notifications |
| Styling | **NativeWind** (Tailwind), dark-first theme | Fast iteration; tokens defined in `03-brand-and-design.md` |
| Backend | **Supabase** — Auth, Postgres (+ RLS), Edge Functions, Storage, `pg_cron` | Managed Postgres with row-level security; Edge Functions hold Meta secrets server-side; cron drives the sync engine |
| Kit web service | **Next.js (App Router) on Vercel** — the only web surface | Server-rendered public kit pages at a custom domain, OG-image generation, print-to-PDF route; reads published-kit data via a narrow service role |
| LLM | Server-side via Edge Function; small/cheap model class (e.g. Claude Haiku tier or GPT mini tier) | One structured call per weekly report; narration only, never raw analysis (§7) |
| Push | `expo-notifications` + Expo Push Service | Velocity alerts, weekly-report-ready |
| Charts | Custom `react-native-svg` line/bar/spark charts | Full control over the velocity-curve and baseline-band visuals |
| Error tracking | Sentry (`sentry-expo`) | Crash + Edge Function error reporting |
| Product analytics | PostHog (self-serve funnel: connect → backfill → first report → kit published) | Measures the activation loop |
| Payments | **RevenueCat** wrapping StoreKit / Play Billing | One subscription state across both stores; users can also cancel via Apple/Google subscription settings (supports the honest-billing brand promise — see business doc) |

### 2.1 Environments

- `dev` — local Expo + a dev Supabase project + Meta app in **Development Mode**
  (works with our own test creator accounts before App Review).
- `staging` — TestFlight/internal track + staging Supabase.
- `prod` — App Store / Play Store + the production kit web service.

Secrets live in Supabase Edge Function secrets (`META_APP_SECRET`,
`LLM_API_KEY`) and are never shipped to the client. Client-side env vars are
limited to publishable keys (`EXPO_PUBLIC_SUPABASE_URL`, anon key, Meta app id).

---

## 3. Authentication

Two distinct auth concerns, kept separate:

### 3.1 App identity (who the user is)

- **Supabase Auth** with email/password plus **Sign in with Apple** and
  **Google** (Apple sign-in is an App Store requirement when any third-party
  login is offered).
- Session persisted with `expo-secure-store`; RLS scopes every table to
  `auth.uid()`.
- A `profiles` row is auto-created on signup via trigger.

### 3.2 Instagram connection (what data we may read)

- **Facebook Login for Business** OAuth flow via `expo-auth-session` (PKCE) in
  the app; the authorization code is exchanged for tokens by the `meta-auth`
  Edge Function so the Meta **app secret never touches the client** (same
  pattern as the Whoop app's `whoop-auth` function).
- Requested scopes (all read-only):
  - `instagram_basic` — profile + media list
  - `instagram_manage_insights` — account and media insights
  - `pages_show_list`, `pages_read_engagement` — required plumbing because IG
    professional accounts hang off a Facebook Page
- The short-lived token is immediately exchanged for a **60-day long-lived
  token**, stored encrypted (Supabase Vault / `pgsodium`) in `ig_connections`.
- A daily cron job refreshes any token older than 45 days; if refresh fails,
  the user gets a push + email ("Reconnect Instagram — your archive is paused")
  and the connection row is flagged `needs_reauth`.
- Meta requires a **Data Deletion Callback URL**: an Edge Function
  (`meta-data-deletion`) that erases the user's Instagram-derived rows and
  returns the confirmation code Meta expects.

### 3.3 Meta App Review plan (go-to-market critical path)

- Development Mode supports building and dogfooding with team-owned accounts
  **before** review.
- Review submission needs: screencast of the OAuth flow and each permission in
  use, privacy policy URL, data deletion URL, and (for some permissions)
  **Business Verification** of the operating entity. Budget several weeks of
  calendar latency; submit as soon as the OAuth + dashboard slice works, not
  when the whole product is done.

---

## 4. Data model (Postgres, all tables RLS owner-only unless noted)

| Table | Key columns | Purpose |
| --- | --- | --- |
| `profiles` | `id (auth.uid)`, `display_name`, `niche`, `timezone`, `plan`, `trial_ends_at` | App user |
| `ig_connections` | `user_id`, `ig_user_id`, `page_id`, `username`, `token_encrypted`, `token_expires_at`, `status`, `last_synced_at` | One row per connected IG account (v1: one; schema allows N for the future multi-account add-on) |
| `media` | `id (ig media id)`, `connection_id`, `media_type` (`REEL`/`CAROUSEL`/`IMAGE`/`STORY`), `caption`, `permalink`, `thumbnail_url`, `posted_at`, `is_trial` (bool, manual tag fallback) | Every content item |
| `media_snapshots` | `media_id`, `captured_at`, `views`, `reach`, `likes`, `comments`, `saves`, `shares`, `total_watch_time_ms`, `avg_watch_time_ms`, `metric_era` | **The archive.** Append-only time series |
| `account_snapshots` | `connection_id`, `date`, `followers`, `follows`, `reach`, `profile_views`, `website_clicks`, `demographics jsonb` | Daily account pulse |
| `baselines` | `connection_id`, `media_type`, `metric`, `window` (`30d`/`90d`), `median`, `mad`, `sample_n`, `metric_era`, `computed_at` | Rolling per-format baselines |
| `velocity_curves` | `connection_id`, `media_type`, `hour_offset`, `p25`, `p50`, `p75` | The account's typical first-48h accumulation curve, for hot-post comparison |
| `reports` | `connection_id`, `week_start`, `findings jsonb`, `narrative text`, `status` | Weekly insight reports |
| `media_kits` | `user_id`, `slug`, `sections jsonb`, `rates jsonb`, `collabs jsonb`, `theme`, `is_published` | Kit configuration |
| `kit_views` | `kit_id`, `viewed_at`, `referrer`, `ua_hash`, `clicked_contact` | Public-kit analytics (insert allowed from public edge route; select owner-only) |
| `notifications_log` | `user_id`, `type`, `payload`, `sent_at` | Dedupe + audit for pushes |

Notes:

- **`metric_era`** (`impressions` / `views`) tags every snapshot and baseline.
  Instagram replaced Impressions/Plays with unified Views in April 2025;
  baselines are never computed across eras and charts render an era-boundary
  marker instead of a fake continuous line. This is a differentiator — most
  incumbents fumbled the transition.
- **Backfill nuance:** media-level insights from the API are *lifetime
  cumulative totals*, available for old posts immediately at connect time. So
  day one gives us lifetime numbers for every post (instant Library value),
  while true *time-series* history accrues from connect day forward.
  Account-level daily metrics cannot be backfilled beyond what Instagram
  retains (90 days). Onboarding copy must set this expectation honestly.

---

## 5. Sync engine

All sync runs in the `ig-sync` Edge Function, driven by `pg_cron` schedules.
Budget: Meta allows ~**200 calls per user per hour**; worst-case design usage
stays under ~30/hour (85% headroom).

| Loop | Cadence | Scope | Approx. calls |
| --- | --- | --- | --- |
| **Hot** | every 20 min | media < 48h old: one insights call per item | posting daily ⇒ 1–2 hot items ⇒ ≤ 6/hr |
| **Warm** | daily 03:00 user-local | media 2–30 days old | ~30 calls once/day |
| **Cold** | weekly | media > 30 days (metrics barely move) | amortized, trivial |
| **Account** | daily 03:10 | followers, reach, profile views, demographics | 2–3 calls |
| **Token refresh** | daily | tokens > 45 days old | 1 call when needed |

Implementation details:

- Each run writes append-only rows to `media_snapshots` /
  `account_snapshots`, then upserts `baselines` and `velocity_curves`
  incrementally (SQL window functions; no external compute needed).
- **Hot-loop alerting:** after each hot snapshot, compare the post's cumulative
  views at `hour_offset` against the account's `velocity_curves`. Cross above
  `p75` ⇒ "breaking out" push; sustained below `p25` after 6h ⇒ optional
  "underperforming — consider a Story boost" push (user-toggleable).
- **Failure handling:** per-connection exponential backoff; Meta error `190`
  (token invalid) flags `needs_reauth` and pauses loops; all failures logged to
  Sentry with the Meta trace id.
- **Rate governor:** a per-connection call counter in Postgres; loops check the
  budget before fanning out. If a user connects an account with thousands of
  posts, backfill paginates across multiple hours automatically.

---

## 6. User onboarding (step-by-step)

Activation target: **connect → see first insight in under 5 minutes**.

1. **Welcome / value screens (3 swipes).** One per pillar: "Your history,
   forever" / "Know *why* posts work" / "Get paid what you're worth". CTA:
   *Get started*.
2. **Sign up.** Apple / Google / email. Minimal friction; no profile form yet.
3. **Connect Instagram.**
   - Pre-flight explainer: "You need an Instagram **Professional** account
     (Creator or Business). It's free." Inline 30-second guide with screenshots
     for converting a personal account, and a "Why do you connect through
     Facebook?" expander (Meta API requirement — creators find this confusing;
     competitors lose users here, so we over-explain).
   - Launch OAuth → `meta-auth` exchanges the code → connection row created.
   - Failure paths handled explicitly: personal account detected (show convert
     guide), no linked Facebook Page (show link guide), declined permissions
     (explain which feature breaks and offer retry).
4. **Backfill with live progress.** A progress screen streams status:
   "Found 214 posts · pulling lifetime stats… 68%". Median account should
   complete in 1–3 minutes. While it runs, we ask two profile questions
   (niche, typical posting frequency) used by the report engine and rate-card
   benchmarks.
5. **Instant-insight moment (the activation hook).** The second backfill
   finishes, show three computed cards *before* the user reaches the dashboard:
   - "Your top post of all time by reach"
   - "Carousels outperform your Reels by 1.6× on saves"
   - "Your median Reel reaches 4,120 accounts — that's your baseline"
   These come from lifetime totals, so they work on day one with zero
   time-series history.
6. **Notification opt-in**, framed by value: "Get pinged when a post is
   breaking out (usually within 2 hours)." Ask *after* the instant-insight
   moment, not before.
7. **Media kit seed.** One screen: "We drafted your media kit." Pre-filled from
   API data (photo, handle, follower count, engagement rate, top 3 posts).
   User adds rates later; kit stays unpublished until they hit *Publish*.
8. **Land on Pulse** (home) with a subtle 4-step tour overlay.

Trial mechanics on signup (no-card 14-day full trial) are specified in
`02-business-model.md`.

---

## 7. Insight engine (Explain pillar)

Two-stage pipeline; the LLM never sees raw data it could misread.

### 7.1 Stage 1 — deterministic stats (`insight-report` Edge Function, SQL + TS)

Weekly per connection (and once at onboarding using lifetime data):

- **Deviation detection:** for each post in the window, robust z-score per
  metric versus the matching `baselines` row (same `media_type`, same
  `metric_era`): `z = (x − median) / (1.4826 × MAD)`. Flag |z| ≥ 1.5.
- **Correlation scan** across the trailing 90 days, only where `sample_n ≥ 8`:
  posting hour buckets, day-of-week, Reel duration buckets, caption length,
  format mix, first-3-words hook cluster (embedding + k-means over captions).
  Report only effects with a bootstrap 95% CI excluding zero.
- **Follower attribution:** daily follower deltas joined to same-day posts;
  attribute conversion windows (±24h) and compute per-post "followers gained
  while hot".
- Output: a `findings` JSON array, each finding carrying its numbers:
  `{type, statement_data: {metric, group_a, group_b, effect, n, ci}, magnitude}`.

### 7.2 Stage 2 — LLM narration

- Input: the `findings` JSON + the creator's niche + last report (for
  continuity). Prompt contract: *narrate only supplied findings; every sentence
  must reference the numbers provided; no advice not derivable from a finding;
  ≤ 300 words; plain English, no hype.*
- Output stored in `reports.narrative`; the UI renders each paragraph with a
  "show the receipts" expander displaying the underlying finding values.
- Cost control: one small-model call per user per week (~fractions of a cent);
  hard monthly token budget per user; graceful fallback = render findings as
  templated bullet points if the LLM call fails.

This mirrors the Whoop journal's transparent-factors philosophy: the model
explains, the arithmetic decides.

---

## 8. Page layouts

Tab bar (4 tabs + settings): **Pulse · Library · Report · Kit**. Dark theme
throughout the app; the public kit defaults to a light professional theme.

### 8.1 Pulse (home)

Top-to-bottom:

1. **Header row** — avatar + @handle, follower count with 7-day delta chip
   (`+214 ▲`), settings gear.
2. **Hot post card** (only when a post is < 48h old) — thumbnail, live view
   count, and a spark-chart of its accumulation curve drawn over the account's
   p25–p75 baseline band; a status pill: `🔥 3.2× usual velocity` or
   `On pace` / `Below usual`. Tap → post detail.
3. **This week strip** — three stat chips vs. prior week: reach, engagement
   rate, followers gained; each colored by direction.
4. **Latest insight card** — the single highest-magnitude finding from the most
   recent report, one sentence + "show the receipts" chevron.
5. **Kit activity card** (if kit published) — "Your kit was viewed 3× this week
   · 1 contact click", tap → Kit tab.

### 8.2 Library

1. **Filter bar** — format segmented control (All / Reels / Carousels / Posts /
   Stories), metric sort dropdown (reach, views, saves, shares, watch time,
   follower conversion, z-score), date range.
2. **Content grid/list toggle.** List rows: thumbnail, posted date, primary
   metric, and the **z-score badge** — a pill like `×2.1` (green ≥ 1.5, neutral
   −1.5..1.5, red ≤ −1.5) versus the format baseline. This badge is the
   product's core UX idea: deviation from *your own* baseline, not raw counts.
3. **Trial Reels section** — posts tagged `is_trial` grouped with win-rate
   summary ("3 of 7 trials graduated"). Auto-tag if the API exposes trial
   status (verify in the API spike); manual tag toggle as fallback.

**Post detail** (pushed screen): full metrics table with baseline comparison
column; accumulation curve vs. baseline band; per-post findings ("this post's
hook cluster historically runs +38% on saves"); follower-attribution row;
share-to-kit button ("feature this post on your media kit").

### 8.3 Report

1. **Report header** — week range, account summary sentence.
2. **Narrative section** — the LLM narration, paragraph cards, each with
   "show the receipts" expander revealing the finding's numbers (effect size, n,
   CI) and a mini chart.
3. **Deviations list** — every |z| ≥ 1.5 post this week.
4. **Watchlist** — ongoing correlations the engine is tracking but that
   haven't reached significance ("posting time: needs ~3 more weeks of data").
   This converts statistical honesty into a retention mechanic.
5. **Archive picker** — previous weekly reports, forever.

### 8.4 Kit

Editor with live preview (creator-facing, dark):

1. **Publish state row** — public URL `getreceipts.app/kit/@handle`, copy
   button, published toggle, theme picker (light default / dark / brand-color
   accent).
2. **Section manager** — draggable cards, each with visibility toggle:
   About (photo, niche, location, bio), Verified stats (followers, avg reach,
   engagement rate, audience demographics — always sourced live from the API,
   never hand-editable, labeled "Verified via Instagram API · updated 2h ago"),
   Top content (auto-picked, creator can pin), Past collaborations (manual:
   brand name, logo, link, result blurb), Rate card (tiered: Reel / carousel /
   Story set / UGC / usage rights; each row shows a benchmark hint range from
   niche + engagement — see business doc), Contact (email or booking link).
3. **Kit analytics panel** — views over time, referrers, contact-click count.

**Public kit page** (`/kit/[slug]` on the Next.js kit service — the product's
only web surface, §1.3): clean one-scroll light page, server-rendered with an
auto-generated OG image (handle + headline stats) so the link unfurls well in
email/DMs/Slack; "Verified" badges on API-sourced numbers; a subtle "Made with
Receipts" footer (the growth loop — free-tier kits keep this; paid can restyle
it). PDF export renders the same layout via a server-side print route. The
service reads only published-kit fields through a narrow service role; kit
views/clicks are written back to `kit_views`.

### 8.5 Settings

Account (email, plan, **cancel subscription in two taps — works on every
platform**, per the brand promise), Instagram connection (status, reconnect,
disconnect), notifications toggles (breakout alerts, underperformer alerts,
weekly report), data & privacy (export all my data as CSV/JSON, delete
account), legal.

### 8.6 Empty/edge states (first-class, not afterthoughts)

- Personal-account user: full-screen convert guide.
- < 100 followers: demographics unavailable (API rule) — hide section with an
  explainer, don't show zeros.
- New connection with sparse history: Library works (lifetime totals), Report
  shows the onboarding lifetime-analysis instead of a weekly, with a "your
  first weekly report lands Monday" banner.
- Token expired: yellow banner everywhere + one-tap reauth.

---

## 9. Notifications

| Trigger | Copy pattern | Default |
| --- | --- | --- |
| Hot post crosses p75 velocity | "🔥 Your reel is at 3.2× your usual pace (12.4K views in 4h)" | on |
| Hot post below p25 at +6h | "Your post is pacing below usual — a Story share often helps" | off |
| Weekly report ready (Mon 08:00 local) | "Your week, explained: 3 findings inside" | on |
| Kit contact click | "A brand just tapped Contact on your kit 👀" | on |
| Token expiring / expired | "Reconnect Instagram to keep your archive running" | on (forced) |

All sends deduped via `notifications_log`; quiet hours 22:00–08:00 local
except token alerts.

---

## 10. Security & privacy

- RLS owner-only on every user table; public kit reads go through a narrow
  Edge route that exposes only published-kit fields.
- Meta tokens encrypted at rest (Supabase Vault); never returned to the client.
- Read-only scopes only; we cannot post, comment, or DM — stated prominently
  in onboarding and on the marketing site.
- GDPR/CCPA: in-app data export (CSV/JSON of the user's entire archive) and
  hard delete; Meta data-deletion callback implemented (§3.2).
- No selling or pooling of individual creator data. Aggregate, anonymized
  benchmarks (e.g. niche engagement ranges for rate hints) only with explicit
  opt-in.

---

## 11. Build phases

| Phase | Contents | Exit criterion |
| --- | --- | --- |
| **0 — API spike** | Meta dev-mode app; `meta-auth` + a throwaway sync script against 2–3 team-owned creator accounts; confirm per-format insight payloads, watch-time fields, Trial Reel visibility, demographics thresholds | A markdown doc of the actual payloads; schema finalized |
| **1 — Archive slice** | Auth, connect flow, backfill, sync loops, Library + post detail with z-score badges, Pulse without insight card | Dogfooders see their real data end-to-end |
| **2 — Explain** | Baselines + velocity curves, hot-post alerts, stats engine, LLM narration, Report tab, onboarding instant-insights | First weekly report that earns a "huh, I didn't know that" from a test creator |
| **3 — Prove** | Kit editor (in-app), Next.js kit service (public page + OG images + PDF), kit analytics, rate-hint benchmarks | A test creator sends their kit to a real brand |
| **4 — Commercial** | RevenueCat (StoreKit/Play Billing), trial/paywall states, Meta App Review submission, EAS store builds, marketing site | App Review approved; TestFlight/Play internal cohort onboarded |

Testing: unit tests on the stats engine (golden-file findings for synthetic
accounts), contract tests on Meta payload parsing (recorded fixtures from the
spike), Playwright smoke on the public kit page, and a seeded demo account so
every screen is workable without a live Meta connection.

---

## 12. Open technical risks

1. **Meta App Review latency/rejection** — mitigated by dev-mode dogfooding and
   early submission (Phase 4 start, not end).
2. **Trial Reels API visibility unknown** — manual tagging fallback designed in.
3. **Metric availability drift** (Meta renames/retires metrics, as with the
   2025 views migration) — `metric_era` tagging and payload contract tests make
   drift a data-labeling event, not a data-loss event.
4. **Rate limits on huge accounts** — paginated multi-hour backfill + rate
   governor (§5).
5. **LLM narration quality** — templated-bullets fallback means the product
   degrades to "honest stats" rather than breaking.
