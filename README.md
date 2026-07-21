# whova-three

A **Whova-style event & conference app** for **RSA** — the all-in-one mobile app
for a national training conference & trade show. It carries the agenda, personal
schedules, speakers, discussion boards, attendee networking, a digital help desk,
vendor lead-scanning, training check-in, and a full admin/organizer back office —
all tied together by a single **universal attendee QR code**.

The project has **two tracks**, and you can see the first one right now in a browser:

| Track | What it is | Where |
|-------|-----------|-------|
| 🅐 **Interactive prototype** | A clickable, mobile-first mockup of the whole app (all 3 roles). No install — runs in any browser, including Safari on your iPhone/iPad. | [`/docs`](./docs) → GitHub Pages |
| 🅑 **Native app** *(next)* | The real React Native + Expo app that ships to iPhone/iPad and the App Store. | root project (Expo scaffold in place) |

---

## 🅐 The live prototype (view it now)

Once GitHub Pages is enabled (see below), the prototype is live at:

> **https://nors3ai.github.io/whova-three/**

It works on a phone, tablet, or desktop. On desktop it's shown inside a phone
frame; on your iPhone/iPad it fills the screen like a real app.

### What you can do in the prototype
Tap the **role pill** in the top-right to switch between **Attendee**, **Vendor**,
and **Admin** — one account, one login, one QR code, three different tool sets.
The marquee flows actually work:

- ⭐ **Star agenda sessions** → they land in *My Schedule* with double-booking warnings.
- 💬 **Discussion Board** → filter by category, open threads, see "official answers", and the **"similar discussions"** suggester as you type a new title.
- 👋 **Request contact** → the recipient picks exactly which fields to share (with a privacy warning); vendors auto-share their approved company card.
- 🎧 **Help Desk (Contact RSA)** → conversational support with **suggested answers** surfaced before you send.
- 🔳 **Universal QR** → the same code drives Registration check-in, Training check-in (green ✓ / red ✗), Vendor lead capture, and Admin lookup — each scanner sees a different result.
- 🧲 **Vendor** → dashboard, lead list + export, lead scanner, editable booth profile.
- 🛡️ **Admin** → event overview, broadcast/push, moderation queue, help-desk queue, users & roles, training rosters, reporting, audit log.

### Enabling GitHub Pages (one-time, ~20 seconds)
1. Repo **Settings → Pages** → https://github.com/NORS3AI/whova-three/settings/pages
2. **Source:** *Deploy from a branch*
3. **Branch:** `main` · **Folder:** `/docs` → **Save**
4. Wait ~1 minute, then open **https://nors3ai.github.io/whova-three/**

### Prototype tech
Deliberately dependency-free so it deploys straight to Pages with **no build step**:

```
docs/
├── index.html   # app shell (device frame, tab bar, sheet, toast)
├── styles.css   # design system (light/dark, per-role theming)
├── data.js      # all mock data (fake — lives only in the browser)
└── app.js       # router + every screen + interactions
```

---

## 🅑 The native app (React Native + Expo)

