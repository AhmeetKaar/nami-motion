import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useElapsed } from "../internal/use-elapsed";
import { ShimmerText } from "../text/shimmer-text";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };
const DEFAULT_DETAIL_STYLE: TextStyle = { fontSize: 14, lineHeight: 21 };
const OPEN_SPRING = { damping: 22, stiffness: 210, mass: 0.9 };
const DOT = 7;

export type ThinkingStepStatus = "done" | "active" | "pending";

export type ThinkingStep = {
  key?: string;
  title: string;
  detail?: string;
  status?: ThinkingStepStatus;
};

export type ThinkingBlockLabels = {
  thinking: string;
  done: (seconds: number) => string;
};

export type ThinkingBlockProps = {
  thinking: boolean;
  startedAt?: number;
  seconds?: number;
  title?: string;
  labels?: Partial<ThinkingBlockLabels>;
  icon?: ReactNode;
  chevron?: ReactNode;
  steps?: ThinkingStep[];
  renderStep?: (step: ThinkingStep, index: number) => ReactNode;
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  textStyle?: StyleProp<TextStyle>;
  detailStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LABELS: ThinkingBlockLabels = {
  thinking: "Thinking",
  done: (seconds) => (seconds < 1 ? "Thought for a moment" : `Thought for ${seconds}s`),
};

export function ThinkingBlock({
  thinking,
  startedAt,
  seconds,
  title,
  labels,
  icon,
  chevron,
  steps,
  renderStep,
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  textStyle = DEFAULT_TEXT_STYLE,
  detailStyle = DEFAULT_DETAIL_STYLE,
  colors,
  style,
}: ThinkingBlockProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const copy = { ...DEFAULT_LABELS, ...labels };
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const elapsed = useElapsed(startedAt, thinking);
  const frozen = useRef(0);
  if (thinking) frozen.current = elapsed;
  const totalSeconds = seconds ?? frozen.current;
  const hasBody = !!children || (steps?.length ?? 0) > 0;

  const [contentHeight, setContentHeight] = useState(0);
  const height = useSharedValue(0);
  const turn = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    const target = open ? contentHeight : 0;
    height.value = reduceMotion ? target : withSpring(target, OPEN_SPRING);
    turn.value = reduceMotion ? (open ? 1 : 0) : withTiming(open ? 1 : 0, { duration: 220 });
  }, [contentHeight, height, open, reduceMotion, turn]);

  const toggle = () => {
    if (!hasBody) return;
    const next = !open;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const bodyStyle = useAnimatedStyle(() => ({ height: height.value, opacity: Math.min(1, height.value / 24) }));
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 90}deg` }] }));

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const next = Math.ceil(event.nativeEvent.layout.height);
    if (next !== contentHeight) setContentHeight(next);
  };

  const heading = title ?? (thinking ? copy.thinking : copy.done(totalSeconds));
  const label = thinking && startedAt !== undefined ? `${heading} ${elapsed}s` : heading;

  return (
    <View style={style}>
      <Pressable
        onPress={toggle}
        disabled={!hasBody}
        accessibilityRole="button"
        accessibilityLabel={heading}
        accessibilityState={{ expanded: open, busy: thinking }}
        hitSlop={8}
        style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" }}
      >
        {icon !== undefined && <View style={{ alignItems: "center", justifyContent: "center" }}>{icon}</View>}
        <Animated.View key={thinking ? "thinking" : "done"} entering={reduceMotion ? undefined : FadeIn.duration(220)}>
          {thinking && !reduceMotion ? (
            <ShimmerText
              text={label}
              activeColor={palette.text}
              mutedColor={palette.textTertiary}
              textStyle={textStyle}
            />
          ) : (
            <Text style={[textStyle, { color: palette.textSecondary }]}>{label}</Text>
          )}
        </Animated.View>
        {hasBody && (
          <Animated.View style={chevronStyle}>
            {chevron ?? <Text style={[textStyle, { color: palette.textTertiary }]}>›</Text>}
          </Animated.View>
        )}
      </Pressable>
      {hasBody && (
        <Animated.View style={[{ overflow: "hidden" }, bodyStyle]}>
          <View
            onLayout={handleContentLayout}
            style={{ position: "absolute", left: 0, right: 0, top: 0, paddingTop: 10 }}
          >
            {steps && steps.length > 0 && (
              <View>
                {steps.map((step, index) => (
                  <Animated.View
                    key={step.key ?? `${index}`}
                    entering={reduceMotion ? undefined : FadeInDown.duration(260).delay(index * 40)}
                  >
                    {renderStep ? (
                      renderStep(step, index)
                    ) : (
                      <TimelineStep
                        step={step}
                        last={index === steps.length - 1}
                        palette={palette}
                        textStyle={textStyle}
                        detailStyle={detailStyle}
                        animate={!reduceMotion}
                      />
                    )}
                  </Animated.View>
                ))}
              </View>
            )}
            {children}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

type TimelineStepProps = {
  step: ThinkingStep;
  last: boolean;
  palette: MotionPalette;
  textStyle: StyleProp<TextStyle>;
  detailStyle: StyleProp<TextStyle>;
  animate: boolean;
};

function TimelineStep({ step, last, palette, textStyle, detailStyle, animate }: TimelineStepProps) {
  const status = step.status ?? "done";
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View style={{ width: DOT, alignItems: "center" }}>
        <TimelineDot status={status} palette={palette} animate={animate} />
        {!last && <View style={{ flex: 1, width: 1, marginVertical: 4, backgroundColor: palette.raised }} />}
      </View>
      <View style={{ flex: 1, paddingBottom: last ? 0 : 14, marginTop: -6 }}>
        <Text style={[textStyle, { color: status === "pending" ? palette.textTertiary : palette.text }]}>{step.title}</Text>
        {step.detail ? (
          <Text style={[detailStyle, { color: palette.textSecondary, marginTop: 2 }]}>{step.detail}</Text>
        ) : null}
      </View>
    </View>
  );
}

function TimelineDot({ status, palette, animate }: { status: ThinkingStepStatus; palette: MotionPalette; animate: boolean }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (status !== "active" || !animate) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    const curve = Easing.inOut(Easing.sin);
    pulse.value = withRepeat(
      withSequence(withTiming(0.35, { duration: 650, easing: curve }), withTiming(1, { duration: 650, easing: curve })),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [animate, pulse, status]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const color = status === "pending" ? palette.raised : status === "active" ? palette.accent : palette.textTertiary;

  return (
    <Animated.View
      style={[{ width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: color, marginTop: 1 }, animatedStyle]}
    />
  );
}
