import { Canvas, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import { Easing, useDerivedValue, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useMotionClock } from "../internal/use-motion-clock";
import { useMotionPalette } from "../theme/provider";

export type DotOrbVariant = "orbit" | "scan" | "constellation" | "helix";

export type DotOrbProps = {
  variant?: DotOrbVariant;
  size?: number;
  color?: string;
  accent?: string;
  speed?: number;
  dotScale?: number;
  paused?: boolean;
  inset?: number;
  scatter?: boolean | "loop";
  style?: StyleProp<ViewStyle>;
};

type Frame = { back: SkPath; mid: SkPath; front: SkPath; accent: SkPath; lines: SkPath; linesOpacity: number };

const TAU = Math.PI * 2;
const STILL_TIME = 1800;
const SCATTER_MS = 700;
const LOOP_MOVE_MS = 900;
const LOOP_GATHERED_MS = 1100;
const LOOP_SCATTERED_MS = 400;

function fibonacciSphere(count: number) {
  const points: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * index;
    points.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
  }
  return points;
}

function buildEdges(points: number[], limit: number) {
  const edges: number[] = [];
  const count = points.length / 3;
  for (let a = 0; a < count; a += 1) {
    for (let b = a + 1; b < count; b += 1) {
      const dx = points[a * 3] - points[b * 3];
      const dy = points[a * 3 + 1] - points[b * 3 + 1];
      const dz = points[a * 3 + 2] - points[b * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < limit * limit) edges.push(a, b);
    }
  }
  const order: number[] = [];
  const pairs = edges.length / 2;
  for (let index = 0; index < pairs; index += 1) order.push(index);
  for (let index = pairs - 1; index > 0; index -= 1) {
    const swap = Math.floor((Math.sin(index * 12.9898) * 43758.5453 - Math.floor(Math.sin(index * 12.9898) * 43758.5453)) * (index + 1));
    const temp = order[index];
    order[index] = order[swap];
    order[swap] = temp;
  }
  const shuffled: number[] = [];
  order.forEach((pair) => shuffled.push(edges[pair * 2], edges[pair * 2 + 1]));
  return shuffled;
}

function project(x: number, y: number, z: number, spin: number, tilt: number) {
  "worklet";
  const x1 = x * Math.cos(spin) + z * Math.sin(spin);
  const z1 = -x * Math.sin(spin) + z * Math.cos(spin);
  const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
  return [x1, y2, z2];
}

