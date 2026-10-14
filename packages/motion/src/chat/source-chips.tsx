import type { ReactNode } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type SourceChipItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

export type SourceChipsProps = {
  sources: SourceChipItem[];
  renderIcon?: (source: SourceChipItem) => ReactNode;
  showIcons?: boolean;
  stagger?: number;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

function LetterIcon({ label, palette }: { label: string; palette: MotionPalette }) {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.card,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: palette.textSecondary }}>
        {label.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

export function SourceChips({
  sources,
  renderIcon,
  showIcons = true,
  stagger = 220,
  colors,
  style,
}: SourceChipsProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();

  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", gap: 6 }, style]}>
      {sources.map((source, index) => {
        const icon = showIcons ? (source.icon ?? renderIcon?.(source) ?? <LetterIcon label={source.label} palette={palette} />) : null;
        return (
          <Animated.View
            key={source.key}
            entering={reduceMotion ? undefined : FadeInDown.delay(index * stagger).duration(300)}
            layout={reduceMotion ? undefined : LinearTransition.duration(200)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingLeft: icon ? 4 : 10,
              paddingRight: 10,
              height: 28,
              borderRadius: 14,
              backgroundColor: palette.surface,
            }}
          >
            {icon}
            <Text style={{ fontSize: 13, color: palette.textSecondary }}>{source.label}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
