import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  View,
  type DimensionValue,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";

const PULSE_MIN = 0.6;
const DEFAULT_DURATION = 1000;
const WAVE_DURATION = 1500;
const WAVE_SLICES = [0.08, 0.2, 0.34, 0.2, 0.08];

type SkeletonClock = {
  progress: SharedValue<number>;
  effect: SkeletonEffect;
};

export type SkeletonEffect = "pulse" | "wave";

const SkeletonClockContext = createContext<SkeletonClock | null>(null);

function useClock(effect: SkeletonEffect, duration: number, enabled: boolean) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(effect === "pulse" ? PULSE_MIN : 0);

  useEffect(() => {
    if (!enabled || reduceMotion) return;
    if (effect === "pulse") {
      progress.value = PULSE_MIN;
      progress.value = withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
      return;
    }
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, [duration, effect, enabled, progress, reduceMotion]);

  return progress;
}

export type SkeletonGroupProps = {
  effect?: SkeletonEffect;
  duration?: number;
  children?: ReactNode;
};

export function SkeletonGroup({ effect = "pulse", duration, children }: SkeletonGroupProps) {
  const progress = useClock(effect, duration ?? (effect === "wave" ? WAVE_DURATION : DEFAULT_DURATION), true);
  return (
    <SkeletonClockContext.Provider value={{ progress, effect }}>{children}</SkeletonClockContext.Provider>
  );
}

export type SkeletonProps = {
  color?: string;
  highlightColor?: string;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  duration?: number;
  effect?: SkeletonEffect;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  color,
  highlightColor,
  width = "100%",
  height = 12,
  borderRadius = 6,
  duration,
  effect: effectProp,
  style,
}: SkeletonProps) {
  const palette = useMotionPalette();
  const reduceMotion = useReducedMotion();
  const group = useContext(SkeletonClockContext);
  const effect = effectProp ?? group?.effect ?? "pulse";
  const ownClock = useClock(
    effect,
    duration ?? (effect === "wave" ? WAVE_DURATION : DEFAULT_DURATION),
    !group || group.effect !== effect,
  );
  const progress = group && group.effect === effect ? group.progress : ownClock;
  const [barWidth, setBarWidth] = useState(0);
  const fill = color ?? palette.surface;
  const highlight = highlightColor ?? palette.card;

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: effect === "pulse" && !reduceMotion ? progress.value : 1,
  }));

  const bandWidth = Math.max(barWidth * 0.5, 48);
  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -bandWidth + progress.value * (barWidth + bandWidth) }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => setBarWidth(event.nativeEvent.layout.width);

  return (
    <Animated.View
      onLayout={effect === "wave" ? handleLayout : undefined}
      style={[
        { width, height, borderRadius, overflow: "hidden", backgroundColor: fill },
        pulseStyle,
        style,
      ]}
    >
      {effect === "wave" && !reduceMotion && barWidth > 0 ? (
        <Animated.View
          style={[{ position: "absolute", top: 0, bottom: 0, left: 0, width: bandWidth, flexDirection: "row" }, waveStyle]}
        >
          {WAVE_SLICES.map((opacity, index) => (
            <View key={index} style={{ flex: 1, backgroundColor: highlight, opacity }} />
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
