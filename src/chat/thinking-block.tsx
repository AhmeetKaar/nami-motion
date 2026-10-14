import { ShimmerText } from "../text/shimmer-text";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  lineHeight: 20,
};

const DEFAULT_BODY_STYLE: TextStyle = {
  fontSize: 14,
  lineHeight: 21,
};

export type ThinkingBlockColors = {
  text: string;
  textSecondary: string;
  textTertiary: string;
  pressed: string;
  rail?: string;
};

export type ThinkingBlockProps = {
  reasoning: string;
  isStreaming: boolean;
  thinkingLabel: string;
  formatDoneLabel: (elapsedSeconds: number | null) => string;
  colors?: Partial<ThinkingBlockColors>;
  textStyle?: StyleProp<TextStyle>;
  bodyTextStyle?: StyleProp<TextStyle>;
  renderIcon?: (active: boolean) => ReactNode;
  trailingIcon?: ReactNode;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  renderBody?: (paragraphs: string[]) => ReactNode;
  onPress?: () => void;
  onPressIn?: (event: GestureResponderEvent) => void;
};

function Chevron({ open, color }: { open: boolean; color: string }) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    rotation.value = reduceMotion ? (open ? 1 : 0) : withTiming(open ? 1 : 0, { duration: 220 });
  }, [open, reduceMotion, rotation]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${45 + rotation.value * 180}deg` }],
  }));
  return (
    <View style={{ width: 12, height: 12, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          {
            width: 6,
            height: 6,
            marginTop: -3,
            borderRightWidth: 1.6,
            borderBottomWidth: 1.6,
            borderColor: color,
          },
          style,
        ]}
      />
    </View>
  );
}

export function ThinkingBlock({
  reasoning,
  isStreaming,
  thinkingLabel,
  formatDoneLabel,
  colors: colorOverrides,
  textStyle = DEFAULT_TEXT_STYLE,
  bodyTextStyle = DEFAULT_BODY_STYLE,
  renderIcon,
  trailingIcon,
  expandable = false,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  renderBody,
  onPress,
  onPressIn,
}: ThinkingBlockProps) {
  const palette = useMotionPalette();
  const reduceMotion = useReducedMotion();
  const colors: ThinkingBlockColors = {
    text: palette.text,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    pressed: palette.surface,
    rail: palette.surface,
    ...colorOverrides,
  };
  const startedAt = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandable && (expandedProp ?? internalExpanded);

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

  const handlePress = () => {
    if (expandable) {
      const next = !expanded;
      if (expandedProp === undefined) setInternalExpanded(next);
      onExpandedChange?.(next);
    }
    onPress?.();
  };

  const showLiveLine = isStreaming && !expanded;
  const layout = reduceMotion ? undefined : LinearTransition.duration(240);

  return (
    <Animated.View layout={layout} style={{ marginBottom: 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={expandable ? { expanded } : undefined}
        onPress={handlePress}
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
          showLiveLine && latestParagraph ? (
            <Animated.Text
              key={paragraphs.length}
              entering={reduceMotion ? undefined : FadeIn.duration(200)}
              exiting={reduceMotion ? undefined : FadeOut.duration(150)}
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
            entering={reduceMotion ? undefined : FadeInDown.duration(250)}
            style={[textStyle, { color: colors.textSecondary }]}
          >
            {formatDoneLabel(elapsedSeconds)}
          </Animated.Text>
        )}

        {trailingIcon ?? (expandable && (!isStreaming || expanded) ? <Chevron open={expanded} color={colors.textTertiary} /> : null)}
      </Pressable>

      {expanded ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(260)}
          exiting={reduceMotion ? undefined : FadeOutUp.duration(160)}
          style={{ flexDirection: "row", gap: 12, marginTop: 6, marginBottom: 6 }}
        >
          <View style={{ width: 2, borderRadius: 1, backgroundColor: colors.rail }} />
          <View style={{ flex: 1, gap: 10 }}>
            {renderBody
              ? renderBody(paragraphs)
              : paragraphs.map((paragraph, index) => (
                  <Animated.View
                    key={index}
                    entering={reduceMotion ? undefined : FadeIn.duration(260)}
                    layout={layout}
                  >
                    <Text style={[bodyTextStyle, { color: colors.textSecondary }]}>{paragraph}</Text>
                  </Animated.View>
                ))}
            {isStreaming ? (
              <ShimmerText
                text={thinkingLabel}
                activeColor={colors.textSecondary}
                mutedColor={colors.textTertiary}
                textStyle={bodyTextStyle}
              />
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
