import { Blur, Canvas, Fill, Group, Oval, Paint, Shader, Skia } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import {
  type SharedValue,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";

export type LiquidOrbMaterial = "metal" | "water" | "iridescent";

export type LiquidOrbState = "idle" | "listening" | "thinking" | "speaking";

export type LiquidOrbProps = {
  material?: LiquidOrbMaterial;
  state?: LiquidOrbState;
  level?: SharedValue<number>;
  size?: number;
  speed?: number;
  wobble?: number;
  distortion?: number;
  detail?: number;
  tint?: string;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
};

const MATERIALS: Record<LiquidOrbMaterial, number> = { metal: 0, water: 1, iridescent: 2 };
const DEFAULT_TINTS: Record<LiquidOrbMaterial, string> = { metal: "#B8C0CC", water: "#6FA8E8", iridescent: "#F2E9FF" };
const STATE_MOTION: Record<LiquidOrbState, { speed: number; wobble: number; scale: number; distortion: number }> = {
  idle: { speed: 0.6, wobble: 0.7, scale: 0.94, distortion: 0.8 },
  listening: { speed: 1, wobble: 1, scale: 1, distortion: 1 },
  thinking: { speed: 2.2, wobble: 0.45, scale: 0.86, distortion: 1.5 },
  speaking: { speed: 1.2, wobble: 1.2, scale: 1.02, distortion: 1.1 },
};

const ORB = Skia.RuntimeEffect.Make(`
uniform float2 resolution;
uniform float time;
uniform float level;
uniform float wobble;
uniform float distortion;
uniform float detail;
uniform float material;
uniform float scale;
uniform float3 tint;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + float2(1.0, 0.0)), u.x), mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x), u.y);
}

float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    v += a * noise(p);
    p = p * 2.03 + float2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

half4 main(float2 xy) {
  float2 c = resolution * 0.5;
  float R = min(resolution.x, resolution.y) * 0.34 * scale;
  float2 p = (xy - c) / R;
  float ang = atan(p.y, p.x);
  float t = time;
  float w = wobble * (0.06 * sin(3.0 * ang + t * 1.3) + 0.04 * sin(5.0 * ang - t * 0.9) + 0.03 * sin(2.0 * ang + t * 0.6));
  w += level * (0.07 * sin(4.0 * ang + t * 3.1) + 0.05 * sin(7.0 * ang - t * 2.3) + 0.06);
  float rad = 1.0 + w;
  float d = length(p) - rad;
  float aa = 1.5 / R;
  float mask = 1.0 - smoothstep(-aa, aa, d);

  float2 q = p / rad;
  float z = sqrt(max(0.0, 1.0 - dot(q, q)));
  float3 n = normalize(float3(q, z));
  float2 wp = q * detail * 1.6 + float2(t * 0.25, -t * 0.18);
  float warp = fbm(wp + fbm(wp + t * 0.15) * 1.5);
  n = normalize(n + distortion * float3(warp - 0.5, fbm(wp * 1.3 + 3.1) - 0.5, 0.0) * 1.4);

  float3 v = float3(0.0, 0.0, 1.0);
  float fres = pow(1.0 - max(0.0, n.z), 2.5);
  float3 L = normalize(float3(-0.45, -0.6, 0.7));
  float spec = pow(max(0.0, dot(reflect(-L, n), v)), 48.0);
  float3 col = float3(0.0);
  float alpha = 0.0;

  if (material < 0.5) {
    float3 rv = reflect(-v, n);
    float band = rv.y + 0.35 * fbm(rv.xy * 2.5 + t * 0.2);
    float env = smoothstep(-0.06, 0.06, band) * 0.85 + 0.1;
    float stripes = 0.5 + 0.5 * sin(rv.x * 7.0 + warp * 6.0);
    col = mix(float3(0.05, 0.05, 0.06), float3(0.93, 0.93, 0.96), env * 0.7 + stripes * 0.3);
    col = mix(col, tint, 0.12) + spec * 0.9 + fres * 0.15;
    alpha = 1.0;
  } else if (material < 1.5) {
    float3 deep = tint * 0.5;
    float3 shallow = mix(tint, float3(1.0), 0.55);
    col = mix(shallow, deep, z * 0.75);
    float sparkle = smoothstep(0.6, 0.76, fbm(q * detail * 4.0 + t * 0.6));
    col += sparkle * 0.4 + fres * float3(0.7, 0.9, 1.0) * 0.85 + spec;
    alpha = 0.8 + fres * 0.2;
  } else {
    float th = fres * 1.6 + warp * 0.9 + t * 0.05;
    float3 film = 0.5 + 0.5 * cos(6.2831 * (th + float3(0.0, 0.33, 0.67)));
    col = mix(float3(0.97), film, 0.55 * fres + 0.25);
    col = mix(col, tint, 0.1) + spec * 1.2;
    alpha = 0.16 + fres * 0.78 + spec;
  }

  alpha = clamp(alpha, 0.0, 1.0) * mask;
  float glow = (material > 0.5 && material < 1.5) ? exp(-max(d, 0.0) * 8.0) * (0.35 + level * 0.3) * (1.0 - mask) : 0.0;
  float3 rgb = col * alpha + tint * glow;
  return half4(half3(rgb), half(alpha + glow));
}
`);

export function LiquidOrb({
  material = "water",
  state = "idle",
  level,
  size = 200,
  speed = 1,
  wobble = 0.6,
  distortion = 0.5,
  detail = 1,
  tint,
  shadow = true,
  style,
}: LiquidOrbProps) {
  const palette = useMotionPalette();
  const reduceMotion = useReducedMotion();
  const color = tint ?? DEFAULT_TINTS[material];
  const rgb = useMemo(() => {
    const parsed = Skia.Color(color);
    return [parsed[0], parsed[1], parsed[2]];
  }, [color]);
  const motion = STATE_MOTION[state];
  const time = useSharedValue(0);
  const smooth = useSharedValue(0);
  const rate = useSharedValue(motion.speed * speed);
  const shape = useSharedValue(motion.scale);
  const wob = useSharedValue(motion.wobble * wobble);
  const dist = useSharedValue(motion.distortion * distortion);
  const fallback = useSharedValue(0);
  const input = level ?? fallback;
  const listensToLevel = state === "listening" || state === "speaking";

  useEffect(() => {
    const config = { damping: 18, stiffness: 120, mass: 1 };
    rate.value = withSpring(motion.speed * speed, config);
    shape.value = reduceMotion ? motion.scale : withSpring(motion.scale, config);
    wob.value = withSpring(motion.wobble * wobble, config);
    dist.value = withSpring(motion.distortion * distortion, config);
  }, [dist, distortion, motion, rate, reduceMotion, shape, speed, wob, wobble]);

  useFrameCallback((info) => {
    const delta = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    time.value += delta * rate.value;
    const target = listensToLevel ? Math.min(1, Math.max(0, input.value)) : state === "thinking" ? 0.15 + 0.1 * Math.sin(time.value * 3) : 0;
    smooth.value += (target - smooth.value) * Math.min(1, delta * 9);
  }, !reduceMotion);

  const uniforms = useDerivedValue(() => ({
    resolution: [size, size],
    time: reduceMotion ? 2.4 : time.value,
    level: smooth.value,
    wobble: wob.value,
    distortion: dist.value,
    detail,
    material: MATERIALS[material],
    scale: shape.value,
    tint: rgb,
  }), [detail, material, rgb, size, reduceMotion]);

  const shadowWidth = useDerivedValue(() => size * 0.5 * shape.value * (1 + smooth.value * 0.08));
  const shadowX = useDerivedValue(() => (size - shadowWidth.value) / 2);
  const shadowOpacity = material === "iridescent" ? 0.1 : material === "water" ? 0.16 : 0.22;

  if (!ORB) return null;

  return (
    <View style={[{ width: size, height: size * (shadow ? 1.12 : 1) }, style]}>
      <Canvas style={{ width: size, height: size * (shadow ? 1.12 : 1) }}>
        {shadow ? (
          <Group
            layer={
              <Paint>
                <Blur blur={size * 0.05} />
              </Paint>
            }
          >
            <Oval x={shadowX} y={size * 0.98} width={shadowWidth} height={size * 0.07} color={palette.text} opacity={shadowOpacity} />
          </Group>
        ) : null}
        <Group clip={Skia.XYWHRect(0, 0, size, size)}>
          <Fill>
            <Shader source={ORB} uniforms={uniforms} />
          </Fill>
        </Group>
      </Canvas>
    </View>
  );
}
