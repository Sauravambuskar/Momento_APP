import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { DotGrid } from "@/components/grid/DotGrid";
import { useApp } from "@/contexts/AppContext";
import { getLifeStats } from "@/lib/weekUtils";

export default function GridScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile } = useApp();

  const stats = userProfile
    ? getLifeStats(new Date(userProfile.birthDate), userProfile.lifespan)
    : null;

  const handleDotPress = useCallback((weekNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/modal/week-detail",
      params: { weekNumber: String(weekNumber) },
    });
  }, []);

  if (!userProfile || !stats) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>Loading your grid...</Text>
      </View>
    );
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.headerName}>{userProfile.name}</Text>
          <Text style={styles.headerSub}>
            {stats.weeksLived.toLocaleString()} of{" "}
            {stats.totalWeeks.toLocaleString()} weeks lived
          </Text>
        </View>
        <Pressable
          style={styles.legendBtn}
          onPress={() => router.push("/modal/week-detail")}
        >
          <Text style={styles.legendBtnText}>+ Tag</Text>
        </Pressable>
      </View>

      {/* Year labels + Grid */}
      <View style={styles.gridArea}>
        <DotGrid
          lifespan={userProfile.lifespan}
          weeksLived={stats.weeksLived}
          currentWeekNumber={stats.currentWeekNumber}
          onDotPress={handleDotPress}
        />
      </View>

      {/* Footer legend */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 72 + (Platform.OS === "web" ? 34 : 0) },
        ]}
      >
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#FFFFFF" }]} />
          <Text style={styles.legendText}>Lived</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendDotOutline,
              { borderColor: "rgba(255,255,255,0.3)" },
            ]}
          />
          <Text style={styles.legendText}>Remaining</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "rgba(255,255,255,0.6)" },
            ]}
          />
          <Text style={styles.legendText}>Now</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#F5F5F5",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  legendBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  legendBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#F5F5F5",
  },
  gridArea: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotOutline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#555",
  },
});
