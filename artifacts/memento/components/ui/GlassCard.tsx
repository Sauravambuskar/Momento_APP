import { BlurView } from "expo-blur";
import React from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 18,
  padding = 20,
}: GlassCardProps) {
  const inner = (
    <View
      style={[styles.inner, { padding }, style]}
    >
      {children}
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webGlass, { padding }, style]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint="dark" style={styles.blur}>
      {inner}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  inner: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  webGlass: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
});
