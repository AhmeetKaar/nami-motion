import { Children, type ReactNode } from "react";
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
  stagger?: number;
  scaleFrom?: number;
  onDetachedChange?: (detached: boolean) => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

function revealStyle(value: number, start: number, end: number, offset: number, scaleFrom: number) {
  "worklet";
  const local = interpolate(value, [start, end], [0, 1], Extrapolation.CLAMP);
  return {
    opacity: local,
    transform: [
      { translateY: (1 - local) * offset },
      { scale: scaleFrom + (1 - scaleFrom) * local },
    ],
  };
}

function StaggerItem({
  progress,
  start,
  end,
  offset,
  scaleFrom,
  children,
}: {
  progress: SharedValue<number>;
  start: number;
  end: number;
  offset: number;
  scaleFrom: number;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => revealStyle(progress.get(), start, end, offset, scaleFrom));
  return <Animated.View style={style}>{children}</Animated.View>;
}

export function DrawerReveal({
  progress,
  offset = DEFAULT_OFFSET,
  stagger = 0,
  scaleFrom = 1,
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
    if (stagger > 0) return {};
    return revealStyle(progress.get(), 0, 1, offset, scaleFrom);
  });

  if (stagger > 0) {
    const items = Children.toArray(children);
    const span = Math.max(0.2, 1 - stagger * Math.max(items.length - 1, 0));
    return (
      <Animated.View {...props} style={style}>
        {items.map((child, index) => {
          const start = Math.min(index * stagger, 1 - span);
          return (
            <StaggerItem
              key={index}
              progress={progress}
              start={start}
              end={start + span}
              offset={offset}
              scaleFrom={scaleFrom}
            >
              {child}
            </StaggerItem>
          );
        })}
      </Animated.View>
    );
  }

  return (
    <Animated.View {...props} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
