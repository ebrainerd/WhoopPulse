# Baseline — Product Documentation

A read-only Instagram performance co-pilot for creators (5K–500K followers),
built on three pillars:

1. **Archive** — keep every metric forever, past Instagram's 90-day deletion
   wall.
2. **Explain** — plain-English diagnosis of every post against the creator's
   own baselines, in the metrics that matter post-2025 (views, watch time,
   retention, shares).
3. **Prove** — a live, API-verified media kit and rate card that turns the
   data into brand-deal income.

Deliberately **no posting or scheduling** — read-only keeps Meta App Review
light, avoids the reliability complaints that dominate competitor reviews, and
is a security selling point. One honest price: $10/month.

## Documents

| Doc | Contents |
| --- | --- |
| [`docs/01-technical-spec.md`](docs/01-technical-spec.md) | How the app functions in detail: infrastructure, auth (Supabase + Meta OAuth), data model, sync engine under API rate limits, onboarding flow, page-by-page layouts, insight engine, notifications, security, build phases |
| [`docs/02-business-model.md`](docs/02-business-model.md) | How it makes money: free "Kit" tier as growth loop, $10/mo Pro tier, card-optional 14-day trial design, unit economics, funnel model, distribution, expansion revenue, competitive pricing |
| [`docs/03-brand-and-design.md`](docs/03-brand-and-design.md) | Unified identity: name rationale (Baseline) + alternatives, logo concepts, dark-first color system with semantic tokens, typography (Space Grotesk + Inter), component language, voice & tone |

## Context

These documents follow from market research (July 2026) into Instagram
creator-analytics tooling. Key findings that shaped the design:

- Instagram deletes account insights after **90 days**; third-party tools'
  compounding asset is the archive they build from connect day.
- Instagram replaced Impressions/Plays with unified **Views** (April 2025),
  breaking historical benchmarks; the algorithm now ranks on watch time,
  replay rate, and shares.
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

Design-phase documents; no application code yet. First build step per the
technical spec is **Phase 0: the Meta Graph API spike** (dev-mode app, confirm
real insight payloads with team-owned creator accounts).

> These docs live in a self-contained `baseline/` folder so they can be lifted
> into a dedicated repository unchanged.
