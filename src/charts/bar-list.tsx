import { useEffect, type ReactNode } from "react";
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";
import { type ChartToneColors, toneColor, toneFor } from "./tone";

const DEFAULT_LABEL_STYLE: TextStyle = { fontSize: 15, lineHeight: 20 };
const DEFAULT_DETAIL_STYLE: TextStyle = { fontSize: 13, lineHeight: 18 };
const GROW_SPRING = { damping: 17, stiffness: 140, mass: 1 };
const MIN_RATIO = 0.03;

export type BarListItem = {
  key: string;
  label: string;
  value: number;
  detail?: string;
  icon?: ReactNode;
  color?: string;
};

export type BarListProps = {
  data: BarListItem[];
  max?: number;
  barHeight?: number;
  stagger?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  renderLabel?: (item: BarListItem) => ReactNode;
  labelStyle?: StyleProp<TextStyle>;
  detailStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function BarList({
  data,
  max,
  barHeight = 6,
  stagger = 45,
  showValue = true,
  formatValue = (value) => Math.round(value).toLocaleString(),
  renderLabel,
  labelStyle = DEFAULT_LABEL_STYLE,
  detailStyle = DEFAULT_DETAIL_STYLE,
  colors,
  style,
}: BarListProps) {
  const palette = useMotionPalette(colors);
  const peak = max ?? Math.max(1, ...data.map((item) => item.value));

  return (
    <View style={[{ gap: 16 }, style]}>
      {data.map((item, index) => (
        <View key={item.key} style={{ gap: 8 }} accessible accessibilityLabel={`${item.label} ${formatValue(item.value)}`}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {item.icon}
            <View style={{ flex: 1 }}>
              {renderLabel ? (
                renderLabel(item)
              ) : (
                <>
                  <Text numberOfLines={1} style={[labelStyle, { color: palette.text }]}>{item.label}</Text>
                  {item.detail ? (
                    <Text numberOfLines={1} style={[detailStyle, { color: palette.textSecondary }]}>{item.detail}</Text>
                  ) : null}
                </>
              )}
            </View>
            {showValue && (
              <Text style={[labelStyle, { color: palette.textSecondary, fontVariant: ["tabular-nums"] }]}>
                {formatValue(item.value)}
              </Text>
            )}
          </View>
          <Bar
            ratio={peak > 0 ? item.value / peak : 0}
            delay={index * stagger}
            height={barHeight}
            color={item.color ?? palette.text}
            track={palette.surface}
          />
        </View>
      ))}
    </View>
  );
}

type BarProps = { ratio: number; delay: number; height: number; color: string; track: string };

function Bar({ ratio, delay, height, color, track }: BarProps) {
  const reduceMotion = useReducedMotion();
  const target = ratio > 0 ? Math.max(MIN_RATIO, Math.min(1, ratio)) : 0;
  const fill = useSharedValue(reduceMotion ? target : 0);

  useEffect(() => {
    fill.value = reduceMotion ? target : withDelay(delay, withSpring(target, GROW_SPRING));
  }, [delay, fill, reduceMotion, target]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${Math.max(0, fill.value) * 100}%` }));

  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }}>
      <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

export type MeterProps = {
  value: number;
  max?: number;
  warnAt?: number;
  dangerAt?: number;
  height?: number;
  toneColors?: ChartToneColors;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Meter({
  value,
  max = 1,
  warnAt,
  dangerAt,
  height = 8,
  toneColors,
  colors,
  style,
  accessibilityLabel,
}: MeterProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const tone = toneFor(fraction, warnAt, dangerAt);
  const target = toneColor(tone, palette, palette.text, toneColors);
  const fill = useSharedValue(reduceMotion ? fraction : 0);
  const paint = useSharedValue(0);
  const from = useSharedValue(target);
  const to = useSharedValue(target);

  useEffect(() => {
    fill.value = reduceMotion ? fraction : withSpring(fraction, GROW_SPRING);
  }, [fill, fraction, reduceMotion]);

  useEffect(() => {
    if (to.value === target) return;
    from.value = to.value;
    to.value = target;
    paint.value = 0;
    paint.value = withTiming(1, { duration: reduceMotion ? 0 : 280 });
  }, [from, paint, reduceMotion, target, to]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, fill.value) * 100}%`,
    backgroundColor: interpolateColor(paint.value, [0, 1], [from.value, to.value]),
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
      style={[{ height, borderRadius: height / 2, backgroundColor: palette.surface, overflow: "hidden" }, style]}
    >
      <Animated.View style={[{ height, borderRadius: height / 2, minWidth: fraction > 0 ? height : 0 }, animatedStyle]} />
    </View>
  );
}
