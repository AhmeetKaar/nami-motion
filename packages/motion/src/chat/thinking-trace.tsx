import { useState, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn, LinearTransition, useReducedMotion } from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

export type ThinkingTraceTab = {
  key: string;
  label: string;
  content: ReactNode;
};

export type ThinkingTraceProps = {
  tabs: ThinkingTraceTab[];
  selectedKey?: string;
  defaultKey?: string;
  onSelect?: (key: string) => void;
  contentHeight?: number;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

export function ThinkingTrace({
  tabs,
  selectedKey,
  defaultKey,
  onSelect,
  contentHeight,
  colors,
  style,
}: ThinkingTraceProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const [internalKey, setInternalKey] = useState(defaultKey ?? tabs[0]?.key);
  const activeKey = selectedKey ?? internalKey;
  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  const select = (key: string) => {
    if (selectedKey === undefined) setInternalKey(key);
    onSelect?.(key);
  };

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(220)}
      layout={reduceMotion ? undefined : LinearTransition.duration(240)}
      style={[{ gap: 12 }, style]}
    >
      <View
        accessibilityRole="tablist"
        style={{ flexDirection: "row", gap: 4, padding: 3, borderRadius: 10, backgroundColor: palette.surface }}
      >
        {tabs.map((tab) => {
          const selected = tab.key === active?.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => select(tab.key)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: selected ? palette.card : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: selected ? "600" : "500",
                  color: selected ? palette.text : palette.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {active ? (
        <Animated.View
          key={active.key}
          entering={reduceMotion ? undefined : FadeIn.duration(220)}
          style={contentHeight ? { height: contentHeight, overflow: "hidden" } : undefined}
        >
          {active.content}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
