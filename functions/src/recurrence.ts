/**
 * Shared recurrence utilities for Cloud Functions.
 * Mirror of src/features/tasks/recurrence.ts (without Expo/RN imports).
 */
import { addDays, addMonths, isAfter, getDay, startOfDay } from 'date-fns';
import { RecurrenceRule } from './types';

export function generateInstanceDates(
  rule: RecurrenceRule,
  from: Date,
  to: Date,
): Date[] {
  const dates: Date[] = [];
  const endDate = rule.endDate ? rule.endDate.toDate() : to;
  const effectiveTo = endDate < to ? endDate : to;

  let cursor = startOfDay(from);

  while (!isAfter(cursor, effectiveTo)) {
    if (matchesRule(rule, cursor)) {
      dates.push(new Date(cursor));
    }
    cursor = advanceCursor(rule, cursor);
  }

  return dates;
}

function matchesRule(rule: RecurrenceRule, date: Date): boolean {
  switch (rule.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      if (!rule.daysOfWeek?.length) return true;
      return rule.daysOfWeek.includes(getDay(date));
    case 'monthly':
      if (!rule.dayOfMonth) return true;
      return date.getDate() === rule.dayOfMonth;
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
      return addDays(current, 1);
    case 'monthly':
      return addMonths(current, interval);
    default:
      return addDays(current, 1);
  }
}
