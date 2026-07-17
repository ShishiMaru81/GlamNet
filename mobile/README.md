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

## Firestore data model

The original Mongoose schemas are represented by strict interfaces in
`src/types`. Firestore document IDs are kept outside document data and added to
client objects with `WithId<T>`.

| Collection     | Type          | Main query pattern                         |
| -------------- | ------------- | ------------------------------------------ |
| `users`        | `AppUser`     | document by Firebase Auth UID              |
| `salons`       | `Salon`       | featured/city/rating salon lists           |
| `services`     | `Service`     | active services filtered by `salonId`      |
| `appointments` | `Appointment` | customer or salon bookings ordered by time |
| `reviews`      | `Review`      | salon reviews ordered by creation time     |
| `offers`       | `Offer`       | active salon offers within a date range    |

### Mongoose → Firestore tradeoffs

- **User, Customer, and Barber merge into `users`:** Firebase Auth stores
  credentials, while one role-discriminated profile document stores app data.
  This removes profile joins and lets security rules authorize salon staff from
  `salonId` on their user document.
- **Appointment display snapshots:** customer, salon, staff, and service names
  plus booked price/duration are copied into each appointment. This preserves
  booking history when source documents change and avoids multiple reads per
  appointment card.
- **Salon rating aggregate:** `averageRating` and `reviewCount` live on the
  salon document. A Step 6 Cloud Function will maintain them so salon lists do
  not read every review, deliberately trading extra writes for fewer reads.
- **Reviews copy customer name:** review feeds can render from one query instead
  of fetching the author document for every row.
- **No persisted ScheduleSlot collection:** slots are derived from salon hours,
  service duration, and existing appointments. Booking will use a transaction
  to prevent conflicts, avoiding duplicated `isBooked` state that can drift.
- **Top-level services and offers:** both keep `salonId`, enabling collection
  queries, indexes, independent CRUD, and simpler cross-salon administration.

Firestore composite indexes and Security Rules will be added alongside the
features that require their exact query shapes.

## Migration status

- [x] Step 1 — Expo scaffold + Firebase env wiring
- [x] Step 2 — Firestore data model / types
- [ ] Step 3 — Authentication
- [ ] Steps 4–5 — Customer & salon flows
- [ ] Step 6 — Cloud Functions
- [ ] Step 7 — Tests
- [ ] Step 8 — Polish + writeup
