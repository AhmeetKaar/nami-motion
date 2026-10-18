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
const GRAB_SPRING = { damping: 22, stiffness: 320, mass: 0.7 };
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const DEFAULT_LABEL_STYLE: TextStyle = { fontSize: 16, lineHeight: 22, fontWeight: "600" };
const DEFAULT_NUMBER_STYLE: TextStyle = { fontSize: 30, lineHeight: 34, fontWeight: "700" };
const DEFAULT_DETAIL_STYLE: TextStyle = { fontSize: 13, lineHeight: 18 };
const DEFAULT_SEGMENT_STYLE: TextStyle = { fontSize: 13, lineHeight: 18, fontWeight: "600" };
const DEFAULT_GRADIENT = ["#53C26B", "#9BCB4A", "#F0C64A", "#F19A3E", "#EC6A4F", "#E5486F"];
const SLIDER_TRACK = 40;
const SLIDER_RIM = 3;
const SLIDER_STRETCH = 1.4;
const SLIDER_TAB = 28;
const SLIDER_TAB_RADIUS = 10;
const SLIDER_SHOULDER = 8;
const COMPACT_SLIDER_KNOB = 10;

export type EffortBarVariant = "bars" | "track" | "segmented" | "slider";

export type EffortLevel = string | { key?: string; label: string; description?: string; value?: string; budget?: number };

export type EffortSelection = { index: number; label: string; value?: string; budget?: number };

