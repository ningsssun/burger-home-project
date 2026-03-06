# Burger Home 🏠

A mobile app similar to Heima (chores tracker) that lets household members share and track housework. Users create or join a household via invite code, assign tasks to members, earn points for completing them, and view a weekly leaderboard.

---

## Implementation Plan

### Context
Build a mobile app similar to Heima (chores tracker) that lets household members share and track housework. Users create or join a household via invite code, assign tasks to members, earn points for completing them, and view a weekly leaderboard.

Stack: React Native + Expo (iOS & Android), Firebase (Auth, Firestore, FCM), invite-based households.

---

## Stack & Key Libraries

| Category | Choice | Reason |
|---|---|---|
| Framework | Expo SDK ~55 (managed) | No Xcode/Android Studio needed for MVP |
| Routing | Expo Router v4 | File-system routes, automatic deep links, typed routes |
| State | Zustand + Firestore `onSnapshot` | Firestore is the reactive source of truth; Zustand is the UI layer |
| Async | TanStack Query | Loading/error handling for one-shot operations |
| Firebase SDK | JS SDK v11 (not native) | Works in managed Expo without custom builds |
| Forms | react-hook-form + zod | Low re-renders, schema validation |
| Lists | @shopify/flash-list | High-perf replacement for FlatList |
| Dates | date-fns | Lightweight, tree-shakeable date math |
| Notifications | expo-notifications + FCM | Managed workflow compatible |
| UI extras | react-native-reanimated, react-native-gesture-handler, expo-haptics | Animations, swipe gestures, haptic feedback |

---

## Project Structure

```
burger-home-project/
├── app/                         # Expo Router file-system routes
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── join-household.tsx
│   ├── (app)/
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── (home)/index.tsx     # Dashboard
│   │   ├── (tasks)/
│   │   │   ├── index.tsx        # Task list
│   │   │   ├── create.tsx
│   │   │   └── [taskId].tsx
│   │   ├── (lists)/
│   │   │   ├── index.tsx
│   │   │   └── [listId].tsx
│   │   └── (profile)/
│   │       ├── index.tsx
│   │       └── household.tsx
│   └── _layout.tsx              # Root layout + auth gate
│
├── src/
│   ├── features/
│   │   ├── auth/          (components, hooks, store)
│   │   ├── household/     (components, hooks, store)
│   │   ├── tasks/         (components, hooks, store, recurrence.ts)
│   │   ├── leaderboard/   (components, hooks)
│   │   ├── lists/         (components, hooks)
│   │   └── notifications/ (hooks, handlers.ts)
│   ├── shared/
│   │   ├── components/ui/       # Button, Input, Card, Badge, Avatar
│   │   ├── hooks/               # useFirestoreDoc, useFirestoreQuery, useAsyncAction
│   │   ├── lib/                 # firebase.ts, firestore.ts, notifications.ts
│   │   ├── constants/           # theme.ts, config.ts
│   │   └── types/               # models.ts
│   └── store/index.ts
│
├── functions/                   # Firebase Cloud Functions (TypeScript)
│   └── src/
│       ├── index.ts             # All Cloud Functions
│       ├── recurrence.ts        # Shared recurrence logic
│       └── types.ts
│
├── firestore.rules              # Firestore Security Rules
├── firestore.indexes.json       # Firestore Indexes
├── firebase.json
├── .env / .env.example
└── app.json
```

---

## Firestore Data Model

```
/users/{userId}
  uid, displayName, email, photoURL, householdId, fcmTokens[], createdAt, updatedAt

/households/{householdId}
  name, inviteCode (indexed), createdBy, memberIds[], createdAt, updatedAt

/households/{householdId}/members/{userId}
  userId, displayName, photoURL, role ("admin"|"member"), weeklyPoints, allTimePoints, joinedAt

/tasks/{taskId}
  householdId, title, description, category, assigneeId, assigneeName, assigneePhotoURL,
  createdBy, points (default 10), status ("pending"|"completed"|"skipped"),
  dueDate, completedAt, completedBy,
  isRecurring, recurrenceRule { frequency, interval, daysOfWeek, dayOfMonth, endDate },
  templateId (null = template itself), instanceDate,
  createdAt, updatedAt

/sharedLists/{listId}
  householdId, title, createdBy, createdAt

/sharedLists/{listId}/items/{itemId}
  text, isChecked, addedBy, addedByName, checkedBy, order, createdAt

/pointsLedger/{ledgerId}
  householdId, userId, taskId, taskTitle, points, weekYear ("2026-W09"), earnedAt
```

**Firestore Indexes:**
- tasks: `householdId ASC, dueDate ASC, status ASC`
- tasks: `householdId ASC, assigneeId ASC, status ASC, dueDate ASC`
- tasks: `householdId ASC, instanceDate ASC`
- pointsLedger: `householdId ASC, weekYear ASC, userId ASC`

---

## Screen Map

```
(auth) — unauthenticated
  /sign-in, /sign-up, /join-household

(app) — authenticated, bottom tabs
  Home tab     → /home (Dashboard: today's tasks, upcoming)
  Tasks tab    → /tasks (list, filter, swipe-to-complete)
                 /tasks/create
                 /tasks/[taskId]
  Lists tab    → /lists (shared lists overview)
                 /lists/[listId] (real-time checklist)
  Profile tab  → /profile (avatar, points, history, sign out)
                 /profile/household (members, invite code, leaderboard)
```

---

## Recurring Tasks Strategy

