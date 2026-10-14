export type Inline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "strike"; children: Inline[] }
  | { type: "link"; url: string; children: Inline[] };

export type TableAlign = "left" | "center" | "right";

export type ListItem = {
  ordered: boolean;
  marker: string;
  depth: number;
  text: string;
};

export type MarkdownNode =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "list"; items: ListItem[] }
  | { type: "quote"; text: string }
  | { type: "code"; language: string; lines: string[]; closed: boolean }
  | { type: "table"; header: string[]; align: TableAlign[]; rows: string[][] }
  | { type: "rule" };

export type LineKind =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "item"; item: ListItem }
  | { type: "quote"; text: string };

const FENCE = /^\s*(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const BULLET = /^(\s*)([-*+])\s+(.*)$/;
const ORDERED = /^(\s*)(\d{1,9})([.)])\s+(.*)$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;

function countFences(text: string): number {
  let count = 0;
  for (const line of text.split("\n")) {
    if (FENCE.test(line)) count += 1;
  }
  return count;
}

export function hasOpenFence(text: string): boolean {
  return countFences(text) % 2 === 1;
}

export function splitBlocks(text: string): string[] {
  const parts = text.split(/\n[ \t]*\n/);
  const merged: string[] = [];
  let open: string[] | null = null;

  for (const part of parts) {
    if (open) {
      open.push(part);
      if (!hasOpenFence(open.join("\n\n"))) {
        merged.push(open.join("\n\n"));
        open = null;
      }
      continue;
    }
    if (hasOpenFence(part)) {
      open = [part];
      continue;
    }
    merged.push(part);
  }
  if (open) merged.push(open.join("\n\n"));

  return merged.filter((raw) => raw.trim().length > 0);
}

export function isTableRow(line: string): boolean {
  return line.trimStart().startsWith("|");
}

export function isTableSeparator(line: string): boolean {
  return line.includes("-") && TABLE_SEPARATOR.test(line);
}

export function isFenceLine(line: string): boolean {
  return FENCE.test(line);
}

