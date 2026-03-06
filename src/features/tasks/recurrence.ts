/**
 * Pure recurrence utilities — shared by client and Cloud Functions.
 * No Firebase imports, no side effects.
 */
import {
  addDays,
  addWeeks,
  addMonths,
  isAfter,
  isBefore,
  getDay,
  setDate,
  startOfDay,
} from 'date-fns';
import { RecurrenceRule } from '../../shared/types/models';

/**
 * Generate all instance dates for a recurrence rule within [from, to].
 */
export function generateInstanceDates(
  rule: RecurrenceRule,
  from: Date,
  to: Date,
): Date[] {
  const dates: Date[] = [];
  const endDate = rule.endDate ? rule.endDate.toDate() : to;
  const effectiveTo = isBefore(endDate, to) ? endDate : to;

  let cursor = startOfDay(from);

  while (!isAfter(cursor, effectiveTo)) {
    if (matchesRule(rule, cursor)) {
      dates.push(new Date(cursor));
    }
    cursor = advanceCursor(rule, cursor);
  }

  return dates;
}

/**
 * Get the next instance date after `after`.
 */
export function getNextInstanceDate(
  rule: RecurrenceRule,
  after: Date,
): Date | null {
  const endDate = rule.endDate ? rule.endDate.toDate() : null;

  let cursor = startOfDay(addDays(after, 1));
  const maxIterations = 365 * 2; // safety limit

  for (let i = 0; i < maxIterations; i++) {
    if (endDate && isAfter(cursor, endDate)) return null;
    if (matchesRule(rule, cursor)) return cursor;
    cursor = addDays(cursor, 1);
  }

  return null;
}

// ─── Internal helpers ──────────────────────────────────────────

function matchesRule(rule: RecurrenceRule, date: Date): boolean {
  switch (rule.frequency) {
    case 'daily':
      return true; // interval handled by cursor advance
    case 'weekly': {
      if (!rule.daysOfWeek?.length) return true;
      return rule.daysOfWeek.includes(getDay(date));
    }
    case 'monthly': {
      if (!rule.dayOfMonth) return true;
      return date.getDate() === rule.dayOfMonth;
    }
    default:
      return false;
  }
}

function advanceCursor(rule: RecurrenceRule, current: Date): Date {
  const interval = rule.interval ?? 1;

  switch (rule.frequency) {
    case 'daily':
      return addDays(current, interval);
    case 'weekly':
      // For weekly with specific days, advance 1 day at a time within the week
      // and advance by `interval` weeks once we've gone through all days
      return addDays(current, 1);
    case 'monthly':
      // For monthly, jump to next month
      return addMonths(current, interval);
    default:
      return addDays(current, 1);
  }
}

/**
 * Build instance dates for the next N weeks from `startDate`.
 */
export function generateInstancesForWeeks(
  rule: RecurrenceRule,
  startDate: Date,
  weeksAhead: number,
): Date[] {
  const to = addWeeks(startDate, weeksAhead);
  return generateInstanceDates(rule, startDate, to);
}
