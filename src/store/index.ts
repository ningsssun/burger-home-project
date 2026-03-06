/**
 * Root store barrel — import individual slices from their feature folders.
 * This file re-exports for convenience.
 */
export { useAuthStore } from '../features/auth/store/authStore';
export { useHouseholdStore } from '../features/household/store/householdStore';
export { useTasksStore } from '../features/tasks/store/tasksStore';