function splitRow(line: string): string[] {
  let body = line.trim();
  if (body.startsWith("|")) body = body.slice(1);
  if (body.endsWith("|") && !body.endsWith("\\|")) body = body.slice(0, -1);
  const cells: string[] = [];
  let current = "";
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === "\\" && body[index + 1] === "|") {
      current += "|";
      index += 1;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseAlign(line: string): TableAlign[] {
  return splitRow(line).map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

export function classifyLine(line: string): LineKind {
  const heading = HEADING.exec(line);
  if (heading) return { type: "heading", level: heading[1]!.length, text: heading[2]! };

  const bullet = BULLET.exec(line);
  if (bullet) {
    return {
      type: "item",
      item: { ordered: false, marker: "•", depth: Math.min(3, Math.floor(bullet[1]!.length / 2)), text: bullet[3]! },
    };
  }

  const ordered = ORDERED.exec(line);
  if (ordered) {
    return {
      type: "item",
      item: {
        ordered: true,
        marker: `${ordered[2]}${ordered[3]}`,
        depth: Math.min(3, Math.floor(ordered[1]!.length / 2)),
        text: ordered[4]!,
      },
    };
  }

  const quote = QUOTE.exec(line);
  if (quote) return { type: "quote", text: quote[1]! };

  return { type: "paragraph", text: line.trim() };
}

export function parseBlock(raw: string): MarkdownNode[] {
  const lines = raw.split("\n");
  const nodes: MarkdownNode[] = [];
  let index = 0;

  const last = () => nodes[nodes.length - 1];

  while (index < lines.length) {
    const line = lines[index]!;

    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[1]!;
      const body: string[] = [];
      index += 1;
      let closed = false;
      while (index < lines.length) {
        const current = lines[index]!;
        if (current.trim().startsWith(marker[0]!.repeat(3)) && current.trim().replace(/[`~]/g, "") === "") {
          closed = true;
          index += 1;
          break;
        }
        body.push(current);
        index += 1;
      }
      nodes.push({ type: "code", language: fence[2] ?? "", lines: body, closed });
      continue;
    }

    if (isTableRow(line) && index + 1 < lines.length && isTableSeparator(lines[index + 1]!)) {
      const header = splitRow(line);
      const align = parseAlign(lines[index + 1]!);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && isTableRow(lines[index]!)) {
        const cells = splitRow(lines[index]!);
        rows.push(header.map((_, column) => cells[column] ?? ""));
        index += 1;
      }
      nodes.push({ type: "table", header, align, rows });
      continue;
    }

    if (line.trim().length === 0) {
      index += 1;
      continue;
    }

    if (RULE.test(line)) {
      nodes.push({ type: "rule" });
      index += 1;
      continue;
    }

    const kind = classifyLine(line);
    const previous = last();

    if (kind.type === "heading") {
      nodes.push({ type: "heading", level: kind.level, text: kind.text });
    } else if (kind.type === "item") {
      if (previous?.type === "list") previous.items.push(kind.item);
      else nodes.push({ type: "list", items: [kind.item] });
    } else if (kind.type === "quote") {
      if (previous?.type === "quote") previous.text += `\n${kind.text}`;
      else nodes.push({ type: "quote", text: kind.text });
    } else if (previous?.type === "paragraph") {
      previous.text += `\n${kind.text}`;
    } else if (previous?.type === "list" && /^\s+/.test(line)) {
      const item = previous.items[previous.items.length - 1]!;
      item.text += ` ${kind.text}`;
    } else {
      nodes.push({ type: "paragraph", text: kind.text });
    }
    index += 1;
  }

  return nodes;
}

type InlineRule = {
  pattern: RegExp;
  build: (match: RegExpExecArray) => { node: Inline; prefix: string };
};

const INLINE_RULES: InlineRule[] = [
  { pattern: /`([^`\n]+)`/, build: (m) => ({ prefix: "", node: { type: "code", text: m[1]! } }) },
  {
    pattern: /\[([^\]\n]+)\]\(([^)\s]+)\)/,
    build: (m) => ({ prefix: "", node: { type: "link", url: m[2]!, children: parseInline(m[1]!) } }),
  },
  { pattern: /\*\*(?=\S)([\s\S]*?\S)\*\*/, build: (m) => ({ prefix: "", node: { type: "strong", children: parseInline(m[1]!) } }) },
  { pattern: /__(?=\S)([\s\S]*?\S)__/, build: (m) => ({ prefix: "", node: { type: "strong", children: parseInline(m[1]!) } }) },
  { pattern: /~~(?=\S)([\s\S]*?\S)~~/, build: (m) => ({ prefix: "", node: { type: "strike", children: parseInline(m[1]!) } }) },
  { pattern: /\*(?=[^\s*])([^*\n]*?[^\s*])\*/, build: (m) => ({ prefix: "", node: { type: "em", children: parseInline(m[1]!) } }) },
  {
    pattern: /(^|[^\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?!\w)/,
    build: (m) => ({ prefix: m[1]!, node: { type: "em", children: parseInline(m[2]!) } }),
  },
];

export function parseInline(text: string): Inline[] {
  const result: Inline[] = [];
  let rest = text;

  while (rest.length > 0) {
    let best: { index: number; length: number; rule: InlineRule; match: RegExpExecArray } | null = null;
    for (const rule of INLINE_RULES) {
      const match = rule.pattern.exec(rest);
      if (match && (best === null || match.index < best.index)) {
        best = { index: match.index, length: match[0].length, rule, match };
      }
    }
    if (!best) {
      result.push({ type: "text", text: rest });
      break;
    }
    const { node, prefix } = best.rule.build(best.match);
    const before = rest.slice(0, best.index) + prefix;
    if (before.length > 0) result.push({ type: "text", text: before });
    result.push(node);
    rest = rest.slice(best.index + best.length);
  }

  return result;
}

export function closeDangling(text: string): string {
  let result = text;
  const ticks = (result.match(/`/g) ?? []).length;
  if (ticks % 2 === 1) result += "`";
  for (const marker of ["**", "~~", "__"]) {
    const count = result.split(marker).length - 1;
    if (count % 2 === 1) result += marker;
  }
  const link = /\[([^\]\n]*)(\]\([^)\s]*)?$/.exec(result);
  if (link) {
    result = result.slice(0, link.index) + link[1]!;
  }
  return result;
}

export function plainText(nodes: Inline[]): string {
  return nodes
    .map((node) => (node.type === "text" || node.type === "code" ? node.text : plainText(node.children)))
    .join("");
}
