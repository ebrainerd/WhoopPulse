# Receipts — Product Documentation

**Receipts** is a read-only Instagram performance co-pilot for creators
(5K–500K followers), delivered as a **mobile app (iOS + Android)**, built on
three pillars:

1. **Archive** — keep every metric forever, past Instagram's 90-day deletion
   wall.
2. **Explain** — plain-English diagnosis of every post against the creator's
   own baselines, in the metrics that matter post-2025 (views, watch time,
   retention, shares).
3. **Prove** — a live, API-verified media kit and rate card that turns the
   data into brand-deal income. *Receipts* is creator slang for proof — the
   media kit is literally your receipts.

Deliberately **no posting or scheduling** — read-only keeps Meta App Review
light, avoids the reliability complaints that dominate competitor reviews, and
is a security selling point. One honest price: **$10/month**, free "Kit" tier,
14-day full trial with **no card required**.

## Documents

| Doc | Contents |
| --- | --- |
| [`docs/01-technical-spec.md`](docs/01-technical-spec.md) | How the app functions in detail: infrastructure (Expo mobile app + Supabase + a small Next.js kit web service), auth (Supabase Auth + Meta OAuth), data model, sync engine under API rate limits, onboarding flow, page-by-page layouts, insight engine, notifications, security, build phases |
| [`docs/02-business-model.md`](docs/02-business-model.md) | How it makes money: free "Kit" tier as growth loop, $10/mo Pro tier, no-card 14-day trial design, app-store billing, unit economics, funnel model, distribution, expansion revenue, competitive pricing |
| [`docs/03-brand-and-design.md`](docs/03-brand-and-design.md) | Unified identity: name rationale (Receipts) + alternatives, logo concepts (receipt-tape mark), dark-first color system with semantic tokens, typography (Space Grotesk + Inter), component language, voice & tone |

## Decisions already made (do not relitigate without owner input)

- **Name:** Receipts (owner-approved direction: fun over corporate).
- **Platforms:** mobile-only (iOS + Android via Expo). The only web surface is
  the public media kit page, served by a separate small Next.js service.
- **Pricing:** $10/month or $96/year, single Pro tier, +$5/month per extra
  Instagram account; free tier is the media kit.
- **Trial:** 14 days of Pro, no card required, starts at Instagram connect,
  90-day archive grace window after expiry.
- **Scope exclusions (v1):** no posting/scheduling, no hashtag research, no
  content-generation AI, no follower-list or competitor scraping (Meta ToS).
- **Billing posture:** app-store billing via RevenueCat; cancel from any
  device in two taps; no dark patterns — this is marketed, not just policy.

## Suggested build order (from the technical spec, §11)

1. **Phase 0 — Meta API spike**: dev-mode Meta app, OAuth edge function, a
   throwaway sync script against a real creator account; document actual
   payloads; finalize schema. *Start here — it de-risks everything else.*
2. **Phase 1 — Archive slice**: auth, connect, backfill, sync loops, Library.
3. **Phase 2 — Explain**: baselines, velocity alerts, stats engine + LLM
   report.
4. **Phase 3 — Prove**: kit editor in-app, Next.js kit service.
5. **Phase 4 — Commercial**: RevenueCat, paywall, Meta App Review, store
   builds.

What an implementing agent will need from the owner along the way: a Meta
developer app (App ID/secret), a Supabase project, a test Instagram
Business/Creator account linked to a Facebook Page, and eventually Apple/Play
developer accounts and a RevenueCat project. Nothing external is required to
scaffold the app, schema, and screens with seeded demo data.

## Market context (July 2026 research)

- Instagram deletes account insights after **90 days**; third-party tools'
  compounding asset is the archive they build from connect day.
- Instagram replaced Impressions/Plays with unified **Views** (April 2025),
  breaking historical benchmarks; the algorithm now ranks on watch time,
  replay rate, and shares. The schema tags every snapshot with a
  `metric_era` for this reason.
- Closest competitors: **ReelSignal** (right idea — AI explanations — executed
  too narrowly: Reels-only, single account, 90-day cap, no monetization
  output) and **Flick** (creator price point but analytics is a capped side
  feature; center of gravity moved to AI content generation; desktop-only
  cancellation dark pattern).
- Incumbents' worst public reviews are **commercial**, not functional (Later:
  1.3/5 Trustpilot on billing) — honest billing is a marketable wedge.
- Creators pay most readily for tools that make them money; the media kit
  connects analytics to brand-deal income, which analytics incumbents
  structurally ignore.

## Status

Design-phase documents; no application code yet. This repository is the
implementation home for Receipts — the next step is Phase 0 of the technical
spec (Meta Graph API spike), followed by scaffolding the Expo app.
