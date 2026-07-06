# Aarogya AI

This repository is now organized as a Firebase-first web app.

## Active stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Firebase Functions
- Database: Firestore
- Auth: Firebase Authentication
- Realtime: Firestore snapshot listeners

## What works today

- Firebase email/password login
- Saved user profiles in Firestore
- Sleep logs, daily health logs, symptom logs, and daily plans in Firestore
- Realtime refresh on Home, Progress, Daily Plan, and AI Chat context
- Firebase Functions backend for:
  - `GET /health`
  - `GET /users/:userId/context`
  - `POST /chat`
- Local payment simulation flow with subscription persistence in the app

## Local development

Install dependencies:

```powershell
npm.cmd install
```

Start the frontend:

```powershell
npm.cmd run dev
```

Build the frontend:

```powershell
npm.cmd run build
```

## Environment

Copy [.env.example](C:\Users\HLBS\Documents\Aarogya.Ai\.env.example) to `.env`.

Important values:

- `VITE_FIREBASE_ENABLED=true`
- `VITE_FIREBASE_FUNCTIONS_BASE_URL=https://asia-south1-aarogya-ai-20260430.cloudfunctions.net/api`
- Firebase web app keys for your project

Notes:

- `VITE_API_ENABLED` is off by default because Firebase Functions are the active backend.
- `VITE_USE_MOCK_FALLBACK=true` keeps older unfinished features usable while the remaining services are migrated.
- `VITE_PAYMENT_API_BASE_URL` and `VITE_RAZORPAY_KEY_ID` are still optional. Payments stay in simulation mode until a live gateway backend is connected.

## Firestore structure

Current collections used by the app:

- `users/{userId}`
- `users/{userId}/dailyHealthLogs/{logDate}`
- `users/{userId}/sleepLogs/{logDate}`
- `users/{userId}/dailyPlans/{planDate}`
- `users/{userId}/symptomLogs/{symptomId}`

## Backend deployment

Firebase Functions live in [functions](C:\Users\HLBS\Documents\Aarogya.Ai\functions).

Deploy:

```powershell
firebase.cmd deploy --only functions --project aarogya-ai-20260430
```

## Current reality

The active app path uses Firebase Authentication, Firestore, and Firebase Functions.

Still in progress:

- live payment gateway backend and webhooks
- broader admin backend cleanup
- fully backend-driven AI for every feature
- deployment polish and monitoring
