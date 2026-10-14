import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector, type PanGesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useMotionPalette } from "../theme/provider";
import { useSwipeActionsGroup } from "./swipe-actions-group";

const DEFAULT_ACTION_WIDTH = 80;
const DEFAULT_FULL_SWIPE_THRESHOLD = 0.6;
const ACTIVE_OFFSET = 10;
const RUBBER_BAND = 0.55;
const EMPTY_SIDE_OVERDRAG = 24;
const VELOCITY_PROJECTION = 0.1;
const EXPAND_DURATION = 180;
const FULL_SWIPE_DURATION = 200;
const SPRING = { damping: 26, stiffness: 260, mass: 1 };

const CLOSED = 0;
const LEFT = 1;
const RIGHT = -1;

export type SwipeActionsSide = "left" | "right";

export type SwipeAction = {
  key: string;
  accessibilityLabel: string;
  backgroundColor: string;
  onPress: () => void;
  label?: string;
  children?: ReactNode;
};

export type SwipeActionShape = "fill" | "circle";

export type SwipeActionsHandle = {
  open: (side: SwipeActionsSide) => void;
  close: () => void;
};

export type SwipeActionsProps = Omit<ViewProps, "style" | "children"> & {
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  actionWidth?: number;
  actionShape?: SwipeActionShape;
  circleSize?: number;
  fullSwipe?: boolean;
  fullSwipeThreshold?: number;
  closeOnActionPress?: boolean;
  onThreshold?: (side: SwipeActionsSide, crossed: boolean) => void;
  onOpenChange?: (side: SwipeActionsSide | null) => void;
  configureGesture?: (gesture: PanGesture) => PanGesture;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  ref?: Ref<SwipeActionsHandle>;
};

const EMPTY: SwipeAction[] = [];

function rubberBand(distance: number, dimension: number) {
  "worklet";
  if (distance <= 0 || dimension <= 0) return 0;
  return (1 - 1 / ((distance * RUBBER_BAND) / dimension + 1)) * dimension;
}

function sideName(sign: number): SwipeActionsSide | null {
  return sign === LEFT ? "left" : sign === RIGHT ? "right" : null;
}

