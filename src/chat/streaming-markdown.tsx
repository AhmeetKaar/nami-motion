import { createContext, memo, useContext, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, { FadeIn, FadeInDown, useReducedMotion } from "react-native-reanimated";
import {
  classifyLine,
  closeDangling,
  hasOpenFence,
  isFenceLine,
  isTableRow,
  isTableSeparator,
  parseBlock,
  parseInline,
  plainText,
  splitBlocks,
  type Inline,
  type ListItem,
  type MarkdownNode,
  type TableAlign,
} from "../internal/markdown";
import { useMotionPalette } from "../theme/provider";
import type { MotionPalette } from "../theme/palette";

const DEFAULT_TEXT_STYLE: TextStyle = { fontSize: 16, lineHeight: 24 };
const HEADING_SCALE = [1.5, 1.25, 1.125, 1, 1, 1];
const MONO = Platform.select({ ios: "Menlo", default: "monospace" });
const PENDING_LINE = /^\s*([-*+_#>|]+|\d+[.)]?)\s*$/;

export type StreamingMarkdownProps = {
  text: string;
  isStreaming?: boolean;
  colors?: Partial<MotionPalette>;
  textStyle?: StyleProp<TextStyle>;
  codeFontFamily?: string;
  blockGap?: number;
  fadeDuration?: number;
  selectable?: boolean;
  onLinkPress?: (url: string) => void;
  TextComponent?: ComponentType<TextProps>;
  renderBlock?: (raw: string) => ReactNode | undefined;
  style?: StyleProp<ViewStyle>;
};

type Context = {
  palette: MotionPalette;
  base: TextStyle;
  mono: string | undefined;
  animate: boolean;
  fadeDuration: number;
  selectable: boolean;
  onLinkPress?: (url: string) => void;
  TextComponent: ComponentType<TextProps>;
};

const MarkdownContext = createContext<Context | null>(null);

function useMarkdown(): Context {
  const context = useContext(MarkdownContext);
  if (!context) throw new Error("StreamingMarkdown context is missing");
  return context;
}

function headingStyle(base: TextStyle, level: number): TextStyle {
  const scale = HEADING_SCALE[level - 1] ?? 1;
  const fontSize = (base.fontSize ?? 16) * scale;
  const lineHeight = base.lineHeight ? Math.round(base.lineHeight * scale) : undefined;
  return { fontSize, lineHeight, fontWeight: level <= 2 ? "700" : "600" };
}

function codeSpanStyle(context: Context): TextStyle {
  return {
    fontFamily: context.mono,
    fontSize: (context.base.fontSize ?? 16) * 0.88,
    backgroundColor: context.palette.surface,
  };
}

function listPrefix(item: ListItem): string {
  return `${" ".repeat(item.depth)}${item.marker}  `;
}

function renderInline(nodes: Inline[], context: Context, keyPrefix = "i"): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case "text":
        return node.text;
      case "code":
        return (
          <Text key={key} style={codeSpanStyle(context)}>
            {node.text}
          </Text>
        );
      case "strong":
        return (
          <Text key={key} style={{ fontWeight: "700" }}>
            {renderInline(node.children, context, key)}
          </Text>
        );
      case "em":
        return (
          <Text key={key} style={{ fontStyle: "italic" }}>
            {renderInline(node.children, context, key)}
          </Text>
        );
      case "strike":
        return (
          <Text key={key} style={{ textDecorationLine: "line-through" }}>
            {renderInline(node.children, context, key)}
          </Text>
        );
      case "link":
        return (
          <Text
            key={key}
            accessibilityRole="link"
            onPress={context.onLinkPress ? () => context.onLinkPress?.(node.url) : undefined}
            style={{ color: context.palette.accent, textDecorationLine: "underline" }}
          >
            {renderInline(node.children, context, key)}
          </Text>
        );
    }
  });
}

type FlowNode = Extract<MarkdownNode, { type: "paragraph" | "heading" | "list" }>;

