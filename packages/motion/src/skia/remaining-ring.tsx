import { Canvas, Group, Path, Skia } from "@shopify/react-native-skia";
import { type PropsWithChildren, useEffect } from "react";
import { View } from "react-native";
import {
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DEFAULT_STROKE_WIDTH = 2.5;
const DEFAULT_DURATION = 200;

export type RemainingRingProps = PropsWithChildren<{
  size: number;
  progress: number;
  trackColor: string;
  color: string;
  strokeWidth?: number;
  duration?: number;
}>;

export function RemainingRing({
  size,
  progress,
  trackColor,
  color,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  duration = DEFAULT_DURATION,
  children,
}: RemainingRingProps) {
  const reduceMotion = useReducedMotion();
  const end = useSharedValue(0);
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circle = Skia.Path.Make();
  circle.addCircle(center, center, radius);

  useEffect(() => {
    const clamped = Math.min(1, Math.max(0, progress));
    end.value = reduceMotion ? clamped : withTiming(clamped, { duration });
  }, [duration, end, progress, reduceMotion]);

  return (
    <View style={{ width: size, height: size }}>
      <Canvas
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Group
          origin={{ x: center, y: center }}
          transform={[{ rotate: -Math.PI / 2 }]}
        >
          <Path
            path={circle}
            style="stroke"
            strokeWidth={strokeWidth}
            color={trackColor}
          />
          <Path
            path={circle}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            color={color}
            start={0}
            end={end}
          />
        </Group>
      </Canvas>
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
}
