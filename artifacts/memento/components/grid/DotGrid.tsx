import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle, Text as SvgText, Rect } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { differenceInMonths, differenceInDays, startOfYear } from "date-fns";
import { CATEGORY_COLORS } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { getWeekKey } from "@/lib/weekUtils";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SW } = Dimensions.get("window");
const LABEL_W = 30;
const HEADER_H = 22;

export type ViewMode = "days" | "weeks" | "months" | "years";

interface ModeLayout {
  cols: number;
  cellSize: number;
  dotRadius: number;
}

function getModeLayout(mode: ViewMode): ModeLayout {
  const availW = SW - LABEL_W - 8;
  switch (mode) {
    case "years":
      return {
        cols: 10,
        cellSize: Math.floor(availW / 10),
        dotRadius: Math.floor(availW / 10 / 2) - 2,
      };
    case "months":
      return {
        cols: 12,
        cellSize: Math.floor(availW / 12),
        dotRadius: Math.floor(availW / 12 / 2) - 2,
      };
    case "days":
      return {
        cols: 7,
        cellSize: Math.floor((SW - 8) / 7),
        dotRadius: Math.floor((SW - 8) / 7 / 2) - 4,
      };
    case "weeks":
    default:
      return {
        cols: 52,
        cellSize: Math.floor(availW / 52),
        dotRadius: Math.max(2, Math.floor(availW / 52 / 2)),
      };
  }
}

