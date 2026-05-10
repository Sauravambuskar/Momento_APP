import React, { useEffect } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { CATEGORY_COLORS } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { WeekEntry } from "@/lib/storage";
import { getWeekKey } from "@/lib/weekUtils";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 16;
const COLS = 52;
const CELL = Math.floor((SCREEN_WIDTH - PADDING * 2) / COLS);
const DOT_R = Math.max(3, Math.floor(CELL * 0.46));

interface PulsingDotProps {
  cx: number;
  cy: number;
}

function PulsingDot({ cx, cy }: PulsingDotProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, {
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    scale.value = withRepeat(
      withTiming(1.8, {
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity, scale]);

  const glowProps = useAnimatedProps(() => ({
    opacity: opacity.value,
    r: DOT_R * scale.value,
  }));

  return (
    <>
      <AnimatedCircle
        cx={cx}
        cy={cy}
        fill="rgba(255,255,255,0.4)"
        animatedProps={glowProps}
      />
      <Circle cx={cx} cy={cy} r={DOT_R} fill="#FFFFFF" />
    </>
  );
}

interface DotRowProps {
  year: number;
  weeksLived: number;
  currentWeekNumber: number;
  weekEntries: Record<string, WeekEntry>;
  onDotPress: (weekNumber: number) => void;
}

function DotRow({
  year,
  weeksLived,
  currentWeekNumber,
  weekEntries,
  onDotPress,
}: DotRowProps) {
  const cy = year * CELL + CELL / 2;
  const dots = [];

  for (let col = 0; col < COLS; col++) {
    const weekNumber = year * COLS + col + 1;
    const cx = col * CELL + CELL / 2;
    const isLived = weekNumber <= weeksLived;
    const isCurrent = weekNumber === currentWeekNumber;
    const entry = weekEntries[getWeekKey(weekNumber)];
    const categoryColor = entry?.category
      ? CATEGORY_COLORS[entry.category]
      : null;

    if (isCurrent) {
      dots.push(<PulsingDot key={col} cx={cx} cy={cy} />);
    } else if (isLived) {
      dots.push(
        <Circle
          key={col}
          cx={cx}
          cy={cy}
          r={DOT_R}
          fill={categoryColor ?? "#FFFFFF"}
          onPress={() => onDotPress(weekNumber)}
        />
      );
    } else {
      dots.push(
        <Circle
          key={col}
          cx={cx}
          cy={cy}
          r={DOT_R}
          fill="transparent"
          stroke={categoryColor ?? "rgba(255,255,255,0.18)"}
          strokeWidth={0.8}
          onPress={() => onDotPress(weekNumber)}
        />
      );
    }
  }

  return <G>{dots}</G>;
}

interface DotGridProps {
  lifespan: number;
  weeksLived: number;
  currentWeekNumber: number;
  onDotPress: (weekNumber: number) => void;
}

export function DotGrid({
  lifespan,
  weeksLived,
  currentWeekNumber,
  onDotPress,
}: DotGridProps) {
  const { weekEntries } = useApp();
  const gridWidth = COLS * CELL;
  const gridHeight = lifespan * CELL;

  const rows = [];
  for (let year = 0; year < lifespan; year++) {
    rows.push(
      <DotRow
        key={year}
        year={year}
        weeksLived={weeksLived}
        currentWeekNumber={currentWeekNumber}
        weekEntries={weekEntries}
        onDotPress={onDotPress}
      />
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: PADDING }}>
        <Svg width={gridWidth} height={gridHeight}>
          {rows}
        </Svg>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
});
