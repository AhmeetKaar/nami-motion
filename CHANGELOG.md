# nami-motion

## 0.2.0

### Minor Changes

- 07b9796: Add `SourceStack` to `nami-motion/chat`: overlapping source avatars (favicons via `icon` or `renderIcon`, letters otherwise) with a count label, the compact citation trigger used under answers. `StatusRow` now shows the Nami logo when no `icon` is given; pass your own `icon` to replace it or `icon={null}` to hide it.
- e42da13: StatusRow animates label changes (the old label drifts up and out, the new one rises in) and shimmers its label by default instead of pulsing the whole row (`effect="pulse"` keeps the old look). New props: `history` shows finished steps with check marks and a connector line, `variant="card"` turns the row into a bordered tool card with a trailing activity indicator, plus `trailing`, `historyIcon`, `colors` and `style`.
- 4254247: Add StreamingMarkdown to `nami-motion/chat`: a dependency-free markdown renderer for streaming replies. Only the line being typed re-renders; its words fade in, code blocks reveal line by line and table rows slide in as they complete.

### Patch Changes

- e42da13: ShimmerText no longer clips the edges of glyphs such as a trailing "s" or "b": each character keeps a little room to draw outside its advance width.

## 0.1.0

### Minor Changes

- 7d3b299: Add a Moodstone-based palette (`nami-motion/theme`: `moodstone`, `MotionThemeProvider`, `useMotionPalette`) and new building blocks that read from it: `SourceChips`, `SourceBadge`, `MessageActions`, `FollowUpChips`, `ThinkingTrace` and `TraceSteps` in `nami-motion/chat`, `GeneratingImage` in `nami-motion/gradient`, and `DictationBar`, `AttachmentTile` and `AttachmentTray` in `nami-motion/skia`. `StatusRow` now falls back to the palette text color when `color` is omitted.
- c03faae: Add `SwipeActions` and `SwipeActionsGroup` to `nami-motion/gestures`: rows reveal actions with a rubber-banded swipe, a full swipe runs the primary action, `onThreshold` reports threshold crossings for haptics, a group keeps one row open at a time, `configureGesture` composes the row pan with parent gestures such as a full-width drawer, and rows with actions expose them to screen readers. The root entry no longer re-exports the gestures entry, so it stays free of react-native-gesture-handler.

### Patch Changes

- 7c0d652: ShimmerText exposes its text to screen readers as one label instead of one element per character.
- dd70359: Skeleton pulses more calmly: opacity now dips to 0.6 instead of 0.45 over a 1000 ms sine curve, so placeholders stay visible on light surfaces.
