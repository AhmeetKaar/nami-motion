import { Canvas, LinearGradient, Path, Skia, vec } from "@shopify/react-native-skia";
import { useState } from "react";
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { type SharedValue, useDerivedValue, useFrameCallback, useReducedMotion, useSharedValue } from "react-native-reanimated";
import { useMotionClock } from "../internal/use-motion-clock";
import { moodstoneSwatches } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_HEIGHT = 32;
const SAMPLE_STEP = 2;
const MIN_AMPLITUDE = 1.5;
const EDGE_PADDING = 2;
const HISTORY = 96;
const PUSH_MS = 70;

type WaveLayer = {
  frequency: number;
  speed: number;
  phase: number;
  amplitude: number;
  strokeWidth: number;
  opacity: number;
};

const LAYERS: WaveLayer[] = [
  { frequency: 1.1, speed: 0.0024, phase: 2.6, amplitude: 0.55, strokeWidth: 1.5, opacity: 0.45 },
  { frequency: 2.3, speed: -0.0031, phase: 1.4, amplitude: 0.75, strokeWidth: 1.5, opacity: 0.6 },
  { frequency: 1.6, speed: 0.0042, phase: 0, amplitude: 1, strokeWidth: 2, opacity: 1 },
];

export type VoiceWaveVariant = "lines" | "bars" | "dots" | "pulse";

