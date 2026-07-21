# whova-three

A **Whova-style event & conference app** — a mobile app for conference attendees
(agenda, networking, community boards, live Q&A/polls, exhibitors & sponsors,
messaging, and announcements).

## Status

🚧 **Early scaffold.** This commit contains only the base project skeleton.
Feature modules are being defined and will be built in phases.

## Tech stack & why

Built with **React Native + [Expo](https://expo.dev)** (TypeScript) so it can be:

- **Developed on Windows** (no Mac required to write code).
- **Tested instantly on a physical iPhone/iPad** via the free **Expo Go** app —
  scan a QR code and the app loads live, hot-reloading on every change.
- **Ported to a native Xcode project** later via `npx expo prebuild` (generates a
  real `ios/` Xcode project), and built for TestFlight/App Store in the cloud via
  **EAS Build** — no Mac needed.

## Getting started (once dependencies are added)

```bash
npm install
npx expo start        # scan the QR code with Expo Go on your iPhone/iPad
```

Detailed setup, architecture, and per-phase feature docs will be added as the
skeleton is built out.
