# Receipts — Business Model

> How the app makes money, what users pay for, what the free tier and trial
> look like, and why the commercial posture itself is a competitive weapon.

---

## 1. The one-line business

A **$10/month flat subscription** sold directly to creators (not to marketers
or agencies), with a free tier that doubles as the growth engine, and a
commercial posture — honest billing, cancel anywhere, no add-on fees — that
directly attacks the incumbents' worst-reviewed behavior.

## 2. Who pays, and why they pay

**Target customer:** the "monetizable middle" — creators with roughly 5K–500K
followers for whom Instagram is a primary platform. Industry data puts ~60M
creators worldwide in this band; it is where the monetization gap is widest
(median creator earnings under $500/year against audiences worth $4K–22K).

Three willingness-to-pay drivers, in order of strength:

1. **Money in** — the media kit and rate card directly support brand-deal
   income. A single deal priced $50 higher pays for years of subscription.
   Creators pay far more readily for revenue tools than reporting tools.
2. **Loss aversion** — from the day they connect, the archive accumulates data
   Instagram deletes after 90 days. Cancelling means the history stops. This is
   an honest switching cost: we never hold data hostage (export is always
   available), but the *ongoing collection* is the subscription.
3. **Understanding** — the weekly "why" report replaces the anxiety loop of
   staring at native Insights with a Monday-morning explanation.

## 3. Packaging

### 3.1 Free tier — "Kit"

Free forever, no card. Contains:

- The **live media kit** with API-verified stats, one published kit,
  "Made with Receipts" footer branding, standard light theme.
- Library view of lifetime post metrics (no time-series archive, no baselines,
  no z-score badges).
- Kit view counter (total views only; no referrers or click detail).

Why give the kit away: every kit sent to a brand is an advertisement viewed by
*exactly our future customers' peers and partners*. The verified-stats page is
the shareable artifact; the analytics engine is the paid substance behind it.
Free users cost us almost nothing to serve (no hot-loop sync, no LLM calls —
one lifetime-stats refresh per week to keep the kit's numbers honest).

### 3.2 Paid tier — "Pro" ($10/month or $96/year, ≈ 20% off)

Everything, no feature gates within the tier:

- **Archive**: full snapshot engine, unlimited history, CSV/JSON export.
- **Explain**: baselines and z-score badges, first-24h velocity tracking with
  breakout push alerts, weekly LLM-narrated report with "show the receipts".
- **Prove**: kit customization (themes, remove Receipts branding), rate card
  with benchmark hints, kit analytics (referrers, contact clicks), PDF export.
- Priority support.

One tier, one price, everything included. The pricing page states the
anti-pattern list explicitly: *no per-profile fees, no per-seat fees, no
"analytics is on the higher plan", cancel in two taps on any device.*

### 3.3 Add-on: extra Instagram accounts (+$5/month each)

For creators running two brands and small managers running 2–5 accounts. This
is deliberately linear and cheap — Flick charges £4/profile *on top of* tiered
plans; ReelSignal simply can't do it. A proper multi-seat agency tier (shared
workspaces, client report exports, white-label kits) is a later expansion
(§8), priced ~$49/month when built — not before.

### 3.4 What we will NOT monetize

- No selling creator data, no sponsored placement inside reports, no
  pay-to-boost gimmicks. The product's credibility *is* the product: a media
  kit is only valuable to brands if the numbers behind it are untouchable.

## 4. The trial

**14 days of Pro, no card required, starting at Instagram connect** (not at
signup — the clock starts when value starts).

Mechanics:

- Day 0: connect → backfill → instant insights → archive starts accruing.
- Day 7 (or first Monday): first weekly report — the primary conversion
  moment. In-app nudge after the report is read: "Your archive has 9 days of
  history Instagram will delete. Keep it running — $10/month."
