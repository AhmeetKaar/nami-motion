import { withAlpha } from "../internal/color";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ReactNode } from "react";
import {
  View,
  type LayoutChangeEvent,
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

const DEFAULT_DURATION = 1400;
const DEFAULT_BAND_RATIO = 0.6;
const DEFAULT_HIGHLIGHT_OPACITY = 0.1;

export type ShimmerBandProps = {
  backgroundColor: string;
  highlightColor: string;
  highlightOpacity?: number;
  bandRatio?: number;
  duration?: number;
  backgroundColors?: string[];
  driftDuration?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function ShimmerBand({
  backgroundColor,
  highlightColor,
  highlightOpacity = DEFAULT_HIGHLIGHT_OPACITY,
  bandRatio = DEFAULT_BAND_RATIO,
  duration = DEFAULT_DURATION,
  backgroundColors,
  driftDuration = 6000,
  style,
  children,
}: ShimmerBandProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const fieldWidth = useSharedValue(0);
  const drift = useSharedValue(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, progress, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !backgroundColors) return;
    drift.value = withRepeat(
      withTiming(1, { duration: driftDuration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [backgroundColors, drift, driftDuration, reduceMotion]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -drift.value * fieldWidth.value * 0.5 },
      { translateY: -drift.value * fieldWidth.value * 0.25 },
    ],
  }));

  const onFieldLayout = (event: LayoutChangeEvent) => {
    fieldWidth.value = event.nativeEvent.layout.width;
    setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height });
  };

  const bandStyle = useAnimatedStyle(() => {
    const band = fieldWidth.value * bandRatio;
    return {
      width: band,
      transform: [
        {
          translateX: -band + progress.value * (fieldWidth.value + band),
        },
      ],
    };
  });

  const highlight = withAlpha(highlightColor, highlightOpacity);
  const clear = withAlpha(highlightColor, 0);

  return (
    <View
      onLayout={onFieldLayout}
      style={[{ overflow: "hidden", backgroundColor }, style]}
    >
      {backgroundColors && backgroundColors.length > 1 && size.width > 0 ? (
        <Animated.View style={[{ position: "absolute", top: 0, left: 0, width: size.width * 2, height: size.height * 2 }, driftStyle]}>
          <LinearGradient
            colors={backgroundColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      ) : null}
      {!reduceMotion && (
        <Animated.View
          style={[
            { position: "absolute", top: 0, bottom: 0, left: 0 },
            bandStyle,
          ]}
        >
          <LinearGradient
            colors={[clear, highlight, clear]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
        </Animated.View>
      )}
      {children}
    </View>
  );
}
