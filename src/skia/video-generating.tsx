import { useEffect, useState, type ReactNode } from "react";
import { type LayoutChangeEvent, Text, View, type DimensionValue, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { withAlpha } from "../internal/color";
import { formatElapsed, useElapsed } from "../internal/use-elapsed";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";
import { MatrixOrb } from "./matrix-orb";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 13, lineHeight: 18, fontWeight: "600" };
const TRACK = 2;
const SEGMENT = 0.28;

export type VideoGeneratingStatus = "queued" | "generating";

export type VideoGeneratingLabels = Record<VideoGeneratingStatus, string>;

export type VideoGeneratingProps = {
  status: VideoGeneratingStatus;
  progress?: number;
  meta?: string;
  startedAt?: number;
  showTimer?: boolean;
  formatTimer?: (seconds: number) => string;
  labels?: Partial<VideoGeneratingLabels>;
  aspectRatio?: number;
  width?: DimensionValue;
  maxHeight?: number;
  radius?: number;
  dots?: number;
  dotColor?: string;
  cover?: ReactNode;
  icon?: ReactNode;
  textStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LABELS: VideoGeneratingLabels = { queued: "Queued", generating: "Generating" };

export function VideoGenerating({
  status,
  progress,
  meta,
  startedAt,
  showTimer = true,
  formatTimer = formatElapsed,
  labels,
  aspectRatio = 16 / 9,
  width = "100%",
  maxHeight = 360,
  radius = 16,
  dots = 14,
  dotColor,
  cover,
  icon,
  textStyle = DEFAULT_TEXT_STYLE,
  colors,
  style,
}: VideoGeneratingProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const copy = { ...DEFAULT_LABELS, ...labels };
  const seconds = useElapsed(startedAt, true);
  const chip = withAlpha(palette.background, 0.72);
  const label = copy[status];
  const percent = progress === undefined ? undefined : Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={percent === undefined ? label : `${label} ${percent}%`}
      accessibilityValue={percent === undefined ? undefined : { min: 0, max: 100, now: percent }}
      style={[
        {
          width,
          aspectRatio,
          maxHeight,
          borderRadius: radius,
          borderCurve: "continuous",
          overflow: "hidden",
          backgroundColor: palette.surface,
        },
        style,
      ]}
    >
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        {cover ?? (
          <MatrixOrb
            cover
            dots={dots}
            color={dotColor ?? palette.accent}
            state={status === "queued" ? "idle" : "thinking"}
          />
        )}
      </View>
      <View style={{ position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: chip }}>
          {icon}
          <PulseLabel key={status} text={label} animate={!reduceMotion} textStyle={[textStyle, { color: palette.text }]} />
          {showTimer && startedAt !== undefined && (
            <Text style={[textStyle, { color: palette.textSecondary, fontVariant: ["tabular-nums"] }]}>{formatTimer(seconds)}</Text>
          )}
        </View>
        <View style={{ flex: 1 }} />
        {percent !== undefined && (
          <View style={{ paddingHorizontal: 10, height: 26, borderRadius: 13, justifyContent: "center", backgroundColor: chip }}>
            <Text style={[textStyle, { color: palette.text, fontVariant: ["tabular-nums"] }]}>{`${percent}%`}</Text>
          </View>
        )}
      </View>
      {meta ? (
        <View style={{ position: "absolute", left: 12, bottom: 14, paddingHorizontal: 10, height: 24, borderRadius: 12, justifyContent: "center", backgroundColor: chip }}>
          <Text style={[textStyle, { color: palette.textSecondary }]}>{meta}</Text>
        </View>
      ) : null}
      <ProgressTrack progress={progress} active={status === "generating"} animate={!reduceMotion} color={palette.accent} track={withAlpha(palette.text, 0.12)} />
    </View>
  );
}

function PulseLabel({ text, animate, textStyle }: { text: string; animate: boolean; textStyle: StyleProp<TextStyle> }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!animate) return;
    const curve = Easing.inOut(Easing.ease);
    opacity.value = withRepeat(
      withSequence(withTiming(0.45, { duration: 800, easing: curve }), withTiming(1, { duration: 800, easing: curve })),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [animate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View entering={animate ? FadeIn.duration(240) : undefined} exiting={animate ? FadeOut.duration(160) : undefined}>
      <Animated.Text style={[textStyle, animatedStyle]}>{text}</Animated.Text>
    </Animated.View>
  );
}

type ProgressTrackProps = { progress?: number; active: boolean; animate: boolean; color: string; track: string };

function ProgressTrack({ progress, active, animate, color, track }: ProgressTrackProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fill = useSharedValue(progress ?? 0);
  const sweep = useSharedValue(0);
  const determinate = progress !== undefined;

  useEffect(() => {
    if (!determinate) return;
    const target = Math.min(1, Math.max(0, progress ?? 0));
    fill.value = animate ? withTiming(target, { duration: 420, easing: Easing.out(Easing.cubic) }) : target;
  }, [animate, determinate, fill, progress]);

  useEffect(() => {
    if (determinate || !active || !animate) {
      cancelAnimation(sweep);
      return;
    }
    sweep.value = 0;
    sweep.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.cubic) }), -1, false);
    return () => cancelAnimation(sweep);
  }, [active, animate, determinate, sweep]);

  const fillStyle = useAnimatedStyle(() => {
    if (determinate) return { width: trackWidth * fill.value, transform: [{ translateX: 0 }] };
    const segment = trackWidth * SEGMENT;
    return { width: segment, transform: [{ translateX: -segment + sweep.value * (trackWidth + segment) }] };
  });

  const handleLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

  if (!active && !determinate) return null;

  return (
    <View onLayout={handleLayout} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: TRACK, backgroundColor: track, overflow: "hidden" }}>
      <Animated.View style={[{ height: TRACK, backgroundColor: color, borderRadius: TRACK / 2 }, fillStyle]} />
    </View>
  );
}
