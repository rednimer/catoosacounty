# Catoosa County Storage — Source of Truth

Extracted 2026-08-09 from the live WordPress site at `http://catoosacountystorage.com`
and cross-checked against third-party directory listings.

Everything below is **verbatim from a cited source** unless marked `[GAP]` (missing,
needs owner input) or `[NEW]` (proposed addition). Do not invent facts about this
business — if it is not in this file, ask.

> **The previous rebuild attempt (May 2026, preserved in `_source/old-site/`) violated
> this rule.** It shipped three fabricated customer testimonials with invented names, a
> phone number that belongs to no verified listing, and roughly a dozen unverified
> amenity claims. None of it may be carried forward. See §9.

---

## 1. Business identity (NAP — must be byte-identical everywhere)

| Field | Value | Source |
|---|---|---|
| Name | Catoosa County Storage | Live site `<title>` and logo |
| Street | 132 Mack Smith Road | Live payments page; Yelp; YellowPages |
| City/State/ZIP | Rossville, GA 30741 | Yelp, YellowPages, CMac (see ZIP conflict below) |
| Phone | 706-858-6498 | **Owner-confirmed 2026-08-09.** Also live contact page, Yelp, YellowPages, CMac |
| Payments (existing customers) | https://www.uhaul.com/Orders/ | Live payments page |
| Reservations (current) | U-Haul partner portal, Fort Oglethorpe GA | Live reserve page |

**Owner decision (2026-08-09): the phone number is `706-858-6498`.**

### Two live-site data conflicts, now resolved or flagged

1. **Phone.** The live *Reserve a Unit* page shows `706-848-6498` — an `848`/`858`
   transposition that appears nowhere else. It is a typo on the current site and is one
   more reason to replace it. Every directory and the contact page agree on `858`.
   → Resolved: use `706-858-6498`.

2. **ZIP.** `[GAP]` The live payments page gives the mailing address as
   **Rossville, GA 30742**. Every directory listing says **30741**. Mack Smith Road sits
   close to the 30741/30742 boundary, so both are plausible and one may be a genuine
   mailing-vs-physical difference. **Confirm with the owner before launch** — a wrong ZIP
   in schema and on Google Business Profile actively suppresses local ranking.
   Currently built as `30741` (directory consensus).

### Directory name mismatch `[GAP]`

Yelp, YellowPages and CMac all list the business as
**"Catoosa County Climate Controlled & Self Storage"**, not "Catoosa County Storage".
One listing reads `132 S Mack Smith Rd` rather than `132 Mack Smith Road`.

This matters: inconsistent NAP across directories dilutes local ranking. Decide on one
canonical name and address string, use it on the site, then correct the listings to match.
The site is currently built as **"Catoosa County Storage"** (what the business calls
itself) with the longer directory name available as schema `alternateName`.

### Old domain status

`catoosacountystorage.com` currently serves an **HTTP 200 WordPress site that has been
compromised** — see §8. Owner decision 2026-08-09: build the replacement on Vercel via
GitHub and cut over; do not attempt to remediate the WordPress install.

---

## 2. Location & directions

Verbatim from the live *Directions and Contact* page:

> "From Cloud Springs Road GA-146 go north on Mack Smith Road approximately 1/10th mile.
> You will see our office on the right after the second house."

That is a genuinely useful landmark direction ("after the second house") and should be
kept — it is exactly the kind of detail that reduces "will I find it" anxiety.

**Scope decision (owner-confirmed 2026-08-09): this is a ONE-location business.**

The live site's tagline — *"Self Storage for Rossville, Fort Oglethorpe at Cloud Springs
and Mack Smith Road"* — reads as if there were two facilities. There are not.
"Cloud Springs" is the **cross street used as a landmark**, not a second site.

> ⚠️ **Do not conflate this with Cloud Springs Storage.** That is a *separate* facility at
> 2862 Cloud Springs Rd, Fort Oglethorpe GA 30741, phone (706) 406-4116, with its own
> domain (`cloudspringsstorage.com`) and its own project folder (`projects/css`). It is a
> different business record with a different phone number. Never merge their NAP data,
> and never reuse copy between the two sites — they would compete for the same queries.

