import { useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { householdDoc, membersCol } from '../../../shared/lib/firestore';
import { useHouseholdStore } from '../store/householdStore';
import { useCurrentUserDoc } from '../../auth/hooks/useAuth';

/**
 * Subscribes to the current user's household and its members.
 * Should be mounted once after authentication.
 */
export function useHouseholdSubscription() {
  const userDoc = useCurrentUserDoc();
  const { setHousehold, setMembers, setLoading } = useHouseholdStore();

  useEffect(() => {
    const householdId = userDoc?.householdId;

    if (!householdId) {
      setHousehold(null);
      setMembers([]);
      return;
    }

    setLoading(true);

    const unsubHousehold = onSnapshot(
      householdDoc(householdId),
      (snap) => {
        if (snap.exists()) {
          setHousehold({ id: snap.id, ...snap.data() });
        } else {
          setHousehold(null);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );

    const unsubMembers = onSnapshot(
      membersCol(householdId),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMembers(docs);
      },
    );

    return () => {
      unsubHousehold();
      unsubMembers();
    };
  }, [userDoc?.householdId, setHousehold, setMembers, setLoading]);
}

export function useHousehold() {
  return useHouseholdStore((s) => s.household);
}

export function useHouseholdMembers() {
  return useHouseholdStore((s) => s.members);
}