function FlowText({ nodes }: { nodes: FlowNode[] }) {
  const context = useMarkdown();
  const { TextComponent } = context;
  const children: ReactNode[] = [];

  nodes.forEach((node, index) => {
    if (index > 0) children.push("\n");
    const key = `f-${index}`;
    if (node.type === "paragraph") {
      children.push(<Text key={key}>{renderInline(parseInline(node.text), context, key)}</Text>);
    } else if (node.type === "heading") {
      children.push(
        <Text key={key} accessibilityRole="header" style={headingStyle(context.base, node.level)}>
          {renderInline(parseInline(node.text), context, key)}
        </Text>,
      );
    } else {
      node.items.forEach((item, itemIndex) => {
        if (itemIndex > 0) children.push("\n");
        const itemKey = `${key}-${itemIndex}`;
        children.push(
          <Text key={itemKey}>
            <Text style={{ color: context.palette.textSecondary }}>{listPrefix(item)}</Text>
            {renderInline(parseInline(item.text), context, itemKey)}
          </Text>,
        );
      });
    }
  });

  return (
    <TextComponent selectable={context.selectable} style={[context.base, { color: context.palette.text }]}>
      {children}
    </TextComponent>
  );
}

function Quote({ children }: { children: ReactNode }) {
  const { palette } = useMarkdown();
  return <View style={{ borderLeftWidth: 3, borderLeftColor: palette.raised, paddingLeft: 12 }}>{children}</View>;
}

function QuoteText({ text }: { text: string }) {
  const context = useMarkdown();
  const { TextComponent } = context;
  return (
    <Quote>
      <TextComponent selectable={context.selectable} style={[context.base, { color: context.palette.textSecondary }]}>
        {renderInline(parseInline(text), context)}
      </TextComponent>
    </Quote>
  );
}

function Rule() {
  const { palette } = useMarkdown();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: palette.raised, marginVertical: 4 }} />;
}

