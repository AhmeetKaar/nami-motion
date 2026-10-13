import { useEffect } from "react";
import {
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const PULSE_MIN = 0.45;
const DEFAULT_DURATION = 800;

export type SkeletonProps = {
  color: string;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  color,
  width = "100%",
  height = 12,
  borderRadius = 6,
  duration = DEFAULT_DURATION,
  style,
}: SkeletonProps) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(PULSE_MIN);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [duration, pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: color },
        pulseStyle,
        style,
      ]}
    />
  );
}
