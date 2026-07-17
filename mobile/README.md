# GlamNet Mobile

Expo (managed) + TypeScript rebuild of GlamNet for React Native / Firebase.

The original MERN course project remains in `/backend` and `/frontend` as historical
reference. This folder is the mobile app target for internship applications.

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) on a phone, or an Android emulator / iOS simulator

## Setup

```bash
cd mobile
npm install
cp .env.example .env
```

Edit `.env` with your Firebase web app config (Project settings → Your apps).
Placeholder values are fine for Step 1 smoke tests; Auth and Firestore need real values.

## Run

```bash
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Scripts

| Command             | Purpose                 |
| ------------------- | ----------------------- |
| `npm start`         | Start Expo dev server   |
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint`      | ESLint                  |
| `npm run format`    | Prettier write          |

## Folder structure

```
mobile/
├── App.tsx
├── src/
│   ├── components/   # reusable UI
│   ├── hooks/        # shared hooks (auth, data)
│   ├── screens/      # navigation screens
│   ├── services/     # Firebase and API helpers
│   └── types/        # TypeScript models (Step 2+)
├── .env.example
└── package.json
```

## Migration status

- [x] Step 1 — Expo scaffold + Firebase env wiring
- [ ] Step 2 — Firestore data model / types
- [ ] Step 3 — Authentication
- [ ] Steps 4–5 — Customer & salon flows
- [ ] Step 6 — Cloud Functions
- [ ] Step 7 — Tests
- [ ] Step 8 — Polish + writeup
