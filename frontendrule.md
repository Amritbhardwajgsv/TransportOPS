# TransitOps — Frontend Design Document & Rulebook v2
## Theme: "NIGHT FREIGHT"

**React + Vite + Tailwind · Hackathon build**

The UI is a truck dashboard at night: true neutral charcoal (zero blue tint anywhere), warm gray text, and a single hi-vis yellow-green accent that reads like instrument backlighting and safety-vest tape. Dense, legible, status-driven. Every role gets their own tailored cockpit, and the interface explains itself — a first-time user should understand each screen without a manual.

---

# PART 1 — DESIGN IDENTITY

## 1.1 Color palette (NO BLUE ANYWHERE)

| Token | Hex | Usage |
|---|---|---|
| `coal-950` | `#141414` | App background |
| `coal-900` | `#1B1B1B` | Card / surface |
| `coal-800` | `#242424` | Elevated surface, table headers, hover |
| `coal-600` | `#3A3A3A` | Borders, dividers |
| `smoke-400` | `#A8A29E` | Secondary text, labels (warm gray — stone, not cool gray) |
| `smoke-100` | `#EDEAE6` | Primary text (warm off-white) |
| `volt-400` | `#C6F432` | THE accent. Buttons, active nav, links, focus rings, chart highlight. Hi-vis yellow-green — safety vest / dashboard backlight |
| `volt-950` | `#1A2005` | Text color ON volt buttons (dark on bright = max contrast) |

**Law: if a color has any blue in it, it doesn't ship.** Grays are warm (stone family). Charts, badges, surfaces — all checked against this.

### Status colors (RESERVED — status only, warmed, zero blue)

| Status | Hex | Applies to |
|---|---|---|
| **Available** | `#4ADE80` warm green | Vehicles, Drivers |
| **On Trip / Dispatched** | `#C6F432` volt | Vehicles, Drivers, Trips — the fleet's "engine running" state gets the signature color |
| **In Shop** | `#FB923C` orange | Vehicles, open Maintenance |
| **Draft** | `#E7B75F` sand | Trips |
| **Completed** | `#4ADE80` green, outline style | Trips |
| **Retired / Suspended / Off Duty / Cancelled** | `#78716C` warm gray | terminal/idle states |
| **Danger / Expired / Blocked** | `#F87171` warm red | Expired licenses, violations, overdue |

Status colors appear ONLY in `<StatusBadge>`, status dots, and chart series. Never on buttons or decoration.

## 1.2 Typography

| Role | Face | Notes |
|---|---|---|
| Display / titles | **Barlow Semi Condensed** 600 | Freight-signage condensed grotesque |
| Body / UI | **Inter** 400/500 | |
| Data / IDs / numbers | **JetBrains Mono** 500 | ALL reg numbers, license numbers, odometer, kg, ₹, liters — right-aligned in tables |

Scale: page title `text-2xl` Barlow · card title `text-lg` Barlow · body `text-sm` · eyebrow labels `text-xs` uppercase `tracking-wider` smoke-400 · KPI numbers `text-3xl` mono · role-page hero numbers `text-4xl` mono.

## 1.3 Surfaces, spacing, texture

- Radius: `rounded-lg` cards/inputs, `rounded-full` badges. 
- No drop shadows. Depth = surface steps (950 → 900 → 800) + 1px `coal-600` borders.
- Signature texture: page headers and the login panel may use a subtle **diagonal hazard-stripe** background — 45° repeating linear-gradient, volt-400 at 4% opacity on coal-950. Use in max 2 places; it's seasoning, not sauce.
- Focus rings: 2px `volt-400` — visible keyboard focus is mandatory.
- Density: table rows `h-11`, inputs `h-10`, page gutter `p-6`.

## 1.4 Icons

**lucide-react**, `strokeWidth={2}`. Fixed vocabulary: Truck, UserRound, Route, Wrench, Fuel, Receipt, LayoutDashboard, BarChart3, Send (dispatch), CheckCircle2 (complete), XCircle (cancel), TriangleAlert (warning), ShieldCheck (safety), Wallet (finance).

## 1.5 Imagery system (WHERE IMAGES GO)

