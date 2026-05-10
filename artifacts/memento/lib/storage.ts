import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER_PROFILE: "@memento/user_profile",
  WEEK_ENTRIES: "@memento/week_entries",
  IS_ONBOARDED: "@memento/is_onboarded",
};

export interface UserProfile {
  name: string;
  birthDate: string;
  lifespan: number;
  accentColor: "white" | "warm" | "cool";
}

export interface WeekEntry {
  weekNumber: number;
  yearNumber: number;
  weekStartDate: string;
  emoji?: string;
  note?: string;
  category?: "work" | "health" | "travel" | "learning" | "personal";
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  if (!raw) return null;
  return JSON.parse(raw) as UserProfile;
}

export async function saveWeekEntries(
  entries: Record<string, WeekEntry>
): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEK_ENTRIES, JSON.stringify(entries));
}

export async function loadWeekEntries(): Promise<Record<string, WeekEntry>> {
  const raw = await AsyncStorage.getItem(KEYS.WEEK_ENTRIES);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, WeekEntry>;
}

export async function setOnboarded(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.IS_ONBOARDED, value ? "1" : "0");
}

export async function getIsOnboarded(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.IS_ONBOARDED);
  return raw === "1";
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.USER_PROFILE,
    KEYS.WEEK_ENTRIES,
    KEYS.IS_ONBOARDED,
  ]);
}
