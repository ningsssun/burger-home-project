import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import { useWeeklyLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { useHouseholdMembers } from '@/features/household/hooks/useHousehold';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { Colors, Spacing, Typography, BorderRadius } from '@/shared/constants/theme';
import { format, subDays, startOfMonth, startOfWeek } from 'date-fns';

type Tab = '周报告' | '月报告' | '积分榜' | '趋势';
const TABS: Tab[] = ['周报告', '月报告', '趋势', '积分榜'];
const CHART_COLORS = ['#F1B1DF', '#1E0517', '#7A5A74', '#FFD166', '#06D6A0'];

const { width: SCREEN_W } = Dimensions.get('window');

// ─── SVG Donut Chart ─────────────────────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function donutPath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, sweepDeg: number) {
  const sweep = Math.min(sweepDeg, 359.99);
  const endDeg = startDeg + sweep;
  const o1 = polarToCartesian(cx, cy, outerR, startDeg);
  const o2 = polarToCartesian(cx, cy, outerR, endDeg);
  const i1 = polarToCartesian(cx, cy, innerR, startDeg);
  const i2 = polarToCartesian(cx, cy, innerR, endDeg);
  const large = sweep > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ');
}

interface ChartSlice { pct: number; color: string; label: string; }

function DonutChart({ slices, size = 140 }: { slices: ChartSlice[]; size?: number }) {
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.38, innerR = size * 0.22;
  const hasData = slices.some(s => s.pct > 0.005);
  let startAngle = 0;

  if (!hasData) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={outerR} fill={Colors.lightBg} />
        <Circle cx={cx} cy={cy} r={innerR} fill={Colors.white} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size}>
      {slices.map((slice, i) => {
        if (slice.pct < 0.005) return null;
        const sweepDeg = slice.pct * 360;
        const d = donutPath(cx, cy, outerR, innerR, startAngle, sweepDeg);
        startAngle += sweepDeg;
        return <Path key={i} d={d} fill={slice.color} />;
      })}
      <Circle cx={cx} cy={cy} r={innerR} fill={Colors.white} />
    </Svg>
  );
}

