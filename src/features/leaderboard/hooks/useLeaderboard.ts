import { useHouseholdMembers } from '../../household/hooks/useHousehold';
import { LeaderboardEntry } from '../../../shared/types/models';

/**
 * Derives the weekly leaderboard from household members.
 * Members are sorted by weeklyPoints descending.
 */
export function useWeeklyLeaderboard(): LeaderboardEntry[] {
  const members = useHouseholdMembers();

  return [...members]
    .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
    .map((member, index) => ({
      userId: member.userId,
      displayName: member.displayName,
      photoURL: member.photoURL,
      weeklyPoints: member.weeklyPoints,
      allTimePoints: member.allTimePoints,
      rank: index + 1,
    }));
}

export function useAllTimeLeaderboard(): LeaderboardEntry[] {
  const members = useHouseholdMembers();

  return [...members]
    .sort((a, b) => b.allTimePoints - a.allTimePoints)
    .map((member, index) => ({
      userId: member.userId,
      displayName: member.displayName,
      photoURL: member.photoURL,
      weeklyPoints: member.weeklyPoints,
      allTimePoints: member.allTimePoints,
      rank: index + 1,
    }));
}