Images make the app feel real. Slots, with sources that are safe and fast:

| Slot | Where | Spec | Source |
|---|---|---|---|
| **Login hero** | Login left panel | Full-bleed, `object-cover`, dark gradient overlay (coal-950 80%→20%) so text stays readable | One night-highway / truck-at-dusk photo from Unsplash (free license), stored in `src/assets/` |
| **Vehicle photos** | Vehicle table (40px rounded thumb) + vehicle detail drawer (16:9 header) + Add Vehicle form (file input w/ preview) | Fallback: coal-800 tile with `Truck` icon — NEVER a broken-image glyph | User upload (store as base64 or URL field for hackathon; S3 later) |
| **Driver photos** | Driver table avatar (32px circle) + driver profile drawer | Fallback: initials on coal-800 circle | User upload, same approach |
| **Role hero illustrations** | Top banner of each role home (Part 3A) | 96–120px icon-scale illustration, volt-400 line style — can be a big lucide icon at `size={96}` `strokeWidth={1}` inside a hazard-stripe header. Zero external dependency | Built from lucide, no downloads |
| **Empty states** | Every empty table | Large lucide icon (48px, smoke-400) + explainer text | lucide |
| **Report cover** | Reports header | Small volt-tinted chart glyph | lucide |

Upload rule for the hackathon: vehicle/driver photo = optional field; `<input type="file">`, read as base64, send in JSON (小 images only, cap ~200KB). Do not build cropping/resizing — accept and display.

---

# PART 2 — APP SHELL, ROLES & SELF-EXPLAINING UI

## 2.1 Layout

Sidebar 232px (`coal-900`, border-right `coal-600`) + topbar + content `max-w-7xl`. Wordmark "TRANSITOPS" Barlow 600, letter-spaced, with a 8px volt square as the dot of the logo. Active nav item: volt text + 2px volt left bar. Sidebar bottom: user chip (photo/initials, name, `<RoleBadge>`), logout.

Mobile <768px: drawer sidebar, tables scroll horizontally.

## 2.2 The four roles — four different apps in one

This is the "5× bigger" principle: instead of one generic dashboard with hidden buttons, **each role logs into their own cockpit** — own home page, own nav emphasis, own explanations. Same components, different composition. Judges logging in as each role should feel a distinct product.

| Role | Sees in nav | Home page (Part 3A) | Can do |
|---|---|---|---|
| **Fleet Manager** | everything | Fleet Command | full CRUD, dispatch, maintenance, all reports |
| **Driver (dispatcher)** | Dashboard, Trips, Vehicles(read), Drivers(read) | Dispatch Desk | create/dispatch/complete trips |
| **Safety Officer** | Dashboard, Drivers, Trips(read) | Compliance Watch | edit driver compliance fields, suspend/reinstate drivers |
| **Financial Analyst** | Dashboard, Expenses, Reports, Vehicles(read) | Cost Console | fuel/expense entry, exports, reports |

Route guards: unauthorized route → redirect to role home. Nav shows only permitted items. Backend re-checks everything.

## 2.3 Self-explaining UI (the "explains the necessary thing" rule)

Every screen teaches itself. Mechanisms — use all four:

1. **Page intro line.** Under every page title, one smoke-400 sentence saying what the screen is for. E.g. Vehicles: "Your fleet's master list. Status changes automatically as vehicles are dispatched or serviced."
2. **`<InfoHint>` component** — small `(?)` icon after complex labels; hover/tap shows a coal-800 tooltip. Required on: Fleet Utilization ("On-Trip vehicles ÷ active fleet"), ROI ("(Revenue − Fuel − Maintenance) ÷ Acquisition Cost"), Safety Score, Cargo Weight ("Must not exceed the vehicle's max load — checked before dispatch").
3. **`<RuleCallout>` component** — a bordered strip (volt left border, coal-900 bg) explaining the business rule active on that screen. Trip form gets: "Only Available vehicles and valid-license drivers are listed. Dispatching sets both to On Trip automatically." This literally displays your rule compliance to judges.
4. **First-visit banner per role home** — dismissible strip: "You're signed in as Safety Officer. You monitor license validity and driver compliance." (store dismissed flag in state).

