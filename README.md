# Whoop Recovery Journal

A React Native + Expo app (iOS / Android / Web) that auto-syncs your
[Whoop](https://www.whoop.com/) data and pairs it with a fast daily journal to
deliver **next-day recovery predictions** and **prioritized "best actions"** to
maximize tomorrow's recovery.

Built for optimizing lifting (Push/Pull/Legs), fasting, creatine, sleep, and
stress. Dark, minimal UI.

---

## Core value

> Daily auto-sync + quick journaling → personalized correlations, a next-day
> recovery-score prediction, and specific recommendations to boost tomorrow's
> recovery.

- **Next-Day Recovery Prediction** — estimate tomorrow's recovery score (0–100)
  from today's journal + recent Whoop data + the weather forecast, shown as e.g.
  `Predicted Recovery: 78 (±8) — Good but room to improve.`
- **Best Actions Today** — a tappable checklist of the 3–5 highest-impact things
  you can still do tonight, each with its potential point gain.
- **What-If simulator** — toggle hypothetical inputs and watch the predicted
  score move in real time.
- **Accuracy tracking** — predictions are reconciled against actual recovery so
  you can see how accurate the model has been (`±6 pts lately`).
- **Insights** — top drivers (correlations), long-term trends, and CSV export.

---

## Tech stack

| Area          | Choice                                             |
| ------------- | -------------------------------------------------- |
| App           | Expo (SDK 56), React Native, TypeScript            |
| Routing       | Expo Router (file-based)                            |
| Styling       | NativeWind (Tailwind) — dark minimal theme         |
| Backend       | Supabase (Auth, Postgres + RLS, Edge Functions)    |
| Charts        | Custom `react-native-svg` line/bar charts          |
| Notifications | `expo-notifications` (local daily reminders)       |
| Weather       | Open-Meteo (no API key required)                   |
| Whoop OAuth   | `expo-auth-session` (PKCE) + Edge Function exchange |

---

## Project structure

```
app/                       # Expo Router screens
  (auth)/sign-in.tsx       # Email/password auth
  onboarding.tsx           # Profile, Whoop connect, notifications
  (tabs)/
    index.tsx              # Dashboard: prediction card, best actions, Whoop, weather
    journal.tsx            # Daily journal form (live prediction)
    history.tsx            # Trends + predicted-vs-actual charts
    insights.tsx           # Drivers, observations, export
  what-if.tsx              # What-If simulator (modal)
  settings.tsx             # Whoop sync, notifications, sign out
src/
  prediction/              # Rule-based + statistical prediction engine
    factors.ts             #   factor rules (+ recommendations)
    engine.ts              #   baseline, calibration, confidence, accuracy
    insights.ts            #   correlations + trend observations
  services/                # Supabase data access (journal, whoop, predictions, …)
  context/                 # AuthContext + DataContext
  components/              # UI primitives, charts, dashboard cards, journal form
  hooks/useWhoopAuth.ts    # Whoop OAuth flow
supabase/
  migrations/0001_init.sql # Schema + RLS + triggers
  functions/whoop-auth/    # OAuth code → token exchange (holds client secret)
  functions/whoop-sync/    # Token refresh + pull recovery/cycle/sleep
```

---

## Prediction & recommendation engine

The MVP model is **rule-based + a lightweight statistical layer**, all in
`src/prediction`:

1. **Baseline** — an exponentially-weighted moving average of recent recovery
   scores (`engine.ts → computeBaseline`).
2. **Factor adjustments** — each rule in `factors.ts` inspects the journal /
   weather / yesterday's strain and returns a point impact, e.g.:
   - Alcohol `-6/drink` (cap −22), high work-stress, late wind-down, late meal,
     late caffeine, heavy training load, warm overnight forecast → penalties.
   - Creatine, magnesium, good fasting window, hydration, early wind-down,
     good energy/mood → bonuses.
3. **Personal calibration** — once ≥5 past predictions have known actuals, the
   mean residual shifts future predictions to correct systematic bias.
4. **Confidence band** — derived from historical mean absolute error (or data
   volume during cold start).
5. **Recommendations** — every rule with a realizable gain becomes an actionable
   suggestion; the top 5 by impact are shown and logged to `recommendations_log`.

`predicted = clamp(baseline + Σ factor impacts + calibration, 1, 99)`

Predictions and recommendations are recomputed whenever the journal is saved and
persisted to the `predictions` table for accuracy tracking. The same pure engine
powers the **What-If simulator** (run without saving) and a `predict`-style
Edge Function can reuse the logic for heavier server-side computation later.

---

## Data model (Supabase)

| Table                 | Purpose                                                       |
| --------------------- | ------------------------------------------------------------ |
| `profiles`            | User profile, location (for weather), baseline               |
| `whoop_connections`   | OAuth tokens (server-managed), last sync time                |
| `whoop_cycles`        | Daily Whoop data: recovery, HRV, RHR, skin temp, sleep, strain |
| `journal_entries`     | Alcohol, meals/fasting, supplements, creatine, energy/mood, training, stress, wind-down |
| `predictions`         | `date, predicted_score, actual_score, confidence, baseline, factors` |
| `recommendations_log` | Which actions were suggested and followed                    |
| `weather_daily`       | Cached forecast snapshots                                    |

All tables are protected by **Row Level Security** (owner-only access). A trigger
auto-creates a `profiles` row on signup.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

> Some Expo web peers are noisy; if a fresh install errors on peer deps, use
> `npm install --legacy-peer-deps`.

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema: run the SQL in `supabase/migrations/0001_init.sql` in the
   Supabase SQL editor, or with the CLI:
   ```bash
   supabase link --project-ref <your-ref>
   supabase db push
   ```
3. Copy your **Project URL** and **anon key** from Project Settings → API.

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
EXPO_PUBLIC_WHOOP_CLIENT_ID=YOUR-WHOOP-CLIENT-ID
EXPO_PUBLIC_DEFAULT_LAT=33.8622
EXPO_PUBLIC_DEFAULT_LNG=-118.3995
EXPO_PUBLIC_DEFAULT_LOCATION_NAME=Hermosa Beach, CA
```

### 4. Whoop developer setup

1. Go to the [Whoop Developer Dashboard](https://developer.whoop.com/) and create
   an app.
2. Request the maximal scopes: `read:recovery`, `read:cycles`, `read:sleep`,
   `read:workout`, `read:profile`, `read:body_measurement`, and `offline`
   (for refresh tokens).
3. Add redirect URIs:
   - Native: `whooprj://whoop-callback`
   - Web (dev): `http://localhost:8081/whoop-callback`
4. Put the **client id** in `EXPO_PUBLIC_WHOOP_CLIENT_ID`.

### 5. Deploy the Edge Functions

The client secret stays server-side. Set Supabase secrets and deploy:

```bash
supabase secrets set \
  WHOOP_CLIENT_ID=your-client-id \
  WHOOP_CLIENT_SECRET=your-client-secret

supabase functions deploy whoop-auth
supabase functions deploy whoop-sync
```

(`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided to functions automatically.)

### 6. Run the app

```bash
npm start        # Expo dev server (scan QR / press i / a / w)
npm run web      # Web
npm run ios      # iOS simulator (macOS)
npm run android  # Android emulator
```

If Supabase env vars are missing, the app shows a friendly setup screen instead
of crashing.

---

## How it works day-to-day

1. **Morning** (~8 AM notification): open the app → yesterday's Whoop summary +
   today's recovery on the dashboard.
2. **Evening** (~7 PM notification): log the journal in ~2 minutes. The
   prediction card and best actions for tomorrow update instantly.
3. Tap actions as you complete them; tomorrow the model checks its prediction
   against your actual recovery and gets a little sharper.

---

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm start`         | Start the Expo dev server            |
| `npm run web`       | Run on web                           |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`)    |
| `npm run format`    | Prettier                             |

---

## Notes & roadmap

- **MVP model** is intentionally transparent (you can see every factor's points).
- **Later**: swap/augment the rule layer with on-device TensorFlow.js or a
  scikit-learn model in an Edge Function, trained on your personal history.
- Whoop's webhook support can replace polling for near-real-time sync.
