import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { addWeeks, format, startOfDay } from 'date-fns';
import { RecurrenceRule } from './types';
import { generateInstanceDates } from './recurrence';

admin.initializeApp();
const db = admin.firestore();

const TASKS = 'tasks';
const HOUSEHOLDS = 'households';
const MEMBERS = 'members';
const POINTS_LEDGER = 'pointsLedger';
const WEEKS_AHEAD = 8;

// ─────────────────────────────────────────────────────────────────
// onTaskCreated — generate recurring instances when a template is created
// ─────────────────────────────────────────────────────────────────

export const onTaskCreated = functions.firestore
  .document(`${TASKS}/{taskId}`)
  .onCreate(async (snap, context) => {
    const task = snap.data();
    if (!task.isRecurring || task.templateId !== null) return; // not a template

    const rule = task.recurrenceRule as RecurrenceRule;
    if (!rule) return;

    const from = startOfDay(new Date());
    const to = addWeeks(from, WEEKS_AHEAD);

    const instanceDates = generateInstanceDates(rule, from, to);

    const batch = db.batch();
    for (const date of instanceDates) {
      const instanceRef = db.collection(TASKS).doc();
      batch.set(instanceRef, {
        ...task,
        isRecurring: false,
        templateId: snap.id,
        instanceDate: admin.firestore.Timestamp.fromDate(date),
        dueDate: admin.firestore.Timestamp.fromDate(date),
        status: 'pending',
        completedAt: null,
        completedBy: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  });

// ─────────────────────────────────────────────────────────────────
// onTaskCompleted — award points when a task is completed
// ─────────────────────────────────────────────────────────────────

export const onTaskCompleted = functions.firestore
  .document(`${TASKS}/{taskId}`)
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only trigger when status transitions to 'completed'
    if (before.status === 'completed' || after.status !== 'completed') return;
    if (!after.completedBy) return;

    const { householdId, completedBy, points, title } = after;
    const taskId = context.params.taskId;

    const batch = db.batch();

    // Update member points
    const memberRef = db
      .collection(HOUSEHOLDS)
      .doc(householdId)
      .collection(MEMBERS)
      .doc(completedBy);

    batch.update(memberRef, {
      weeklyPoints: admin.firestore.FieldValue.increment(points),
      allTimePoints: admin.firestore.FieldValue.increment(points),
    });

    await batch.commit();

    // Write ledger entry
    const weekYear = format(new Date(), "yyyy-'W'II");
    await db.collection(POINTS_LEDGER).add({
      householdId,
      userId: completedBy,
      taskId,
      taskTitle: title,
      points,
      weekYear,
      earnedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

// ─────────────────────────────────────────────────────────────────
// scheduleWeeklyInstances — extend recurring tasks every Monday
// ─────────────────────────────────────────────────────────────────

export const scheduleWeeklyInstances = functions.pubsub
  .schedule('0 0 * * 1') // Every Monday at 00:00 UTC
  .onRun(async () => {
    const templatesSnap = await db
      .collection(TASKS)
      .where('isRecurring', '==', true)
      .where('templateId', '==', null)
      .get();

    for (const templateDoc of templatesSnap.docs) {
      const task = templateDoc.data();
      const rule = task.recurrenceRule as RecurrenceRule;
      if (!rule) continue;

      // Generate just 1 more week ahead
      const from = addWeeks(startOfDay(new Date()), WEEKS_AHEAD - 1);
      const to = addWeeks(from, 1);
      const dates = generateInstanceDates(rule, from, to);

      const batch = db.batch();
      for (const date of dates) {
        const instanceRef = db.collection(TASKS).doc();
        batch.set(instanceRef, {
          ...task,
          isRecurring: false,
          templateId: templateDoc.id,
          instanceDate: admin.firestore.Timestamp.fromDate(date),
          dueDate: admin.firestore.Timestamp.fromDate(date),
          status: 'pending',
          completedAt: null,
          completedBy: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    }
  });

// ─────────────────────────────────────────────────────────────────
// resetWeeklyPoints — archive and reset every Monday
// ─────────────────────────────────────────────────────────────────

export const resetWeeklyPoints = functions.pubsub
  .schedule('0 0 * * 1') // Every Monday at 00:00 UTC
  .onRun(async () => {
    const householdsSnap = await db.collection(HOUSEHOLDS).get();

    for (const householdDoc of householdsSnap.docs) {
      const membersSnap = await householdDoc.ref.collection(MEMBERS).get();
      const batch = db.batch();
      for (const memberDoc of membersSnap.docs) {
        batch.update(memberDoc.ref, { weeklyPoints: 0 });
      }
      await batch.commit();
    }
  });
