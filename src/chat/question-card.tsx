import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
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
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutLeft,
  FadeOutRight,
  LinearTransition,
  useReducedMotion,
  ZoomIn,
} from "react-native-reanimated";
import { withAlpha } from "../internal/color";
import { type MotionPalette } from "../theme/palette";
import { useMotionPalette } from "../theme/provider";

const EASE = Easing.bezier(0.23, 1, 0.32, 1);
const ADVANCE_DELAY = 220;
const DEFAULT_TITLE_STYLE: TextStyle = { fontSize: 18, lineHeight: 25, fontWeight: "600" };
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
  showSentState?: boolean;
  onSubmit: (answers: QuestionAnswer[]) => void;
  onClose?: () => void;
  onAnswerChange?: (answers: QuestionAnswer[]) => void;
  onHaptic?: (kind: "select" | "submit") => void;
  renderOption?: (option: { label: string; description?: string }, state: QuestionOptionState) => ReactNode;
  titleStyle?: StyleProp<TextStyle>;
  optionStyle?: StyleProp<TextStyle>;
  metaStyle?: StyleProp<TextStyle>;
  colors?: Partial<MotionPalette>;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_LABELS: QuestionCardLabels = {
  progress: (current, total) => `${current} of ${total}`,
  next: "Next",
  submit: "Send",
  customPlaceholder: "Type your answer...",
  sent: "Answers sent",
};

type Draft = { selected: number[]; custom: string };

function normalize(option: QuestionOption) {
  return typeof option === "string" ? { label: option } : option;
}

