import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  UserProfile,
  WeekEntry,
  clearAll,
  getIsOnboarded,
  loadUserProfile,
  loadWeekEntries,
  saveUserProfile,
  saveWeekEntries,
  setOnboarded,
} from "@/lib/storage";
import { getWeekKey } from "@/lib/weekUtils";

interface AppContextType {
  isLoading: boolean;
  isOnboarded: boolean;
  userProfile: UserProfile | null;
  weekEntries: Record<string, WeekEntry>;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  saveWeekEntry: (entry: WeekEntry) => Promise<void>;
  getWeekEntry: (weekNumber: number) => WeekEntry | undefined;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [weekEntries, setWeekEntries] = useState<Record<string, WeekEntry>>(
    {}
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [onboarded, profile, entries] = await Promise.all([
          getIsOnboarded(),
          loadUserProfile(),
          loadWeekEntries(),
        ]);
        setIsOnboarded(onboarded);
        setUserProfile(profile);
        setWeekEntries(entries);
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const completeOnboarding = useCallback(async (profile: UserProfile) => {
    await saveUserProfile(profile);
    await setOnboarded(true);
    setUserProfile(profile);
    setIsOnboarded(true);
  }, []);

  const saveWeekEntry = useCallback(
    async (entry: WeekEntry) => {
      const key = getWeekKey(entry.weekNumber);
      const updated = { ...weekEntries, [key]: entry };
      setWeekEntries(updated);
      await saveWeekEntries(updated);
    },
    [weekEntries]
  );

  const getWeekEntry = useCallback(
    (weekNumber: number): WeekEntry | undefined => {
      return weekEntries[getWeekKey(weekNumber)];
    },
    [weekEntries]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!userProfile) return;
      const updated = { ...userProfile, ...updates };
      setUserProfile(updated);
      await saveUserProfile(updated);
    },
    [userProfile]
  );

  const resetApp = useCallback(async () => {
    await clearAll();
    setIsOnboarded(false);
    setUserProfile(null);
    setWeekEntries({});
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isOnboarded,
        userProfile,
        weekEntries,
        completeOnboarding,
        saveWeekEntry,
        getWeekEntry,
        updateProfile,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppContextProvider");
  return ctx;
}
