import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { CATEGORY_COLORS } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { WeekEntry } from "@/lib/storage";
import {
  getWeekDateRange,
  getWeekYearFromNumber,
} from "@/lib/weekUtils";

type Category = WeekEntry["category"];

const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: "work", label: "Work" },
  { key: "health", label: "Health" },
  { key: "travel", label: "Travel" },
  { key: "learning", label: "Learning" },
  { key: "personal", label: "Personal" },
];

const EMOJI_SUGGESTIONS = ["🚀", "💪", "✈️", "📚", "❤️", "🎯", "🌱", "⚡", "🔥", "✨"];

export default function WeekDetailModal() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ weekNumber?: string }>();
  const weekNumber = params.weekNumber ? parseInt(params.weekNumber) : null;

  const { userProfile, getWeekEntry, saveWeekEntry } = useApp();

  const existingEntry = weekNumber ? getWeekEntry(weekNumber) : undefined;

  const [note, setNote] = useState(existingEntry?.note ?? "");
  const [emoji, setEmoji] = useState(existingEntry?.emoji ?? "");
  const [category, setCategory] = useState<Category>(existingEntry?.category);

  useEffect(() => {
    if (existingEntry) {
      setNote(existingEntry.note ?? "");
      setEmoji(existingEntry.emoji ?? "");
      setCategory(existingEntry.category);
    }
  }, [existingEntry]);

  const dateRange =
    weekNumber && userProfile
      ? getWeekDateRange(new Date(userProfile.birthDate), weekNumber - 1)
      : null;

  const { year, weekInYear } = weekNumber
    ? getWeekYearFromNumber(weekNumber)
    : { year: 0, weekInYear: 0 };

  async function handleSave() {
    if (!weekNumber) return;
    const entry: WeekEntry = {
      weekNumber,
      yearNumber: year,
      weekStartDate: dateRange?.start ?? "",
      note: note.trim() || undefined,
      emoji: emoji.trim() || undefined,
      category,
    };
    await saveWeekEntry(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 8),
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={20} color="#888" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {weekNumber ? `Week ${weekNumber}` : "Tag a Week"}
          </Text>
          <Pressable onPress={handleSave} style={styles.saveBtn} disabled={!weekNumber}>
            <Text style={[styles.saveBtnText, !weekNumber && { opacity: 0.4 }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Week info */}
          {weekNumber && dateRange && (
            <View style={styles.weekInfo}>
              <Text style={styles.weekMeta}>
                Year {year + 1} · Week {weekInYear}
              </Text>
              <Text style={styles.weekDates}>
                {dateRange.start} — {dateRange.end}
              </Text>
            </View>
          )}

          {/* Emoji */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Emoji</Text>
            <View style={styles.emojiRow}>
              {EMOJI_SUGGESTIONS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => {
                    setEmoji(emoji === e ? "" : e);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.emojiBtn,
                    emoji === e && styles.emojiBtnActive,
                  ]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Memory tag</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="What made this week memorable?"
              placeholderTextColor="#444"
              multiline
              maxLength={200}
              returnKeyType="default"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => {
                    setCategory(category === cat.key ? undefined : cat.key);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.catBtn,
                    category === cat.key && {
                      backgroundColor: `${CATEGORY_COLORS[cat.key!]}22`,
                      borderColor: CATEGORY_COLORS[cat.key!],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.catDot,
                      { backgroundColor: CATEGORY_COLORS[cat.key!] },
                    ]}
                  />
                  <Text
                    style={[
                      styles.catLabel,
                      category === cat.key && {
                        color: CATEGORY_COLORS[cat.key!],
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#F5F5F5",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
  },
  saveBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#0A0A0A",
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 24,
    gap: 32,
    paddingBottom: 40,
  },
  weekInfo: {
    gap: 4,
  },
  weekMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#555",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  weekDates: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#F5F5F5",
    letterSpacing: -0.5,
  },
  section: {
    gap: 14,
  },
  sectionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#555",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiBtnActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  emojiText: {
    fontSize: 22,
  },
  noteInput: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#F5F5F5",
    fontFamily: "Inter_400Regular",
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 24,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#888",
  },
});