**Generate-ahead-of-time**: When a recurring task template is created, a Cloud Function generates concrete instance documents for the next 8 weeks. A weekly scheduler extends the window.

- Template doc: `isRecurring: true, templateId: null`
- Instance doc: `isRecurring: false, templateId: "<parentId>", instanceDate: <Timestamp>`
- Each instance is independently completable with its own status/history
- Enables Firestore queries, push notification scheduling, and offline reads

`src/features/tasks/recurrence.ts` — pure functions shared by client and Cloud Functions:
```typescript
generateInstanceDates(rule, from, to): Date[]
getNextInstanceDate(rule, after): Date | null
```

---

## Cloud Functions

| Function | Trigger | Purpose |
|---|---|---|
| `onTaskCreated` | Firestore onCreate tasks/{id} | If recurring template: generate 8 weeks of instances |
| `onTaskUpdated` | Firestore onUpdate tasks/{id} | If template changed: regenerate future instances |
| `onTaskCompleted` | Firestore onUpdate (status → completed) | Write pointsLedger, update member points (batch), send push |
| `scheduleWeeklyInstances` | Cloud Scheduler (Mon 00:00) | Extend all recurring templates by another week |
| `resetWeeklyPoints` | Cloud Scheduler (Mon 00:00) | Archive + reset `weeklyPoints` on all member docs |

---

## Implementation Phases

### Phase 0 — Bootstrap ✅
- `npx create-expo-app` with TypeScript template
- Install all libraries, configure Firebase project
- Set up `.env`, `firebase.ts`, path aliases, ESLint/Prettier, theme constants

### Phase 1 — Auth & Household ✅
- Sign in/up (email), Firebase Auth
- Root layout auth gate
- Create household (writes to Firestore, generates 6-char invite code)
- Join household (lookup by `inviteCode`, add to `memberIds`)
- `useHousehold` hook with real-time listener
- HouseholdScreen: members list, invite code copy/share

### Phase 2 — Task Management Core ✅
- TaskListScreen with real-time Firestore listener
- CreateTaskScreen: title, category, assignee picker, due date, recurrence, points
- TaskDetailScreen
- Mark complete: update status, write pointsLedger, update member points
- DashboardScreen: today's tasks for current user

### Phase 3 — Recurring Tasks Engine ✅
- `recurrence.ts` utility (pure functions, unit tested)
- Cloud Functions: `onTaskCreated`, `onTaskUpdated`, `scheduleWeeklyInstances`
- Dashboard/TaskList query by `instanceDate`

### Phase 4 — Leaderboard & Gamification ✅
- LeaderboardModal: members ordered by `weeklyPoints`
- `resetWeeklyPoints` Cloud Function (Monday)
- Points on completion with haptic feedback

### Phase 5 — Push Notifications ✅
- Request permission, save FCM token to user doc
- Cloud Function sends FCM on task assignment
- Local notification scheduled 1 hour before due date (expo-notifications)
- Notification tap deep links to task screen

### Phase 6 — Shared Lists ✅
- ListsOverviewScreen + SharedListScreen
- Real-time sync via `onSnapshot`
- Add/check/delete items

### Phase 7 — Polish & Production (TODO)
- Full Firestore Security Rules (tested with Emulator)
- Error boundaries, offline handling
- EAS Build config for iOS and Android
- App icon, splash screen, TestFlight submission

---

## Getting Started

### 1. Clone and install
```bash
git clone <repo>
cd burger-home-project
npm install
```

### 2. Configure Firebase
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Copy your web app config to `.env`:

```bash
cp .env.example .env
# Fill in your Firebase config values
```

### 3. Deploy Firestore rules and indexes
```bash
firebase deploy --only firestore
```

### 4. Deploy Cloud Functions
```bash
cd functions && npm install
firebase deploy --only functions
```

### 5. Start the app
```bash
npx expo start
```

---

## Verification Checklist

- [ ] `npx expo start` runs on iOS Simulator and Android Emulator
- [ ] User can sign up, create household, invite another user, both see shared tasks
- [ ] Creating a recurring task generates instances visible in task list
- [ ] Completing a task updates points on leaderboard in real time
- [ ] Push notification arrives ~1h before due task on a physical device
- [ ] Shared grocery list syncs instantly across two devices
- [ ] Firestore Security Rules: a user from household A cannot read household B's tasks
- [ ] EAS build succeeds for both platforms

---

## Architecture Notes

### Auth Gate
The root `app/_layout.tsx` mounts `AuthGate` which:
1. Subscribes to Firebase Auth state
2. Subscribes to user's Firestore document
3. Redirects to `/(auth)/sign-in` if unauthenticated
4. Redirects to `/(auth)/join-household` if authenticated but no household

### State Management
- **Zustand stores** (`useAuthStore`, `useHouseholdStore`, `useTasksStore`) are the UI cache
- **Firestore `onSnapshot` listeners** feed into these stores
- **TanStack Query** is used for one-shot mutations (create task, join household)

### Points System
When a task is marked complete:
1. Task document `status` → `"completed"`, `completedAt` set
2. Member's `weeklyPoints` and `allTimePoints` incremented (batch write)
3. `pointsLedger` entry written with `weekYear` for historical queries
4. Cloud Function also handles this server-side as a safety net

### Recurring Tasks
Templates (`templateId: null, isRecurring: true`) are never shown in task lists.
Instances (`templateId: "<id>", instanceDate: <Date>`) are the actual tasks.
Cloud Function `onTaskCreated` generates 8 weeks of instances upfront.
