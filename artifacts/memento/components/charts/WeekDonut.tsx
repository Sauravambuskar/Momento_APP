import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface WeekDonutProps {
  weeksLived: number;
  totalWeeks: number;
  percentLived: number;
}

const SIZE = 180;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const CENTER = SIZE / 2;

export function WeekDonut({
  weeksLived,
  totalWeeks,
  percentLived,
}: WeekDonutProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentLived / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentLived, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.4)" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={R}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
          fill="transparent"
        />
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          r={R}
          stroke="url(#grad)"
          strokeWidth={STROKE}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.percentText}>{percentLived.toFixed(1)}%</Text>
        <Text style={styles.subText}>lived</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  labelContainer: {
    position: "absolute",
    alignItems: "center",
  },
  percentText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F5F5F5",
    letterSpacing: -1,
  },
  subText: {
    fontSize: 13,
    color: "#888888",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },
});