- Day 12: email + push, plain copy, shows *their own numbers* ("Receipts has
  captured 41K views of history for you so far").
- Day 14: trial ends. **No surprise charge — there is no card on file.**
  Account downgrades to Kit (free): kit stays live, Library keeps lifetime
  stats, but the snapshot engine pauses and Report/alerts lock.
- **Grace window:** the accumulated archive is preserved for 90 days after
  trial end; subscribing within the window restores it seamlessly ("your
  history is waiting"). After 90 days of inactivity we delete time-series data
  (and say so up front — it's also our GDPR-minimization story).

Why no-card instead of card-required: our positioning attacks
auto-renew-surprise billing; starting the relationship with a dark-pattern-free
trial is the walk that matches the talk. We accept a lower trial→paid
conversion rate in exchange for a much larger top-of-funnel (connects), because
every connect starts an archive (lock-in) and usually publishes a kit
(distribution).

**Billing promises (published, marketed, kept):**

- Cancellation from any device, two taps, no survey wall, no desktop-only trick
  (Flick's most-cited dark pattern; Later's Trustpilot is 1.3/5 on this).
- Email 7 days before every **annual** renewal.
- Prorated refunds on annual plans, no questions asked.
- All billing runs through the app stores (StoreKit / Play Billing via
  RevenueCat), so users can also cancel from their Apple or Google
  subscription settings — nobody is ever more than two taps from out. The
  15–30% commission is the cost of that trust posture; Apple's Small Business
  Program (15% under $1M/year) applies for the foreseeable future.

## 5. Unit economics (per paying user per month)

| Cost | Estimate | Notes |
| --- | --- | --- |
| Supabase (DB + Edge + storage) | ~$0.15–0.40 | Snapshots are tiny rows; ~50K rows/user/year ≈ negligible storage; Edge Function invocations dominated by sync loops |
| LLM narration | ~$0.02–0.10 | One small-model call/week, structured input, ≤ 300-word output |
| Push/email | ~$0.02 | Expo push free; transactional email ~pennies |
| Payments | ~$1.50 | Apple/Google 15% (small-business tier) on the $10 subscription; rises toward 30% only past $1M/yr |
| **Total COGS** | **≈ $1.70–2.10** | **Gross margin ≈ 79–83%** |

Fixed costs at prototype stage: Meta app (free), Apple ($99/yr), Play ($25
once), Sentry/PostHog free tiers, domain. The product is a solo-buildable
margin profile; there is no per-user human cost until support volume appears.

## 6. Funnel model (planning baseline, not a forecast)

Assumptions to validate, with the metric that tests each:

| Stage | Assumption | Instrumented metric |
| --- | --- | --- |
| Visitor → store install → signup | 8% end-to-end | marketing-site CTA → App/Play Store page conversion → first-open signup (each step instrumented; the store page is an extra drop-off unique to mobile-only, so screenshots/preview video matter) |
| Signup → successful IG connect | 55% (Meta OAuth friction is real; the convert-your-account guide is the lever) | onboarding funnel step |
| Connect → trial-end active (read ≥ 2 reports) | 45% | weekly retention during trial |
| Trial → paid | 12–18% (no-card-trial norm) | conversion at day 14–104 (grace window rescues late converters) |
| Paid monthly churn | 4–6% early, target < 3.5% as archive depth grows | cohort retention |

Implication at small scale: 10,000 visitors/month ⇒ ~800 signups ⇒ ~440
connects ⇒ ~55–80 new paying users/month ⇒ crossing ~$10K MRR requires roughly
1,000 subscribers, i.e. 12–18 months of that funnel or better distribution.
The kit loop (§7) is what bends that curve; paid acquisition at $10/month
price points generally doesn't.

**LTV sanity check:** at $10/month and 4% monthly churn, LTV ≈ $250 gross.
That supports meaningful affiliate payouts (§7) and modest paid experiments,
but the plan assumes organic-first.

## 7. Distribution (how users arrive)

1. **The kit loop (structural).** Free kits carry "Made with Receipts"; kits
   are sent to brands and shared in creator communities; recipients include
   other creators and managers. This is the compounding channel and the reason
   the free tier exists.
2. **Creator-affiliate program** — 30% recurring for 12 months, aimed at
   micro-creators in the "creator economy education" niche who review tools;
   this audience converts peers efficiently and 30%/12mo is affordable at our
   margin.
3. **Content SEO** — honest, data-grounded posts on exactly the searches our
   research surfaced: "instagram analytics beyond 90 days", "why did my reach
   drop", "instagram media kit with verified stats", "impressions vs views
   change". Low competition, perfect intent match.
4. **Community presence** — r/Instagram, r/InstagramMarketing, creator Discord
   servers; contribute analysis, not spam.
5. **App Store search** — "instagram analytics" ASO; the incumbents' mobile
   apps are weak (Flick's is deliberately limited; ReelSignal has none), so
   mobile-first is also a distribution wedge, not just UX.

## 8. Expansion revenue (sequenced, not v1)

1. **Multi-account add-on** (+$5/account) — ships with v1, trivial marginal
   cost.
2. **Agency tier** (~$49/month) — workspaces, white-label kits and PDF
   reports, client seats. Build when ≥ ~50 paying users are already stacking
   the $5 add-on (demand signal, not speculation).
3. **TikTok/YouTube Shorts modules** — same archive/explain/prove pillars,
   priced as +$5 platform add-ons or folded into a $15 "all platforms" tier.
   Also the primary hedge against single-platform (Meta) dependency.
4. **Brand-side surface (long-term option)** — brands viewing many Receipts
   kits may pay for search/verification tooling. Two-sided potential, but only
   after kit volume exists. Never sell creator data to get there.

## 9. Competitive pricing context

| Product | Entry price | What you actually get at entry |
| --- | --- | --- |
| Instagram Insights | free | 90-day window, no explanations, no kit |
| ReelSignal | $15/mo | Reels-only, one account, 90-day history |
| Flick Solo | £11/mo (~$14) | 30 tracked posts/mo, partial features; real analytics needs Pro £24 |
| Later | $25+/mo | scheduling-first; analytics called "basic" even by fans; 1.3/5 Trustpilot billing reputation |
| Iconosquare | ~€49/mo | agency-grade, agency-priced |
| **Receipts Pro** | **$10/mo** | full archive + explanations + media kit, one honest tier |

Positioning sentence: *"Cheaper than every serious alternative, deeper than
everything at its price, and the only one that helps you get paid."*

## 10. Business risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Meta extends native retention past 90 days | Weakens Archive pillar only; Explain + Prove are untouched, and the kit is unaffected |
| Incumbents ship AI insights | They sell to marketers/agencies; the creator-monetization angle (kit + rates) is structurally off their roadmap. Speed + focus |
| Trial abuse (connect, export, leave) | Export is a feature, not a leak — the value is *ongoing* collection and weekly explanation |
| App-store commission compresses margin | Acceptable at 15% small-business rate (~79–83% gross margin); if scale ever warrants it, external-purchase links for annual plans are now permitted in most regions — an option, not a plan |
| Low price ceiling limits paid acquisition | Organic-first plan; kit loop and affiliates are margin-compatible |
