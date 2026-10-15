import type { ReactNode } from "react";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { LinearTransition, ZoomIn, ZoomOut, useReducedMotion } from "react-native-reanimated";

export type AttachmentTrayProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  gap?: number;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function AttachmentTray<T>({
  items,
  keyExtractor,
  renderItem,
  gap = 12,
  scroll = true,
  style,
  contentContainerStyle,
}: AttachmentTrayProps<T>) {
  const reduceMotion = useReducedMotion();

  const tiles = items.map((item) => (
        <Animated.View
          key={keyExtractor(item)}
          entering={reduceMotion ? undefined : ZoomIn.duration(240)}
          exiting={reduceMotion ? undefined : ZoomOut.duration(180)}
          layout={reduceMotion ? undefined : LinearTransition.springify().damping(18)}
        >
          {renderItem(item)}
        </Animated.View>
  ));
  const containerStyle = [{ flexDirection: "row" as const, gap, paddingTop: 8, paddingRight: 8, alignItems: "flex-end" as const }, contentContainerStyle];

  if (!scroll) return <View style={[containerStyle, style]}>{tiles}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style} contentContainerStyle={containerStyle}>
      {tiles}
    </ScrollView>
  );
}
