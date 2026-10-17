import {
  Blur,
  Canvas,
  Circle,
  FractalNoise,
  Group,
  LinearGradient,
  Paint,
  Rect,
  useClock,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useState, type ReactNode } from "react";
import {
  type DimensionValue,
  type LayoutChangeEvent,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { withAlpha } from "../internal/color";
import { formatElapsed, useElapsed } from "../internal/use-elapsed";
import { ShimmerText } from "../text/shimmer-text";
import { moodstoneSwatches, type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";
import { DotOrb, type DotOrbVariant } from "./dot-orb";
import { MatrixOrb } from "./matrix-orb";

const HEADER_TEXT: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };
const CHIP_TEXT: TextStyle = { fontSize: 13, lineHeight: 18, fontWeight: "600" };
const DEFAULT_BLOBS = [moodstoneSwatches.lilac, moodstoneSwatches.sky, moodstoneSwatches.blossom];
const SWEEP_MS = 1400;
const BAND = 0.6;
const TRACK = 2;
const SEGMENT = 0.28;
const ORBITS = [
  { x: 0.3, y: 0.35, rx: 0.22, ry: 0.18, speed: 0.00042, phase: 0 },
  { x: 0.68, y: 0.6, rx: 0.2, ry: 0.24, speed: -0.00035, phase: 2.1 },
  { x: 0.45, y: 0.75, rx: 0.26, ry: 0.14, speed: 0.00028, phase: 4.2 },
];

export type MediaGeneratingVariant = "blobs" | "matrix" | DotOrbVariant;

export type MediaGeneratingStatus = "queued" | "generating";

export type MediaGeneratingLabels = Record<MediaGeneratingStatus, string>;

export type MediaGeneratingChrome = "header" | "overlay" | "none";

export type MediaGeneratingProps = {
  variant?: MediaGeneratingVariant;
  chrome?: MediaGeneratingChrome;
  label?: string;
  status?: MediaGeneratingStatus;
  labels?: Partial<MediaGeneratingLabels>;
  progress?: number;
  meta?: string;
  startedAt?: number;
  showTimer?: boolean;
  formatTimer?: (seconds: number) => string;
  aspectRatio?: number;
  width?: DimensionValue;
  maxHeight?: number;
  radius?: number;
  dotColor?: string;
  accentColor?: string;
  blobColors?: string[];
  grain?: boolean;
  sweep?: boolean;
  dots?: number;
  cover?: ReactNode;
  icon?: ReactNode;
  textStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LABELS: MediaGeneratingLabels = { queued: "Queued", generating: "Generating" };

export function MediaGenerating({
  variant = "blobs",
  chrome = "header",
  label,
  status,
  labels,
  progress,
  meta,
  startedAt,
  showTimer = true,
  formatTimer = formatElapsed,
  aspectRatio = 1,
  width = "100%",
  maxHeight = 360,
  radius = 16,
  dotColor,
  accentColor,
  blobColors = DEFAULT_BLOBS,
  grain = true,
  sweep,
  dots = 14,
  cover,
  icon,
  textStyle,
  colors,
  style,
}: MediaGeneratingProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const seconds = useElapsed(startedAt, true);
  const copy = { ...DEFAULT_LABELS, ...labels };
  const title = status ? copy[status] : (label ?? copy.generating);
  const headline = chrome === "header" && label && status ? label : title;
  const percent = progress === undefined ? undefined : Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const chip = withAlpha(palette.background, 0.72);
  const showSweep = sweep ?? variant === "blobs";
  const timer = showTimer && startedAt !== undefined ? formatTimer(seconds) : null;

  const field = cover ?? (
    variant === "blobs" ? (
      <BlobField colors={blobColors} grain={grain} sweep={showSweep && !reduceMotion} sweepColor={palette.text} still={reduceMotion} />
    ) : variant === "matrix" ? (
      <MatrixOrb cover dots={dots} color={dotColor ?? palette.accent} state={status === "queued" ? "idle" : "thinking"} />
    ) : (
      <View style={{ flex: 1, padding: "9%" }}>
        <DotOrb variant={variant} color={dotColor ?? palette.text} accent={accentColor ?? palette.accent} />
      </View>
    )
  );

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={percent === undefined ? headline : `${headline} ${percent}%`}
      accessibilityValue={percent === undefined ? undefined : { min: 0, max: 100, now: percent }}
      style={[{ width, gap: 10 }, style]}
    >
      {chrome === "header" ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          {reduceMotion ? (
            <Text style={[HEADER_TEXT, textStyle, { color: palette.textSecondary }]}>{headline}</Text>
          ) : (
            <ShimmerText text={headline} activeColor={palette.text} mutedColor={palette.textTertiary} textStyle={[HEADER_TEXT, textStyle]} />
          )}
          {timer ? <Text style={[HEADER_TEXT, textStyle, { color: palette.textTertiary, fontVariant: ["tabular-nums"] }]}>{timer}</Text> : null}
        </View>
      ) : null}
      <View
        style={{
          aspectRatio,
          maxHeight,
          borderRadius: radius,
          borderCurve: "continuous",
          overflow: "hidden",
          backgroundColor: palette.surface,
        }}
      >
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>{field}</View>
        {chrome === "overlay" ? (
          <View style={{ position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: chip }}>
              {icon}
              <PulseLabel key={title} text={title} animate={!reduceMotion} textStyle={[CHIP_TEXT, textStyle, { color: palette.text }]} />
              {timer ? <Text style={[CHIP_TEXT, textStyle, { color: palette.textSecondary, fontVariant: ["tabular-nums"] }]}>{timer}</Text> : null}
            </View>
            <View style={{ flex: 1 }} />
            {percent !== undefined ? (
              <View style={{ paddingHorizontal: 10, height: 26, borderRadius: 13, justifyContent: "center", backgroundColor: chip }}>
                <Text style={[CHIP_TEXT, textStyle, { color: palette.text, fontVariant: ["tabular-nums"] }]}>{`${percent}%`}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
        {meta ? (
          <View style={{ position: "absolute", left: 12, bottom: 14, paddingHorizontal: 10, height: 24, borderRadius: 12, justifyContent: "center", backgroundColor: chip }}>
            <Text style={[CHIP_TEXT, textStyle, { color: palette.textSecondary }]}>{meta}</Text>
          </View>
        ) : null}
        <ProgressTrack
          progress={progress}
          active={status === "generating" || (chrome === "overlay" && status === undefined)}
          animate={!reduceMotion}
          color={palette.accent}
          track={withAlpha(palette.text, 0.12)}
        />
      </View>
    </View>
  );
}

export type ImageGeneratingProps = Omit<MediaGeneratingProps, "chrome"> & { header?: boolean };

export function ImageGenerating({ header = true, label = "Creating image", width = "88%", ...props }: ImageGeneratingProps) {
  return <MediaGenerating chrome={header ? "header" : "none"} label={label} width={width} {...props} />;
}

export type VideoGeneratingProps = Omit<MediaGeneratingProps, "status"> & { status: MediaGeneratingStatus };

export function VideoGenerating({ variant = "matrix", chrome = "overlay", aspectRatio = 16 / 9, ...props }: VideoGeneratingProps) {
  return <MediaGenerating variant={variant} chrome={chrome} aspectRatio={aspectRatio} {...props} />;
}

type BlobFieldProps = { colors: string[]; grain: boolean; sweep: boolean; sweepColor: string; still: boolean };

function BlobField({ colors, grain, sweep, sweepColor, still }: BlobFieldProps) {
  const size = useSharedValue({ width: 0, height: 0 });
  const clock = useClock();
  const time = useDerivedValue(() => (still ? 0 : clock.value), [still]);
  const canvasWidth = useDerivedValue(() => size.value.width);
  const canvasHeight = useDerivedValue(() => size.value.height);
  return (
    <Canvas onSize={size} style={{ flex: 1 }}>
      <Group
        layer={
          <Paint>
            <Blur blur={36} />
          </Paint>
        }
      >
        {colors.slice(0, ORBITS.length).map((color, index) => (
          <Blob key={index} index={index} color={withAlpha(color, 0.55)} size={size} time={time} />
        ))}
      </Group>
      {grain ? (
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} opacity={0.07}>
          <FractalNoise freqX={0.9} freqY={0.9} octaves={3} />
        </Rect>
      ) : null}
      {sweep ? <SweepBand size={size} time={time} color={sweepColor} /> : null}
    </Canvas>
  );
}

type SizeValue = SharedValue<{ width: number; height: number }>;

function Blob({ index, color, size, time }: { index: number; color: string; size: SizeValue; time: SharedValue<number> }) {
  const orbit = ORBITS[index];
  const cx = useDerivedValue(() => size.value.width * (orbit.x + orbit.rx * Math.sin(time.value * orbit.speed + orbit.phase)));
  const cy = useDerivedValue(() => size.value.height * (orbit.y + orbit.ry * Math.cos(time.value * orbit.speed * 1.3 + orbit.phase)));
  const r = useDerivedValue(() => Math.min(size.value.width, size.value.height) * (0.34 + 0.04 * Math.sin(time.value * 0.0009 + orbit.phase)));
  return <Circle cx={cx} cy={cy} r={r} color={color} />;
}

function SweepBand({ size, time, color }: { size: SizeValue; time: SharedValue<number>; color: string }) {
  const start = useDerivedValue(() => {
    const progress = (time.value % SWEEP_MS) / SWEEP_MS;
    const w = size.value.width;
    return vec(-w * BAND + progress * w * (1 + BAND), 0);
  });
  const end = useDerivedValue(() => vec(start.value.x + size.value.width * BAND, 0));
  const w = useDerivedValue(() => size.value.width);
  const h = useDerivedValue(() => size.value.height);
  return (
    <Rect x={0} y={0} width={w} height={h}>
      <LinearGradient start={start} end={end} colors={[withAlpha(color, 0), withAlpha(color, 0.1), withAlpha(color, 0)]} />
    </Rect>
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
