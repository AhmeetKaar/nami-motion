# nami-motion

## 0.5.0

### Minor Changes

- b1cb0c9: Add customizable components: SpinningMark (`nami-motion/brand`), MediaGenerating (one loading state shared by image and video, with the ImageGenerating and VideoGenerating presets and eight variants), DotOrb and MatrixOrb (`nami-motion/skia`), StreamingText (`nami-motion/text`), StatusRow, ThinkingBlock, QuestionCard, EffortBar (bars, track, segmented and slider styles, each with a compact size, a `tabLabel` for the slider's tab and `levelIcon` to show each level as an icon instead of text) and the reasoning helpers (`REASONING_EFFORTS`, `reasoningRequest`, `reasoningBudget`, matching OpenRouter's `reasoning.effort`) (`nami-motion/chat`) and BarList, Meter, Sparkline, RingGauge and CountUp (`nami-motion/charts`). VoiceWave gains `variant` (lines, bars, dots, pulse, ring) and `height`. Every component takes its icon, font, colors and timing as props and settles to a static state when reduce motion is on.

## 0.4.0

### Minor Changes

- 0941326: Trim the package down to `ShimmerText` (`nami-motion/text`) and `VoiceWave` (`nami-motion/skia`) plus the Moodstone theme entry. The `chat`, `feedback`, `gestures` and `gradient` entries and every other component (Skeleton, StatusRow, ThinkingBlock, SourceChips, SourceStack, SourceBadge, MessageActions, FollowUpChips, ThinkingTrace, TraceSteps, StreamingMarkdown, AttachmentPicker, PlusToggle, DrawerReveal, SwipeActions, ShimmerBand, GeneratingImage, RemainingRing, MatrixOrb, DictationBar, AttachmentTile, AttachmentTray) are removed, along with the `react-native-gesture-handler` and `expo-linear-gradient` peer dependencies.

## 0.3.0

### Minor Changes

- e155d98: Add `AttachmentPicker` and `PlusToggle` to `nami-motion/chat`: a panel that slides open under the composer with source tiles (camera, photos, files or your own) and an optional recent-photos grid with numbered selection badges, plus a "+" button that turns into a close mark as it opens. Icons, labels, previews and handlers are all props.

## 0.2.0

### Minor Changes

- 07b9796: Add `SourceStack` to `nami-motion/chat`: overlapping source avatars (favicons via `icon` or `renderIcon`, letters otherwise) with a count label, the compact citation trigger used under answers. `StatusRow` now shows the Nami logo when no `icon` is given; pass your own `icon` to replace it or `icon={null}` to hide it.
- e42da13: StatusRow animates label changes (the old label drifts up and out, the new one rises in) and shimmers its label by default instead of pulsing the whole row (`effect="pulse"` keeps the old look). New props: `history` shows finished steps with check marks and a connector line, `variant="card"` turns the row into a bordered tool card with a trailing activity indicator, plus `trailing`, `historyIcon`, `colors` and `style`.
- 4254247: Add StreamingMarkdown to `nami-motion/chat`: a dependency-free markdown renderer for streaming replies. Only the line being typed re-renders; its words fade in, code blocks reveal line by line and table rows slide in as they complete.
- c4ad26c: AttachmentTile adds `progressPlacement="corner"` (a small ring in the corner instead of dimming the whole image) and `variant="chip"` for files (a single-line pill with icon, name and an inline remove button). AttachmentTray items now grow in with a short timed zoom instead of an overshooting spring.
- 44522ee: DrawerReveal can reveal its children one after another: `stagger` gives each child its own slice of the drawer progress, and `scaleFrom` lets items grow slightly as they arrive.
- 089ea82: MatrixOrb takes `stateColors` to give idle, listening and thinking their own color; the tint blends between them with the same easing as the state change.
- ddbddb0: ShimmerBand can sit on a slowly drifting gradient: pass `backgroundColors` (and `driftDuration`) for a soft pastel field under the sweep. GeneratingImage forwards it as `tint`.
- 2350401: ShimmerText sweeps cleanly from outside the text to outside again with a softer falloff, wraps long text across lines, and takes `highlightWidth`, `pause` (rest between sweeps) and `direction`.
- 8214008: Skeleton gets `effect="wave"` (a soft highlight band sweeping across each bar, no gradient dependency) and `SkeletonGroup`, which drives every Skeleton inside it from one clock so pulses and waves stay in sync. `color` is now optional and falls back to the palette; `highlightColor` sets the wave tint.
- 41868bc: SwipeActions can draw actions as circles: `actionShape="circle"` puts each action in a colored circle (`circleSize`) that scales and fades in as the row opens, and actions take an optional `label` shown under the circle (or under the icon on filled actions).
- 2350401: ThinkingBlock can expand in place: `expandable` makes the header toggle a body with a left rail and the full reasoning (paragraphs fade in as they stream), with a rotating chevron when no `trailingIcon` is given. Control it with `expanded` / `defaultExpanded` / `onExpandedChange`, or replace the body with `renderBody`. `colors` is now optional and falls back to the palette; `onPress` keeps working for apps that open their own sheet.

### Patch Changes

- e42da13: ShimmerText no longer clips the edges of glyphs such as a trailing "s" or "b": each character keeps a little room to draw outside its advance width.

## 0.1.0

### Minor Changes

- 7d3b299: Add a Moodstone-based palette (`nami-motion/theme`: `moodstone`, `MotionThemeProvider`, `useMotionPalette`) and new building blocks that read from it: `SourceChips`, `SourceBadge`, `MessageActions`, `FollowUpChips`, `ThinkingTrace` and `TraceSteps` in `nami-motion/chat`, `GeneratingImage` in `nami-motion/gradient`, and `DictationBar`, `AttachmentTile` and `AttachmentTray` in `nami-motion/skia`. `StatusRow` now falls back to the palette text color when `color` is omitted.
- c03faae: Add `SwipeActions` and `SwipeActionsGroup` to `nami-motion/gestures`: rows reveal actions with a rubber-banded swipe, a full swipe runs the primary action, `onThreshold` reports threshold crossings for haptics, a group keeps one row open at a time, `configureGesture` composes the row pan with parent gestures such as a full-width drawer, and rows with actions expose them to screen readers. The root entry no longer re-exports the gestures entry, so it stays free of react-native-gesture-handler.

### Patch Changes

- 7c0d652: ShimmerText exposes its text to screen readers as one label instead of one element per character.
- dd70359: Skeleton pulses more calmly: opacity now dips to 0.6 instead of 0.45 over a 1000 ms sine curve, so placeholders stay visible on light surfaces.
