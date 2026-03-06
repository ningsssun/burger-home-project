export const APP_CONFIG = {
  // Household
  INVITE_CODE_LENGTH: 6,

  // Tasks
  DEFAULT_TASK_POINTS: 10,
  RECURRING_INSTANCE_WEEKS_AHEAD: 8,

  // Notifications
  TASK_DUE_REMINDER_MINUTES: 60,

  // Leaderboard
  LEADERBOARD_WEEK_FORMAT: "yyyy-'W'II", // date-fns format for ISO week

  // Pagination
  TASKS_PAGE_SIZE: 20,
  LISTS_PAGE_SIZE: 50,
} as const;

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  HOUSEHOLDS: 'households',
  TASKS: 'tasks',
  SHARED_LISTS: 'sharedLists',
  POINTS_LEDGER: 'pointsLedger',
} as const;

export const FIRESTORE_SUBCOLLECTIONS = {
  MEMBERS: 'members',
  ITEMS: 'items',
} as const;
