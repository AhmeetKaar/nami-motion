import type { ReactNode } from "react";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const DEFAULT_OFFSET = 20;
const PROGRESS_EPSILON = 0.001;

export type DrawerRevealProps = Omit<ViewProps, "style"> & {
  progress: SharedValue<number>;
  offset?: number;
  onDetachedChange?: (detached: boolean) => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function DrawerReveal({
  progress,
  offset = DEFAULT_OFFSET,
  onDetachedChange,
  style,
  children,
  ...props
}: DrawerRevealProps) {
  useAnimatedReaction(
    () => progress.get() > PROGRESS_EPSILON,
    (detached, previous) => {
      if (detached !== previous && onDetachedChange) {
        scheduleOnRN(onDetachedChange, detached);
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.get();

    return {
      opacity: interpolate(value, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            value,
            [0, 1],
            [offset, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View {...props} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
