import { withAlpha } from "../internal/color";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, type ReactNode } from "react";
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
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function ShimmerBand({
  backgroundColor,
  highlightColor,
  highlightOpacity = DEFAULT_HIGHLIGHT_OPACITY,
  bandRatio = DEFAULT_BAND_RATIO,
  duration = DEFAULT_DURATION,
  style,
  children,
}: ShimmerBandProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const fieldWidth = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, progress, reduceMotion]);

  const onFieldLayout = (event: LayoutChangeEvent) => {
    fieldWidth.value = event.nativeEvent.layout.width;
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
