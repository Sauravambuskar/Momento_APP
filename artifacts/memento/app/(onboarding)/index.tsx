import React, { useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { UserProfile } from "@/lib/storage";

const { width: W } = Dimensions.get("window");
const TOTAL_STEPS = 3;

const ACCENT_OPTIONS: Array<{
  key: UserProfile["accentColor"];
  label: string;
  color: string;
}> = [
  { key: "white", label: "Pure", color: "#FFFFFF" },
  { key: "warm", label: "Warm", color: "#F5E6D0" },
  { key: "cool", label: "Cool", color: "#D0E8F5" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [lifespan, setLifespan] = useState(80);
  const [accentColor, setAccentColor] =
    useState<UserProfile["accentColor"]>("white");

  const slideX = useSharedValue(0);

  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  function animateToStep(nextStep: number) {
    const dir = nextStep > step ? -1 : 1;
    slideX.value = withTiming(dir * W, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    }, () => {
      runOnJS(setStep)(nextStep);
      slideX.value = -dir * W;
      slideX.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    });
  }

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  function validateStep(): boolean {
    if (step === 0) return name.trim().length > 1;
    if (step === 1) {
      const d = parseInt(birthDay), m = parseInt(birthMonth), y = parseInt(birthYear);
      return d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= new Date().getFullYear();
    }
    return true;
  }

  async function handleNext() {
    if (!validateStep()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    if (step < TOTAL_STEPS - 1) {
      animateToStep(step + 1);
    } else {
      const birthDate = new Date(
        parseInt(birthYear),
        parseInt(birthMonth) - 1,
        parseInt(birthDay)
      ).toISOString();
      await completeOnboarding({ name: name.trim(), birthDate, lifespan, accentColor });
      router.replace("/(tabs)");
    }
  }

  function handleBack() {
    if (step > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateToStep(step - 1);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) }]}>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === step && styles.progressDotActive,
                i < step && styles.progressDotDone,
              ]}
            />
          ))}
        </View>

        <Animated.View style={[styles.stepContainer, containerStyle]}>
          {step === 0 && (
            <Step0
              name={name}
              setName={setName}
            />
          )}
          {step === 1 && (
            <Step1
              birthDay={birthDay}
              setBirthDay={setBirthDay}
              birthMonth={birthMonth}
              setBirthMonth={setBirthMonth}
              birthYear={birthYear}
              setBirthYear={setBirthYear}
              monthRef={monthRef}
              yearRef={yearRef}
            />
          )}
          {step === 2 && (
            <Step2
              lifespan={lifespan}
              setLifespan={setLifespan}
              accentColor={accentColor}
              setAccentColor={setAccentColor}
            />
          )}
        </Animated.View>

        <View style={styles.nav}>
          {step > 0 ? (
            <Pressable onPress={handleBack} style={styles.backBtn}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            onPress={handleNext}
            style={[styles.nextBtn, !validateStep() && styles.nextBtnDisabled]}
          >
            <Text style={styles.nextText}>
              {step === TOTAL_STEPS - 1 ? "Begin" : "Continue"}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Step0({ name, setName }: { name: string; setName: (v: string) => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>01</Text>
      <Text style={styles.stepTitle}>Who are you?</Text>
      <Text style={styles.stepSubtitle}>
        Your name will appear on your life grid.
      </Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor="#555"
        autoFocus
        returnKeyType="done"
        maxLength={40}
      />
    </View>
  );
}

function Step1({
  birthDay, setBirthDay, birthMonth, setBirthMonth, birthYear, setBirthYear,
  monthRef, yearRef,
}: {
  birthDay: string; setBirthDay: (v: string) => void;
  birthMonth: string; setBirthMonth: (v: string) => void;
  birthYear: string; setBirthYear: (v: string) => void;
  monthRef: React.RefObject<TextInput | null>;
  yearRef: React.RefObject<TextInput | null>;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>02</Text>
      <Text style={styles.stepTitle}>When were you born?</Text>
      <Text style={styles.stepSubtitle}>
        This anchors every week of your grid to real dates.
      </Text>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Day</Text>
          <TextInput
            style={styles.dateInput}
            value={birthDay}
            onChangeText={(v) => {
              setBirthDay(v.replace(/\D/g, "").slice(0, 2));
              if (v.length >= 2) monthRef.current?.focus();
            }}
            placeholder="DD"
            placeholderTextColor="#555"
            keyboardType="number-pad"
            maxLength={2}
            autoFocus
          />
        </View>
        <Text style={styles.dateSep}>/</Text>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Month</Text>
          <TextInput
            ref={monthRef}
            style={styles.dateInput}
            value={birthMonth}
            onChangeText={(v) => {
              setBirthMonth(v.replace(/\D/g, "").slice(0, 2));
              if (v.length >= 2) yearRef.current?.focus();
            }}
            placeholder="MM"
            placeholderTextColor="#555"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <Text style={styles.dateSep}>/</Text>
        <View style={[styles.dateField, { flex: 2 }]}>
          <Text style={styles.dateLabel}>Year</Text>
          <TextInput
            ref={yearRef}
            style={styles.dateInput}
            value={birthYear}
            onChangeText={(v) => setBirthYear(v.replace(/\D/g, "").slice(0, 4))}
            placeholder="YYYY"
            placeholderTextColor="#555"
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  );
}

function Step2({
  lifespan, setLifespan, accentColor, setAccentColor,
}: {
  lifespan: number; setLifespan: (v: number) => void;
  accentColor: UserProfile["accentColor"];
  setAccentColor: (v: UserProfile["accentColor"]) => void;
}) {
  const sliderWidth = W - 80;

  function handleSliderPress(x: number) {
    const ratio = Math.max(0, Math.min(1, x / sliderWidth));
    const val = Math.round(50 + ratio * 50);
    setLifespan(val);
    Haptics.selectionAsync();
  }

  const fillPercent = ((lifespan - 50) / 50) * 100;

  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>03</Text>
      <Text style={styles.stepTitle}>Your horizon</Text>
      <Text style={styles.stepSubtitle}>
        Set your expected lifespan and choose your accent tone.
      </Text>

      <View style={styles.sliderSection}>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.sliderLabel}>Expected lifespan</Text>
          <Text style={styles.sliderValue}>{lifespan} years</Text>
        </View>
        <Pressable
          style={styles.sliderTrack}
          onPress={(e) => handleSliderPress(e.nativeEvent.locationX)}
        >
          <View style={[styles.sliderFill, { width: `${fillPercent}%` }]} />
          <View
            style={[
              styles.sliderThumb,
              { left: `${fillPercent}%`, marginLeft: -10 },
            ]}
          />
        </Pressable>
        <View style={styles.sliderEndLabels}>
          <Text style={styles.sliderEndLabel}>50</Text>
          <Text style={styles.sliderEndLabel}>100</Text>
        </View>
      </View>

      <View style={styles.accentSection}>
        <Text style={styles.sliderLabel}>Accent tone</Text>
        <View style={styles.accentRow}>
          {ACCENT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => {
                setAccentColor(opt.key);
                Haptics.selectionAsync();
              }}
              style={[
                styles.accentBtn,
                accentColor === opt.key && styles.accentBtnActive,
              ]}
            >
              <View style={[styles.accentSwatch, { backgroundColor: opt.color }]} />
              <Text style={styles.accentLabel}>{opt.label}</Text>
            </Pressable>
          ))}
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
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 20,
    paddingBottom: 8,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressDotActive: {
    backgroundColor: "#FFFFFF",
    width: 24,
  },
  progressDotDone: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  stepContainer: {
    flex: 1,
  },
  step: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  stepNumber: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#555",
    letterSpacing: 3,
    marginBottom: 16,
  },
  stepTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: "#F5F5F5",
    marginBottom: 12,
    lineHeight: 44,
  },
  stepSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#888",
    lineHeight: 24,
    marginBottom: 48,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 20,
    fontSize: 20,
    color: "#F5F5F5",
    fontFamily: "Inter_500Medium",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  dateField: {
    flex: 1,
    gap: 6,
  },
  dateLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#555",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dateInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    fontSize: 22,
    color: "#F5F5F5",
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },
  dateSep: {
    fontSize: 24,
    color: "#444",
    paddingBottom: 12,
  },
  sliderSection: {
    marginBottom: 40,
  },
  sliderLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#888",
    letterSpacing: 0.5,
  },
  sliderValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#F5F5F5",
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    position: "relative",
    justifyContent: "center",
  },
  sliderFill: {
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    top: -8,
  },
  sliderEndLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sliderEndLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#555",
  },
  accentSection: {
    gap: 16,
  },
  accentRow: {
    flexDirection: "row",
    gap: 12,
  },
  accentBtn: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  accentBtnActive: {
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  accentSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  accentLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#888",
    letterSpacing: 0.5,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 20,
    paddingTop: 16,
  },
  backBtn: {
    padding: 12,
  },
  backText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#555",
  },
  nextBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#0A0A0A",
  },
});
