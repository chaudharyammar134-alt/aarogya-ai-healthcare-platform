# Aarogya AI

Aarogya AI is an ongoing personalized health and wellness web application. Its core feature generates a daily wellness plan from a user's sleep schedule, lifestyle, goals, symptoms, and recent progress.

## Project Status

Working MVP foundation, approximately 65% complete.

Implemented:

- Email and password authentication
- User onboarding and health profile persistence
- Sleep and wake-time based daily plan generation
- Daily health, progress, and symptom logging
- Realtime Firestore updates for core health data
- Context-aware health assistant foundation
- Membership, payment, and admin interface foundations

In progress:

- Advanced AI assistant integration
- Meal photo nutrition analysis
- Live Razorpay payments and webhooks
- Production-ready admin authorization and analytics
- Notifications, testing, performance, and launch hardening

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, Firebase Functions
- Database: Cloud Firestore
- Authentication: Firebase Authentication
- Realtime: Firestore snapshot listeners

## Repository Structure

```text
Aarogya.Ai/
|-- frontend/             React and Vite application
|-- backend/
|   `-- functions/        Firebase Functions backend
|-- firebase.json         Firebase deployment configuration
|-- firestore.rules       Firestore security rules
|-- firestore.indexes.json
|-- BUILD_SEQUENCE.md     Ordered implementation roadmap
`-- README.md
```

## Local Setup

Requirements:

- Node.js
- npm
- Firebase CLI for backend deployment

Create the frontend environment file:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Fill in the Firebase web configuration values in `frontend/.env`.

Install and run:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0 --port 4173
```

Open `http://localhost:4173/`.

## Build

```powershell
cd frontend
npm.cmd run build
```

## Backend

Firebase Functions live in `backend/functions`.

Install backend dependencies:

```powershell
cd backend\functions
npm.cmd install
```

Deploy from the repository root:

```powershell
firebase.cmd deploy --only functions --project aarogya-ai-20260430
```

## Data Model

Current Firestore paths include:

- `users/{userId}`
- `users/{userId}/dailyHealthLogs/{logDate}`
- `users/{userId}/sleepLogs/{logDate}`
- `users/{userId}/dailyPlans/{planDate}`
- `users/{userId}/symptomLogs/{symptomId}`

## Security

- Local `.env` files are ignored by Git.
- Do not commit service-account JSON files, private keys, payment secrets, or API secrets.
- Firestore access is controlled through `firestore.rules`.

## Roadmap

Development order is maintained in [BUILD_SEQUENCE.md](BUILD_SEQUENCE.md).

The next phase is to finish consistency across onboarding, sleep logs, daily plans, Home, Progress, and AI Chat before adding meal-photo analysis and live payments.

