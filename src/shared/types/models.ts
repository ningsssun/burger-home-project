import { Timestamp } from 'firebase/firestore';
import { TaskCategory } from '../constants/theme';

export type { TaskCategory };

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  householdId: string | null;
  fcmTokens: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────
// Household
// ─────────────────────────────────────────────

export interface HouseholdDoc {
  name: string;
  inviteCode: string;
  createdBy: string;
  memberIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MemberRole = 'admin' | 'member';

export interface MemberDoc {
  userId: string;
  displayName: string;
  photoURL: string | null;
  role: MemberRole;
  weeklyPoints: number;
  allTimePoints: number;
  joinedAt: Timestamp;
}

// ─────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────

export type TaskStatus = 'pending' | 'completed' | 'skipped';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // every N days/weeks/months
  daysOfWeek?: number[]; // 0=Sun … 6=Sat (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: Timestamp | null;
}

export interface TaskDoc {
  householdId: string;
  title: string;
  description: string;
  category: TaskCategory;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneePhotoURL: string | null;
  createdBy: string;
  points: number;
  status: TaskStatus;
  dueDate: Timestamp | null;
  completedAt: Timestamp | null;
  completedBy: string | null;
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule | null;
  templateId: string | null; // null = this IS the template
  instanceDate: Timestamp | null; // set on instances
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// TaskDoc with Firestore document id attached
export interface Task extends TaskDoc {
  id: string;
}

// ─────────────────────────────────────────────
// Shared Lists
// ─────────────────────────────────────────────

export interface SharedListDoc {
  householdId: string;
  title: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface SharedList extends SharedListDoc {
  id: string;
}

export interface ListItemDoc {
  text: string;
  isChecked: boolean;
  addedBy: string;
  addedByName: string;
  checkedBy: string | null;
  order: number;
  createdAt: Timestamp;
}

export interface ListItem extends ListItemDoc {
  id: string;
}

// ─────────────────────────────────────────────
// Points Ledger
// ─────────────────────────────────────────────

export interface PointsLedgerDoc {
  householdId: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  points: number;
  weekYear: string; // e.g. "2026-W09"
  earnedAt: Timestamp;
}

export interface PointsLedgerEntry extends PointsLedgerDoc {
  id: string;
}

// ─────────────────────────────────────────────
// UI / Store types
// ─────────────────────────────────────────────

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string | null;
  weeklyPoints: number;
  allTimePoints: number;
  rank: number;
}