`[GAP]` Geo coordinates. The May build used `34.9834, -85.2864`, which was not sourced
from anything. **Verify against the parcel before launch** — do not ship an unverified
lat/lng in schema.

---

## 3. Unit types (verbatim claims — safe to repeat)

The live site makes exactly two product claims, both explicit:

- **Climate control units** — "temperature and humidity controlled to keep your
  belongings protected"
- **Non-climate control units** — "convenient drive-up access to allow for easy loading
  and unloading"

That is the entire verified product catalogue. Both are confirmed and may be used freely.

---

## 4. Unit sizes `[GAP — BLOCKER]`

**The live site publishes no unit sizes at all.** Not one.

The May build listed 5x5, 5x10, 10x10, 10x15, 10x20 and 10x30 with "comparable to"
copy. That size list is **plausible industry-standard but unsourced** — it did not come
from this business. It must be confirmed before it ships.

**Needed from owner — which sizes actually exist, and in which type:**

```
        size     climate?   drive-up?   qty
        5 x 5      [ ]        [ ]       ___
        5 x 10     [ ]        [ ]       ___
        10 x 10    [ ]        [ ]       ___
        10 x 15    [ ]        [ ]       ___
        10 x 20    [ ]        [ ]       ___
        10 x 30    [ ]        [ ]       ___
        RV / boat / vehicle parking      ___
```

---

## 5. Pricing `[GAP — BLOCKER]`

The live site publishes **no prices**. Neither did the May build.

Decision (carried over from the Cañon City build, which worked): show
**"starting at" prices**, one anchor price per size.

**Needed from owner:**

- One "starting at" monthly rate per size, split by climate / non-climate
- Current move-in special, with exact terms and an expiry date
- Deposit or admin fee, if any
- Lock: required? provided? price?
- Insurance: required? monthly cost?
- Minimum term and notice-to-vacate period
- Any discounts (military, senior, prepay) — Fort Oglethorpe has a large veteran
  population, so a military discount is worth asking about specifically

All prices live in ONE file (`src/data/units.ts`). `priceFrom: null` degrades the UI
honestly to "Call for pricing" — it never renders a fabricated number.

---

## 6. Hours `[GAP]`

| Source | Office hours | Gate hours |
|---|---|---|
| Live site | *not published* | *not published* |
| YellowPages | 9:00 am – 5:00 pm daily | — |
| May 2026 build | Mon–Fri 9–5, Sat 9–1, Sun closed | "extend beyond office hours" |

The May build's Mon–Fri/Sat split and its claim that "gate access hours for tenants extend
beyond office hours" trace to **no source**. The only third-party signal is YellowPages'
"9:00 am – 5:00 pm daily", which is itself unreliable.

**Do not publish hours until the owner confirms them.** Per the playbook rule: never
assume 24/7, and never overstate gate access. Until confirmed the site says
"Call for current office hours" rather than guessing.

---

## 7. Facility features

**Verified — safe to claim:**
- Climate-controlled units (temperature and humidity controlled)
- Non-climate units with drive-up access
- Office on site (the directions reference "our office on the right")
- U-Haul affiliation for payments and reservations

`[GAP]` **Unverified — do NOT claim without owner confirmation.** Every one of these
appeared as fact in the May build with no source:

