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
import { type ReactNode } from "react";
import { Text, View, type DimensionValue, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type SharedValue, useDerivedValue, useReducedMotion, useSharedValue } from "react-native-reanimated";
import { withAlpha } from "../internal/color";
import { formatElapsed, useElapsed } from "../internal/use-elapsed";
import { ShimmerText } from "../text/shimmer-text";
import { moodstoneSwatches, type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };
const DEFAULT_BLOBS = [moodstoneSwatches.lilac, moodstoneSwatches.sky, moodstoneSwatches.blossom];
const SWEEP_MS = 1400;
const BAND = 0.6;

const ORBITS = [
  { x: 0.3, y: 0.35, rx: 0.22, ry: 0.18, speed: 0.00042, phase: 0 },
  { x: 0.68, y: 0.6, rx: 0.2, ry: 0.24, speed: -0.00035, phase: 2.1 },
  { x: 0.45, y: 0.75, rx: 0.26, ry: 0.14, speed: 0.00028, phase: 4.2 },
];

export type ImageGeneratingProps = {
  label?: string;
  startedAt?: number;
  showTimer?: boolean;
  formatTimer?: (seconds: number) => string;
  aspectRatio?: number;
  width?: DimensionValue;
  maxHeight?: number;
  radius?: number;
  blobColors?: string[];
  grain?: boolean;
  sweep?: boolean;
  icon?: ReactNode;
  header?: boolean;
  textStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function ImageGenerating({
  label = "Creating image",
  startedAt,
  showTimer = true,
  formatTimer = formatElapsed,
  aspectRatio = 1,
  width = "88%",
  maxHeight = 360,
  radius = 16,
  blobColors = DEFAULT_BLOBS,
  grain = true,
  sweep = true,
  icon,
  header = true,
  textStyle = DEFAULT_TEXT_STYLE,
  colors,
  style,
}: ImageGeneratingProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const seconds = useElapsed(startedAt, true);
  const size = useSharedValue({ width: 0, height: 0 });
  const clock = useClock();
  const time = useDerivedValue(() => (reduceMotion ? 0 : clock.value), [reduceMotion]);
  const canvasWidth = useDerivedValue(() => size.value.width);
  const canvasHeight = useDerivedValue(() => size.value.height);

  return (
    <View style={[{ width, gap: 10 }, style]} accessible accessibilityRole="progressbar" accessibilityLabel={label}>
      {header && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon}
          {reduceMotion ? (
            <Text style={[textStyle, { color: palette.textSecondary }]}>{label}</Text>
          ) : (
            <ShimmerText text={label} activeColor={palette.text} mutedColor={palette.textTertiary} textStyle={textStyle} />
          )}
          {showTimer && startedAt !== undefined && (
            <Text style={[textStyle, { color: palette.textTertiary, fontVariant: ["tabular-nums"] }]}>
              {formatTimer(seconds)}
            </Text>
          )}
        </View>
      )}
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
        <Canvas onSize={size} style={{ flex: 1 }}>
          <Group layer={<Paint><Blur blur={36} /></Paint>}>
            {blobColors.slice(0, ORBITS.length).map((color, index) => (
              <Blob key={index} index={index} color={withAlpha(color, 0.55)} size={size} time={time} />
            ))}
          </Group>
          {grain && (
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} opacity={0.07}>
              <FractalNoise freqX={0.9} freqY={0.9} octaves={3} />
            </Rect>
          )}
          {sweep && !reduceMotion && <SweepBand size={size} time={time} color={palette.text} />}
        </Canvas>
      </View>
    </View>
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
      <LinearGradient
        start={start}
        end={end}
        colors={[withAlpha(color, 0), withAlpha(color, 0.1), withAlpha(color, 0)]}
      />
    </Rect>
  );
}
