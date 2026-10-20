import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { PixelRatio, StyleSheet } from "react-native";
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

export type MatrixOrbState = "idle" | "listening" | "thinking";

const STATES: MatrixOrbState[] = ["idle", "listening", "thinking"];
const STATE_SCALE = [0.88, 1, 0.92];

const STIFFNESS = 180;
const DAMPING = 26;
const ATTACK = 0.22;
const RELEASE = 0.08;
const BLEND = 0.16;
const FRAME_RATE = 60;
const MAX_DELTA = 0.05;

const MIN_DOTS = 3;
const DEFAULT_DOTS = 11;
const DEFAULT_SIZE = 240;

const ORB_SPAN = 0.74;
const ORB_DOT = 0.6;
const ORB_BLOOM = 1.7;
const ORB_CUTOFF = 1.12;
const ORB_REACH = 1;

const COVER_DOT = 0.42;
const COVER_BLOOM = 0.55;
const COVER_CUTOFF = 2.0;
const COVER_MARGIN = 0.85;
const COVER_REACH = 0.7;

const MATRIX_ORB = Skia.RuntimeEffect.Make(`
uniform float2 resolution;
uniform float2 counts;
uniform float spacing;
uniform float dotScale;
uniform float bloom;
uniform float cutoff;
uniform float reach;
uniform float time;
uniform float amplitude;
uniform float scale;
uniform float3 weights;
uniform float feather;
uniform float4 tint;

float orbiter(float2 n, float radius, float speed, float phase, float spread) {
  float angle = time * speed + phase;
  float2 delta = n - float2(cos(angle), sin(angle)) * radius;
  return exp(-dot(delta, delta) / (spread * spread));
}

float idleIntensity(float d) {
  return 0.62 + 0.12 * sin(time * 1.05 - d * 2.4);
}

float listeningIntensity(float d) {
  float ripple = 0.5 + 0.5 * sin(d * 4.2 - time * 3.0);
  return 0.32 + amplitude * (0.34 + 0.38 * ripple);
}

float thinkingIntensity(float2 n) {
  float heat = orbiter(n, 0.62, 2.2, 0.0, 0.42)
    + orbiter(n, 0.4, -1.7, 2.1, 0.36)
    + orbiter(n, 0.8, 1.15, 4.0, 0.34);
  return 0.26 + 0.8 * min(1.0, heat);
}

half4 main(float2 xy) {
  float2 span = (counts - 1.0) * 0.5;
  float maxRadius = spacing * dotScale;
  float2 center = resolution * 0.5;
  float stride = spacing * scale;
  float2 origin = floor((xy - center) / stride + span + 0.5);

  float cover = 0.0;

  for (int iy = 0; iy < 3; iy++) {
    for (int ix = 0; ix < 3; ix++) {
      float2 cell = origin + float2(float(ix) - 1.0, float(iy) - 1.0);
      float2 edge = min(cell, counts - 1.0 - cell);

      if (min(edge.x, edge.y) >= 0.0) {
        float2 n = (cell - span) / span;
        float d = length(n);

        if (d <= cutoff) {
          float blended = weights.x * idleIntensity(d)
            + weights.y * listeningIntensity(d)
            + weights.z * thinkingIntensity(n / reach);
          float intensity = clamp(blended, 0.0, 1.0);
          float radius = maxRadius * exp(-d * d * bloom) * intensity * scale;

          if (radius >= feather) {
            float dist = length(xy - (center + (cell - span) * stride));
            cover = max(
              cover,
              1.0 - smoothstep(radius - feather, radius + feather, dist)
            );
          }
        }
      }
    }
  }

  float alpha = cover * tint.a;
  return half4(half3(tint.rgb) * half(alpha), half(alpha));
}
`);

type Motion = {
  stamp: number;
  time: number;
  amplitude: number;
  scale: number;
  velocity: number;
  weights: number[];
};

type Field = {
  counts: number[];
  spacing: number;
  dotScale: number;
  bloom: number;
  cutoff: number;
  reach: number;
};

function stateIndex(state: MatrixOrbState) {
  return Math.max(STATES.indexOf(state), 0);
}

function oneHot(index: number) {
  return STATES.map((_, position) => (position === index ? 1 : 0));
}

function envelope(time: number) {
  "worklet";
  const slow = 0.5 + 0.5 * Math.sin(time * 0.62 + 0.4);
  const fast = 0.5 + 0.5 * Math.sin(time * 1.9 + 1.1);
  return 0.22 + 0.78 * (0.45 + 0.55 * slow) * fast;
}

function levelAt(level: number | undefined, time: number) {
  "worklet";
  if (level === undefined || !Number.isFinite(level)) {
    return envelope(time);
  }

  return Math.min(1, Math.max(0, level));
}

function orbField(size: number, dots: number): Field {
  "worklet";
  return {
    counts: [dots, dots],
    spacing: (size * ORB_SPAN) / (dots - 1),
    dotScale: ORB_DOT,
    bloom: ORB_BLOOM,
    cutoff: ORB_CUTOFF,
    reach: ORB_REACH,
  };
}

