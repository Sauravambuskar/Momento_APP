import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

const FEATURES = [
  {
    symbol: "○",
    title: "Your entire life — at a glance",
    body: "Every week of your life rendered as a single dot. Filled for the past, open for the future.",
  },
  {
    symbol: "◉",
    title: "Tag any week with a memory",
    body: "Tap a dot to add an emoji, a note, and a category — work, health, travel, learning, or personal.",
  },
  {
    symbol: "◎",
    title: "Reflect on what remains",
    body: "See your life percentage, weeks remaining, and a daily motivational quote on the Stats screen.",
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  function handleGetStarted() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(onboarding)/step1" as any);
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Poster image */}
        <Animated.View
          entering={FadeInDown.duration(600).easing(Easing.out(Easing.cubic))}
          style={styles.imageWrap}
        >
          <Image
            source={require("../../assets/images/life-in-weeks.png")}
            style={styles.poster}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title block */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600).easing(Easing.out(Easing.cubic))}
          style={styles.titleBlock}
        >
          <Text style={styles.appName}>Memento</Text>
          <Text style={styles.tagline}>My Life in Weeks</Text>
          <Text style={styles.description}>
            A 90-year life is{" "}
            <Text style={styles.descriptionBold}>4,680 dots.</Text>{" "}
            Memento makes mortality tangible — turning abstract years into a
            grid you can touch, annotate, and reflect on.
          </Text>
        </Animated.View>

        {/* Feature list */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600).easing(Easing.out(Easing.cubic))}
          style={styles.features}
        >
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureSymbol}>{f.symbol}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* CTA — pinned to bottom */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={[styles.cta, { paddingBottom: botPad + 20 }]}
      >
        <Pressable onPress={handleGetStarted} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Begin your journey</Text>
        </Pressable>
        <Text style={styles.ctaNote}>Takes 30 seconds · No account needed</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 20,
    gap: 32,
  },
  imageWrap: {
    alignItems: "center",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
  poster: {
    width: W * 0.72,
    height: W * 0.9,
    borderRadius: 8,
  },
  titleBlock: {
    gap: 8,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 42,
    color: "#F5F5F5",
    letterSpacing: -2,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#555",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#888",
    lineHeight: 26,
  },
  descriptionBold: {
    fontFamily: "Inter_700Bold",
    color: "#F5F5F5",
  },
  features: {
    gap: 24,
    paddingBottom: 8,
  },
  featureRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  featureSymbol: {
    fontSize: 22,
    color: "#FFFFFF",
    width: 28,
    lineHeight: 26,
    textAlign: "center",
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#F5F5F5",
    lineHeight: 22,
  },
  featureBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 16,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    gap: 10,
    alignItems: "center",
  },
  ctaBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
    width: "100%",
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#0A0A0A",
    letterSpacing: -0.3,
  },
  ctaNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#444",
    letterSpacing: 0.3,
  },
});