- Electronic/coded gate access
- Gated or fenced perimeter
- Video surveillance / cameras
- "Well-lit grounds"
- Individually locked units
- Paved driveways
- "Regular pest treatment"
- Month-to-month leases / no long-term contract
- "No deposit required" to reserve
- RV, boat and vehicle storage
- Business storage
- Locally owned
- Proximity claims ("5 minutes from downtown Fort Oglethorpe", "3 minutes from
  the center of Rossville")

Several are *probably* true — most storage facilities are gated — but "probably" is not a
source. A fabricated amenity is a legal exposure and a trust-killer when the customer
arrives and finds otherwise.

---

## 8. Current site is compromised

`http://catoosacountystorage.com` is a WordPress install serving **injected online-casino
spam**: 77 instances of "casino", 36 of "Casino", 20 of "slot" and 3 of "poker" in a
79 KB homepage, in several languages, mixed into the legitimate business content.

Implications for the rebuild:

- **Assume the domain carries an SEO penalty.** Check Google Search Console for a manual
  action and for spam URLs in the index before treating any existing ranking as an asset.
- **Do not migrate any content programmatically** from the live HTML — injected links are
  woven into the real copy. Everything in this file was transcribed by hand for that reason.
- Old URL structure is `/index.php/<slug>/` — `/index.php/making-a-payment/`,
  `/index.php/directions-and-contact/`, `/index.php/reserve-a-unit/`. Map these as 301s
  to the new equivalents.
- Owner decision: no remediation of the WordPress box; replace and cut over.

---

## 9. The May 2026 build — what not to carry forward

Preserved at `_source/old-site/` (git history: commit `118d3fa`). Useful as a **structural**
reference only. Its content is not trustworthy.

**Must not be reused:**

| Problem | Detail |
|---|---|
| Fabricated testimonials | Three invented five-star reviews with invented names — "Sarah M. — Rossville, GA", "James T. — Fort Oglethorpe, GA", "David & Linda R. — East Ridge, TN". Fake reviews with `Review` schema are an FTC exposure, not just a trust problem. |
| Wrong phone | `(706) 861-2327` throughout, including `tel:` links and schema. Matches no verified listing. Every call from that site went to the wrong number — or nowhere. |
| Unverified geo | `34.9834, -85.2864` in `SelfStorage` schema, unsourced. |
| Invented hours | Mon–Fri 9–5 / Sat 9–1 in schema and footer, unsourced. |
| ~12 invented amenities | See the `[GAP]` list in §7. |
| Unsourced unit sizes | The 5x5–10x30 table, presented as this facility's inventory. |

**Worth keeping — the local-SEO page architecture.** Its instinct was right even though
its facts were not:

| Old page | Verdict |
|---|---|
| `rossville-storage.html`, `fort-oglethorpe-storage.html` | Good. Two distinct high-intent local queries. Keep as city pages. |
| `climate-controlled-storage.html` | Strong — this is the one product the business genuinely differentiates on and the directory name literally leads with it. |
| `drive-up-storage.html` | Good, verified product. |
| `rv-boat-vehicle-storage.html` | Only if the owner confirms it exists. |
| `unit-sizes.html` | Keep the page, replace the data. |
| `mini-storage.html`, `business-storage.html` | Thin keyword pages with no verified backing. Drop unless there is something real to say. |
| `pay-online.html` | Keep — existing-customer payments, clearly separated from new leads. |

---

## 10. Reservation & payment flow

Current: both reservations *and* payments hand off to U-Haul.

Decision (carried from Cañon City): **own the lead.** An on-site form captures the
inquiry — name, phone, email, size wanted, climate vs drive-up, move-in date — and
notifies the office. The U-Haul link is retained **only** as "Existing customer? Make a
payment", clearly separated, so a new prospect is never handed to a third party before
the lead is captured.

`[GAP]` Where should leads go? One inbox, or several? Any SMS notification wanted?

---

## 11. Local SEO context

- Rossville, GA 30741 — Catoosa/Walker County line, immediately south of Chattanooga
- The Tennessee state line is ~1 mile north; East Ridge, TN is a real service area
- Nearby/serviceable: Fort Oglethorpe, Rossville, Cloud Springs, Ringgold, Chickamauga,
  Graysville (GA) and East Ridge, Chattanooga (TN)
- Landmarks for directions and content: Cloud Springs Road (GA-146), Battlefield Parkway,
  Chickamauga & Chattanooga National Military Park, I-75 Exit 350
- Cross-border demand is real: Chattanooga metro residents storing just over the GA line

`[GAP]` Needed for full local SEO: Google Business Profile access and current status,
existing review count and rating, whether the owner wants the "Climate Controlled" long
name as the GBP name, and any competitor they specifically want to outrank.

`[GAP]` **Photography — there is none.** The live site has no facility photos and the May
build shipped with an empty `images/` directory. Every photo request in the playbook
applies here, and this is the single biggest content gap:

- The office and the turn off Mack Smith Road ("after the second house")
- The gate and keypad
- A climate-controlled interior hallway
- A drive-up unit with the door open
- Signage from Cloud Springs Road
- The RV/boat area, if it exists
