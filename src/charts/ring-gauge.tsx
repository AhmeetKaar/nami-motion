import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useEffect, useMemo, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import {
  interpolateColor,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";
import { type ChartToneColors, toneColor, toneFor } from "./tone";

const SWEEP_SPRING = { damping: 20, stiffness: 90, mass: 1 };

export type RingGaugeProps = {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  sweep?: number;
  warnAt?: number;
  dangerAt?: number;
  color?: string;
  trackColor?: string;
  toneColors?: ChartToneColors;
  children?: ReactNode;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function RingGauge({
  value,
  max = 1,
  size = 140,
  thickness = 12,
  sweep = 270,
  warnAt,
  dangerAt,
  color,
  trackColor,
  toneColors,
  children,
  colors,
  style,
  accessibilityLabel,
}: RingGaugeProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const target = toneColor(toneFor(fraction, warnAt, dangerAt), palette, color ?? palette.accent, toneColors);
  const progress = useSharedValue(reduceMotion ? fraction : 0);
  const paint = useSharedValue(1);
  const from = useSharedValue(target);
  const to = useSharedValue(target);

  useEffect(() => {
    progress.value = reduceMotion ? fraction : withSpring(fraction, SWEEP_SPRING);
  }, [fraction, progress, reduceMotion]);

  useEffect(() => {
    if (to.value === target) return;
    from.value = to.value;
    to.value = target;
    paint.value = 0;
    paint.value = withTiming(1, { duration: reduceMotion ? 0 : 320 });
  }, [from, paint, reduceMotion, target, to]);

  const arc = useMemo(() => {
    const inset = thickness / 2;
    const rect = Skia.XYWHRect(inset, inset, size - thickness, size - thickness);
    const path = Skia.Path.Make();
    path.addArc(rect, 90 + (360 - sweep) / 2, sweep);
    return path;
  }, [size, sweep, thickness]);

  const end = useDerivedValue(() => Math.max(0.0001, Math.min(1, progress.value)));
  const fillColor = useDerivedValue(() => interpolateColor(paint.value, [0, 1], [from.value, to.value]));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
      style={[{ width: size, height: size }, style]}
    >
      <Canvas style={{ width: size, height: size }}>
        <Path path={arc} style="stroke" strokeWidth={thickness} strokeCap="round" color={trackColor ?? palette.surface} />
        <Path path={arc} style="stroke" strokeWidth={thickness} strokeCap="round" color={fillColor} start={0} end={end} />
      </Canvas>
      {children !== undefined && (
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          {children}
        </View>
      )}
    </View>
  );
}