export function SwipeActions({
  leftActions = EMPTY,
  rightActions = EMPTY,
  actionWidth = DEFAULT_ACTION_WIDTH,
  actionShape = "fill",
  circleSize,
  fullSwipe = true,
  fullSwipeThreshold = DEFAULT_FULL_SWIPE_THRESHOLD,
  closeOnActionPress = true,
  onThreshold,
  onOpenChange,
  configureGesture,
  style,
  contentStyle,
  children,
  ref,
  onLayout,
  ...props
}: SwipeActionsProps) {
  const reduceMotion = useReducedMotion();
  const group = useSwipeActionsGroup();
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const rowWidth = useSharedValue(0);
  const expanded = useSharedValue(0);
  const crossed = useSharedValue(CLOSED);
  const openSide = useSharedValue(CLOSED);
  const [restingSide, setRestingSide] = useState(CLOSED);

  const leftCount = leftActions.length;
  const rightCount = rightActions.length;
  const leftWidth = leftCount * actionWidth;
  const rightWidth = rightCount * actionWidth;

  const settle = useCallback(
    (target: number) =>
      reduceMotion ? withTiming(target, { duration: 0 }) : withSpring(target, SPRING),
    [reduceMotion],
  );

  const close = useCallback(() => {
    translateX.set(settle(0));
    expanded.set(withTiming(0, { duration: reduceMotion ? 0 : EXPAND_DURATION }));
    crossed.set(CLOSED);
    openSide.set(CLOSED);
  }, [crossed, expanded, openSide, reduceMotion, settle, translateX]);

  const open = useCallback(
    (side: SwipeActionsSide) => {
      const width = side === "left" ? leftWidth : rightWidth;
      if (width === 0) return;
      group?.activate(close);
      translateX.set(settle(side === "left" ? width : -width));
      openSide.set(side === "left" ? LEFT : RIGHT);
    },
    [close, group, leftWidth, openSide, rightWidth, settle, translateX],
  );

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  useEffect(() => () => group?.release(close), [close, group]);

  const handleOpenChange = useCallback(
    (sign: number) => {
      setRestingSide(sign);
      if (sign === CLOSED) {
        group?.release(close);
      } else {
        group?.activate(close);
      }
      onOpenChange?.(sideName(sign));
    },
    [close, group, onOpenChange],
  );

  useAnimatedReaction(
    () => openSide.get(),
    (sign, previous) => {
      if (previous !== null && sign !== previous) {
        scheduleOnRN(handleOpenChange, sign);
      }
    },
  );

  const activate = useCallback(() => group?.activate(close), [close, group]);

  const handleThreshold = useCallback(
    (sign: number, isCrossed: boolean) => {
      const side = sideName(sign);
      if (side) onThreshold?.(side, isCrossed);
    },
    [onThreshold],
  );

  const triggerPrimary = useCallback(
    (sign: number) => {
      const action = sign === LEFT ? leftActions[0] : rightActions[0];
      action?.onPress();
      close();
    },
    [close, leftActions, rightActions],
  );

  const pressAction = useCallback(
    (action: SwipeAction) => {
      action.onPress();
      if (closeOnActionPress) close();
    },
    [close, closeOnActionPress],
  );

  const gesture = useMemo(() => {
    const expandDuration = reduceMotion ? 0 : EXPAND_DURATION;
    const fullSwipeDuration = reduceMotion ? 0 : FULL_SWIPE_DURATION;

    const constrain = (raw: number) => {
      "worklet";
      const sign = raw > 0 ? LEFT : RIGHT;
      const limit = sign === LEFT ? leftWidth : rightWidth;
      const distance = Math.abs(raw);
      if (limit === 0) {
        return sign * rubberBand(distance, EMPTY_SIDE_OVERDRAG);
      }
      if (distance <= limit) return raw;
      if (fullSwipe) return sign * Math.min(distance, rowWidth.get());
      return sign * (limit + rubberBand(distance - limit, actionWidth));
    };

    const fullSwipeSide = (x: number) => {
      "worklet";
      if (!fullSwipe) return CLOSED;
      const sign = x > 0 ? LEFT : RIGHT;
      const limit = sign === LEFT ? leftWidth : rightWidth;
      if (limit === 0) return CLOSED;
      const threshold = Math.max(rowWidth.get() * fullSwipeThreshold, limit + actionWidth / 2);
      return Math.abs(x) >= threshold ? sign : CLOSED;
    };

    const pan = Gesture.Pan()
      .activeOffsetX([-ACTIVE_OFFSET, ACTIVE_OFFSET])
      .failOffsetY([-ACTIVE_OFFSET, ACTIVE_OFFSET])
      .onStart(() => {
        startX.set(translateX.get());
        scheduleOnRN(activate);
      })
      .onUpdate((event) => {
        const x = constrain(startX.get() + event.translationX);
        translateX.set(x);
        const next = fullSwipeSide(x);
        const previous = crossed.get();
        if (next !== previous) {
          crossed.set(next);
          expanded.set(withTiming(next === CLOSED ? 0 : 1, { duration: expandDuration }));
          scheduleOnRN(handleThreshold, next === CLOSED ? previous : next, next !== CLOSED);
        }
      })
      .onEnd((event) => {
        const x = translateX.get();
        const fullSide = crossed.get();
        if (fullSide !== CLOSED) {
          translateX.set(
            withTiming(fullSide * rowWidth.get(), { duration: fullSwipeDuration }, (finished) => {
              if (finished) scheduleOnRN(triggerPrimary, fullSide);
            }),
          );
          return;
        }
        const projected = x + event.velocityX * VELOCITY_PROJECTION;
        let target = 0;
        let sign = CLOSED;
        if (x > 0 && leftWidth > 0 && projected > leftWidth / 2) {
          target = leftWidth;
          sign = LEFT;
        } else if (x < 0 && rightWidth > 0 && -projected > rightWidth / 2) {
          target = -rightWidth;
          sign = RIGHT;
        }
        translateX.set(
          reduceMotion
            ? withTiming(target, { duration: 0 })
            : withSpring(target, { ...SPRING, velocity: event.velocityX }),
        );
        openSide.set(sign);
      });

    return configureGesture ? configureGesture(pan) : pan;
  }, [
    configureGesture,
    actionWidth,
    activate,
    crossed,
    expanded,
    fullSwipe,
    fullSwipeThreshold,
    handleThreshold,
    leftWidth,
    openSide,
    reduceMotion,
    rightWidth,
    rowWidth,
    startX,
    translateX,
    triggerPrimary,
  ]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  const accessibilityActions = useMemo(
    () =>
      [...leftActions, ...rightActions].map((action) => ({
        name: action.key,
        label: action.accessibilityLabel,
      })),
    [leftActions, rightActions],
  );

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const action = [...leftActions, ...rightActions].find(
        (item) => item.key === event.nativeEvent.actionName,
      );
      if (action) pressAction(action);
    },
    [leftActions, pressAction, rightActions],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      rowWidth.set(event.nativeEvent.layout.width);
      onLayout?.(event);
    },
    [onLayout, rowWidth],
  );

  const hasActions = leftCount + rightCount > 0;

  return (
    <View
      {...props}
      accessible={props.accessible ?? (hasActions || undefined)}
      accessibilityActions={hasActions ? accessibilityActions : props.accessibilityActions}
      onAccessibilityAction={hasActions ? handleAccessibilityAction : props.onAccessibilityAction}
      onLayout={handleLayout}
      style={[styles.row, style]}
    >
      {leftCount > 0 ? (
        <ActionPanel
          side={LEFT}
          shape={actionShape}
          actionWidth={actionWidth}
          circleSize={circleSize ?? Math.min(actionWidth - 24, 52)}
          actions={leftActions}
          translateX={translateX}
          expanded={expanded}
          onPress={pressAction}
        />
      ) : null}
      {rightCount > 0 ? (
        <ActionPanel
          side={RIGHT}
          shape={actionShape}
          actionWidth={actionWidth}
          circleSize={circleSize ?? Math.min(actionWidth - 24, 52)}
          actions={rightActions}
          translateX={translateX}
          expanded={expanded}
          onPress={pressAction}
        />
      ) : null}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[contentStyle, contentAnimatedStyle]}>
          {children}
          {restingSide !== CLOSED ? (
            <Pressable
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              onPress={close}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

type ActionPanelProps = {
  side: number;
  shape: SwipeActionShape;
  actionWidth: number;
  circleSize: number;
  actions: SwipeAction[];
  translateX: SharedValue<number>;
  expanded: SharedValue<number>;
  onPress: (action: SwipeAction) => void;
};

function ActionPanel({ side, shape, actionWidth, circleSize, actions, translateX, expanded, onPress }: ActionPanelProps) {
  const panelStyle = useAnimatedStyle(() => ({
    width: Math.max(side * translateX.get(), 0),
  }));

  return (
    <Animated.View
      style={[
        styles.panel,
        side === LEFT ? styles.panelLeft : styles.panelRight,
        panelStyle,
      ]}
    >
      {actions.map((action, index) => (
        <ActionItem
          key={action.key}
          action={action}
          index={index}
          count={actions.length}
          side={side}
          shape={shape}
          actionWidth={actionWidth}
          circleSize={circleSize}
          translateX={translateX}
          expanded={expanded}
          onPress={onPress}
        />
      ))}
    </Animated.View>
  );
}

type ActionItemProps = {
  action: SwipeAction;
  shape: SwipeActionShape;
  actionWidth: number;
  circleSize: number;
  index: number;
  count: number;
  side: number;
  translateX: SharedValue<number>;
  expanded: SharedValue<number>;
  onPress: (action: SwipeAction) => void;
};

function ActionItem({
  action,
  index,
  count,
  side,
  shape,
  actionWidth,
  circleSize,
  translateX,
  expanded,
  onPress,
}: ActionItemProps) {
  const palette = useMotionPalette();
  const itemStyle = useAnimatedStyle(() => {
    const reveal = Math.max(side * translateX.get(), 0);
    const share = reveal / count;
    const progress = expanded.get();
    return {
      width: index === 0 ? share + (reveal - share) * progress : share * (1 - progress),
    };
  });
  const circleStyle = useAnimatedStyle(() => {
    const share = Math.max(side * translateX.get(), 0) / count;
    const appear = interpolate(share, [actionWidth * 0.25, actionWidth * 0.9], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: appear,
      transform: [{ scale: 0.55 + appear * 0.45 }],
    };
  });

  if (shape === "circle") {
    return (
      <Animated.View style={[styles.item, itemStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          onPress={() => onPress(action)}
          style={styles.pressable}
        >
          <Animated.View style={[{ alignItems: "center", gap: 4 }, circleStyle]}>
            <View
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: action.backgroundColor,
              }}
            >
              {action.children}
            </View>
            {action.label ? (
              <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: "600", color: palette.textSecondary }}>
                {action.label}
              </Text>
            ) : null}
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.item, { backgroundColor: action.backgroundColor }, itemStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action.accessibilityLabel}
        onPress={() => onPress(action)}
        style={styles.pressable}
      >
        {action.children}
        {action.label ? (
          <Text numberOfLines={1} style={{ marginTop: 4, fontSize: 12, fontWeight: "600", color: "#FFFFFF" }}>
            {action.label}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    overflow: "hidden",
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  panelLeft: {
    left: 0,
    flexDirection: "row",
  },
  panelRight: {
    right: 0,
    flexDirection: "row-reverse",
  },
  item: {
    overflow: "hidden",
  },
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
