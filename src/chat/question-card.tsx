import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { withAlpha } from "../internal/color";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const ENTER_SPRING = { damping: 24, stiffness: 220, mass: 0.9 };
const HEIGHT_SPRING = { damping: 28, stiffness: 260, mass: 0.9 };
const CHIP_SPRING = { damping: 14, stiffness: 420, mass: 0.6 };
const PAGE_OUT = 110;
const PAGE_IN = 240;
const PAGE_SHIFT = 12;
const ADVANCE_DELAY = 260;
const CHIP = 26;

const DEFAULT_TITLE_STYLE: TextStyle = { fontSize: 19, lineHeight: 25, fontWeight: "500" };
const DEFAULT_OPTION_STYLE: TextStyle = { fontSize: 16, lineHeight: 22 };
const DEFAULT_META_STYLE: TextStyle = { fontSize: 13, lineHeight: 18, fontWeight: "500" };

export type QuestionOption = string | { label: string; description?: string };

export type Question = {
  key?: string;
  title: string;
  kind?: "single" | "multiple";
  options: QuestionOption[];
  allowCustom?: boolean;
};

export type QuestionAnswer = {
  question: string;
  selected: number[];
  labels: string[];
  custom?: string;
};

export type QuestionCardLabels = {
  progress: (current: number, total: number) => string;
  next: string;
  submit: string;
  customPlaceholder: string;
  sent: string;
};

export type QuestionCardIcons = {
  previous?: ReactNode;
  next?: ReactNode;
  close?: ReactNode;
  check?: ReactNode;
  custom?: ReactNode;
  send?: ReactNode;
  sent?: ReactNode;
};

export type QuestionOptionState = { index: number; selected: boolean; kind: "single" | "multiple" };

