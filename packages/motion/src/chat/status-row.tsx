import { useEffect, type ReactNode } from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const PULSE_MIN = 0.4;
const DEFAULT_DURATION = 700;
const DEFAULT_ICON_SIZE = 16;
const LABEL_OPACITY = 0.7;

const DEFAULT_LABEL_STYLE: TextStyle = {
  fontSize: 16,
  lineHeight: 24,
};

export type StatusRowProps = {
  label: string;
  color: string;
  icon?: ReactNode;
  iconSize?: number;
  labelStyle?: StyleProp<TextStyle>;
  duration?: number;
};

export function StatusRow({
  label,
  color,
  icon,
  iconSize = DEFAULT_ICON_SIZE,
  labelStyle = DEFAULT_LABEL_STYLE,
  duration = DEFAULT_DURATION,
}: StatusRowProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(PULSE_MIN);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [duration, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 4,
        },
        animatedStyle,
      ]}
    >
      {icon ? (
        <View style={{ width: iconSize, height: iconSize }}>{icon}</View>
      ) : null}
      <Text style={[labelStyle, { color, opacity: LABEL_OPACITY }]}>
        {label}
      </Text>
    </Animated.View>
  );
}
