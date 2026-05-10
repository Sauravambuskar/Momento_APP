import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WeekDonut } from "@/components/charts/WeekDonut";
import { GlassCard } from "@/components/ui/GlassCard";
import { CATEGORY_COLORS } from "@/constants/colors";
import { getDailyQuote } from "@/constants/quotes";
import { useApp } from "@/contexts/AppContext";
import { getLifeStats } from "@/lib/weekUtils";

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile, weekEntries } = useApp();

  if (!userProfile) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const stats = getLifeStats(
    new Date(userProfile.birthDate),
    userProfile.lifespan
  );

  const taggedWeeks = Object.keys(weekEntries).length;
  const quote = getDailyQuote();

  const categoryCounts: Record<string, number> = {};
  Object.values(weekEntries).forEach((entry) => {
    if (entry.category) {
      categoryCounts[entry.category] = (categoryCounts[entry.category] ?? 0) + 1;
    }
  });

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + 72 + (Platform.OS === "web" ? 34 : 0);

  const age = Math.floor(stats.weeksLived / 52);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: topPad + 20,
        paddingBottom: botPad + 20,
        paddingHorizontal: 20,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Your Life</Text>

      {/* Donut chart */}
      <GlassCard style={styles.donutCard}>
        <WeekDonut
          weeksLived={stats.weeksLived}
          totalWeeks={stats.totalWeeks}
          percentLived={stats.percentLived}
        />
        <View style={styles.donutMeta}>
          <StatPill label="Weeks lived" value={stats.weeksLived.toLocaleString()} />
          <View style={styles.statDivider} />
          <StatPill label="Remaining" value={stats.weeksRemaining.toLocaleString()} />
        </View>
      </GlassCard>

      {/* Key numbers */}
      <View style={styles.row}>
        <GlassCard style={styles.halfCard} padding={18}>
          <Text style={styles.bigNum}>{age}</Text>
          <Text style={styles.bigLabel}>Age</Text>
        </GlassCard>
        <GlassCard style={styles.halfCard} padding={18}>
          <Text style={styles.bigNum}>{taggedWeeks}</Text>
          <Text style={styles.bigLabel}>Tagged</Text>
        </GlassCard>
      </View>

      {/* Progress bar */}
      <GlassCard>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Life Progress</Text>
          <Text style={styles.progressValue}>
            {stats.percentLived.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, stats.percentLived)}%` },
            ]}
          />
        </View>
        <View style={styles.progressEnds}>
          <Text style={styles.progressEnd}>Birth</Text>
          <Text style={styles.progressEnd}>Year {userProfile.lifespan}</Text>
        </View>
      </GlassCard>

      {/* Category breakdown */}
      {Object.keys(categoryCounts).length > 0 && (
        <GlassCard>
          <Text style={styles.sectionTitle}>Tagged weeks by category</Text>
          <View style={styles.categoryList}>
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <View key={cat} style={styles.categoryRow}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: CATEGORY_COLORS[cat] ?? "#fff" },
                  ]}
                />
                <Text style={styles.categoryName}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      )}

      {/* Daily quote */}
      <GlassCard>
        <Text style={styles.quoteLabel}>Today's thought</Text>
        <Text style={styles.quoteText}>{quote}</Text>
      </GlassCard>
    </ScrollView>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#F5F5F5",
    letterSpacing: -1,
    marginBottom: 4,
  },
  donutCard: {
    alignItems: "center",
    gap: 24,
  },
  donutMeta: {
    flexDirection: "row",
    gap: 0,
    width: "100%",
    justifyContent: "space-around",
  },
  statPill: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#F5F5F5",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  bigNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    color: "#F5F5F5",
    letterSpacing: -2,
  },
  bigLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#888",
  },
  progressValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#F5F5F5",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  progressEnds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressEnd: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#555",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#F5F5F5",
    flex: 1,
  },
  categoryCount: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#888",
  },
  quoteLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#555",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  quoteText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#888",
    lineHeight: 26,
    fontStyle: "italic",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#555",
  },
});
