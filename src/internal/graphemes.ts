const EXTEND = /^[\p{M}\u200C\uFE00-\uFE0F\u{E0020}-\u{E007F}\u{1F3FB}-\u{1F3FF}]$/u;
const REGIONAL = /^[\u{1F1E6}-\u{1F1FF}]$/u;
const ZWJ = "\u200D";
const SHAPED = /[\u0590-\u08FF\u0900-\u0DFF\u0E00-\u0FFF\u1000-\u109F\u1780-\u18AF\uA800-\uABFF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const CJK = /^[\u2E80-\u303F\u3040-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;

type Segmenter = { segment(text: string): Iterable<{ segment: string }> };
type SegmenterConstructor = new (locale?: string, options?: { granularity: "grapheme" }) => Segmenter;

function nativeSegmenter(): Segmenter | null {
  const constructor = (Intl as unknown as { Segmenter?: SegmenterConstructor }).Segmenter;
  return constructor ? new constructor(undefined, { granularity: "grapheme" }) : null;
}

export function splitGraphemes(text: string): string[] {
  const segmenter = typeof Intl === "undefined" ? null : nativeSegmenter();
  if (segmenter) return Array.from(segmenter.segment(text), (part) => part.segment);
  const clusters: string[] = [];
  let joinNext = false;
  for (const point of text) {
    const last = clusters.length - 1;
    const previous = clusters[last];
    const pairsFlag = REGIONAL.test(point) && previous !== undefined && REGIONAL.test(previous);
    if (previous !== undefined && (joinNext || point === ZWJ || EXTEND.test(point) || pairsFlag)) {
      clusters[last] = previous + point;
    } else {
      clusters.push(point);
    }
    joinNext = point === ZWJ;
  }
  return clusters;
}

export function needsShaping(text: string) {
  return SHAPED.test(text);
}

export function isCjk(cluster: string) {
  return CJK.test(cluster);
}
