import type { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type MessageAction = {
  key: string;
  icon: ReactNode;
  accessibilityLabel: string;
  onPress?: () => void;
  onPressIn?: () => void;
  disabled?: boolean;
};

export type MessageActionsProps = {
  actions: MessageAction[];
  delay?: number;
  stagger?: number;
  hitSize?: number;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function MessageActions({
  actions,
  delay = 0,
  stagger = 50,
  hitSize = 32,
  colors,
  style,
}: MessageActionsProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();

  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 4, marginLeft: -(hitSize - 18) / 2 }, style]}>
      {actions.map((action, index) => (
        <Animated.View
          key={action.key}
          entering={reduceMotion ? undefined : FadeIn.delay(delay + index * stagger).duration(240)}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            disabled={action.disabled}
            onPress={action.onPress}
            onPressIn={action.onPressIn}
            style={({ pressed }) => ({
              width: hitSize,
              height: hitSize,
              borderRadius: hitSize / 2,
              alignItems: "center",
              justifyContent: "center",
              opacity: action.disabled ? 0.4 : 1,
              backgroundColor: pressed ? palette.surface : "transparent",
            })}
          >
            {action.icon}
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