// ─── Pulsing dot for current unit ────────────────────────────────────────────
interface PulsingDotProps { cx: number; cy: number; r: number }
function PulsingDot({ cx, cy, r }: PulsingDotProps) {
  const opacity = useSharedValue(1);
  const radius = useSharedValue(r);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
    radius.value = withRepeat(
      withTiming(r * 2, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, [opacity, radius, r]);

  const glowProps = useAnimatedProps(() => ({
    opacity: opacity.value,
    r: radius.value,
  }));

  return (
    <>
      <AnimatedCircle cx={cx} cy={cy} fill="rgba(255,255,255,0.45)" animatedProps={glowProps} />
      <Circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
    </>
  );
}

// ─── Main DotGrid ─────────────────────────────────────────────────────────────
interface DotGridProps {
  lifespan: number;
  weeksLived: number;
  currentWeekNumber: number;
  birthDate: Date;
  viewMode: ViewMode;
  onDotPress: (weekNumber: number) => void;
}

export function DotGrid({
  lifespan,
  weeksLived,
  currentWeekNumber,
  birthDate,
  viewMode,
  onDotPress,
}: DotGridProps) {
  const { weekEntries } = useApp();
  const { cols, cellSize, dotRadius } = getModeLayout(viewMode);
  const today = new Date();

  // ── Lived / total / current units by mode ─────────────────────────────
  let livedUnits: number;
  let totalUnits: number;
  let currentUnit: number;
  let rows: number;

  if (viewMode === "weeks") {
    livedUnits = weeksLived;
    totalUnits = lifespan * 52;
    currentUnit = currentWeekNumber;
    rows = lifespan;
  } else if (viewMode === "months") {
    livedUnits = Math.max(0, differenceInMonths(today, birthDate));
    totalUnits = lifespan * 12;
    currentUnit = livedUnits + 1;
    rows = lifespan;
  } else if (viewMode === "years") {
    livedUnits = Math.floor(weeksLived / 52);
    totalUnits = lifespan;
    currentUnit = livedUnits + 1;
    rows = Math.ceil(lifespan / cols);
  } else {
    // days — current year only, 7 cols (days of week)
    const yearStart = startOfYear(today);
    livedUnits = differenceInDays(today, yearStart);
    totalUnits = 365;
    currentUnit = livedUnits + 1;
    rows = 53;
  }

  // ── SVG dimensions ────────────────────────────────────────────────────
  const svgW = LABEL_W + cols * cellSize;
  const svgH = HEADER_H + rows * cellSize;

  // ── Build all SVG elements ────────────────────────────────────────────
  const elements: React.ReactNode[] = [];

  // Column header labels
  const colLabels = getColLabels(viewMode, cols);
  colLabels.forEach(({ col, label }) => {
    elements.push(
      <SvgText
        key={`hdr-${col}`}
        x={LABEL_W + col * cellSize + cellSize / 2}
        y={HEADER_H - 7}
        textAnchor="middle"
        fontSize={7}
        fill="rgba(255,255,255,0.28)"
      >
        {label}
      </SvgText>
    );
  });

  // Row labels + dots
  for (let row = 0; row < rows; row++) {
    const cy = HEADER_H + row * cellSize + cellSize / 2;

    // Row label
    const rowLabel = getRowLabel(viewMode, row, cols);
    if (rowLabel) {
      elements.push(
        <SvgText
          key={`rlabel-${row}`}
          x={LABEL_W - 4}
          y={cy + 3}
          textAnchor="end"
          fontSize={7}
          fill="rgba(255,255,255,0.28)"
        >
          {rowLabel}
        </SvgText>
      );
    }

    for (let col = 0; col < cols; col++) {
      const unitNumber = row * cols + col + 1;
      if (unitNumber > totalUnits) continue;

      const cx = LABEL_W + col * cellSize + cellSize / 2;
      const isLived = unitNumber <= livedUnits;
      const isCurrent = unitNumber === currentUnit;

      let categoryColor: string | null = null;
      if (viewMode === "weeks") {
        const entry = weekEntries[getWeekKey(unitNumber)];
        if (entry?.category) categoryColor = CATEGORY_COLORS[entry.category];
      }

      if (isCurrent) {
        elements.push(
          <PulsingDot key={`dot-${unitNumber}`} cx={cx} cy={cy} r={dotRadius} />
        );
      } else if (isLived) {
        elements.push(
          <Circle
            key={`dot-${unitNumber}`}
            cx={cx}
            cy={cy}
            r={dotRadius}
            fill={categoryColor ?? "#FFFFFF"}
            onPress={viewMode === "weeks" ? () => onDotPress(unitNumber) : undefined}
          />
        );
      } else {
        elements.push(
          <Circle
            key={`dot-${unitNumber}`}
            cx={cx}
            cy={cy}
            r={dotRadius}
            fill="transparent"
            stroke={categoryColor ?? "rgba(255,255,255,0.16)"}
            strokeWidth={0.7}
            onPress={viewMode === "weeks" ? () => onDotPress(unitNumber) : undefined}
          />
        );
      }
    }
  }

  // ── Zoom + Pan + double-tap-to-reset gestures ─────────────────────────
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(6, Math.max(0.5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .minDistance(1)
    .onUpdate((e) => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1, { duration: 280 });
      savedScale.value = 1;
      offsetX.value = withTiming(0, { duration: 280 });
      savedOffsetX.value = 0;
      offsetY.value = withTiming(0, { duration: 280 });
      savedOffsetY.value = 0;
    });

  const composed = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, pan),
    pinch
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <View style={styles.gestureArea}>
          <Animated.View style={animStyle}>
            <Svg width={svgW} height={svgH}>
              <Rect x={0} y={0} width={svgW} height={svgH} fill="transparent" />
              {elements}
            </Svg>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

// ─── Label helpers ────────────────────────────────────────────────────────────
function getColLabels(mode: ViewMode, cols: number): { col: number; label: string }[] {
  if (mode === "weeks") {
    return Array.from({ length: cols }, (_, i) => i)
      .filter((i) => i === 0 || (i + 1) % 5 === 0)
      .map((i) => ({ col: i, label: String(i + 1) }));
  }
  if (mode === "months") {
    const M = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    return M.map((label, col) => ({ col, label }));
  }
  if (mode === "years") {
    return Array.from({ length: 10 }, (_, i) => ({ col: i, label: String(i + 1) }));
  }
  // days
  const D = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return D.map((label, col) => ({ col, label }));
}

function getRowLabel(mode: ViewMode, row: number, cols: number): string | null {
  if (mode === "weeks" || mode === "months") {
    const yr = row + 1;
    return yr === 1 || yr % 5 === 0 ? String(yr) : null;
  }
  if (mode === "years") {
    return String(row * cols + 1);
  }
  // days — show week number every 4 weeks
  return row % 4 === 0 ? `W${row + 1}` : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  gestureArea: {
    flex: 1,
    overflow: "hidden",
  },
});
