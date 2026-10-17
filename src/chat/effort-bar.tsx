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
const DEFAULT_DETAIL_STYLE: TextStyle = { fontSize: 13, lineHeight: 18 };
const DEFAULT_SEGMENT_STYLE: TextStyle = { fontSize: 13, lineHeight: 18, fontWeight: "600" };

export type EffortLevel = string | { key?: string; label: string; description?: string };

export type EffortBarProps = {
  levels: EffortLevel[];
  value: number;
  onChange?: (index: number) => void;
  variant?: "bars" | "track";
  size?: "regular" | "compact";
  title?: string;
  icon?: ReactNode | ((index: number) => ReactNode);
  badge?: ReactNode;
  illustration?: (index: number) => ReactNode;
  illustrationHeight?: number;
  showHeader?: boolean;
  showDescription?: boolean;
  disabled?: boolean;
  fillColors?: string[];
  onHaptic?: (index: number) => void;
  labelStyle?: StyleProp<TextStyle>;
  detailStyle?: StyleProp<TextStyle>;
  segmentStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

function normalize(level: EffortLevel) {
  return typeof level === "string" ? { label: level } : level;
}

export function EffortBar({
  levels,
  value,
  onChange,
  variant = "bars",
  size = "regular",
  title,
  icon,
  badge,
  illustration,
  illustrationHeight = 132,
  showHeader = true,
  showDescription = true,
  disabled = false,
  fillColors,
  onHaptic,
  labelStyle = DEFAULT_LABEL_STYLE,
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
  const level = useSharedValue(index);
  const [width, setWidth] = useState(0);
  const lastIndex = useRef(index);
  const interactive = !!onChange && !disabled;

  useEffect(() => {
    level.value = reduceMotion ? index : withSpring(index, LEVEL_SPRING);
  }, [index, level, reduceMotion]);

  const fills = useMemo(() => {
    if (fillColors && fillColors.length > 0) {
      return items.map((_, position) => fillColors[Math.min(fillColors.length - 1, position)]);
    }
    return items.map(() => (variant === "track" ? palette.text : palette.accent));
  }, [fillColors, items, palette.accent, palette.text, variant]);

  const pick = (x: number) => {
    if (!interactive || width === 0) return;
    const next = Math.min(count - 1, Math.max(0, Math.floor((x / width) * count)));
    if (next === lastIndex.current) return;
    lastIndex.current = next;
    onHaptic?.(next);
    onChange?.(next);
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
    const step = event.nativeEvent.actionName === "increment" ? 1 : event.nativeEvent.actionName === "decrement" ? -1 : 0;
    const next = Math.min(count - 1, Math.max(0, index + step));
    if (next !== index) {
      onHaptic?.(next);
      onChange?.(next);
    }
  };

  const height = compact ? 14 : variant === "track" ? 44 : 34;

  const control = (
    <View
      onLayout={handleLayout}
      {...(interactive ? responder.panHandlers : {})}
      style={{ height, justifyContent: "flex-end" }}
    >
      {variant === "track" ? (
        <Track
          items={items}
          level={level}
          width={width}
          height={height}
          fills={fills}
          palette={palette}
          compact={compact}
          segmentStyle={segmentStyle}
        />
      ) : (
        <Bars items={items} level={level} height={height} fills={fills} palette={palette} compact={compact} />
      )}
    </View>
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
          <View style={{ width: count * 6 + (count - 1) * 3 }}>{control}</View>
          {showHeader && current ? (
            <Animated.Text
              key={index}
              entering={reduceMotion ? undefined : FadeIn.duration(180).easing(EASE_OUT)}
              style={[segmentStyle, { color: palette.textSecondary }]}
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
          {showHeader ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {typeof icon === "function" ? (
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
              )}
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                {title ? <Text style={[labelStyle, { color: palette.text }]}>{title}</Text> : null}
                {badge}
              </View>
              <View style={{ overflow: "hidden" }}>
                <Animated.Text
                  key={index}
                  entering={reduceMotion ? undefined : FadeIn.duration(220).easing(EASE_OUT)}
                  exiting={reduceMotion ? undefined : FadeOut.duration(120)}
                  style={[labelStyle, { color: title ? palette.textSecondary : palette.text, fontWeight: title ? "500" : "600" }]}
                >
                  {current?.label}
                </Animated.Text>
              </View>
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
  items: { label: string }[];
  level: SharedValue<number>;
  height: number;
  fills: string[];
  palette: MotionPalette;
  compact: boolean;
};

function Bars({ items, level, height, fills, palette, compact }: BarsProps) {
  const count = items.length;
  const gap = compact ? 3 : 6;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap, height }}>
      {items.map((item, position) => (
        <Bar
          key={`${position}-${item.label}`}
          position={position}
          count={count}
          level={level}
          height={height}
          fill={fills[position]}
          track={compact ? withAlpha(palette.text, 0.16) : palette.surface}
          compact={compact}
        />
      ))}
    </View>
  );
}

type BarProps = {
  position: number;
  count: number;
  level: SharedValue<number>;
  height: number;
  fill: string;
  track: string;
  compact: boolean;
};

function Bar({ position, count, level, height, fill, track, compact }: BarProps) {
  const minimum = compact ? 0.4 : 0.32;
  const ratio = count > 1 ? minimum + ((1 - minimum) * position) / (count - 1) : 1;
  const barHeight = Math.round(height * ratio);
  const radius = compact ? 1.5 : 4;
  const amount = useDerivedValue(() => Math.min(1, Math.max(0, level.value - position + 1)));
  const fillStyle = useAnimatedStyle(() => ({
    height: barHeight * amount.value,
    opacity: 0.35 + amount.value * 0.65,
  }));
  const liftStyle = useAnimatedStyle(() => {
    const near = Math.max(0, 1 - Math.abs(level.value - position));
    return { transform: [{ scaleY: 1 + near * (compact ? 0 : 0.06) }] };
  });

  return (
    <Animated.View
      style={[
        { flex: compact ? undefined : 1, width: compact ? 6 : undefined, height: barHeight, borderRadius: radius, backgroundColor: track, overflow: "hidden", justifyContent: "flex-end" },
        liftStyle,
      ]}
    >
      <Animated.View style={[{ borderRadius: radius, backgroundColor: fill }, fillStyle]} />
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
