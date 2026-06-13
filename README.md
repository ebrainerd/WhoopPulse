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
- **Morning recap** — a daily briefing: yesterday's predicted-vs-actual, model
  accuracy, whether following actions helped, and today's top 3 actions.
- **Personalized model** — a per-user ridge regression learns your own factor
  weights from history and blends with the rule engine as data accumulates.
- **Lightweight trends** — recovery over time and predicted-vs-actual accuracy.

### MVP scope (intentionally narrow)

v1 is the tightest possible **daily recovery loop** for Whoop users. The
following are deliberately **out of scope** until the loop proves retention:
bloodwork analysis, fasting tracker, n-of-1 experiments, coaching/sharing, deep
history/insights, Oura / multi-device, broad nutrition logging, and goal setting.

---

## Tech stack

| Area          | Choice                                             |
| ------------- | -------------------------------------------------- |
| App           | Expo (SDK 54), React Native, TypeScript            |
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
    index.tsx              # Today: morning recap, prediction card, best actions, Whoop
    journal.tsx            # Fast daily journal (live prediction)
    trends.tsx             # Lightweight recovery + predicted-vs-actual charts
  briefing.tsx             # Morning recap (auto-presented once/day)
  what-if.tsx              # Focused What-If simulator (top levers)
  settings.tsx             # Whoop sync, notifications, sign out
src/
  prediction/              # Rule-based + statistical prediction engine
    factors.ts             #   factor rules (+ recommendations)
    engine.ts              #   baseline, calibration, confidence, accuracy
    regression.ts          #   per-user ridge regression (personalization)
  services/                # Supabase data access (journal, whoop, predictions, …)
  context/                 # AuthContext + DataContext
  components/ui/BackgroundScreen.tsx  # nature photo background + scrim
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

### Running on a physical iPhone

This project targets **Expo SDK 54**, which is the version supported by the
**Expo Go** app on the Apple App Store. Just run `npm start` and scan the QR code
with Expo Go. (Newer SDKs like 56 are not yet available in App Store Expo Go, so
they require a custom development build instead — staying on SDK 54 keeps the
free Expo Go workflow working on iOS.)

---

## How it works day-to-day

1. **Morning** (~8 AM notification): open the app → yesterday's Whoop summary +
   today's recovery on the dashboard.
2. **Evening** (~7 PM notification): log the journal in ~2 minutes. The
   prediction card and best actions for tomorrow update instantly.
3. Tap actions as you complete them; tomorrow the model checks its prediction
   against your actual recovery and gets a little sharper.

---

## Deployment

### Web / PWA (free, instant)

The app exports to a static SPA, so any static host works. A `vercel.json` is
included (build `expo export --platform web` → `dist`, with SPA rewrites).

1. Push the repo to GitHub and import it at [vercel.com](https://vercel.com) (or
   Netlify / Cloudflare Pages).
2. Add your `EXPO_PUBLIC_*` variables as **Build Environment Variables** in the
   host dashboard (they're inlined at build time).
3. Deploy. Friends open the URL and tap **Share → Add to Home Screen** on iOS.
4. In the Whoop dashboard, add `https://your-domain/whoop-callback` as a redirect
   URI, and add the domain to Supabase Auth → URL configuration.

> Note: push notifications are not supported on iOS web; everything else works.

Locally you can preview a production web build with:

```bash
npm run build:web && npx serve dist
```

### iOS via TestFlight (native, ~$99/yr)

Requires an [Apple Developer Program](https://developer.apple.com/programs/)
membership and [EAS](https://docs.expo.dev/eas/) (`npm i -g eas-cli`). An
`eas.json` with `development` / `preview` / `production` profiles is included.

```bash
eas login
eas build:configure
npm run build:ios     # cloud build (production profile)
npm run submit:ios    # upload to App Store Connect / TestFlight
```

Then in App Store Connect → TestFlight, enable **external testing** to get a
public invite link you can share with friends (up to 10,000 testers, no per-device
registration). Remember to add the native redirect URI `whooprj://whoop-callback`
to your Whoop app.

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
