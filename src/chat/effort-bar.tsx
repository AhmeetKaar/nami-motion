import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  PanResponder,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  type SharedValue,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";
import { withAlpha } from "../internal/color";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const LEVEL_SPRING = { damping: 20, stiffness: 190, mass: 0.9 };
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const DEFAULT_LABEL_STYLE: TextStyle = { fontSize: 16, lineHeight: 22, fontWeight: "600" };
const DEFAULT_NUMBER_STYLE: TextStyle = { fontSize: 30, lineHeight: 34, fontWeight: "700" };
const DEFAULT_DETAIL_STYLE: TextStyle = { fontSize: 13, lineHeight: 18 };
const DEFAULT_SEGMENT_STYLE: TextStyle = { fontSize: 13, lineHeight: 18, fontWeight: "600" };
const DEFAULT_GRADIENT = ["#53C26B", "#9BCB4A", "#F0C64A", "#F19A3E", "#EC6A4F", "#E5486F"];

export type EffortLevel = string | { key?: string; label: string; description?: string; value?: string; budget?: number };

export type EffortSelection = { index: number; label: string; value?: string; budget?: number };

export type EffortBarProps = {
  levels: EffortLevel[];
  value: number;
  onChange?: (index: number, level: EffortSelection) => void;
  variant?: "bars" | "track";
  size?: "regular" | "compact";
  steps?: number;
  title?: string;
  icon?: ReactNode | ((index: number) => ReactNode);
  badge?: ReactNode;
  illustration?: (index: number) => ReactNode;
  illustrationHeight?: number;
  showHeader?: boolean;
  showNumber?: boolean;
  formatNumber?: (index: number, filled: number) => string;
  showDescription?: boolean;
  disabled?: boolean;
  fillColors?: string[];
  barHeight?: number;
  onHaptic?: (index: number) => void;
  labelStyle?: StyleProp<TextStyle>;
  numberStyle?: StyleProp<TextStyle>;
  detailStyle?: StyleProp<TextStyle>;
  segmentStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

function normalize(level: EffortLevel): { key?: string; label: string; description?: string; value?: string; budget?: number } {
  return typeof level === "string" ? { label: level } : level;
}

function mix(a: string, b: string, t: number) {
  const parse = (hex: string) => {
    const clean = hex.replace("#", "");
    return [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16));
  };
  const from = parse(a);
  const to = parse(b);
  const channel = (index: number) => Math.round(from[index] + (to[index] - from[index]) * t).toString(16).padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

function spread(stops: string[], count: number) {
  if (count <= 1) return [stops[stops.length - 1]];
  if (stops.length === 1) return new Array(count).fill(stops[0]);
  return Array.from({ length: count }, (_, index) => {
    const position = (index / (count - 1)) * (stops.length - 1);
    const low = Math.floor(position);
    const high = Math.min(stops.length - 1, low + 1);
    const a = stops[low];
    const b = stops[high];
    return a.startsWith("#") && b.startsWith("#") ? mix(a, b, position - low) : position - low < 0.5 ? a : b;
  });
}

function filledFor(index: number, count: number, steps: number) {
  return Math.max(1, Math.round(((index + 1) / count) * steps));
}

export function EffortBar({
  levels,
  value,
  onChange,
  variant = "bars",
  size = "regular",
  steps: stepsProp,
  title,
  icon,
  badge,
  illustration,
  illustrationHeight = 132,
  showHeader = true,
  showNumber = true,
  formatNumber,
  showDescription = true,
  disabled = false,
  fillColors,
  barHeight,
  onHaptic,
  labelStyle = DEFAULT_LABEL_STYLE,
  numberStyle = DEFAULT_NUMBER_STYLE,
  detailStyle = DEFAULT_DETAIL_STYLE,
  segmentStyle = DEFAULT_SEGMENT_STYLE,
  colors,
  style,
}: EffortBarProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const items = useMemo(() => levels.map(normalize), [levels]);
  const count = Math.max(1, items.length);
  const index = Math.min(count - 1, Math.max(0, value));
  const current = items[index];
  const compact = size === "compact";
  const steps = variant === "track" ? count : Math.max(count, stepsProp ?? (compact ? count : Math.max(count, 10)));
  const filled = filledFor(index, count, steps);
  const fill = useSharedValue(filled);
  const level = useSharedValue(index);
  const [width, setWidth] = useState(0);
  const lastIndex = useRef(index);
  const previous = useRef(index);
  const rising = index >= previous.current;
  const interactive = !!onChange && !disabled;

  useEffect(() => {
    fill.value = reduceMotion ? filled : withSpring(filled, LEVEL_SPRING);
    level.value = reduceMotion ? index : withSpring(index, LEVEL_SPRING);
    previous.current = index;
  }, [fill, filled, index, level, reduceMotion]);

  const barColors = useMemo(() => spread(fillColors && fillColors.length > 0 ? fillColors : DEFAULT_GRADIENT, steps), [fillColors, steps]);
  const levelColors = useMemo(() => items.map((_, position) => barColors[filledFor(position, count, steps) - 1]), [barColors, count, items, steps]);
  const trackFills = useMemo(
    () => (fillColors && fillColors.length > 0 ? spread(fillColors, count) : items.map(() => palette.text)),
    [count, fillColors, items, palette.text],
  );
  const accent = levelColors[index] ?? palette.accent;
  const numberFor = (position: number) => {
    if (formatNumber) return formatNumber(position, filledFor(position, count, steps));
    const budget = items[position]?.budget;
    return budget !== undefined ? `${Math.round(budget * 100)}%` : String(filledFor(position, count, steps));
  };
  const numberWidth = Math.max(...items.map((_, position) => numberFor(position).length)) * 19;

  const select = (next: number) => {
    const item = items[next];
    onHaptic?.(next);
    onChange?.(next, { index: next, label: item.label, value: item.value, budget: item.budget });
  };

  const pick = (x: number) => {
    if (!interactive || width === 0) return;
    const next = Math.min(count - 1, Math.max(0, Math.floor((x / width) * count)));
    if (next === lastIndex.current) return;
    lastIndex.current = next;
    select(next);
  };
  const pickRef = useRef(pick);
  pickRef.current = pick;

  useEffect(() => {
    lastIndex.current = index;
  }, [index]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => pickRef.current(event.nativeEvent.locationX),
        onPanResponderMove: (event) => pickRef.current(event.nativeEvent.locationX),
      }),
    [],
  );

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const handleAction = (event: AccessibilityActionEvent) => {
    if (!interactive) return;
    const delta = event.nativeEvent.actionName === "increment" ? 1 : event.nativeEvent.actionName === "decrement" ? -1 : 0;
    const next = Math.min(count - 1, Math.max(0, index + delta));
    if (next !== index) select(next);
  };

  const height = barHeight ?? (compact ? 14 : variant === "track" ? 44 : 56);

  const control = (
    <View onLayout={handleLayout} {...(interactive ? responder.panHandlers : {})} style={{ height, justifyContent: "flex-end" }}>
      {variant === "track" ? (
        <Track items={items} level={level} width={width} height={height} fills={trackFills} palette={palette} compact={compact} segmentStyle={segmentStyle} />
      ) : (
        <Bars steps={steps} fill={fill} height={height} colors={barColors} palette={palette} compact={compact} />
      )}
    </View>
  );

  const iconNode =
    typeof icon === "function" ? (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          key={`icon${index}`}
          entering={reduceMotion ? undefined : ZoomIn.springify().damping(13).stiffness(260)}
          exiting={reduceMotion ? undefined : FadeOut.duration(100)}
        >
          {icon(index)}
        </Animated.View>
      </View>
    ) : (
      icon
    );

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={title ?? "Effort"}
      accessibilityValue={{ text: current?.label }}
      accessibilityState={{ disabled }}
      accessibilityActions={interactive ? [{ name: "increment" }, { name: "decrement" }] : undefined}
      onAccessibilityAction={handleAction}
      style={[{ gap: compact ? 0 : 12, opacity: disabled ? 0.45 : 1 }, compact && { flexDirection: "row", alignItems: "center", gap: 8 }, style]}
    >
      {compact ? (
        <>
          <View style={{ width: steps * 5 + (steps - 1) * 2.5 }}>{control}</View>
          {showHeader && current ? (
            <Animated.Text
              key={index}
              entering={reduceMotion ? undefined : FadeIn.duration(180).easing(EASE_OUT)}
              style={[segmentStyle, { color: variant === "track" ? palette.textSecondary : accent }]}
            >
              {current.label}
            </Animated.Text>
          ) : null}
        </>
      ) : (
        <>
          {illustration ? (
            <View style={{ height: illustrationHeight, alignItems: "center", justifyContent: "center" }}>
              <Animated.View
                key={`i${index}`}
                entering={reduceMotion ? undefined : ZoomIn.duration(320).easing(EASE_OUT)}
                exiting={reduceMotion ? undefined : FadeOut.duration(140)}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}
              >
                {illustration(index)}
              </Animated.View>
            </View>
          ) : null}
          {showHeader && variant === "bars" ? (
            <View style={{ gap: 2 }}>
              {title || badge ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {title ? <Text style={[segmentStyle, { color: palette.textSecondary }]}>{title}</Text> : null}
                  {badge}
                </View>
              ) : null}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 36 }}>
                {showNumber ? (
                  <View style={{ overflow: "hidden", minWidth: numberWidth }}>
                    <Animated.Text
                      key={`n${index}`}
                      entering={reduceMotion ? undefined : (rising ? FadeInUp : FadeInDown).delay(70).duration(240).easing(EASE_OUT)}
                      exiting={reduceMotion ? undefined : FadeOut.duration(60)}
                      style={[numberStyle, { color: palette.text, fontVariant: ["tabular-nums"] }]}
                    >
                      {numberFor(index)}
                    </Animated.Text>
                  </View>
                ) : null}
                <Animated.Text
                  key={`l${index}`}
                  entering={reduceMotion ? undefined : FadeIn.duration(220).easing(EASE_OUT)}
                  style={[labelStyle, { color: accent }]}
                >
                  {current?.label}
                </Animated.Text>
                <View style={{ flex: 1 }} />
                {iconNode}
              </View>
            </View>
          ) : null}
          {showHeader && variant === "track" ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {iconNode}
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                {title ? <Text style={[labelStyle, { color: palette.text }]}>{title}</Text> : null}
                {badge}
              </View>
              <Animated.Text
                key={index}
                entering={reduceMotion ? undefined : FadeIn.duration(220).easing(EASE_OUT)}
                style={[labelStyle, { color: title ? palette.textSecondary : palette.text, fontWeight: title ? "500" : "600" }]}
              >
                {current?.label}
              </Animated.Text>
            </View>
          ) : null}
          {control}
          {showDescription && current?.description ? (
            <Animated.Text
              key={`d${index}`}
              entering={reduceMotion ? undefined : FadeIn.duration(240).easing(EASE_OUT)}
              style={[detailStyle, { color: palette.textSecondary }]}
            >
              {current.description}
            </Animated.Text>
          ) : null}
        </>
      )}
    </View>
  );
}