// ─── SVG Line Chart ──────────────────────────────────────────────
function LineChart({ data, width, height = 80 }: { data: number[]; width: number; height?: number }) {
  if (data.length < 2) return null;
  const maxVal = Math.max(...data, 1);
  const stepX = (width - 16) / (data.length - 1);
  const points = data.map((v, i) => ({
    x: 8 + i * stepX,
    y: height - 8 - ((v / maxVal) * (height - 16)),
  }));
  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      {/* Axis line */}
      <Line x1={8} y1={height - 8} x2={width - 8} y2={height - 8} stroke={Colors.gray200} strokeWidth={1} />
      {/* Line */}
      <Polyline
        points={polylineStr}
        fill="none"
        stroke={Colors.pink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={Colors.pink} />
      ))}
    </Svg>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('周报告');
  const leaderboard = useWeeklyLeaderboard();
  const members     = useHouseholdMembers();
  const allTasks    = useTasks();

  // Weekly: completed tasks per member this week
  const weeklyData = useMemo(() => {
    const sow = startOfWeek(new Date(), { weekStartsOn: 1 });
    return members.map((m, i) => {
      const count = allTasks.filter(t =>
        t.status === 'completed' &&
        t.completedBy === m.userId &&
        t.completedAt && t.completedAt.toDate() >= sow
      ).length;
      return { ...m, weeklyTasks: count, color: CHART_COLORS[i % CHART_COLORS.length] };
    });
  }, [members, allTasks]);

  const totalWeeklyTasks = weeklyData.reduce((s, m) => s + m.weeklyTasks, 0);
  const weeklySlices: ChartSlice[] = weeklyData.map(m => ({
    pct: totalWeeklyTasks > 0 ? m.weeklyTasks / totalWeeklyTasks : 1 / Math.max(members.length, 1),
    color: m.color,
    label: m.displayName,
  }));

  // Monthly: completed tasks per member this month
  const monthlyData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return members.map((m, i) => {
      const count = allTasks.filter(t =>
        t.status === 'completed' &&
        t.completedBy === m.userId &&
        t.completedAt &&
        t.completedAt.toDate() >= startOfMonth
      ).length;
      return { ...m, monthlyTasks: count, color: CHART_COLORS[i % CHART_COLORS.length] };
    });
  }, [members, allTasks]);

  const totalMonthlyTasks = monthlyData.reduce((s, m) => s + m.monthlyTasks, 0);
  const monthlySlices: ChartSlice[] = monthlyData.map(m => ({
    pct: totalMonthlyTasks > 0 ? m.monthlyTasks / totalMonthlyTasks : 1 / Math.max(members.length, 1),
    color: m.color,
    label: m.displayName,
  }));

  // Monthly leaderboard: points earned this calendar month
  const currentMonthLabel = format(new Date(), 'yyyy年M月');
  const monthlyLeaderboard = useMemo(() => {
    const som = startOfMonth(new Date());
    return [...members]
      .map((m, i) => ({
        ...m,
        monthlyPoints: allTasks
          .filter(t =>
            t.status === 'completed' &&
            t.completedBy === m.userId &&
            t.completedAt && t.completedAt.toDate() >= som
          )
          .reduce((s, t) => s + t.points, 0),
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.monthlyPoints - a.monthlyPoints);
  }, [members, allTasks]);

  // Trends: completed tasks per day for last 7 days
  const trendData = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(today, 6 - i);
      const next = new Date(day); next.setDate(next.getDate() + 1);
      const count = allTasks.filter(t =>
        t.status === 'completed' && t.completedAt &&
        t.completedAt.toDate() >= day && t.completedAt.toDate() < next
      ).length;
      return { label: format(day, 'M/d'), count };
    });
  }, [allTasks]);

  // Trends: completed tasks per day for last 30 days
  const trend30Data = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(today, 29 - i);
      const next = new Date(day); next.setDate(next.getDate() + 1);
      const count = allTasks.filter(t =>
        t.status === 'completed' && t.completedAt &&
        t.completedAt.toDate() >= day && t.completedAt.toDate() < next
      ).length;
      return { label: format(day, 'M/d'), count };
    });
  }, [allTasks]);

  const handleShare = async () => {
    const lines = leaderboard.map((e, i) => `${i + 1}. ${e.displayName} — ${e.weeklyPoints} 分`);
    await Share.share({ message: `本周家务排行榜 🏠\n\n${lines.join('\n')}` });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 周报告 ── */}
        {activeTab === '周报告' && (
          <View style={styles.section}>
            <View style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>本周家务贡献</Text>
              <Text style={styles.chartCardSub}>{format(new Date(), 'M月')}本周完成任务</Text>
              <View style={styles.chartRow}>
                <DonutChart slices={weeklySlices} size={140} />
                <View style={styles.legend}>
                  {weeklyData.map(m => {
                    const pct = totalWeeklyTasks > 0 ? Math.round((m.weeklyTasks / totalWeeklyTasks) * 100) : 0;
                    return (
                      <View key={m.userId} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{m.displayName}</Text>
                        <Text style={styles.legendPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                  {members.length === 0 && <Text style={styles.emptyText}>暂无成员</Text>}
                </View>
              </View>
            </View>

            {/* Member task bars */}
            {weeklyData.map(m => {
              const maxTasks = Math.max(...weeklyData.map(x => x.weeklyTasks), 1);
              return (
                <View key={m.userId} style={styles.memberBar}>
                  <Text style={styles.memberName} numberOfLines={1}>{m.displayName}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(m.weeklyTasks / maxTasks) * 100}%`, backgroundColor: m.color }]} />
                  </View>
                  <Text style={styles.memberPoints}>{m.weeklyTasks} 项</Text>
                </View>
              );
            })}

            {totalWeeklyTasks === 0 && (
              <Text style={styles.emptyText}>本周暂无完成记录</Text>
            )}

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>分享本周报告</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 月报告 ── */}
        {activeTab === '月报告' && (
          <View style={styles.section}>
            <View style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>本月家务贡献</Text>
              <Text style={styles.chartCardSub}>{format(new Date(), 'M月')}完成任务</Text>
              <View style={styles.chartRow}>
                <DonutChart slices={monthlySlices} size={140} />
                <View style={styles.legend}>
                  {monthlyData.map((m, i) => {
                    const pct = totalMonthlyTasks > 0 ? Math.round((m.monthlyTasks / totalMonthlyTasks) * 100) : 0;
                    return (
                      <View key={m.userId} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{m.displayName}</Text>
                        <Text style={styles.legendPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                  {members.length === 0 && <Text style={styles.emptyText}>暂无成员</Text>}
                </View>
              </View>
            </View>

            {/* Monthly task breakdown */}
            {monthlyData.map((m, i) => {
              const maxTasks = Math.max(...monthlyData.map(x => x.monthlyTasks), 1);
              return (
                <View key={m.userId} style={styles.memberBar}>
                  <Text style={styles.memberName} numberOfLines={1}>{m.displayName}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(m.monthlyTasks / maxTasks) * 100}%`, backgroundColor: m.color }]} />
                  </View>
                  <Text style={styles.memberPoints}>{m.monthlyTasks} 项</Text>
                </View>
              );
            })}

            {totalMonthlyTasks === 0 && (
              <Text style={styles.emptyText}>本月暂无完成记录</Text>
            )}

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>分享本月报告</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 积分榜 ── */}
        {activeTab === '积分榜' && (
          <View style={styles.section}>
            <Text style={styles.monthLabel}>{currentMonthLabel}</Text>

            <View style={styles.podium}>
              {monthlyLeaderboard.slice(0, 3).map((e, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const heights = [80, 60, 50];
                return (
                  <View key={e.userId} style={[styles.podiumItem, i === 0 && styles.podiumFirst]}>
                    <Text style={styles.podiumPoints}>{e.monthlyPoints} 积分</Text>
                    <Text style={styles.podiumName} numberOfLines={1}>{e.displayName}</Text>
                    <View style={[styles.podiumBar, { height: heights[i], backgroundColor: CHART_COLORS[i] }]}>
                      <Text style={styles.podiumMedal}>{medals[i]}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {monthlyLeaderboard.map((e, i) => (
              <View key={e.userId} style={styles.rankRow}>
                <Text style={styles.rankMedal}>
                  {['🥇', '🥈', '🥉'][i] ?? `${i + 1}`}
                </Text>
                <View style={styles.rankAvatar}>
                  <Text style={styles.rankAvatarText}>{e.displayName.charAt(0)}</Text>
                </View>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{e.displayName}</Text>
                </View>
                <Text style={styles.rankPoints}>⭐ {e.monthlyPoints} 积分</Text>
              </View>
            ))}
            {monthlyLeaderboard.length === 0 && <Text style={styles.emptyText}>暂无数据</Text>}
          </View>
        )}

        {/* ── 趋势 ── */}
        {activeTab === '趋势' && (
          <View style={styles.section}>
            <View style={styles.chartCard}>
              <Text style={styles.chartCardSub}>近7天完成任务数</Text>
              <LineChart
                data={trendData.map(d => d.count)}
                width={SCREEN_W - Spacing.lg * 2 - Spacing.lg * 2}
                height={100}
              />
              <View style={styles.trendLabels}>
                {trendData.map(d => (
                  <Text key={d.label} style={styles.trendLabel}>{d.label}</Text>
                ))}
              </View>
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartCardSub}>近30天完成任务数</Text>
              <LineChart
                data={trend30Data.map(d => d.count)}
                width={SCREEN_W - Spacing.lg * 2 - Spacing.lg * 2}
                height={100}
              />
              <View style={styles.trendLabels}>
                {trend30Data.filter((_, i) => i % 5 === 0 || i === 29).map(d => (
                  <Text key={d.label} style={styles.trendLabel}>{d.label}</Text>
                ))}
              </View>
            </View>

            {/* Insight cards */}
            {(() => {
              const total7 = trendData.reduce((s, d) => s + d.count, 0);
              const total30 = trend30Data.reduce((s, d) => s + d.count, 0);
              const maxDay = trend30Data.reduce((best, d) => d.count > best.count ? d : best, trend30Data[0]);
              return (
                <View style={styles.insightRow}>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightText}>近7天完成</Text>
                    <Text style={styles.insightNum}>{total7} 项</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightText}>近30天完成</Text>
                    <Text style={styles.insightNum}>{total30} 项</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightText}>最活跃</Text>
                    <Text style={styles.insightNum}>{maxDay?.label ?? '-'}</Text>
                  </View>
                </View>
              );
            })()}

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: 4,
    gap: 3,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: Typography.xs, color: Colors.slate, fontWeight: Typography.medium },
  tabTextActive: { color: Colors.ink, fontWeight: Typography.semibold },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.md },
  section: { gap: Spacing.md },

  emptyText: { color: Colors.slate, fontSize: Typography.sm, textAlign: 'center', paddingVertical: Spacing.lg },
  monthLabel: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.ink },

  // Chart card
  chartCard: {
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  chartCardTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.ink },
  chartCardSub: { fontSize: Typography.xs, color: Colors.slate },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendName: { flex: 1, fontSize: Typography.xs, color: Colors.ink },
  legendPct: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.slate },

  // Member bars
  memberBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  memberName: { width: 64, fontSize: Typography.xs, color: Colors.ink, fontWeight: Typography.medium },
  barTrack: { flex: 1, height: 10, backgroundColor: Colors.lightBg, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  memberPoints: { width: 58, fontSize: Typography.xs, color: Colors.slate, textAlign: 'right' },

  shareBtn: {
    backgroundColor: Colors.ink, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm,
  },
  shareBtnText: { color: Colors.white, fontWeight: Typography.semibold, fontSize: Typography.base },

  // Leaderboard podium
  podium: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
  },
  podiumItem: { flex: 1, alignItems: 'center', gap: 4 },
  podiumFirst: { transform: [{ scale: 1.05 }] },
  podiumPoints: { fontSize: Typography.xs, color: Colors.slate, fontWeight: Typography.medium },
  podiumName: { fontSize: Typography.xs, color: Colors.ink, fontWeight: Typography.semibold, textAlign: 'center' },
  podiumBar: {
    width: '100%', borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  podiumMedal: { fontSize: 22, paddingVertical: 8 },

  rankRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg, padding: Spacing.md,
  },
  rankMedal: { fontSize: 22, width: 30, textAlign: 'center' },
  rankAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center',
  },
  rankAvatarText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.ink },
  rankInfo: { flex: 1 },
  rankName: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.ink },
  rankPoints: { fontSize: Typography.sm, color: Colors.slate, fontWeight: Typography.semibold },

  // Trends
  trendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  trendLabel: { fontSize: 10, color: Colors.slate, textAlign: 'center' },
  insightRow: { flexDirection: 'row', gap: Spacing.sm },
  insightCard: {
    flex: 1, backgroundColor: Colors.lightBg, borderRadius: BorderRadius.xl,
    padding: Spacing.md, alignItems: 'center', gap: 4,
  },
  insightText: { fontSize: Typography.xs, color: Colors.slate },
  insightNum: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.ink },
  trendMemberRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.lightBg, borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  trendMemberDot: { width: 10, height: 10, borderRadius: 5 },
  trendMemberName: { flex: 1, fontSize: Typography.sm, color: Colors.ink, fontWeight: Typography.medium },
  trendMemberPoints: { fontSize: Typography.sm, color: Colors.slate },
});