function smooth(value: number) {
  "worklet";
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

export function DotOrb({
  variant = "orbit",
  size,
  color,
  accent,
  speed = 1,
  dotScale = 1,
  paused = false,
  inset = 0,
  scatter = false,
  style,
}: DotOrbProps) {
  const palette = useMotionPalette();
  const reduceMotion = useReducedMotion();
  const ink = color ?? palette.text;
  const highlight = accent ?? palette.accent;
  const still = reduceMotion || paused;
  const clock = useMotionClock(!still);
  const layout = useSharedValue({ width: size ?? 0, height: size ?? 0 });
  const spread = useSharedValue(scatter === true ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      spread.value = scatter === true ? 1 : 0;
    } else if (scatter === "loop") {
      const move = { duration: LOOP_MOVE_MS, easing: Easing.inOut(Easing.cubic) };
      spread.value = withRepeat(withSequence(withDelay(LOOP_GATHERED_MS, withTiming(1, move)), withDelay(LOOP_SCATTERED_MS, withTiming(0, move))), -1);
    } else {
      spread.value = withTiming(scatter ? 1 : 0, { duration: SCATTER_MS, easing: Easing.out(Easing.cubic) });
    }
  }, [reduceMotion, scatter, spread]);

  const sphere = useMemo(() => fibonacciSphere(variant === "constellation" ? 46 : 240), [variant]);
  const edges = useMemo(() => (variant === "constellation" ? buildEdges(sphere, 0.6) : []), [sphere, variant]);

  const frame = useDerivedValue<Frame>(() => {
    const t = (reduceMotion ? STILL_TIME : clock.value) * 0.001 * speed;
    const width = layout.value.width;
    const height = layout.value.height;
    const cx = width / 2;
    const cy = height / 2;
    const pad = inset * width;
    const radius = Math.min(width - pad * 2, height - pad * 2) * 0.4;
    const s = spread.value;
    let order = 0;
    const dot = Math.max(0.6, radius * 0.045 * dotScale);
    const back = Skia.Path.Make();
    const mid = Skia.Path.Make();
    const front = Skia.Path.Make();
    const accentPath = Skia.Path.Make();
    const lines = Skia.Path.Make();
    let linesOpacity = 0;

    const spot = (x: number, y: number) => {
      const px = cx + x * radius;
      const py = cy + y * radius;
      order += 1;
      if (s === 0) return [px, py];
      const hx = Math.sin(order * 12.9898) * 43758.5453;
      const hy = Math.sin(order * 78.233) * 43758.5453;
      const tx = width * (0.06 + 0.88 * (hx - Math.floor(hx)));
      const ty = height * (0.06 + 0.88 * (hy - Math.floor(hy)));
      return [px + (tx - px) * s, py + (ty - py) * s];
    };

    const place = (x: number, y: number, z: number, scale: number) => {
      const depth = (z + 1) / 2;
      const r = dot * scale * (0.45 + 0.55 * depth);
      const target = z < -0.3 ? back : z < 0.35 ? mid : front;
      const at = spot(x, y);
      target.addCircle(at[0], at[1], r);
    };

    if (variant === "orbit") {
      const spin = t * 0.25;
      const orbits = [
        [0.35, 0.0, 0.9],
        [1.15, 0.95, -0.7],
        [-0.75, 2.2, 1.15],
      ];
      for (let o = 0; o < orbits.length; o += 1) {
        const tiltX = orbits[o][0];
        const rotZ = orbits[o][1];
        const rate = orbits[o][2];
        for (let p = 0; p < 13; p += 1) {
          const theta = (p / 13) * TAU + Math.sin(p * 2.3 + o) * 0.25 + t * rate;
          const bx = Math.cos(theta);
          const bz = Math.sin(theta);
          const y1 = -bz * Math.sin(tiltX);
          const z1 = bz * Math.cos(tiltX);
          const x2 = bx * Math.cos(rotZ) - y1 * Math.sin(rotZ);
          const y2 = bx * Math.sin(rotZ) + y1 * Math.cos(rotZ);
          const projected = project(x2, y2, z1, spin, 0.2);
          place(projected[0], projected[1], projected[2], 1.15 + 0.35 * Math.sin(p * 1.7 + o));
        }
      }
      for (let p = 0; p < 7; p += 1) {
        const a = p * 0.9 + t * 0.6;
        place(Math.cos(a) * 0.22, Math.sin(a * 1.3) * 0.22, Math.sin(a) * 0.5, 1.3);
      }
    } else if (variant === "scan") {
      const spin = t * 0.35;
      const sweep = -1.75 + ((t * 0.55) % 1) * 3.5;
      for (let index = 0; index < sphere.length; index += 3) {
        const projected = project(sphere[index], sphere[index + 1], sphere[index + 2], spin, 0.28);
        const longitude = Math.atan2(projected[0], projected[2]);
        const near = Math.abs(longitude - sweep);
        if (projected[2] > 0 && near < 0.2) {
          const at = spot(projected[0], projected[1]);
          accentPath.addCircle(at[0], at[1], dot * 0.95 * (1.25 - near * 2));
        } else {
          place(projected[0], projected[1], projected[2], 0.62);
        }
      }
    } else if (variant === "constellation") {
      const spin = t * 0.22;
      const cycle = (t % 6.5) / 6.5;
      const grow = smooth(cycle / 0.6);
      linesOpacity = (cycle < 0.85 ? 0.42 : 0.42 * (1 - smooth((cycle - 0.85) / 0.15))) * (1 - s);
      const points: number[] = [];
      for (let index = 0; index < sphere.length; index += 3) {
        const projected = project(sphere[index], sphere[index + 1], sphere[index + 2], spin, 0.35);
        points.push(projected[0], projected[1], projected[2]);
        place(projected[0], projected[1], projected[2], 1.05);
      }
      const visible = Math.floor((edges.length / 2) * grow);
      for (let pair = 0; pair < visible; pair += 1) {
        const a = edges[pair * 2] * 3;
        const b = edges[pair * 2 + 1] * 3;
        lines.moveTo(cx + points[a] * radius, cy + points[a + 1] * radius);
        lines.lineTo(cx + points[b] * radius, cy + points[b + 1] * radius);
      }
    } else if (variant === "helix") {
      const spin = t * 0.2;
      for (let strand = 0; strand < 3; strand += 1) {
        for (let step = 0; step < 30; step += 1) {
          const u = step / 29;
          const y = Math.cos(Math.PI * u);
          const ring = Math.sqrt(Math.max(0, 1 - y * y));
          const longitude = (strand * TAU) / 3 + u * Math.PI * 2.4 + t * 1.1;
          const projected = project(ring * Math.cos(longitude), y, ring * Math.sin(longitude), spin, 0.25);
          place(projected[0], projected[1], projected[2], 0.85 + 0.6 * Math.sin(Math.PI * u));
        }
      }
    }

    return { back, mid, front, accent: accentPath, lines, linesOpacity };
  });

  const back = useDerivedValue(() => frame.value.back);
  const mid = useDerivedValue(() => frame.value.mid);
  const front = useDerivedValue(() => frame.value.front);
  const accentLayer = useDerivedValue(() => frame.value.accent);
  const lines = useDerivedValue(() => frame.value.lines);
  const linesOpacity = useDerivedValue(() => frame.value.linesOpacity);

  return (
    <Canvas onSize={layout} style={[size !== undefined ? { width: size, height: size } : { flex: 1, alignSelf: "stretch" }, style]}>
      {variant === "constellation" ? <Path path={lines} style="stroke" strokeWidth={1} color={ink} opacity={linesOpacity} /> : null}
      <Path path={back} color={ink} opacity={0.25} />
      <Path path={mid} color={ink} opacity={0.55} />
      <Path path={front} color={ink} opacity={0.95} />
      {variant === "scan" ? <Path path={accentLayer} color={highlight} /> : null}
    </Canvas>
  );
}