function coverField(width: number, height: number, dots: number): Field {
  "worklet";
  const spacing = Math.min(width, height) / (dots - 1);
  const across = Math.ceil(width / (spacing * COVER_MARGIN)) + 1;
  const down = Math.ceil(height / (spacing * COVER_MARGIN)) + 1;

  return {
    counts: [Math.max(across, MIN_DOTS), Math.max(down, MIN_DOTS)],
    spacing,
    dotScale: COVER_DOT,
    bloom: COVER_BLOOM,
    cutoff: COVER_CUTOFF,
    reach: COVER_REACH,
  };
}

export type MatrixOrbProps = {
  state?: MatrixOrbState;
  level?: number;
  size?: number;
  cover?: boolean;
  color?: string;
  stateColors?: Partial<Record<MatrixOrbState, string>>;
  dots?: number;
  colors?: Partial<MotionPalette>;
};

export function MatrixOrb({
  state = "idle",
  level,
  size = DEFAULT_SIZE,
  cover = false,
  color: colorProp,
  stateColors,
  dots = DEFAULT_DOTS,
  colors,
}: MatrixOrbProps) {
  const palette = useMotionPalette(colors);
  const color = colorProp ?? palette.text;
  const reduceMotion = useReducedMotion();

  const grid = Math.max(MIN_DOTS, Math.round(dots));
  const feather = 0.5 / PixelRatio.get();
  const tints = useMemo(
    () => STATES.map((name) => Array.from(Skia.Color(stateColors?.[name] ?? color))),
    [color, stateColors],
  );

  const layout = useSharedValue(
    cover ? { width: 0, height: 0 } : { width: size, height: size },
  );
  const target = useSharedValue(stateIndex(state));
  const requested = useSharedValue(level);
  const motion = useSharedValue<Motion>({
    stamp: 0,
    time: 0,
    amplitude: 0,
    scale: STATE_SCALE[stateIndex(state)],
    velocity: 0,
    weights: oneHot(stateIndex(state)),
  });

  useEffect(() => {
    const index = stateIndex(state);
    target.value = index;
    requested.value = level;

    if (reduceMotion) {
      motion.value = {
        stamp: 0,
        time: 0,
        amplitude: levelAt(level, 0),
        scale: STATE_SCALE[index],
        velocity: 0,
        weights: oneHot(index),
      };
    }
  }, [level, motion, reduceMotion, requested, state, target]);

  useFrameCallback((info) => {
    const current = target.value;
    const previous = motion.value;
    const elapsed = previous.stamp === 0 ? 0 : info.timestamp - previous.stamp;
    const delta = Math.min(elapsed / 1000, MAX_DELTA);

    if (delta <= 0) {
      motion.value = { ...previous, stamp: info.timestamp };
      return;
    }

    const time = previous.time + delta;

    const desired = levelAt(requested.value, time);
    const rate = desired > previous.amplitude ? ATTACK : RELEASE;
    const amplitude =
      previous.amplitude +
      (desired - previous.amplitude) *
        (1 - Math.pow(1 - rate, delta * FRAME_RATE));

    const step = 1 - Math.pow(1 - BLEND, delta * FRAME_RATE);
    const weights = previous.weights.map(
      (weight, index) => weight + ((index === current ? 1 : 0) - weight) * step,
    );

    const velocity =
      previous.velocity +
      (-STIFFNESS * (previous.scale - STATE_SCALE[current]) -
        DAMPING * previous.velocity) *
        delta;

    motion.value = {
      stamp: info.timestamp,
      time,
      amplitude,
      scale: previous.scale + velocity * delta,
      velocity,
      weights,
    };
  }, !reduceMotion);

  const uniforms = useDerivedValue(() => {
    const width = Math.max(layout.value.width, 1);
    const height = Math.max(layout.value.height, 1);
    const field = cover
      ? coverField(width, height, grid)
      : orbField(Math.min(width, height), grid);

    return {
      resolution: [width, height],
      counts: field.counts,
      spacing: field.spacing,
      dotScale: field.dotScale,
      bloom: field.bloom,
      cutoff: field.cutoff,
      reach: field.reach,
      time: motion.value.time,
      amplitude: motion.value.amplitude,
      scale: motion.value.scale,
      weights: motion.value.weights,
      feather,
      tint: [0, 1, 2, 3].map((channel) =>
        tints.reduce((sum, value, index) => sum + value[channel] * (motion.value.weights[index] ?? 0), 0) /
        Math.max(motion.value.weights.reduce((sum, weight) => sum + weight, 0), 0.0001),
      ),
    };
  });

  if (!MATRIX_ORB) {
    return null;
  }

  return (
    <Canvas
      onSize={layout}
      style={cover ? styles.cover : { width: size, height: size }}
    >
      <Fill>
        <Shader source={MATRIX_ORB} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  cover: {
    flex: 1,
  },
});
