# Aarogya AI Build Sequence

This file is the working order for building Aarogya without mixing priorities or creating avoidable cleanup later.

## Current Stage

Aarogya is in the working MVP foundation stage.

The active app path is:

- React frontend in `src`
- Firebase Functions backend in `functions`
- Firebase Auth for login/signup
- Firestore for profiles, logs, plans, and realtime health data

## Build Rules

- Finish one product layer before starting the next.
- Keep Firebase as the active backend.
- Avoid adding new mock flows unless they are clearly marked as temporary.
- Every major feature should have a frontend screen, backend route or data path, and stored data model.
- Payment, AI, and nutrition features should run through backend functions before being considered real.

## Phase 1: Stabilize The Foundation

Goal: make sure the current app is clean, understandable, and buildable.

Tasks:

- Verify the current frontend build.
- Remove or isolate old generated files that are not part of the active app.
- Keep README and environment files Firebase-first.
- Confirm app runs locally from a clean VS Code open.
- Confirm Firebase Functions health endpoint is live.

Status: completed

## Phase 2: Core Health Flow

Goal: make the main USP solid before adding more advanced features.

Tasks:

- Ensure onboarding saves complete user profile data.
- Ensure sleep and wake time are saved and reused everywhere.
- Ensure daily plan generation uses the saved profile, sleep log, symptoms, and progress.
- Ensure Home, Daily Plan, Progress, and AI Chat show the same saved plan context.
- Add better empty, loading, and error states for the core health screens.

Status: partly complete

## Phase 3: Real AI Assistant

Goal: make AI responses come from real backend context.

Tasks:

- Move the main AI chat flow through Firebase Functions.
- Add stronger user context retrieval for profile, plan, logs, symptoms, and nutrition.
- Save chat threads and messages.
- Add safety handling for urgent symptoms and medical disclaimers.
- Prepare later OpenAI integration behind the backend.

Status: foundation exists

## Phase 4: Meal Photo Nutrition

Goal: let users upload a meal image and receive nutrition estimates.

Tasks:

- Add meal photo upload UI.
- Add Firebase Storage support for meal images.
- Add Firestore `mealLogs`.
- Add backend endpoint for meal analysis.
- Estimate calories, protein, carbs, fat, fiber, and meal quality.
- Feed saved meal data into Progress and AI Chat.

Status: not started

## Phase 5: Payments And Membership

Goal: replace payment simulation with a live verified payment flow.

Tasks:

- Add backend payment routes in Firebase Functions.
- Create Razorpay orders on the backend.
- Verify payments on the backend.
- Add webhook handling.
- Save subscriptions and invoices to Firestore.
- Update membership state from verified payment only.

Status: UI exists, live gateway pending

## Phase 6: Admin And Operations

Goal: make admin features useful and secure.

Tasks:

- Add admin role handling.
- Lock admin screens behind role checks.
- Move admin data reads to backend or secure Firestore queries.
- Clean user, subscription, invoice, alert, and analytics flows.
- Add audit-friendly activity records.

Status: screens exist, hardening pending

## Phase 7: Production Polish

Goal: make the app demo-ready and then launch-ready.

Tasks:

- Full QA of signup, onboarding, plan, progress, chat, meal, payment, and admin flows.
- Improve mobile responsiveness and copy quality.
- Add robust error states and retry actions.
- Add monitoring/logging.
- Deploy frontend and backend cleanly.
- Create final submission/demo package.

Status: pending

## Immediate Next Step

Start with Phase 1:

1. Verify build.
2. Confirm runtime config is Firebase-first.
3. Remove or ignore old archive/submission folders from the active development path.
4. Then continue with Phase 2 core health flow polish.