The prototype defines the UX; the shipping app is built with **React Native +
[Expo](https://expo.dev)** (TypeScript). This stack was chosen specifically for
this setup — **development on Windows, an iPhone + iPad for testing, no Mac:**

- **Develop on Windows 10** — no Mac needed to write code.
- **Test on your real iPhone/iPad instantly** — install the free **Expo Go** app,
  scan a QR code, and the app loads live and hot-reloads on every change.
- **Ship to iOS without a Mac** — `npx expo prebuild` generates a real native
  `ios/` **Xcode project**, and **EAS Build** compiles the iOS app **in the cloud**
  for TestFlight / the App Store.

```bash
npm install
npx expo start   # scan the QR with Expo Go on your iPhone/iPad
```

> The Expo project is currently a base scaffold (SDK 57, TypeScript). Building the
> real screens is the next phase — the prototype's screens translate almost 1:1.

---

## Full feature set (from the requirements)

Grouped by role. ✅ = represented in the prototype · ⏳ = planned for the native app.

### Attendee
- ✅ Agenda (main event) with day selector, tracks, rooms, speakers
- ✅ My Schedule — star sessions, double-booking detection, "same class at another time" recommendation, session reminders (push)
- ✅ Speakers (name, info, photo, bio)
- ✅ Supplier Directory (profiles, booths, categories)
- ✅ Announcements & Push Notifications (per-category)
- ✅ Photo Share / Gallery — upload, caption, like/react, report, admin approval
- ✅ Venue Map & Trade-Show Map (booths link to supplier profiles)
- ⏳ Session Q&A (prototype shows the pattern)
- ✅ Discussion Board — threads, replies, upvotes, official answers, subscribe, categories, keyword search, "similar discussions" suggestions, post-as identity (personal vs vendor)
- ✅ Digital Help Desk (Contact RSA) — categories, suggested answers, conversation history
- ✅ Contact Exchange — request contact, recipient chooses fields, vendor auto-card
- ✅ Personal Profile + privacy controls
- ✅ Notification Settings — mute categories (emergency always on)
- ✅ Universal Attendee QR Code

### Vendor / Exhibitor
- ✅ Company/booth profile, reps, product categories, website/social, approved public contact
- ✅ Lead scanning (QR) with duplicate-prevention, auto timestamp + scanning rep
- ✅ Lead management — notes, qualification, list, CSV export
- ✅ Vendor-only announcements
- ✅ Vendor dashboard — lead totals
- ✅ Favorites / bookmark suppliers (attendee side)

### Admin / Organizer
- ✅ Manage agenda, speakers, suppliers
- ✅ Send announcements & push (now or scheduled, by audience)
- ✅ Reporting & event-data export
- ✅ User & role management — assign roles, dual-role users, permissions
- ✅ Discussion & content moderation — remove, pin, official answer, lock, reported queue
- ✅ Help Desk management — shared queue, assign, internal notes, reply, resolve (auto-reopen)
- ✅ Training management — rosters, attendance, fix check-in errors, export
- ✅ Map & venue management — upload/replace, link rooms
- ✅ System controls — notification categories, scheduled sends, delivery status, audit log, backup

### Cross-cutting
- ✅ **Universal Attendee QR Code** — one permanent code containing only an attendee ID; the result depends on who scans it (registration / training / vendor lead / admin lookup).
- ✅ **Dual-role support** — one account & login, tap to switch role views; notifications arrive for *all* assigned roles regardless of the active view; posting identity is always shown.
- ✅ **Privacy-friendly contact exchange** — attendees control exactly what is shared; vendors share only their approved public card.

See [`Whova_Clone` requirements](#) — the source spec — for the full detail behind each item.

---

## Repository layout

```
whova-three/
├── docs/            # 🅐 Interactive prototype (served by GitHub Pages)
├── App.tsx          # 🅑 Expo app entry (scaffold)
├── app.json         # Expo config
├── package.json     # Expo/React Native dependencies
├── assets/          # app icons & splash
└── README.md
```

---

## Roadmap

- [x] **Phase 0** — Repo, tooling, tech decision (Expo for Windows-based iOS dev)
- [x] **Phase 1** — Full interactive prototype (all 3 roles) on GitHub Pages
- [ ] **Phase 2** — Native Expo build: navigation + Attendee module (agenda, schedule, board, people, help desk, QR)
- [ ] **Phase 3** — Vendor module (scanner, leads, dashboard) + Admin module
- [ ] **Phase 4** — Backend & real data (auth, roles, push notifications, ticketing, lead export)
- [ ] **Phase 5** — TestFlight via EAS Build → App Store

---

## Git workflow

Active development happens on **`claude/whova-clone-setup-i4cg1i`**; the prototype
is also fast-forwarded onto **`main`** so GitHub Pages can serve it from `main/docs`.
All commits, pushes, and merges are handled for you.

*All data in the prototype is fictional and used only for demonstration.*
