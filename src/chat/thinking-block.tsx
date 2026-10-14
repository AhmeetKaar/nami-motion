import { ShimmerText } from "../text/shimmer-text";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  lineHeight: 20,
};

export type ThinkingBlockColors = {
  text: string;
  textSecondary: string;
  textTertiary: string;
  pressed: string;
};

export type ThinkingBlockProps = {
  reasoning: string;
  isStreaming: boolean;
  thinkingLabel: string;
  formatDoneLabel: (elapsedSeconds: number | null) => string;
  colors: ThinkingBlockColors;
  textStyle?: StyleProp<TextStyle>;
  renderIcon?: (active: boolean) => ReactNode;
  trailingIcon?: ReactNode;
  onPress?: () => void;
  onPressIn?: (event: GestureResponderEvent) => void;
};

export function ThinkingBlock({
  reasoning,
  isStreaming,
  thinkingLabel,
  formatDoneLabel,
  colors,
  textStyle = DEFAULT_TEXT_STYLE,
  renderIcon,
  trailingIcon,
  onPress,
  onPressIn,
}: ThinkingBlockProps) {
  const startedAt = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (isStreaming) {
      startedAt.current ??= Date.now();
      return;
    }
    if (startedAt.current !== null) {
      setElapsedSeconds(
        Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      );
    }
  }, [isStreaming]);

  const paragraphs = useMemo(
    () =>
      reasoning
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [reasoning],
  );
  const latestParagraph = paragraphs[paragraphs.length - 1];

  return (
    <View style={{ marginBottom: 8 }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginLeft: -6,
            paddingHorizontal: 6,
            paddingVertical: 4,
            borderRadius: 8,
          },
          pressed && { backgroundColor: colors.pressed },
        ]}
      >
        {renderIcon?.(isStreaming)}

        {isStreaming ? (
          latestParagraph ? (
            <Animated.Text
              key={paragraphs.length}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[textStyle, { flex: 1, color: colors.textSecondary }]}
            >
              {latestParagraph}
            </Animated.Text>
          ) : (
            <ShimmerText
              text={thinkingLabel}
              activeColor={colors.text}
              mutedColor={colors.textTertiary}
              textStyle={textStyle}
            />
          )
        ) : (
          <Animated.Text
            entering={FadeInDown.duration(250)}
            style={[textStyle, { color: colors.textSecondary }]}
          >
            {formatDoneLabel(elapsedSeconds)}
          </Animated.Text>
        )}

        {trailingIcon}
      </Pressable>
    </View>
  );
}