export type EffortBarProps = {
  levels: EffortLevel[];
  value: number;
  onChange?: (index: number, level: EffortSelection) => void;
  variant?: EffortBarVariant;
  size?: "regular" | "compact";
  steps?: number;
  title?: string;
  tabLabel?: string;
  levelIcon?: (index: number, color: string) => ReactNode;
  icon?: ReactNode | ((index: number) => ReactNode);
  badge?: ReactNode;
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
  tabLabel,
  levelIcon,
  icon,
  badge,
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
  const stops = fillColors && fillColors.length > 0 ? fillColors : undefined;
  const custom = !!stops;
  const steps = variant === "bars" ? Math.max(count, stepsProp ?? (compact ? count : Math.max(count, 10))) : count;
  const filled = filledFor(index, count, steps);
  const ratio = count > 1 ? index / (count - 1) : 0;
  const fill = useSharedValue(filled);
  const level = useSharedValue(index);
  const knob = useSharedValue(ratio);
  const pressed = useSharedValue(0);
  const [width, setWidth] = useState(0);
  const lastIndex = useRef(index);
  const indexRef = useRef(index);
  const previous = useRef(index);
  const dragging = useRef(false);
  const rising = index >= previous.current;
  const interactive = !!onChange && !disabled;
  indexRef.current = index;

  useEffect(() => {
    fill.value = reduceMotion ? filled : withSpring(filled, LEVEL_SPRING);
    level.value = reduceMotion ? index : withSpring(index, LEVEL_SPRING);
    previous.current = index;
  }, [fill, filled, index, level, reduceMotion]);

  useEffect(() => {
    if (dragging.current) return;
    knob.value = reduceMotion ? ratio : withSpring(ratio, LEVEL_SPRING);
  }, [knob, ratio, reduceMotion]);

  const barColors = useMemo(() => spread(stops ?? DEFAULT_GRADIENT, steps), [steps, stops]);
  const levelColors = useMemo(() => items.map((_, position) => barColors[filledFor(position, count, steps) - 1]), [barColors, count, items, steps]);
  const trackFills = useMemo(
    () => (stops ? spread(stops, count) : items.map(() => palette.text)),
    [count, items, palette.text, stops],
  );
  const accent = levelColors[index] ?? palette.accent;
  const numberFor = (position: number) => {
    if (formatNumber) return formatNumber(position, filledFor(position, count, steps));
    const budget = items[position]?.budget;
    return budget !== undefined ? `${Math.round(budget * 100)}%` : String(filledFor(position, count, steps));
  };
  const numberWidth = Math.max(...items.map((_, position) => numberFor(position).length)) * 19;
  const sliderTrack = barHeight ?? SLIDER_TRACK;
  const knobSize = compact ? COMPACT_SLIDER_KNOB : sliderTrack;
  const knobInset = compact ? 0 : SLIDER_RIM;

  const select = (next: number) => {
    const item = items[next];
    onHaptic?.(next);
    onChange?.(next, { index: next, label: item.label, value: item.value, budget: item.budget });
  };

  const pick = (x: number, grant: boolean) => {
    if (!interactive || width === 0) return;
    let next: number;
    if (variant === "slider") {
      const position = Math.min(1, Math.max(0, (x - knobInset - knobSize / 2) / Math.max(1, width - knobInset * 2 - knobSize)));
      dragging.current = true;
      knob.value = reduceMotion || !grant ? position : withSpring(position, GRAB_SPRING);
      if (grant && !reduceMotion) pressed.value = withSpring(1, GRAB_SPRING);
      next = Math.round(position * (count - 1));
    } else {
      next = Math.min(count - 1, Math.max(0, Math.floor((x / width) * count)));
    }
    if (next === lastIndex.current) return;
    lastIndex.current = next;
    select(next);
  };
  const pickRef = useRef(pick);
  pickRef.current = pick;

  const release = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const target = count > 1 ? indexRef.current / (count - 1) : 0;
    knob.value = reduceMotion ? target : withSpring(target, LEVEL_SPRING);
    pressed.value = reduceMotion ? 0 : withSpring(0, LEVEL_SPRING);
  };
  const releaseRef = useRef(release);
  releaseRef.current = release;

  useEffect(() => {
    lastIndex.current = index;
  }, [index]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => pickRef.current(event.nativeEvent.locationX, true),
        onPanResponderMove: (event) => pickRef.current(event.nativeEvent.locationX, false),
        onPanResponderRelease: () => releaseRef.current(),
        onPanResponderTerminate: () => releaseRef.current(),
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

  const height =
    variant === "slider" ? (compact ? knobSize : SLIDER_TAB + sliderTrack) : barHeight ?? (compact ? 14 : variant === "track" ? 44 : variant === "segmented" ? 40 : 56);
  const compactWidth = variant === "segmented" ? count * 12 + 4 : variant === "slider" ? 40 : steps * 5 + (steps - 1) * 2.5;

  const visual =
    variant === "track" ? (
      <Track items={items} level={level} width={width} height={height} fills={trackFills} palette={palette} compact={compact} segmentStyle={segmentStyle} levelIcon={levelIcon} />
    ) : variant === "segmented" ? (
      <Segmented
        items={items}
        level={level}
        width={width}
        height={height}
        fills={trackFills}
        custom={custom}
        palette={palette}
        compact={compact}
        segmentStyle={segmentStyle}
        levelIcon={levelIcon}
      />
    ) : variant === "slider" ? (
      compact ? (
        <CompactSlider count={count} knob={knob} width={width} knobSize={knobSize} fills={trackFills} palette={palette} />
      ) : (
        <Slider
          count={count}
          label={current?.label ?? ""}
          index={index}
          tabLabel={tabLabel}
          levelIcon={levelIcon}
          knob={knob}
          pressed={pressed}
          width={width}
          track={sliderTrack}
          fills={trackFills}
          palette={palette}
          reduceMotion={reduceMotion}
          segmentStyle={segmentStyle}
        />
      )
    ) : (
      <Bars steps={steps} fill={fill} height={height} colors={barColors} palette={palette} compact={compact} />
    );

  const control = (
    <View
      onLayout={handleLayout}
      {...(interactive ? responder.panHandlers : {})}
      style={{ height, justifyContent: "flex-end" }}
    >
      <View pointerEvents="none">{visual}</View>
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

  const labelled = variant !== "bars" && (variant !== "slider" || !!(title || badge || iconNode));

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
          <View style={{ width: compactWidth }}>{control}</View>
          {showHeader && current ? (
            levelIcon ? (
              <Animated.View key={index} entering={reduceMotion ? undefined : FadeIn.duration(180).easing(EASE_OUT)}>
                {levelIcon(index, variant === "bars" ? accent : palette.textSecondary)}
              </Animated.View>
            ) : (
              <Animated.Text
                key={index}
                entering={reduceMotion ? undefined : FadeIn.duration(180).easing(EASE_OUT)}
                style={[segmentStyle, { color: variant === "bars" ? accent : palette.textSecondary }]}
              >
                {current.label}
              </Animated.Text>
            )
          ) : null}
        </>
      ) : (
        <>
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
                {levelIcon ? (
                  <Animated.View key={`l${index}`} entering={reduceMotion ? undefined : FadeIn.duration(220).easing(EASE_OUT)}>
                    {levelIcon(index, accent)}
                  </Animated.View>
                ) : (
                  <Animated.Text
                    key={`l${index}`}
                    entering={reduceMotion ? undefined : FadeIn.duration(220).easing(EASE_OUT)}
                    style={[labelStyle, { color: accent }]}
                  >
                    {current?.label}
                  </Animated.Text>
                )}
                <View style={{ flex: 1 }} />
                {iconNode}
              </View>
            </View>
          ) : null}
          {showHeader && labelled ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {iconNode}
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                {title ? <Text style={[labelStyle, { color: palette.text }]}>{title}</Text> : null}
                {badge}
              </View>
              {variant !== "slider" ? (
                levelIcon ? (
                  <Animated.View key={index} entering={reduceMotion ? undefined : FadeIn.duration(220).easing(EASE_OUT)}>
                    {levelIcon(index, title ? palette.textSecondary : palette.text)}
                  </Animated.View>
                ) : (
                  <Animated.Text
                    key={index}
                    entering={reduceMotion ? undefined : FadeIn.duration(220).easing(EASE_OUT)}
                    style={[labelStyle, { color: title ? palette.textSecondary : palette.text, fontWeight: title ? "500" : "600" }]}
                  >
                    {current?.label}
                  </Animated.Text>
                )
              ) : null}
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
  levelIcon?: (index: number, color: string) => ReactNode;
};

