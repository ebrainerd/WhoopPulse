# Privacy Policy — Whoop Recovery Journal

_Last updated: June 13, 2026_

Whoop Recovery Journal ("the App") is a personal application used by its owner to
view and analyze their own health and recovery data. This policy explains what
data the App accesses, how it is used, and how it is stored.

## Who this applies to

The App is intended for personal use by the account owner. It is not a commercial
product and does not have multiple end users beyond the individual operating their
own instance.

## Data the App accesses

With your explicit authorization through Whoop's OAuth flow, the App accesses the
following data from the [Whoop API](https://developer.whoop.com/):

- **Recovery** — recovery score, heart rate variability (HRV), resting heart
  rate, skin temperature, blood oxygen (SpO₂)
- **Cycles** — daily strain and related cycle data
- **Sleep** — sleep performance, duration, efficiency, consistency, respiratory
  rate
- **Workouts** — activity/workout data
- **Profile** — basic Whoop profile identifier
- **Body measurements** — basic body-measurement data

The App also stores data you enter yourself in the daily journal (for example:
alcohol intake, meal timing/fasting, supplements, energy/mood, training notes,
work stress, and wind-down routine), as well as weather forecast data retrieved
from [Open-Meteo](https://open-meteo.com/) for your chosen location.

## How the data is used

Your data is used **only** to provide the App's features to you, including:

- Displaying your recovery, sleep, and strain metrics
- Generating next-day recovery predictions and personalized recommendations
- Showing trends, correlations, and prediction-accuracy insights

The data is **not** sold, shared with advertisers, or used for any purpose other
than presenting these insights back to you.

## How the data is stored

- Health and journal data are stored in a private [Supabase](https://supabase.com/)
  database controlled by the App owner, protected by row-level security so that
  data is accessible only to the authenticated owner.
- Whoop OAuth tokens are stored server-side and used solely to sync your data on
  your behalf.
- The App does not transmit your data to any third parties other than the service
  providers required to operate it (Supabase for storage, Whoop for source data,
  and Open-Meteo for weather).

## Data retention and deletion

You remain in control of your data:

- You can revoke the App's access to your Whoop data at any time from your
  [Whoop account settings](https://www.whoop.com/).
- You can request deletion of your stored data, or delete it directly from the
  database, at any time.

## Third-party services

- **Whoop** — source of health/recovery data ([Privacy Policy](https://www.whoop.com/privacy/))
- **Supabase** — authentication and database storage ([Privacy Policy](https://supabase.com/privacy))
- **Open-Meteo** — weather forecast data ([Terms](https://open-meteo.com/en/terms))

## Changes to this policy

This policy may be updated from time to time. Material changes will be reflected
by updating the "Last updated" date above.

## Contact

For any questions about this policy or your data, contact the App owner at:
**your-email@example.com**