---

# PART 3A — ROLE HOME PAGES (the four cockpits)

Each role's `/` route renders THEIR home. All use: hazard-stripe header band with role icon (96px lucide, volt, strokeWidth 1) + role title + intro line, then role-specific content.

## Fleet Manager → "Fleet Command"

- Header: `Truck` icon · "Fleet Command" · "Everything on the road, in the shop, and in between."
- Full KPI row (7 cards): Active Vehicles · Available · In Maintenance · Active Trips · Draft Trips · Drivers On Duty · Fleet Utilization % (volt progress bar)
- **Fleet board**: grid of vehicle cards (photo thumb / truck fallback, reg mono, model, StatusBadge) — a visual parking lot of the fleet; click → vehicle drawer
- Active trips table (⅔) + Attention panel (⅓): expired licenses, vehicles in shop, drafts older than today
- Quick actions row: Add vehicle · Add driver · New trip · Log maintenance

## Driver (dispatcher) → "Dispatch Desk"

- Header: `Route` icon · "Dispatch Desk" · "Create trips, dispatch, and close them out."
- Big volt CTA card: "New trip" (the role's whole job — make it unmissable)
- **My active trips**: card list, each showing route A → B, vehicle reg (mono), status, and the context action (Dispatched → "Complete trip")
- "Ready to roll" strip: count of Available vehicles + Available drivers right now ("6 vehicles · 4 drivers ready")
- RuleCallout: dispatch/status-transition rules

## Safety Officer → "Compliance Watch"

- Header: `ShieldCheck` icon · "Compliance Watch" · "Licenses, suspensions, and safety scores."
- KPI row: Valid Licenses · **Expiring ≤30 days** (sand) · **Expired** (red) · Suspended drivers
- **License radar table**: drivers sorted by expiry ascending — expired rows red-tinted with TriangleAlert; each row action: "Suspend" / "Reinstate"
- Safety score strip: horizontal bar per driver, volt fill, red below 50
- RuleCallout: "Drivers with expired licenses or Suspended status never appear in dispatch."

## Financial Analyst → "Cost Console"

- Header: `Wallet` icon · "Cost Console" · "Where the money goes, per vehicle and per liter."
- KPI row: Total Fuel Cost (month) · Total Maintenance Cost · Total Operational Cost · Avg Fuel Efficiency (km/L)
- **Cost per vehicle** stacked bar (fuel volt / maintenance orange)
- Recent fuel logs + expenses table (last 10)
- Buttons: "Log fuel" · "Add expense" · "Open reports"

---

# PART 3B — FUNCTIONAL SCREENS

(Names, tables, modals — same contracts as v1, re-skinned to Night Freight. Deltas and key rules:)

## Login (`/login`)

Split: left 45% = **night-highway photo** hero with coal gradient overlay + wordmark + tagline "Fleet operations, off the spreadsheet." + three sample StatusBadges. Right: coal-900 card, email/password, volt "Sign in" button (volt-950 text). Errors: warm red inline. No role selection at signup — roles are assigned, not chosen.

## Vehicles (`/vehicles`)

Intro line + Add vehicle (volt, Fleet Manager only). Search + status chips (active chip = volt outline). Table now begins with a **photo thumb column** (40px, rounded, truck-icon fallback). Reg mono bold · Model · Type · Max load · Odometer · Cost · StatusBadge · actions. Add/Edit modal includes **photo upload with preview** (optional). Duplicate reg → field error from 409. Status is never directly editable. Row click → **detail drawer** (right slide-over, `coal-900`): 16:9 photo header, spec list, mini history (trips + maintenance for this vehicle).

## Drivers (`/drivers`)

Avatar column (photo/initials). License expiry treatment: expired = red date + icon + chip; ≤30 days = sand. Profile drawer with photo, license block (mono), safety score bar. Suspend/reinstate via action menu with ConfirmDialog. On Trip status is workflow-only.

## Trips (`/trips`)

RuleCallout at top. Create form: Source/Destination; **Vehicle dropdown = Available only**, options show "reg · model · capacity kg"; **Driver dropdown = Available + valid license + not suspended**; Cargo weight with **live over-capacity validation** ("Cargo 650 kg exceeds capacity (500 kg)" — red, submit disabled); planned distance. Buttons: Save as draft (ghost) / Dispatch (volt, Send icon). Table with status-dependent actions (Draft: Dispatch·Cancel / Dispatched: Complete·Cancel / terminal: none). Complete modal: final odometer (> start, live-checked) + fuel consumed. Toasts narrate transitions: "Trip TR-014 completed. Vehicle and driver are Available again."

## Maintenance (`/maintenance`)

Open records volt-orange badged "In Shop". New record: vehicle (non-retired, not On Trip), description, cost. Create/close toasts announce the automatic status flips. Empty state: wrench icon + "No maintenance records yet."

## Fuel & Expenses (`/expenses`)

Tabs Fuel | Expenses. Mono numerics. Per-vehicle **total operational cost strip** (fuel+maintenance). Financial Analyst home links here.

## Reports (`/reports`)

Recharts, styled: coal-950 transparent bg, coal-600 gridlines, smoke-400 axes, tooltip on coal-800. Charts: fuel efficiency horizontal bars (volt) · utilization line (volt) · cost stacked bars (volt + orange) · ROI table (negative red). InfoHints on every formula. Export CSV (client-side). PDF export only if time remains (bonus).

---

# PART 4 — COMPONENT RULEBOOK

All in `src/components/`, single implementations:

`<StatusBadge>` (single source of status→color truth) · `<RoleBadge>` · `<KpiCard>` · `<DataTable>` (numeric cols right-aligned mono) · `<Modal>` · `<Drawer>` (right slide-over for vehicle/driver detail) · `<Field>` (focus ring volt) · `<Button>` (primary volt / ghost / danger red — danger only for destructive confirms) · `<Toast>` (bottom-right, 4s, one per mutation) · `<EmptyState>` · `<ConfirmDialog>` · `<InfoHint>` · `<RuleCallout>` · `<Avatar>` (photo→initials fallback) · `<PhotoThumb>` (photo→icon fallback).

**Validation laws:** validate on submit, re-validate on change; name the field in errors; pre-checkable business rules (cargo/capacity, expired license, odometer) validate live before submit; server 409/422 map to field errors; buttons disable in-flight.

**Data laws:** one `api.js` (axios, baseURL `/api`, JWT interceptor); 401 → login; every list has loading (skeleton pulse rows) / empty / error states; refetch affected lists + KPIs after every mutation; no Redux — auth context + hooks.

**Theme law:** no blue. If a hex starts looking cool-toned, warm it or gray it.

---

# PART 5 — VOICE

Buttons say what they do ("Dispatch trip", not "Submit"). Toasts narrate the business rule ("…now On Trip"). Errors say what's wrong and the fix. Intro lines explain purpose. Sentence case. Plain verbs. The interface is calm — it's 2 AM on the highway; nothing shouts except the volt accent.

---

# PART 6 — BUILD ORDER (8 hours, role-aware)

1. **H1:** Shell + routing + auth context + Login (with hero image)
2. **H2:** Component kit (StatusBadge → Button → DataTable → Modal → Field → Toast first; InfoHint/RuleCallout are 10-minute components — don't skip, they're the explain-layer)
3. **H3–4:** Vehicles + Drivers CRUD incl. photo upload + drawers
4. **H4–5:** Trips end-to-end (create/validate/dispatch/complete/cancel)
5. **H5–6:** Maintenance + Fuel/Expenses
6. **H6–7:** The four role homes (compose from existing components — this is assembly, not new machinery) + Reports charts
7. **H8:** Seed demo data for ALL four roles, run the PDF's Section-5 workflow logged in as each role, polish

**Scope safety valve:** if time collapses, the cut order is: role homes fold back into one shared dashboard with role-filtered widgets → drawers become plain modals → photos become fallback-only. The business rules and trip flow are never cut — they're the grade.

**Demo script bonus:** log in as each role in sequence — Fleet Manager registers vehicle → Dispatcher creates & dispatches trip → Safety Offic

er shows the expired-license block → Financial Analyst shows cost per vehicle. Four logins, four different cockpits, every mandatory rule demonstrated. That's a winning demo.