function Track({ items, level, width, height, fills, palette, compact, segmentStyle, levelIcon }: TrackProps) {
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
        {levelIcon ? (
          levelIcon(position, color)
        ) : (
          <Text numberOfLines={1} style={[segmentStyle, { color }]}>
            {item.label}
          </Text>
        )}
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

type LevelLabelProps = {
  label: string;
  position: number;
  level: SharedValue<number>;
  on: string;
  off: string;
  segmentStyle: StyleProp<TextStyle>;
  align?: "left" | "center" | "right";
  style?: StyleProp<ViewStyle>;
};

function LevelLabel({ label, position, level, on, off, segmentStyle, align = "center", style }: LevelLabelProps) {
  const colorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(Math.min(1, Math.abs(level.value - position)), [0, 1], [on, off]),
  }));
  return (
    <View style={style}>
      <Animated.Text numberOfLines={1} style={[segmentStyle, { textAlign: align }, colorStyle]}>
        {label}
      </Animated.Text>
    </View>
  );
}

function LevelGlyph({
  position,
  level,
  render,
  on,
  off,
}: {
  position: number;
  level: SharedValue<number>;
  render: (index: number, color: string) => ReactNode;
  on: string;
  off: string;
}) {
  const onStyle = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, Math.abs(level.value - position)) }));
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {render(position, off)}
      <Animated.View style={[{ position: "absolute" }, onStyle]}>{render(position, on)}</Animated.View>
    </View>
  );
}

type SegmentedProps = {
  items: { label: string }[];
  level: SharedValue<number>;
  width: number;
  height: number;
  fills: string[];
  custom: boolean;
  palette: MotionPalette;
  compact: boolean;
  segmentStyle: StyleProp<TextStyle>;
  levelIcon?: (index: number, color: string) => ReactNode;
};