type BarsProps = {
  steps: number;
  fill: SharedValue<number>;
  height: number;
  colors: string[];
  palette: MotionPalette;
  compact: boolean;
};

function Bars({ steps, fill, height, colors, palette, compact }: BarsProps) {
  const gap = compact ? 2.5 : 6;
  const track = compact ? withAlpha(palette.text, 0.14) : withAlpha(palette.text, 0.08);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap, height }}>
      {Array.from({ length: steps }, (_, position) => (
        <Bar key={position} position={position} steps={steps} fill={fill} height={height} color={colors[position]} track={track} compact={compact} />
      ))}
    </View>
  );
}

type BarProps = {
  position: number;
  steps: number;
  fill: SharedValue<number>;
  height: number;
  color: string;
  track: string;
  compact: boolean;
};

function Bar({ position, steps, fill, height, color, track, compact }: BarProps) {
  const minimum = compact ? 0.4 : 0.42;
  const ratio = steps > 1 ? minimum + ((1 - minimum) * position) / (steps - 1) : 1;
  const barHeight = Math.round(height * ratio);
  const amount = useDerivedValue(() => Math.min(1, Math.max(0, fill.value - position)));
  const colorStyle = useAnimatedStyle(() => ({ opacity: amount.value }));
  const popStyle = useAnimatedStyle(() => {
    const near = Math.max(0, 1 - Math.abs(fill.value - (position + 1)));
    return { transform: [{ scale: 1 + near * (compact ? 0 : 0.08) }] };
  });

  return (
    <Animated.View
      style={[
        {
          flex: compact ? undefined : 1,
          width: compact ? 5 : undefined,
          height: barHeight,
          borderRadius: 999,
          backgroundColor: track,
          overflow: "hidden",
        },
        popStyle,
      ]}
    >
      <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color }, colorStyle]} />
    </Animated.View>
  );
}