function buildAnswers(questions: Question[], drafts: Draft[]): QuestionAnswer[] {
  return questions.map((question, index) => {
    const draft = drafts[index] ?? { selected: [], custom: "" };
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
  showSentState = true,
  onSubmit,
  onClose,
  onAnswerChange,
  onHaptic,
  renderOption,
  titleStyle = DEFAULT_TITLE_STYLE,
  optionStyle = DEFAULT_OPTION_STYLE,
  metaStyle = DEFAULT_META_STYLE,
  colors,
  style,
}: QuestionCardProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const copy = { ...DEFAULT_LABELS, ...labels };
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [drafts, setDrafts] = useState<Draft[]>(() => questions.map(() => ({ selected: [], custom: "" })));
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const signature = questions.map((item) => `${item.title}:${item.options.length}`).join("|");
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    setPage(0);
    setEditing(false);
    setSent(false);
    setDrafts(questions.map(() => ({ selected: [], custom: "" })));
  }, [questions, signature]);

  const question = questions[page];
  const kind = question?.kind ?? "single";
  const draft = drafts[page] ?? { selected: [], custom: "" };
  const options = useMemo(() => question?.options.map(normalize) ?? [], [question]);
  const answered = draft.selected.length > 0 || draft.custom.trim().length > 0;
  const last = page === questions.length - 1;
  const allAnswered = drafts.every((item) => item.selected.length > 0 || item.custom.trim().length > 0);
  const hairline = withAlpha(palette.text, 0.1);
  const layout = reduceMotion ? undefined : LinearTransition.duration(260).easing(EASE);

  const update = (next: Draft[]) => {
    setDrafts(next);
    onAnswerChange?.(buildAnswers(questions, next));
  };

  const goTo = (target: number) => {
    if (target < 0 || target >= questions.length || target === page) return;
    setDirection(target > page ? 1 : -1);
    setEditing(false);
    setPage(target);
  };

  const submit = (source: Draft[]) => {
    onHaptic?.("submit");
    onSubmit(buildAnswers(questions, source));
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
    const next = drafts.map((item, position) =>
      position === page ? { selected, custom: kind === "single" ? "" : item.custom } : item,
    );
    update(next);
    if (kind === "single" && autoAdvance && !last) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => goTo(page + 1), ADVANCE_DELAY);
    }
  };

  const setCustom = (value: string) => {
    update(
      drafts.map((item, position) =>
        position === page ? { selected: kind === "single" && value ? [] : item.selected, custom: value } : item,
      ),
    );
  };

  const container: ViewStyle =
    variant === "card"
      ? {
          borderRadius: 20,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: hairline,
          backgroundColor: palette.card,
          padding: 16,
        }
      : { paddingHorizontal: 20, paddingVertical: 8 };

  if (sent) {
    return (
      <Animated.View
        entering={reduceMotion ? undefined : ZoomIn.duration(260).easing(EASE)}
        style={[{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, height: 30, borderRadius: 15, backgroundColor: withAlpha(palette.success, 0.14) }, variant === "sheet" && { marginHorizontal: 20, marginTop: 12 }, style]}
      >
        {icons?.sent ?? <Text style={[metaStyle, { color: palette.success }]}>✓</Text>}
        <Text style={[metaStyle, { color: palette.success }]}>{copy.sent}</Text>
      </Animated.View>
    );
  }

  if (!question) return null;

  const entering = reduceMotion ? undefined : (direction === 1 ? FadeInRight : FadeInLeft).duration(280).easing(EASE);
  const exiting = reduceMotion ? undefined : (direction === 1 ? FadeOutLeft : FadeOutRight).duration(160);

  return (
    <Animated.View
      entering={reduceMotion || variant === "sheet" ? undefined : FadeInDown.duration(380).easing(EASE)}
      layout={layout}
      style={[container, { overflow: "hidden" }, style]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, minHeight: 28 }}>
        {questions.length > 1 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <IconButton label="Previous question" disabled={page === 0} onPress={() => goTo(page - 1)}>
              {icons?.previous ?? <Text style={[metaStyle, { color: palette.textSecondary, fontSize: 18 }]}>‹</Text>}
            </IconButton>
            <Animated.Text
              key={page}
              entering={reduceMotion ? undefined : (direction === 1 ? FadeInUp : FadeInDown).duration(220)}
              style={[metaStyle, { color: palette.textSecondary, fontVariant: ["tabular-nums"], minWidth: 44, textAlign: "center" }]}
            >
              {copy.progress(page + 1, questions.length)}
            </Animated.Text>
            <IconButton label="Next question" disabled={last} onPress={() => goTo(page + 1)}>
              {icons?.next ?? <Text style={[metaStyle, { color: palette.textSecondary, fontSize: 18 }]}>›</Text>}
            </IconButton>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {onClose && (
          <IconButton label="Close" onPress={onClose}>
            {icons?.close ?? <Text style={[metaStyle, { color: palette.textSecondary, fontSize: 18 }]}>×</Text>}
          </IconButton>
        )}
      </View>

      <Animated.View key={question.key ?? page} entering={entering} exiting={exiting}>
        <Text accessibilityRole="header" style={[titleStyle, { color: palette.text, marginBottom: 12 }]}>
          {question.title}
        </Text>
        <View accessibilityRole={kind === "single" ? "radiogroup" : undefined}>
          {options.map((option, index) => {
            const selected = draft.selected.includes(index);
            return (
              <Pressable
                key={`${index}-${option.label}`}
                onPress={() => select(index)}
                accessibilityRole={kind === "single" ? "radio" : "checkbox"}
                accessibilityState={{ checked: selected }}
                accessibilityLabel={option.label}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: hairline,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                {renderOption ? (
                  renderOption(option, { index, selected, kind })
                ) : (
                  <>
                    {numbered && (
                      <Text style={[metaStyle, { color: palette.textTertiary, width: 18, fontVariant: ["tabular-nums"] }]}>
                        {index + 1}
                      </Text>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[optionStyle, { color: palette.text }]}>{option.label}</Text>
                      {option.description ? (
                        <Text style={[metaStyle, { color: palette.textSecondary, marginTop: 2, fontWeight: "400" }]}>
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                    <Check selected={selected} kind={kind} palette={palette} animate={!reduceMotion} icon={icons?.check} />
                  </>
                )}
              </Pressable>
            );
          })}
          {question.allowCustom !== false && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: options.length ? 1 : 0, borderTopColor: hairline }}>
              <View style={{ width: numbered ? 18 : undefined, alignItems: "flex-start" }}>
                {icons?.custom ?? <Text style={[metaStyle, { color: palette.textTertiary }]}>✎</Text>}
              </View>
              {editing || draft.custom ? (
                <TextInput
                  autoFocus={editing}
                  value={draft.custom}
                  onChangeText={setCustom}
                  onBlur={() => setEditing(false)}
                  placeholder={copy.customPlaceholder}
                  placeholderTextColor={palette.textTertiary}
                  returnKeyType={last ? "send" : "next"}
                  onSubmitEditing={() => (last ? allAnswered && submit(drafts) : goTo(page + 1))}
                  style={[optionStyle, { flex: 1, color: palette.text, paddingVertical: 2 }]}
                />
              ) : (
                <Pressable style={{ flex: 1 }} onPress={() => setEditing(true)} accessibilityRole="button">
                  <Text style={[optionStyle, { color: palette.textTertiary }]}>{copy.customPlaceholder}</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Animated.View>

      {(answered && (kind === "multiple" || last || draft.custom.trim().length > 0)) && (
        <Animated.View entering={reduceMotion ? undefined : FadeInUp.duration(200).easing(EASE)} exiting={reduceMotion ? undefined : FadeOut.duration(120)} style={{ marginTop: 12, alignItems: "flex-end" }}>
          <Pressable
            onPress={() => (last ? submit(drafts) : goTo(page + 1))}
            disabled={last && !allAnswered}
            accessibilityRole="button"
            style={({ pressed }) => ({
              paddingHorizontal: 18,
              height: 38,
              borderRadius: 19,
              justifyContent: "center",
              backgroundColor: palette.text,
              opacity: last && !allAnswered ? 0.4 : pressed ? 0.8 : 1,
            })}
          >
            <Text style={[metaStyle, { color: palette.background, fontSize: 15 }]}>{last ? copy.submit : copy.next}</Text>
          </Pressable>
        </Animated.View>
      )}
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
      style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.3 : 1 }}
    >
      {children}
    </Pressable>
  );
}

type CheckProps = { selected: boolean; kind: "single" | "multiple"; palette: MotionPalette; animate: boolean; icon?: ReactNode };

function Check({ selected, kind, palette, animate, icon }: CheckProps) {
  const size = 22;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: kind === "single" ? size / 2 : 6,
        borderWidth: selected ? 0 : 1.5,
        borderColor: withAlpha(palette.text, 0.25),
        backgroundColor: selected ? palette.accent : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {selected && (
        <Animated.View entering={animate ? ZoomIn.duration(180).easing(EASE) : undefined} exiting={animate ? FadeOut.duration(100) : undefined}>
          {icon ?? <Text style={{ color: palette.accentContrast, fontSize: 13, fontWeight: "700" }}>✓</Text>}
        </Animated.View>
      )}
    </View>
  );
}