export type QuestionCardProps = {
  questions: Question[];
  variant?: "card" | "sheet";
  labels?: Partial<QuestionCardLabels>;
  icons?: QuestionCardIcons;
  numbered?: boolean;
  autoAdvance?: boolean;
  autoSubmit?: boolean;
  showSentState?: boolean;
  onSubmit: (answers: QuestionAnswer[]) => void;
  onClose?: () => void;
  onAnswerChange?: (answers: QuestionAnswer[]) => void;
  onHaptic?: (kind: "select" | "page" | "submit") => void;
  renderOption?: (option: { label: string; description?: string }, state: QuestionOptionState) => ReactNode;
  fontFamily?: string;
  titleStyle?: StyleProp<TextStyle>;
  optionStyle?: StyleProp<TextStyle>;
  metaStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LABELS: QuestionCardLabels = {
  progress: (current, total) => `${current} of ${total}`,
  next: "Continue",
  submit: "Send",
  customPlaceholder: "Type your answer...",
  sent: "Answers sent",
};

type Draft = { selected: number[]; custom: string };

const emptyDraft = (): Draft => ({ selected: [], custom: "" });

function normalize(option: QuestionOption) {
  return typeof option === "string" ? { label: option } : option;
}

function isAnswered(draft: Draft | undefined) {
  return !!draft && (draft.selected.length > 0 || draft.custom.trim().length > 0);
}

function buildAnswers(questions: Question[], drafts: Draft[]): QuestionAnswer[] {
  return questions.map((question, index) => {
    const draft = drafts[index] ?? emptyDraft();
    const options = question.options.map(normalize);
    const custom = draft.custom.trim();
    return {
      question: question.title,
      selected: draft.selected,
      labels: draft.selected.map((position) => options[position]?.label ?? ""),
      ...(custom ? { custom } : {}),
    };
  });
}

export function QuestionCard({
  questions,
  variant = "card",
  labels,
  icons,
  numbered = true,
  autoAdvance = true,
  autoSubmit = true,
  showSentState = true,
  onSubmit,
  onClose,
  onAnswerChange,
  onHaptic,
  renderOption,
  fontFamily,
  titleStyle: titleStyleProp = DEFAULT_TITLE_STYLE,
  optionStyle: optionStyleProp = DEFAULT_OPTION_STYLE,
  metaStyle: metaStyleProp = DEFAULT_META_STYLE,
  colors,
  style,
}: QuestionCardProps) {
  const font = fontFamily ? { fontFamily } : null;
  const titleStyle = [titleStyleProp, font];
  const optionStyle = [optionStyleProp, font];
  const metaStyle = [metaStyleProp, font];
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const copy = { ...DEFAULT_LABELS, ...labels };
  const [page, setPage] = useState(0);
  const [shown, setShown] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>(() => questions.map(emptyDraft));
  const [sent, setSent] = useState(false);
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = useSharedValue(reduceMotion ? 1 : 0);
  const contentOpacity = useSharedValue(1);
  const contentShift = useSharedValue(0);
  const height = useSharedValue(0);
  const measured = useRef(0);

  useEffect(() => {
    enter.value = reduceMotion ? 1 : withSpring(1, ENTER_SPRING);
  }, [enter, reduceMotion]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const signature = questions.map((item) => `${item.title}:${item.options.length}`).join("|");
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    setPage(0);
    setShown(0);
    setSent(false);
    setDrafts(questions.map(emptyDraft));
  }, [questions, signature]);

  useEffect(() => {
    if (page === shown) return;
    const direction = page > shown ? 1 : -1;
    if (reduceMotion) {
      setShown(page);
      return;
    }
    contentShift.value = withTiming(-direction * PAGE_SHIFT, { duration: PAGE_OUT, easing: Easing.in(Easing.quad) });
    contentOpacity.value = withTiming(0, { duration: PAGE_OUT, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) scheduleOnRN(setShown, page);
    });
  }, [contentOpacity, contentShift, page, reduceMotion, shown]);

  const firstShown = useRef(true);
  useEffect(() => {
    if (firstShown.current) {
      firstShown.current = false;
      return;
    }
    if (reduceMotion) return;
    contentShift.value = contentShift.value < 0 ? PAGE_SHIFT : -PAGE_SHIFT;
    contentShift.value = withTiming(0, { duration: PAGE_IN, easing: EASE_OUT });
    contentOpacity.value = withTiming(1, { duration: PAGE_IN, easing: EASE_OUT });
  }, [contentOpacity, contentShift, reduceMotion, shown]);

  const question = questions[shown];
  const kind = question?.kind ?? "single";
  const draft = drafts[shown] ?? emptyDraft();
  const options = useMemo(() => question?.options.map(normalize) ?? [], [question]);
  const last = shown === questions.length - 1;
  const hairline = withAlpha(palette.text, 0.08);

  const commit = (next: Draft[]) => {
    draftsRef.current = next;
    setDrafts(next);
    onAnswerChange?.(buildAnswers(questions, next));
  };

  const goTo = (target: number) => {
    if (target < 0 || target >= questions.length || target === page) return;
    if (timer.current) clearTimeout(timer.current);
    onHaptic?.("page");
    setPage(target);
  };

  const submit = () => {
    const current = draftsRef.current;
    if (!current.every(isAnswered)) return;
    onHaptic?.("submit");
    onSubmit(buildAnswers(questions, current));
    if (showSentState) setSent(true);
  };

  const select = (index: number) => {
    onHaptic?.("select");
    const selected =
      kind === "single"
        ? [index]
        : draft.selected.includes(index)
          ? draft.selected.filter((value) => value !== index)
          : [...draft.selected, index].sort((a, b) => a - b);
    commit(
      drafts.map((item, position) =>
        position === shown ? { selected, custom: kind === "single" ? "" : item.custom } : item,
      ),
    );
    if (kind !== "single") return;
    if (timer.current) clearTimeout(timer.current);
    if (!last && autoAdvance) {
      timer.current = setTimeout(() => goTo(shown + 1), ADVANCE_DELAY);
    } else if (last && autoSubmit) {
      timer.current = setTimeout(submit, ADVANCE_DELAY);
    }
  };

  const setCustom = (value: string) => {
    commit(
      drafts.map((item, position) =>
        position === shown ? { selected: kind === "single" && value ? [] : item.selected, custom: value } : item,
      ),
    );
  };

  const sendCustom = () => {
    if (!draft.custom.trim()) return;
    if (last) submit();
    else goTo(shown + 1);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const next = Math.ceil(event.nativeEvent.layout.height);
    if (next === measured.current) return;
    const initial = measured.current === 0;
    measured.current = next;
    height.value = initial || reduceMotion ? next : withSpring(next, HEIGHT_SPRING);
  };

  const shellStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value * 1.6),
    transform: [{ translateY: (1 - enter.value) * 22 }, { scale: 0.985 + enter.value * 0.015 }],
  }));
  const clipStyle = useAnimatedStyle(() => (height.value > 0 ? { height: height.value } : {}));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentShift.value }],
  }));

  const radius = variant === "card" ? 26 : 0;
  const container: ViewStyle =
    variant === "card"
      ? {
          borderRadius: radius,
          borderCurve: "continuous",
          backgroundColor: palette.card,
          borderWidth: 1,
          borderColor: withAlpha(palette.text, 0.06),
          shadowColor: "#000000",
          shadowOpacity: 0.08,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 8 },
        }
      : {};
  const sheet = variant === "sheet";
  const padding: ViewStyle = sheet
    ? { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }
    : { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 };
  const showFooter = kind === "multiple" && draft.selected.length > 0;

  return (
    <Animated.View style={[container, shellStyle, style]}>
      <Animated.View style={[{ overflow: "hidden", borderRadius: radius }, sheet ? null : clipStyle]}>
        <View onLayout={sheet ? undefined : handleLayout} style={[padding, sheet ? null : { position: "absolute", top: 0, left: 0, right: 0 }]}>
          {sent ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeIn.duration(260).easing(EASE_OUT)}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}
            >
              <Animated.View
                entering={reduceMotion ? undefined : ZoomIn.springify().damping(14).stiffness(320)}
                style={{ width: CHIP, height: CHIP, borderRadius: CHIP / 2, alignItems: "center", justifyContent: "center", backgroundColor: palette.success }}
              >
                {icons?.sent ?? <Text style={{ color: palette.accentContrast, fontSize: 13, fontWeight: "700" }}>✓</Text>}
              </Animated.View>
              <Text style={[optionStyle, { color: palette.text, fontWeight: "500" }]}>{copy.sent}</Text>
            </Animated.View>
          ) : question ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", minHeight: 32 }}>
                {questions.length > 1 ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: -8 }}>
                    <IconButton label="Previous question" disabled={page === 0} onPress={() => goTo(page - 1)}>
                      {icons?.previous ?? <Text style={[metaStyle, { color: palette.textSecondary, fontSize: 18, fontWeight: "400" }]}>‹</Text>}
                    </IconButton>
                    <Text style={[metaStyle, { color: palette.textSecondary, fontVariant: ["tabular-nums"] }]}>
                      {copy.progress(page + 1, questions.length)}
                    </Text>
                    <IconButton
                      label="Next question"
                      disabled={page === questions.length - 1 || !isAnswered(drafts[page])}
                      onPress={() => goTo(page + 1)}
                    >
                      {icons?.next ?? <Text style={[metaStyle, { color: palette.textSecondary, fontSize: 18, fontWeight: "400" }]}>›</Text>}
                    </IconButton>
                  </View>
                ) : null}
                <View style={{ flex: 1 }} />
                {onClose ? (
                  <View style={{ marginRight: -8 }}>
                    <IconButton label="Close" onPress={onClose}>
                      {icons?.close ?? <Text style={[metaStyle, { color: palette.textSecondary, fontSize: 18, fontWeight: "400" }]}>×</Text>}
                    </IconButton>
                  </View>
                ) : null}
              </View>

              <Animated.View style={contentStyle}>
                <Text accessibilityRole="header" style={[titleStyle, { color: palette.text, marginTop: 4, marginBottom: 8 }]}>
                  {question.title}
                </Text>
                <View accessibilityRole={kind === "single" ? "radiogroup" : undefined}>
                  {options.map((option, index) => (
                    <OptionRow
                      key={`${shown}-${index}`}
                      label={option.label}
                      description={option.description}
                      index={index}
                      kind={kind}
                      selected={draft.selected.includes(index)}
                      divider={index > 0}
                      numbered={numbered}
                      palette={palette}
                      hairline={hairline}
                      optionStyle={optionStyle}
                      metaStyle={metaStyle}
                      checkIcon={icons?.check}
                      animate={!reduceMotion}
                      renderOption={renderOption}
                      onPress={() => select(index)}
                    />
                  ))}
                  {question.allowCustom !== false ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        minHeight: 50,
                        marginHorizontal: -8,
                        paddingHorizontal: 8,
                      }}
                    >
                      {options.length ? (
                        <View style={{ position: "absolute", top: 0, left: numbered ? CHIP + 20 : 8, right: 8, height: 1, backgroundColor: hairline }} />
                      ) : null}
                      {numbered ? (
                        <View style={{ width: CHIP, height: CHIP, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface }}>
                          {icons?.custom ?? <Text style={[metaStyle, { color: palette.textSecondary }]}>✎</Text>}
                        </View>
                      ) : null}
                      <TextInput
                        value={draft.custom}
                        onChangeText={setCustom}
                        placeholder={copy.customPlaceholder}
                        placeholderTextColor={palette.textTertiary}
                        returnKeyType={last ? "send" : "next"}
                        onSubmitEditing={sendCustom}
                        style={[optionStyle, { flex: 1, color: palette.text, paddingVertical: 12 }]}
                      />
                      {draft.custom.trim() ? (
                        <Animated.View
                          entering={reduceMotion ? undefined : ZoomIn.springify().damping(15).stiffness(340)}
                          exiting={reduceMotion ? undefined : ZoomOut.duration(140)}
                        >
                          <Pressable
                            onPress={sendCustom}
                            accessibilityRole="button"
                            accessibilityLabel={last ? copy.submit : copy.next}
                            hitSlop={6}
                            style={({ pressed }) => ({
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: palette.accent,
                              opacity: pressed ? 0.8 : 1,
                            })}
                          >
                            {icons?.send ?? <Text style={{ color: palette.accentContrast, fontSize: 16, fontWeight: "700" }}>↑</Text>}
                          </Pressable>
                        </Animated.View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                {showFooter ? (
                  <Animated.View
                    entering={reduceMotion ? undefined : FadeIn.duration(200).easing(EASE_OUT)}
                    exiting={reduceMotion ? undefined : FadeOut.duration(120)}
                    style={{ alignItems: "flex-end", paddingTop: 8 }}
                  >
                    <Pressable
                      onPress={() => (last ? submit() : goTo(shown + 1))}
                      accessibilityRole="button"
                      style={({ pressed }) => ({
                        paddingHorizontal: 18,
                        height: 38,
                        borderRadius: 19,
                        justifyContent: "center",
                        backgroundColor: palette.text,
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text style={[metaStyle, { color: palette.background, fontSize: 15, fontWeight: "600" }]}>
                        {last ? copy.submit : copy.next}
                      </Text>
                    </Pressable>
                  </Animated.View>
                ) : null}
              </Animated.View>
            </>
          ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function IconButton({ label, disabled, onPress, children }: { label: string; disabled?: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.28 : 1 }}
    >
      {children}
    </Pressable>
  );
}

type OptionRowProps = {
  label: string;
  description?: string;
  index: number;
  kind: "single" | "multiple";
  selected: boolean;
  divider: boolean;
  numbered: boolean;
  palette: MotionPalette;
  hairline: string;
  optionStyle: StyleProp<TextStyle>;
  metaStyle: StyleProp<TextStyle>;
  checkIcon?: ReactNode;
  animate: boolean;
  renderOption?: QuestionCardProps["renderOption"];
  onPress: () => void;
};

function OptionRow({
  label,
  description,
  index,
  kind,
  selected,
  divider,
  numbered,
  palette,
  hairline,
  optionStyle,
  metaStyle,
  checkIcon,
  animate,
  renderOption,
  onPress,
}: OptionRowProps) {
  const pop = useSharedValue(1);
  const fill = useSharedValue(selected ? 1 : 0);
  const pressed = useSharedValue(0);
  const rest = withAlpha(palette.text, 0);
  const press = withAlpha(palette.text, 0.05);

  useEffect(() => {
    fill.value = animate ? withTiming(selected ? 1 : 0, { duration: 180, easing: EASE_OUT }) : selected ? 1 : 0;
    if (selected && animate) pop.value = withSequence(withTiming(0.86, { duration: 70 }), withSpring(1, CHIP_SPRING));
  }, [animate, fill, pop, selected]);

  const chipStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const chipFill = useAnimatedStyle(() => ({ opacity: fill.value }));
  const rowStyle = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(pressed.value, [0, 1], [rest, press]) }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 220 });
      }}
      accessibilityRole={kind === "single" ? "radio" : "checkbox"}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            minHeight: 50,
            paddingVertical: 10,
            marginHorizontal: -8,
            paddingHorizontal: 8,
            borderRadius: 12,
          },
          rowStyle,
        ]}
      >
        {divider ? (
          <View style={{ position: "absolute", top: 0, left: numbered ? CHIP + 20 : 8, right: 8, height: 1, backgroundColor: hairline }} />
        ) : null}
        {renderOption ? (
          renderOption({ label, description }, { index, selected, kind })
        ) : (
          <>
            {numbered ? (
              <Animated.View
                style={[
                  { width: CHIP, height: CHIP, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: palette.surface },
                  chipStyle,
                ]}
              >
                <Animated.View
                  style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 8, backgroundColor: palette.text }, chipFill]}
                />
                <Text style={[metaStyle, { color: selected ? palette.background : palette.textSecondary, fontVariant: ["tabular-nums"] }]}>
                  {index + 1}
                </Text>
              </Animated.View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={[optionStyle, { color: palette.text }]}>{label}</Text>
              {description ? (
                <Text style={[metaStyle, { color: palette.textSecondary, marginTop: 1, fontWeight: "400" }]}>{description}</Text>
              ) : null}
            </View>
            {kind === "multiple" ? (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: selected ? 0 : 1.5,
                  borderColor: withAlpha(palette.text, 0.22),
                  backgroundColor: selected ? palette.text : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected ? (
                  <Animated.View entering={animate ? ZoomIn.springify().damping(14).stiffness(380) : undefined}>
                    {checkIcon ?? <Text style={{ color: palette.background, fontSize: 12, fontWeight: "700" }}>✓</Text>}
                  </Animated.View>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function QuestionSheet(props: Omit<QuestionCardProps, "variant">) {
  return <QuestionCard {...props} variant="sheet" />;
}