type TrackProps = {
  items: { label: string }[];
  level: SharedValue<number>;
  width: number;
  height: number;
  fills: string[];
  palette: MotionPalette;
  compact: boolean;
  segmentStyle: StyleProp<TextStyle>;
};

function Track({ items, level, width, height, fills, palette, compact, segmentStyle }: TrackProps) {
  const count = items.length;
  const segment = width / Math.max(1, count);
  const radius = height / 2;
  const inputs = items.map((_, position) => position);
  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(height, segment * (level.value + 1)),
    backgroundColor: count > 1 ? interpolateColor(level.value, inputs, fills) : fills[0],
  }));
  const clipStyle = useAnimatedStyle(() => ({ width: Math.max(height, segment * (level.value + 1)) }));

  const labels = (color: string) =>
    items.map((item, position) => (
      <View key={`${position}-${item.label}`} style={{ width: segment, alignItems: "center", justifyContent: "center" }}>
        <Text numberOfLines={1} style={[segmentStyle, { color }]}>
          {item.label}
        </Text>
      </View>
    ));

  return (
    <View style={{ height, borderRadius: radius, borderCurve: "continuous", backgroundColor: palette.surface, overflow: "hidden" }}>
      {!compact
        ? items.slice(1).map((_, position) => (
            <View
              key={position}
              style={{ position: "absolute", top: height * 0.3, bottom: height * 0.3, left: segment * (position + 1), width: 1, backgroundColor: withAlpha(palette.text, 0.1) }}
            />
          ))
        : null}
      {!compact && width > 0 ? (
        <View style={{ position: "absolute", top: 0, left: 0, bottom: 0, flexDirection: "row" }}>{labels(palette.textSecondary)}</View>
      ) : null}
      <Animated.View style={[{ position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: radius, borderCurve: "continuous" }, fillStyle]} />
      {!compact && width > 0 ? (
        <Animated.View style={[{ position: "absolute", top: 0, left: 0, bottom: 0, overflow: "hidden" }, clipStyle]}>
          <View style={{ flexDirection: "row", height, width }}>{labels(palette.background)}</View>
        </Animated.View>
      ) : null}
    </View>
  );
}
