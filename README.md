# Aarogya AI

Aarogya AI is an ongoing personalized health and wellness web application. Its core feature generates a daily wellness plan from a user's sleep schedule, lifestyle, goals, symptoms, and recent progress.

## Project Status

Working MVP foundation, approximately 70% complete.

Implemented:

- Email and password authentication
- User onboarding and health profile persistence
- Sleep and wake-time based daily plan generation
- Daily health, progress, and symptom logging
- Realtime Firestore updates for core health data
- Context-aware Gemini health assistant foundation
- Meal nutrition analysis with optional photo context
- Membership, payment, and admin interface foundations

In progress:

- Saving AI chat threads and advanced safety review
- Full production meal-photo nutrition validation
- Live Razorpay payments and webhooks
- Production-ready admin authorization and analytics
- Notifications, testing, performance, and launch hardening

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, Firebase Functions
- Database: Cloud Firestore
- Authentication: Firebase Authentication
- Realtime: Firestore snapshot listeners
- AI provider: Google Gemini API through Firebase Functions

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
The same Express backend can also run as a standalone web service on Render while Google Cloud Billing is under review.

Install backend dependencies:

```powershell
cd backend\functions
npm.cmd install
```

Create backend environment values for local function testing:

```powershell
Copy-Item .env.example .env
```

Set `GEMINI_API_KEY` in `backend/functions/.env` for local emulators. For deployed Firebase Functions, configure the same value as a backend secret/environment value. Never place Gemini or payment secrets in `frontend/.env`.

## Render Backend Deployment

Use Render when Firebase Functions deployment is blocked by Google Cloud Billing.

The repository includes `render.yaml`. Create a new Render Blueprint from the GitHub repository and set these environment variables:

- `STANDALONE_SERVER=true`
- `GEMINI_API_KEY=<your Gemini API key>`
- `GEMINI_MODEL=gemini-2.5-flash`
- `FIREBASE_SERVICE_ACCOUNT_JSON=<single-line Firebase service account JSON>`

Do not commit the service account JSON. It must stay only inside Render environment variables.

After Render gives a backend URL, set this in `frontend/.env`:

```powershell
VITE_FIREBASE_FUNCTIONS_BASE_URL=https://your-render-service.onrender.com
```

Then rebuild and redeploy hosting:

```powershell
cd frontend
npm.cmd run build
cd ..
firebase.cmd deploy --only hosting
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

The next phase is to finish production hardening for Gemini AI, meal-photo analysis, Razorpay payments, admin authorization, and deployment monitoring.
