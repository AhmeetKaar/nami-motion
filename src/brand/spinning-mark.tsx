import { useEffect, type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  type EasingFunction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const DEFAULT_DURATION = 3630;
const DEFAULT_BREATHE = { scale: 1.06, duration: 1800 };
const ENTRANCE_SPRING = { damping: 14, stiffness: 120, mass: 1 };

export type SpinningMarkBreathe = { scale?: number; duration?: number };

export type SpinningMarkProps = {
  children: ReactNode;
  size?: number;
  duration?: number;
  direction?: "clockwise" | "counterclockwise";
  easing?: EasingFunction;
  breathe?: boolean | SpinningMarkBreathe;
  entrance?: boolean;
  paused?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function SpinningMark({
  children,
  size,
  duration = DEFAULT_DURATION,
  direction = "clockwise",
  easing = Easing.linear,
  breathe = false,
  entrance = false,
  paused = false,
  style,
  accessibilityLabel,
}: SpinningMarkProps) {
  const reduceMotion = useReducedMotion();
  const angle = useSharedValue(0);
  const pulse = useSharedValue(1);
  const intro = useSharedValue(entrance && !reduceMotion ? 0 : 1);
  const sign = direction === "clockwise" ? 1 : -1;
  const breatheScale = breathe ? ((breathe === true ? undefined : breathe.scale) ?? DEFAULT_BREATHE.scale) : 1;
  const breatheDuration = breathe
    ? ((breathe === true ? undefined : breathe.duration) ?? DEFAULT_BREATHE.duration)
    : 0;

  useEffect(() => {
    if (reduceMotion || paused) {
      cancelAnimation(angle);
      return;
    }
    const start = angle.value % 360;
    angle.value = start;
    angle.value = withRepeat(withTiming(start + 360, { duration, easing }), -1, false);
    return () => cancelAnimation(angle);
  }, [angle, duration, easing, paused, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || paused || breatheScale === 1) {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
      return;
    }
    const half = breatheDuration / 2;
    const curve = Easing.inOut(Easing.sin);
    pulse.value = withRepeat(
      withSequence(
        withTiming(breatheScale, { duration: half, easing: curve }),
        withTiming(1, { duration: half, easing: curve }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [breatheDuration, breatheScale, paused, pulse, reduceMotion]);

  useEffect(() => {
    if (!entrance || reduceMotion) {
      intro.value = 1;
      return;
    }
    intro.value = withSpring(1, ENTRANCE_SPRING);
  }, [entrance, intro, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, intro.value * 1.4),
    transform: [
      { rotate: `${sign * angle.value - (1 - intro.value) * 90 * sign}deg` },
      { scale: pulse.value * (0.6 + intro.value * 0.4) },
    ],
  }));

  return (
    <Animated.View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[
        size !== undefined && { width: size, height: size },
        { alignItems: "center", justifyContent: "center" },
        style,
        animatedStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
}
