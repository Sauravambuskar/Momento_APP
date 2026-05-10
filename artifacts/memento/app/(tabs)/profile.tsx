import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { GlassCard } from "@/components/ui/GlassCard";
import { useApp } from "@/contexts/AppContext";
import { getLifeStats } from "@/lib/weekUtils";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userProfile, updateProfile, resetApp, signOut, currentEmail } = useApp();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name ?? "");
  const [lifespan, setLifespan] = useState(
    String(userProfile?.lifespan ?? 80)
  );

  useEffect(() => {
    setName(userProfile?.name ?? "");
    setLifespan(String(userProfile?.lifespan ?? 80));
  }, [userProfile]);

  if (!userProfile) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyText}>No profile found</Text>
      </View>
    );
  }

  const stats = getLifeStats(
    new Date(userProfile.birthDate),
    userProfile.lifespan
  );

  async function handleSave() {
    const ls = parseInt(lifespan);
    if (isNaN(ls) || ls < 50 || ls > 120) {
      Alert.alert("Invalid lifespan", "Enter a value between 50 and 120.");
      return;
    }
    await updateProfile({ name: name.trim() || userProfile!.name, lifespan: ls });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  }

  async function handleSignOut() {
    Alert.alert(
      "Sign out",
      "You'll need to sign back in to access your grid.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/sign-in");
          },
        },
      ]
    );
  }

  function handleReset() {
    Alert.alert(
      "Reset Memento",
      "This will delete all your data and restart from scratch. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetApp();
            router.replace("/(onboarding)");
          },
        },
      ]
    );
  }

  const birthDate = new Date(userProfile.birthDate);
  const birthStr = birthDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + 72 + (Platform.OS === "web" ? 34 : 0);

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
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Pressable
          onPress={() => {
            if (editing) handleSave();
            else setEditing(true);
          }}
          style={styles.editBtn}
        >
          <Feather
            name={editing ? "check" : "edit-2"}
            size={18}
            color="#F5F5F5"
          />
        </Pressable>
      </View>

      {/* Avatar + name */}
      <GlassCard style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {userProfile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        {editing ? (
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        ) : (
          <Text style={styles.profileName}>{userProfile.name}</Text>
        )}
        <Text style={styles.profileBirth}>Born {birthStr}</Text>
        {currentEmail && (
          <Text style={styles.profileEmail}>{currentEmail}</Text>
        )}
      </GlassCard>

      {/* Life summary */}
      <GlassCard>
        <Text style={styles.sectionLabel}>Life Summary</Text>
        <View style={styles.summaryGrid}>
          <SummaryItem
            label="Age"
            value={String(Math.floor(stats.weeksLived / 52))}
          />
          <SummaryItem
            label="Weeks lived"
            value={stats.weeksLived.toLocaleString()}
          />
          <SummaryItem
            label="Weeks left"
            value={stats.weeksRemaining.toLocaleString()}
          />
          <SummaryItem
            label="Life %"
            value={`${stats.percentLived.toFixed(1)}%`}
          />
        </View>
      </GlassCard>

      {/* Settings */}
      <GlassCard>
        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingKey}>Expected lifespan</Text>
          {editing ? (
            <TextInput
              style={styles.settingInput}
              value={lifespan}
              onChangeText={setLifespan}
              keyboardType="number-pad"
              maxLength={3}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          ) : (
            <Text style={styles.settingValue}>{userProfile.lifespan} yrs</Text>
          )}
        </View>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.settingKey}>Accent tone</Text>
          <Text style={styles.settingValue}>
            {userProfile.accentColor.charAt(0).toUpperCase() +
              userProfile.accentColor.slice(1)}
          </Text>
        </View>
      </GlassCard>

      {/* Account */}
      <GlassCard>
        <Text style={styles.sectionLabel}>Account</Text>
        <Pressable
          onPress={handleSignOut}
          style={[styles.settingRow, { borderBottomWidth: 0 }]}
        >
          <View style={styles.signOutLeft}>
            <Feather name="log-out" size={16} color="#F5F5F5" />
            <Text style={styles.settingKey}>Sign out</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#444" />
        </Pressable>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard>
        <Text style={[styles.sectionLabel, { color: "#ef4444" }]}>
          Danger Zone
        </Text>
        <Pressable onPress={handleReset} style={styles.resetBtn}>
          <Feather name="trash-2" size={16} color="#ef4444" />
          <Text style={styles.resetText}>Reset all data</Text>
        </Pressable>
      </GlassCard>
    </ScrollView>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#F5F5F5",
    letterSpacing: -1,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCard: {
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "#F5F5F5",
  },
  profileName: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#F5F5F5",
  },
  nameInput: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#F5F5F5",
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingBottom: 4,
    minWidth: 120,
    textAlign: "center",
  },
  profileBirth: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#666",
  },
  sectionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#555",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  summaryItem: {
    width: "45%",
    gap: 4,
  },
  summaryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#F5F5F5",
    letterSpacing: -1,
  },
  summaryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  settingKey: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#888",
  },
  settingValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#F5F5F5",
  },
  settingInput: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#F5F5F5",
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingBottom: 2,
    minWidth: 60,
    textAlign: "right",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  resetText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#ef4444",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#555",
  },
  profileEmail: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#444",
    letterSpacing: 0.2,
  },
  signOutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
