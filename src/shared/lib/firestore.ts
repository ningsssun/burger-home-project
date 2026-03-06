/**
 * Typed Firestore helpers — build collection/doc refs with full TypeScript types.
 */
import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserDoc,
  HouseholdDoc,
  MemberDoc,
  TaskDoc,
  SharedListDoc,
  ListItemDoc,
  PointsLedgerDoc,
} from '../types/models';
import { FIRESTORE_COLLECTIONS, FIRESTORE_SUBCOLLECTIONS } from '../constants/config';

function col<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

function colSub<T extends DocumentData>(
  parent: string,
  parentId: string,
  sub: string,
): CollectionReference<T> {
  return collection(db, parent, parentId, sub) as CollectionReference<T>;
}

function d<T extends DocumentData>(
  colPath: string,
  id: string,
): DocumentReference<T> {
  return doc(db, colPath, id) as DocumentReference<T>;
}

function dSub<T extends DocumentData>(
  parent: string,
  parentId: string,
  sub: string,
  id: string,
): DocumentReference<T> {
  return doc(db, parent, parentId, sub, id) as DocumentReference<T>;
}

// ─── Collection refs ───────────────────────────────────────────

export const usersCol = () =>
  col<UserDoc>(FIRESTORE_COLLECTIONS.USERS);

export const userDoc = (uid: string) =>
  d<UserDoc>(FIRESTORE_COLLECTIONS.USERS, uid);

export const householdsCol = () =>
  col<HouseholdDoc>(FIRESTORE_COLLECTIONS.HOUSEHOLDS);

export const householdDoc = (householdId: string) =>
  d<HouseholdDoc>(FIRESTORE_COLLECTIONS.HOUSEHOLDS, householdId);

export const membersCol = (householdId: string) =>
  colSub<MemberDoc>(
    FIRESTORE_COLLECTIONS.HOUSEHOLDS,
    householdId,
    FIRESTORE_SUBCOLLECTIONS.MEMBERS,
  );

export const memberDoc = (householdId: string, userId: string) =>
  dSub<MemberDoc>(
    FIRESTORE_COLLECTIONS.HOUSEHOLDS,
    householdId,
    FIRESTORE_SUBCOLLECTIONS.MEMBERS,
    userId,
  );

export const tasksCol = () =>
  col<TaskDoc>(FIRESTORE_COLLECTIONS.TASKS);

export const taskDoc = (taskId: string) =>
  d<TaskDoc>(FIRESTORE_COLLECTIONS.TASKS, taskId);

export const sharedListsCol = () =>
  col<SharedListDoc>(FIRESTORE_COLLECTIONS.SHARED_LISTS);

export const sharedListDoc = (listId: string) =>
  d<SharedListDoc>(FIRESTORE_COLLECTIONS.SHARED_LISTS, listId);

export const listItemsCol = (listId: string) =>
  colSub<ListItemDoc>(
    FIRESTORE_COLLECTIONS.SHARED_LISTS,
    listId,
    FIRESTORE_SUBCOLLECTIONS.ITEMS,
  );

export const listItemDoc = (listId: string, itemId: string) =>
  dSub<ListItemDoc>(
    FIRESTORE_COLLECTIONS.SHARED_LISTS,
    listId,
    FIRESTORE_SUBCOLLECTIONS.ITEMS,
    itemId,
  );

export const pointsLedgerCol = () =>
  col<PointsLedgerDoc>(FIRESTORE_COLLECTIONS.POINTS_LEDGER);