function CodeBlock({ language, lines }: { language: string; lines: string[] }) {
  const context = useMarkdown();
  const { palette } = context;
  const fontSize = (context.base.fontSize ?? 16) * 0.82;
  const lineHeight = Math.round(fontSize * 1.55);

  return (
    <View style={{ backgroundColor: palette.surface, borderRadius: 12, overflow: "hidden" }}>
      {language ? (
        <Text style={{ paddingHorizontal: 14, paddingTop: 10, fontSize: 12, color: palette.textTertiary }}>{language}</Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 14, paddingTop: language ? 6 : 14 }}>
        <View>
          {lines.map((line, index) => (
            <Animated.View key={index} entering={context.animate ? FadeIn.duration(context.fadeDuration) : undefined}>
              <Text
                selectable={context.selectable}
                style={{ fontFamily: context.mono, fontSize, lineHeight, color: palette.text }}
              >
                {line.length > 0 ? line : " "}
              </Text>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function estimateWidths(header: string[], rows: string[][], fontSize: number): number[] {
  const charWidth = fontSize * 0.52;
  return header.map((cell, column) => {
    const lengths = [plainText(parseInline(cell)).length * 1.1, ...rows.map((row) => plainText(parseInline(row[column] ?? "")).length)];
    const longest = Math.max(...lengths, 0);
    return Math.min(260, Math.max(64, Math.round(longest * charWidth) + 20));
  });
}

const TEXT_ALIGN: Record<TableAlign, TextStyle["textAlign"]> = { left: "left", center: "center", right: "right" };

function Table({ header, align, rows }: { header: string[]; align: TableAlign[]; rows: string[][] }) {
  const context = useMarkdown();
  const { palette, TextComponent } = context;
  const [width, setWidth] = useState(0);
  const fontSize = (context.base.fontSize ?? 16) * 0.9;
  const lineHeight = Math.round(fontSize * 1.4);
  const widths = useMemo(() => estimateWidths(header, rows, fontSize), [header, rows, fontSize]);

  const renderRow = (cells: string[], isHeader: boolean, key: string) => (
    <View key={key} style={{ flexDirection: "row", backgroundColor: isHeader ? palette.surface : undefined }}>
      {cells.map((cell, column) => (
        <View
          key={column}
          style={{
            flexGrow: 1,
            flexBasis: widths[column] ?? 120,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderTopWidth: isHeader ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: palette.raised,
          }}
        >
          <TextComponent
            selectable={context.selectable}
            style={{
              fontSize,
              lineHeight,
              color: palette.text,
              fontWeight: isHeader ? "600" : "400",
              textAlign: TEXT_ALIGN[align[column] ?? "left"],
            }}
          >
            {renderInline(parseInline(cell), context, `${key}-${column}`)}
          </TextComponent>
        </View>
      ))}
    </View>
  );

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.raised, borderRadius: 12, overflow: "hidden" }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={width > 0 ? { minWidth: width } : undefined}>
        <View style={{ flexGrow: 1 }}>
          {renderRow(header, true, "head")}
          {rows.map((row, index) => (
            <Animated.View
              key={index}
              entering={context.animate ? FadeInDown.duration(context.fadeDuration) : undefined}
            >
              {renderRow(row, false, `row-${index}`)}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function groupNodes(nodes: MarkdownNode[]): Array<FlowNode[] | Exclude<MarkdownNode, FlowNode>> {
  const groups: Array<FlowNode[] | Exclude<MarkdownNode, FlowNode>> = [];
  for (const node of nodes) {
    if (node.type === "paragraph" || node.type === "heading" || node.type === "list") {
      const previous = groups[groups.length - 1];
      if (Array.isArray(previous)) previous.push(node);
      else groups.push([node]);
    } else {
      groups.push(node);
    }
  }
  return groups;
}

type BlockProps = {
  raw: string;
  context: Context;
  renderBlock?: (raw: string) => ReactNode | undefined;
};

const Block = memo(function Block({ raw, renderBlock }: BlockProps) {
  const nodes = useMemo(() => parseBlock(raw), [raw]);
  const custom = renderBlock?.(raw);
  if (custom !== undefined) return <>{custom}</>;

  const groups = groupNodes(nodes);

  return (
    <View style={{ gap: 10 }}>
      {groups.map((group, index) => {
        if (Array.isArray(group)) return <FlowText key={index} nodes={group} />;
        switch (group.type) {
          case "quote":
            return <QuoteText key={index} text={group.text} />;
          case "code":
            return <CodeBlock key={index} language={group.language} lines={group.lines} />;
          case "table":
            return <Table key={index} header={group.header} align={group.align} rows={group.rows} />;
          case "rule":
            return <Rule key={index} />;
        }
      })}
    </View>
  );
});

type Token = { text: string; style: TextStyle; url?: string };

function toTokens(nodes: Inline[], context: Context, style: TextStyle, url?: string, out: Token[] = []): Token[] {
  for (const node of nodes) {
    if (node.type === "text" || node.type === "code") {
      const words = node.text.match(/\s*\S+\s*|\s+/g) ?? [];
      const tokenStyle = node.type === "code" ? { ...style, ...codeSpanStyle(context) } : style;
      for (const word of words) out.push({ text: word, style: tokenStyle, url });
      continue;
    }
    if (node.type === "strong") toTokens(node.children, context, { ...style, fontWeight: "700" }, url, out);
    else if (node.type === "em") toTokens(node.children, context, { ...style, fontStyle: "italic" }, url, out);
    else if (node.type === "strike") toTokens(node.children, context, { ...style, textDecorationLine: "line-through" }, url, out);
    else toTokens(node.children, context, { ...style, color: context.palette.accent, textDecorationLine: "underline" }, node.url, out);
  }
  return out;
}

function LiveLine({ line }: { line: string }) {
  const context = useMarkdown();
  const { palette, base } = context;
  const kind = classifyLine(line);

  let lineStyle: TextStyle = { ...base, color: palette.text };
  let prefix: string | null = null;
  if (kind.type === "heading") lineStyle = { ...lineStyle, ...headingStyle(base, kind.level) };
  if (kind.type === "quote") lineStyle = { ...lineStyle, color: palette.textSecondary };
  if (kind.type === "item") prefix = listPrefix(kind.item);

  const text = kind.type === "item" ? kind.item.text : kind.text;
  const tokens = toTokens(parseInline(closeDangling(text)), context, lineStyle);
  if (tokens.length > 0) tokens[0] = { ...tokens[0]!, text: tokens[0]!.text.trimStart() };

  const row = (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {prefix ? <Text style={[lineStyle, { color: palette.textSecondary }]}>{prefix}</Text> : null}
      {tokens.map((token, index) => (
        <Animated.Text
          key={index}
          entering={context.animate ? FadeIn.duration(context.fadeDuration) : undefined}
          onPress={token.url && context.onLinkPress ? () => context.onLinkPress?.(token.url!) : undefined}
          style={token.style}
        >
          {token.text}
        </Animated.Text>
      ))}
    </View>
  );

  return kind.type === "quote" ? <Quote>{row}</Quote> : row;
}

type Layout = { blocks: string[]; live: string | null; liveStartsBlock: boolean };

function layout(text: string, isStreaming: boolean): Layout {
  if (!isStreaming || hasOpenFence(text)) {
    return { blocks: splitBlocks(text), live: null, liveStartsBlock: false };
  }

  const lastBreak = text.lastIndexOf("\n");
  const frozen = lastBreak === -1 ? "" : text.slice(0, lastBreak);
  let live: string | null = text.slice(lastBreak + 1);
  const blocks = splitBlocks(frozen);
  const liveStartsBlock = frozen.trim().length === 0 || /\n[ \t]*$/.test(frozen);

  const tail = blocks[blocks.length - 1];
  if (tail) {
    const lines = tail.split("\n");
    const lastLine = lines[lines.length - 1]!;
    const tableHeaderOnly = lines.length >= 1 && isTableRow(lastLine) && !lines.some(isTableSeparator);
    if (tableHeaderOnly && !liveStartsBlock) blocks.pop();
  }

  if (isTableRow(live) || isFenceLine(live) || PENDING_LINE.test(live) || live.trim().length === 0) live = null;

  return { blocks, live, liveStartsBlock };
}

export function StreamingMarkdown({
  text,
  isStreaming = false,
  colors,
  textStyle,
  codeFontFamily,
  blockGap = 12,
  fadeDuration = 360,
  selectable = true,
  onLinkPress,
  TextComponent = Text,
  renderBlock,
  style,
}: StreamingMarkdownProps) {
  const palette = useMotionPalette(colors);
  const reduceMotion = useReducedMotion();
  const animate = isStreaming && !reduceMotion;

  const base = useMemo(() => ({ ...DEFAULT_TEXT_STYLE, ...StyleSheet.flatten(textStyle) }), [textStyle]);
  const context = useMemo<Context>(
    () => ({
      palette,
      base,
      mono: codeFontFamily ?? MONO,
      animate,
      fadeDuration,
      selectable,
      onLinkPress,
      TextComponent,
    }),
    [palette, base, codeFontFamily, animate, fadeDuration, selectable, onLinkPress, TextComponent],
  );

  const { blocks, live, liveStartsBlock } = useMemo(() => layout(text, isStreaming), [text, isStreaming]);

  return (
    <MarkdownContext.Provider value={context}>
      <View style={style}>
        {blocks.map((raw, index) => (
          <View key={index} style={index > 0 ? { marginTop: blockGap } : undefined}>
            <Block raw={raw} context={context} renderBlock={renderBlock} />
          </View>
        ))}
        {live ? (
          <View style={blocks.length > 0 ? { marginTop: liveStartsBlock ? blockGap : 0 } : undefined}>
            <LiveLine line={live} />
          </View>
        ) : null}
      </View>
    </MarkdownContext.Provider>
  );
}
