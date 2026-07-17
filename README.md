# GlamNet - Smart Salon Network System

A smart, AI-assisted platform that connects customers with salons, barbers, and
beauty service providers. This repository contains **two versions** of the same
product concept:

| Path | Stack | Status |
| --- | --- | --- |
| [`/backend`](backend/) + [`/frontend`](frontend/) | MERN (MongoDB, Express, React.js web, Node.js) | Original Software Engineering course project — kept as historical reference |
| [`/mobile`](mobile/) | Expo + TypeScript + Firebase | Active rebuild for React Native / Firebase internship applications |

Do **not** delete the MERN code. The mobile app is a fresh, idiomatic Expo/Firebase
implementation of the same product (salon booking: customers, salons, appointments,
reviews, recommendations) — not a line-by-line port of the Express routes.

---

## Mobile app (Expo + Firebase) — primary

See [`mobile/README.md`](mobile/README.md) for full setup details.

```bash
cd mobile
npm install
cp .env.example .env   # then fill Firebase web config values
npm start              # scan QR with Expo Go
```

Firebase client keys use `EXPO_PUBLIC_FIREBASE_*` env vars (never commit `.env`).

### Planned migration steps

1. Setup (scaffold) — current
2. Data model — Mongoose schemas → Firestore + TypeScript types
3. Authentication — Firebase Auth (email/password)
4. Customer flow — browse, book, review
5. Salon flow — dashboard, services/offers CRUD
6. Cloud Functions — rating aggregate + sentiment on review create
7. Tests — Jest + Testing Library
8. Polish + writeup

---

## Original MERN web app (course project)

### Features

- **Smart Recommendation Module**: AI-powered salon and service recommendations
- **Online Appointment Booking**: Easy booking system with real-time availability
- **Salon Schedule Management**: Complete schedule management for salon staff
- **Service & Offer Management**: Create and manage services and promotional offers
- **Customer Feedback & Rating System**: Review system with sentiment analysis
- **Secure Authentication**: JWT-based authentication system
- **Real-time Updates**: Live schedule updates and notifications

### Tech stack

**Backend:** Node.js, Express.js, MongoDB/Mongoose, JWT, bcrypt, sentiment analysis  
**Frontend:** React.js, React Router, Axios, TailwindCSS

### Installation (MERN)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GlamNet
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/glamnet
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Run the application**
   ```bash
   npm run dev      # backend (nodemon)
   npm run client   # React web frontend (separate terminal)
   ```

### Project structure (MERN + mobile)

```
GlamNet/
├── backend/          # Original Express + MongoDB API
├── frontend/         # Original React.js web client
├── mobile/           # Expo + TypeScript + Firebase rebuild
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Usage (MERN)

**Customer flow:** Register/Login → browse salons → book → review  
**Salon staff flow:** Login → dashboard → manage services/offers/schedule → appointments

### API endpoints (MERN)

- `POST /api/auth/register` | `POST /api/auth/login` | `GET /api/auth/logout` | `PUT /api/auth/profile`
- `GET/POST/PUT /api/salons`
- `GET/POST/PUT/DELETE /api/appointments`
- `GET/POST/PUT/DELETE /api/reviews`

### AI features (MERN)

- Recommendation engine based on history, ratings, and popular services
- Sentiment analysis on review text (positive / negative / neutral)

---

## License

Educational / portfolio use.

## Contributors

Originally created for a Software Engineering course; mobile rebuild in progress.