function Segmented({ items, level, width, height, fills, custom, palette, compact, segmentStyle, levelIcon }: SegmentedProps) {
  const count = items.length;
  const inset = compact ? 2 : 3;
  const radius = height / 2;
  const segment = Math.max(0, (width - inset * 2) / Math.max(1, count));
  const inputs = items.map((_, position) => position);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: segment * level.value }],
    backgroundColor: custom ? (count > 1 ? interpolateColor(level.value, inputs, fills) : fills[0]) : compact ? palette.text : palette.card,
  }));

  return (
    <View style={{ height, flexDirection: "row", padding: inset, borderRadius: radius, borderCurve: "continuous", backgroundColor: palette.surface }}>
      {width > 0 ? (
        <Animated.View
          style={[
            { position: "absolute", top: inset, left: inset, bottom: inset, width: segment, borderRadius: radius - inset, borderCurve: "continuous" },
            !custom && !compact ? { shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } } : null,
            thumbStyle,
          ]}
        />
      ) : null}
      {!compact && levelIcon
        ? items.map((item, position) => (
            <View key={`${position}-${item.label}`} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <LevelGlyph position={position} level={level} render={levelIcon} on={custom ? palette.background : palette.text} off={palette.textSecondary} />
            </View>
          ))
        : null}
      {!compact && !levelIcon
        ? items.map((item, position) => (
            <LevelLabel
              key={`${position}-${item.label}`}
              label={item.label}
              position={position}
              level={level}
              on={custom ? palette.background : palette.text}
              off={palette.textSecondary}
              segmentStyle={segmentStyle}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            />
          ))
        : null}
    </View>
  );
}

type SliderProps = {
  count: number;
  label: string;
  index: number;
  tabLabel?: string;
  levelIcon?: (index: number, color: string) => ReactNode;
  knob: SharedValue<number>;
  pressed: SharedValue<number>;
  width: number;
  track: number;
  fills: string[];
  palette: MotionPalette;
  reduceMotion: boolean;
  segmentStyle: StyleProp<TextStyle>;
};

function Slider({ count, label, index, tabLabel, levelIcon, knob, pressed, width, track, fills, palette, reduceMotion, segmentStyle }: SliderProps) {
  const span = Math.max(0, width - SLIDER_RIM * 2 - track);
  const radius = track / 2;
  const edge = radius;
  const tabWidth = useSharedValue(0);
  const inputs = Array.from({ length: count }, (_, position) => position);
  const knobFrame = useDerivedValue(() => {
    const size = track * (1 + pressed.value * (SLIDER_STRETCH - 1));
    const center = SLIDER_RIM + track / 2 + knob.value * span;
    const left = Math.min(Math.max(center - size / 2, SLIDER_RIM), Math.max(SLIDER_RIM, width - SLIDER_RIM - size));
    return { left, size, center };
  });
  const fillStyle = useAnimatedStyle(() => ({
    width: knobFrame.value.left + knobFrame.value.size + SLIDER_RIM,
    backgroundColor: count > 1 ? interpolateColor(knob.value * (count - 1), inputs, fills) : fills[0],
  }));
  const knobStyle = useAnimatedStyle(() => ({ width: knobFrame.value.size, transform: [{ translateX: knobFrame.value.left }] }));
  const tabStyle = useAnimatedStyle(() => {
    const wanted = knobFrame.value.center - tabWidth.value / 2;
    const left = Math.min(Math.max(wanted, edge), Math.max(edge, width - edge - tabWidth.value));
    return { opacity: tabWidth.value > 0 ? 1 : 0, transform: [{ translateX: left }] };
  });

  if (width === 0) return <View style={{ height: SLIDER_TAB + track }} />;

  return (
    <View style={{ height: SLIDER_TAB + track }}>
      <Animated.View
        onLayout={(event) => {
          tabWidth.value = event.nativeEvent.layout.width;
        }}
        style={[{ position: "absolute", top: 0, left: 0 }, tabStyle]}
      >
        <View
          style={{
            height: SLIDER_TAB + 1,
            paddingHorizontal: 12,
            paddingBottom: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            borderTopLeftRadius: SLIDER_TAB_RADIUS,
            borderTopRightRadius: SLIDER_TAB_RADIUS,
            borderCurve: "continuous",
            backgroundColor: palette.surface,
          }}
        >
          {tabLabel ? <Text style={[segmentStyle, { color: palette.text, fontWeight: "700" }]}>{tabLabel}</Text> : null}
          {levelIcon ? (
            <Animated.View key={index} entering={reduceMotion ? undefined : FadeIn.duration(200).easing(EASE_OUT)}>
              {levelIcon(index, palette.textSecondary)}
            </Animated.View>
          ) : (
            <Animated.Text
              key={index}
              entering={reduceMotion ? undefined : FadeIn.duration(200).easing(EASE_OUT)}
              style={[segmentStyle, { color: palette.textSecondary, fontWeight: "500" }]}
            >
              {label}
            </Animated.Text>
          )}
        </View>
        <Shoulder side="left" color={palette.surface} />
        <Shoulder side="right" color={palette.surface} />
      </Animated.View>
      <View
        style={{
          position: "absolute",
          top: SLIDER_TAB,
          left: 0,
          right: 0,
          height: track,
          borderRadius: radius,
          borderCurve: "continuous",
          backgroundColor: palette.surface,
          overflow: "hidden",
        }}
      >
        <Animated.View style={[{ position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: radius, borderCurve: "continuous" }, fillStyle]} />
        {inputs.map((position) => (
          <Stop
            key={position}
            position={position}
            count={count}
            knob={knob}
            left={SLIDER_RIM + track / 2 + (count > 1 ? (span * position) / (count - 1) : 0)}
            size={Math.round(track * 0.3)}
            on={withAlpha(palette.card, 0.55)}
            off={withAlpha(palette.text, 0.18)}
          />
        ))}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: SLIDER_RIM,
              left: 0,
              height: track - SLIDER_RIM * 2,
              borderRadius: radius - SLIDER_RIM,
              borderCurve: "continuous",
              backgroundColor: palette.card,
              shadowColor: "#000000",
              shadowOpacity: 0.12,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            },
            knobStyle,
          ]}
        />
      </View>
    </View>
  );
}

