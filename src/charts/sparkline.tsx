import { Canvas, Circle, LinearGradient, Path, Skia, vec } from "@shopify/react-native-skia";
import { useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, View, type StyleProp, type ViewStyle } from "react-native";
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { withAlpha } from "../internal/color";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const PAD = 4;

export type SparklineProps = {
  data: number[];
  height?: number;
  strokeWidth?: number;
  color?: string;
  area?: boolean;
  dot?: boolean;
  duration?: number;
  min?: number;
  max?: number;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

function resample(values: number[], length: number) {
  if (values.length === length) return values;
  if (values.length === 0) return new Array(length).fill(0);
  if (values.length === 1) return new Array(length).fill(values[0]);
  return Array.from({ length }, (_, index) => {
    const position = (index / (length - 1)) * (values.length - 1);
    const low = Math.floor(position);
    const high = Math.min(values.length - 1, low + 1);
    return values[low] + (values[high] - values[low]) * (position - low);
  });
}

export function Sparkline({
  data,
  height = 44,
  strokeWidth = 2,
  color,
  area = true,
  dot = true,
  duration = 700,
  min,
  max,
  colors,
  style,
  accessibilityLabel,
}: SparklineProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const stroke = color ?? palette.text;
  const [width, setWidth] = useState(0);
  const draw = useSharedValue(reduceMotion ? 1 : 0);
  const morph = useSharedValue(1);
  const length = Math.max(2, data.length);
  const previous = useSharedValue<number[]>(resample(data, length));
  const next = useSharedValue<number[]>(resample(data, length));
  const lastData = useRef(data);
  const low = min ?? Math.min(...data, 0);
  const high = max ?? Math.max(...data, 1);

  useEffect(() => {
    draw.value = reduceMotion ? 1 : withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [draw, duration, reduceMotion]);

  useEffect(() => {
    if (lastData.current === data) return;
    const size = Math.max(2, data.length, lastData.current.length);
    previous.value = resample(lastData.current, size);
    next.value = resample(data, size);
    lastData.current = data;
    morph.value = 0;
    morph.value = reduceMotion ? 1 : withTiming(1, { duration: 420, easing: Easing.inOut(Easing.cubic) });
  }, [data, morph, next, previous, reduceMotion]);

  const points = useDerivedValue(() => {
    const from = previous.value;
    const to = next.value;
    const span = high - low || 1;
    const usable = Math.max(1, width - PAD * 2);
    return to.map((value, index) => {
      const mixed = (from[index] ?? value) + (value - (from[index] ?? value)) * morph.value;
      return {
        x: PAD + (index / Math.max(1, to.length - 1)) * usable,
        y: PAD + (1 - (mixed - low) / span) * (height - PAD * 2),
      };
    });
  }, [width, height, high, low]);

  const line = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const list = points.value;
    list.forEach((point, index) => {
      if (index === 0) {
        path.moveTo(point.x, point.y);
        return;
      }
      const prior = list[index - 1];
      const mid = (prior.x + point.x) / 2;
      path.cubicTo(mid, prior.y, mid, point.y, point.x, point.y);
    });
    return path;
  });

  const fill = useDerivedValue(() => {
    const path = line.value.copy();
    const list = points.value;
    if (list.length > 0) {
      path.lineTo(list[list.length - 1].x, height);
      path.lineTo(list[0].x, height);
      path.close();
    }
    return path;
  }, [height]);

  const areaOpacity = useDerivedValue(() => Math.max(0, (draw.value - 0.4) / 0.6));
  const dotX = useDerivedValue(() => points.value[points.value.length - 1]?.x ?? 0);
  const dotY = useDerivedValue(() => points.value[points.value.length - 1]?.y ?? 0);
  const dotOpacity = useDerivedValue(() => (draw.value > 0.98 ? 1 : 0));

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
      accessibilityLabel={accessibilityLabel}
      onLayout={handleLayout}
      style={[{ height, alignSelf: "stretch" }, style]}
    >
      {width > 0 && (
        <Canvas style={{ width, height }}>
          {area && (
            <Path path={fill} opacity={areaOpacity}>
              <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={[withAlpha(stroke, 0.22), withAlpha(stroke, 0)]} />
            </Path>
          )}
          <Path
            path={line}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
            color={stroke}
            start={0}
            end={draw}
          />
          {dot && <Circle cx={dotX} cy={dotY} r={strokeWidth + 1.5} color={stroke} opacity={dotOpacity} />}
        </Canvas>
      )}
    </View>
  );
}