export type VoiceWaveProps = {
  level: SharedValue<number>;
  colors?: [string, string, string];
  variant?: VoiceWaveVariant;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

type LayerProps = {
  layer: WaveLayer;
  width: number;
  height: number;
  level: SharedValue<number>;
  clock: SharedValue<number>;
  color: string;
};

function WaveLayerPath({ layer, width, height, level, clock, color }: LayerProps) {
  const path = useDerivedValue(() => {
    const middle = height / 2;
    const reach = middle - EDGE_PADDING;
    const amplitude = (MIN_AMPLITUDE + level.value * (reach - MIN_AMPLITUDE)) * layer.amplitude;
    const offset = clock.value * layer.speed + layer.phase;
    const next = Skia.Path.Make();
    for (let x = 0; x <= width; x += SAMPLE_STEP) {
      const progress = x / width;
      const envelope = Math.sin(Math.PI * progress);
      const y = middle + amplitude * envelope * Math.sin(2 * Math.PI * layer.frequency * progress + offset);
      if (x === 0) next.moveTo(x, y);
      else next.lineTo(x, y);
    }
    return next;
  });

  return <Path path={path} style="stroke" strokeWidth={layer.strokeWidth} strokeCap="round" strokeJoin="round" color={color} opacity={layer.opacity} />;
}

function Lines({ width, height, level, clock, colors }: Omit<LayerProps, "layer" | "color"> & { colors: string[] }) {
  return (
    <>
      {LAYERS.map((layer, index) => (
        <WaveLayerPath key={index} layer={layer} width={width} height={height} level={level} clock={clock} color={colors[index]} />
      ))}
    </>
  );
}

type FieldProps = { width: number; height: number; level: SharedValue<number>; clock: SharedValue<number>; colors: string[]; still: boolean };

function Bars({ width, height, level, colors, still }: FieldProps) {
  const history = useSharedValue<number[]>(new Array(HISTORY).fill(0));
  const last = useSharedValue(0);
  const smooth = useSharedValue(0);

  useFrameCallback((info) => {
    smooth.value += (level.value - smooth.value) * 0.35;
    if (info.timestamp - last.value < PUSH_MS) return;
    last.value = info.timestamp;
    const next = history.value.slice(1);
    next.push(smooth.value);
    history.value = next;
  }, !still);

  const path = useDerivedValue(() => {
    const bar = 3;
    const gap = 3;
    const count = Math.min(HISTORY, Math.floor((width + gap) / (bar + gap)));
    const middle = height / 2;
    const samples = still ? new Array(HISTORY).fill(level.value) : history.value;
    const next = Skia.Path.Make();
    for (let index = 0; index < count; index += 1) {
      const sample = samples[HISTORY - count + index] ?? 0;
      const h = Math.max(bar, sample * (height - 4));
      const x = width - (count - index) * (bar + gap) + gap;
      next.addRRect(Skia.RRectXY(Skia.XYWHRect(x, middle - h / 2, bar, h), bar / 2, bar / 2));
    }
    return next;
  });

  return (
    <Path path={path}>
      <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={[colors[0], colors[1], colors[2]]} />
    </Path>
  );
}

function Dots({ width, height, level, clock, colors }: FieldProps) {
  const path = useDerivedValue(() => {
    const spacing = 11;
    const count = Math.max(3, Math.floor(width / spacing));
    const start = (width - (count - 1) * spacing) / 2;
    const middle = height / 2;
    const reach = middle - 4;
    const t = clock.value * 0.006;
    const next = Skia.Path.Make();
    for (let index = 0; index < count; index += 1) {
      const progress = index / (count - 1);
      const envelope = Math.sin(Math.PI * progress);
      const wave = Math.sin(t + index * 0.55) * Math.sin(t * 0.43 + index * 0.21);
      const y = middle + wave * reach * envelope * (0.15 + level.value * 0.85);
      const r = 1.6 + Math.abs(wave) * level.value * 1.8 * envelope;
      next.addCircle(start + index * spacing, y, r);
    }
    return next;
  });

  return (
    <Path path={path}>
      <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={[colors[0], colors[1], colors[2]]} />
    </Path>
  );
}

function Pulse({ width, height, level, clock, colors }: FieldProps) {
  const path = useDerivedValue(() => {
    const middle = height / 2;
    const reach = middle - 3;
    const t = clock.value * 0.004;
    const next = Skia.Path.Make();
    for (let x = 0; x <= width; x += 2) {
      const progress = x / width;
      const envelope = Math.pow(Math.sin(Math.PI * progress), 1.5);
      const carrier = Math.sin(x * 0.21 - t * 5.2);
      const burst = Math.pow(Math.abs(Math.sin(x * 0.027 + t * 1.7)), 3);
      const y = middle + carrier * burst * envelope * reach * (0.08 + level.value * 0.92);
      if (x === 0) next.moveTo(x, y);
      else next.lineTo(x, y);
    }
    return next;
  });

  return (
    <>
      <Path path={path} style="stroke" strokeWidth={5} strokeCap="round" strokeJoin="round" color={colors[1]} opacity={0.18} />
      <Path path={path} style="stroke" strokeWidth={1.8} strokeCap="round" strokeJoin="round">
        <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={[colors[0], colors[2], colors[0]]} />
      </Path>
    </>
  );
}

export function VoiceWave({ level, colors: colorsProp, variant = "lines", height = DEFAULT_HEIGHT, style }: VoiceWaveProps) {
  const palette = useMotionPalette();
  const colors = colorsProp ?? [palette.accent, moodstoneSwatches.sky, moodstoneSwatches.mint];
  const [width, setWidth] = useState(0);
  const reduceMotion = useReducedMotion();
  const ticking = useMotionClock(!reduceMotion);
  const clock = useDerivedValue(() => (reduceMotion ? 1200 : ticking.value), [reduceMotion]);

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const props = { width, height, level, clock, colors, still: reduceMotion };

  return (
    <View style={[{ flex: 1, height }, style]} onLayout={handleLayout}>
      {width > 0 ? (
        <Canvas style={{ width, height }}>
          {variant === "bars" ? (
            <Bars {...props} />
          ) : variant === "dots" ? (
            <Dots {...props} />
          ) : variant === "pulse" ? (
            <Pulse {...props} />
          ) : (
            <Lines width={width} height={height} level={level} clock={clock} colors={colors} />
          )}
        </Canvas>
      ) : null}
    </View>
  );
}

export type VoiceWaveStyleProps = Omit<VoiceWaveProps, "variant">;

export function VoiceWaveLines(props: VoiceWaveStyleProps) {
  return <VoiceWave {...props} variant="lines" />;
}

export function VoiceWaveBars(props: VoiceWaveStyleProps) {
  return <VoiceWave {...props} variant="bars" />;
}

export function VoiceWaveDots(props: VoiceWaveStyleProps) {
  return <VoiceWave {...props} variant="dots" />;
}

export function VoiceWavePulse(props: VoiceWaveStyleProps) {
  return <VoiceWave {...props} variant="pulse" />;
}
