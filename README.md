# Replan (MVP)

Initialized Next.js 14 + TypeScript skeleton for the Replan MVP based on the PRD.

## Getting Started
1. Install dependencies (registry access required):
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Environment variables (Firebase client):
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=""
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
   NEXT_PUBLIC_FIREBASE_APP_ID=""
   ```

## Routes
- `/login`: Google Sign-in entry
- `/onboarding`: initial 10-task setup (requires 3+ entries)
- `/dashboard`: daily checklist + mood + note shell
- `/history`: chart placeholder
- `/coach`: AI coach placeholder (free vs pro states)
- `/settings`: account info + sign out

AuthProvider guards navigation per PRD: unauthenticated users are redirected to `/login`, and users without custom tasks are sent to `/onboarding`.