function Shoulder({ side, color }: { side: "left" | "right"; color: string }) {
  const size = SLIDER_SHOULDER;
  return (
    <View style={[{ position: "absolute", bottom: 0, width: size, height: size, overflow: "hidden" }, side === "left" ? { left: -size } : { right: -size }]}>
      <View
        style={{
          position: "absolute",
          top: -size * 2,
          left: side === "left" ? -size * 2 : -size,
          width: size * 4,
          height: size * 4,
          borderRadius: size * 2,
          borderWidth: size,
          borderColor: color,
        }}
      />
    </View>
  );
}

type CompactSliderProps = {
  count: number;
  knob: SharedValue<number>;
  width: number;
  knobSize: number;
  fills: string[];
  palette: MotionPalette;
};

function CompactSlider({ count, knob, width, knobSize, fills, palette }: CompactSliderProps) {
  const inset = knobSize / 2;
  const span = Math.max(0, width - knobSize);
  const inputs = Array.from({ length: count }, (_, position) => position);
  const fillStyle = useAnimatedStyle(() => ({
    width: inset + span * knob.value,
    backgroundColor: count > 1 ? interpolateColor(knob.value * (count - 1), inputs, fills) : fills[0],
  }));
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: span * knob.value }] }));

  return (
    <View style={{ height: knobSize, justifyContent: "center" }}>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: palette.surface, overflow: "hidden" }}>
        {width > 0 ? <Animated.View style={[{ position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: 2 }, fillStyle]} /> : null}
      </View>
      {width > 0 ? (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              backgroundColor: palette.card,
              borderWidth: 1,
              borderColor: withAlpha(palette.text, 0.08),
              shadowColor: "#000000",
              shadowOpacity: 0.08,
              shadowRadius: 2,
              shadowOffset: { width: 0, height: 1 },
            },
            knobStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

type StopProps = {
  position: number;
  count: number;
  knob: SharedValue<number>;
  left: number;
  size: number;
  on: string;
  off: string;
};

function Stop({ position, count, knob, left, size, on, off }: StopProps) {
  const colorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(Math.min(1, Math.max(0, knob.value * (count - 1) - position + 0.5)), [0, 1], [off, on]),
  }));
  return <Animated.View style={[{ position: "absolute", left: left - 1, top: "50%", marginTop: -size / 2, width: 2, height: size, borderRadius: 1 }, colorStyle]} />;
}
