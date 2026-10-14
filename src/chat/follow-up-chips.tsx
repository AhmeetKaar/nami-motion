import type { ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type FollowUpItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

export type FollowUpChipsProps = {
  items: FollowUpItem[];
  onPress?: (item: FollowUpItem) => void;
  delay?: number;
  stagger?: number;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function FollowUpChips({ items, onPress, delay = 0, stagger = 120, colors, style }: FollowUpChipsProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();

  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", gap: 8 }, style]}>
      {items.map((item, index) => (
        <Animated.View
          key={item.key}
          entering={reduceMotion ? undefined : FadeInDown.delay(delay + index * stagger).duration(320)}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => onPress?.(item)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: palette.surface,
              backgroundColor: pressed ? palette.surface : "transparent",
            })}
          >
            {item.icon}
            <Text style={{ fontSize: 14, color: palette.text }}>{item.label}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
