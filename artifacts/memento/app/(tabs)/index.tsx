import React, { useCallback, useState } from "react";
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
import { DotGrid, ViewMode } from "@/components/grid/DotGrid";
import { useApp } from "@/contexts/AppContext";
import { getLifeStats } from "@/lib/weekUtils";

const MODES: { key: ViewMode; label: string }[] = [
  { key: "days", label: "D" },
  { key: "weeks", label: "W" },
  { key: "months", label: "M" },
  { key: "years", label: "Y" },
];

export default function GridScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>("weeks");

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

  function handleModeChange(mode: ViewMode) {
    Haptics.selectionAsync();
    setViewMode(mode);
  }

  if (!userProfile || !stats) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>Loading your grid...</Text>
      </View>
    );
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const modeHint: Record<ViewMode, string> = {
    days: "This year · day by day",
    weeks: "Your life · week by week",
    months: "Your life · month by month",
    years: "Your life · year by year",
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View>
          <Text style={styles.headerName}>{userProfile.name}</Text>
          <Text style={styles.headerSub}>{modeHint[viewMode]}</Text>
        </View>

        {/* View mode filter */}
        <View style={styles.modeRow}>
          {MODES.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => handleModeChange(m.key)}
              style={[
                styles.modeBtn,
                viewMode === m.key && styles.modeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === m.key && styles.modeBtnTextActive,
                ]}
              >
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Grid */}
      <DotGrid
        lifespan={userProfile.lifespan}
        weeksLived={stats.weeksLived}
        currentWeekNumber={stats.currentWeekNumber}
        birthDate={new Date(userProfile.birthDate)}
        viewMode={viewMode}
        onDotPress={handleDotPress}
      />

      {/* Bottom legend + hint */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              insets.bottom + 72 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#FFFFFF" }]} />
          <Text style={styles.legendText}>Lived</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDotOutline]} />
          <Text style={styles.legendText}>Remaining</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "rgba(255,255,255,0.5)" }]} />
          <Text style={styles.legendText}>Now</Text>
        </View>
        <Text style={styles.zoomHint}>Pinch · Pan · Double-tap to reset</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#F5F5F5",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#555",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  modeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#555",
  },
  modeBtnTextActive: {
    color: "#0A0A0A",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    flexWrap: "wrap",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendDotOutline: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  legendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#555",
  },
  zoomHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#333",
    letterSpacing: 0.3,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#555",
  },
});
