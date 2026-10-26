# react-native-ai-animations

## 0.9.2

### Patch Changes

- Peer dependency ranges now stop below the next major version (`react` <20, `react-native` <1.0, `react-native-reanimated` <5, `react-native-worklets` <1.0, `@shopify/react-native-skia` <3). The open `>=` ranges let dependency scanners resolve `react-native` to the `1000.0.0` placeholder release and report its old dependency tree (deprecated, unmaintained and CVE alerts) against this package.

## 0.9.1

### Patch Changes

- 3ec75a2: Fix the medium bugs found in a package audit:
  
  - QuestionCard shows the send button after a single choice pick when `autoSubmit` (last page) or `autoAdvance` is off, so the card can always be sent.
  - EffortBar picks a level on release or once a horizontal drag starts, and lets a parent ScrollView take a vertical swipe. `value` is rounded and NaN falls back to 0. `fillColors` blend any color React Native accepts.
  - ShimmerText splits by grapheme, so ZWJ emoji, flags and combining marks stay whole; Arabic, Indic and other joined scripts shimmer as one text, and CJK wraps per character.
  - StatusRow takes `seconds` for a fixed duration, stops its timer at the exact moment it turns inactive and is no longer announced as a progress bar when inactive.
  - ThinkingBlock keeps the live seconds and SpokenText keeps spoken and upcoming colors when reduce motion is on.
  - DotOrb, the blobs field and VoiceWave stop their frame clock while still, and a paused DotOrb holds its current frame.
  - MatrixOrb takes `colors` and defaults its dots to the palette text color; VoiceWave `colors` is optional and defaults to the palette accent with sky and mint.
  - The MediaGenerating header shows the queued text after a custom `label`.
- 66f5709: StreamingText fades each arriving chunk with a nested Text `opacity` instead of a color alpha, so named, hsl() and rgba() colors fade too and any source alpha is kept. A `color` in `textStyle` now wins over the palette text color and also colors the default caret. `withAlpha` parses every color React Native accepts and multiplies the source alpha, so the other components handle named and hsl() palette colors as well.

## 0.9.0

### Minor Changes

- 873c457: StreamingText renders each paragraph as one native `Text`, so the streaming layout is the same as the finished text and nothing jumps when `streaming` turns false. Every arriving chunk fades in through its color, including the rest of a word that is already on screen; long words and URLs wrap natively; text that is not a prefix of the previous value keeps only the shared prefix and fades the rest. New `selectable` prop. The `rise` prop is removed.

## 0.8.1

### Patch Changes

- The README no longer embeds the recordings and instead links to the docs site, and the package homepage points at https://nami-motion-web.vercel.app/ so the npm page shows the restructured README with install, theming and prop tables.

## 0.8.0

### Minor Changes

- f566f2e: QuestionCard and QuestionSheet accept a `ref` with `select(index)`, `goTo(page)` and `submit()`, so a host can drive the questions programmatically (demos, voice input, tests).
- 189421b: The package is renamed from `nami-motion` to `react-native-ai-animations`. Install `react-native-ai-animations` and change imports such as `nami-motion/chat` to `react-native-ai-animations/chat`; the components and props are unchanged.

## 0.7.0

### Minor Changes

- 0f18220: Ring moves from VoiceWave to LiquidOrb: use `<LiquidOrb material="ring" />` with the same `state`, `level` and `size` as the other materials, and `colors` for its three loops. `VoiceWave` keeps four styles (lines, bars, dots, pulse) and `VoiceWaveRing` is removed.

## 0.6.0

### Minor Changes

- d5b5f9c: EffortBar is now only the bar, so you can place it anywhere with your own UX around it. The header and description it used to draw are gone, along with the `title`, `icon`, `badge`, `showHeader`, `showNumber`, `formatNumber`, `showDescription`, `labelStyle`, `numberStyle` and `detailStyle` props; render your own title, level label or description next to the bar instead. `accessibilityLabel` names the adjustable control for screen readers (it defaults to "Effort"). Track, segmented and slider keep their level labels, `levelIcon`, `tabLabel`, `fillColors` and `barHeight`, and `size="compact"` is now the small control on its own.
- MediaGenerating no longer paints a gray surface behind its picture, so the dots, blobs or matrix sit straight on your screen; wrap it in your own view if you want a card behind it.
- QuestionCard spacing is even: matching top and bottom padding, the close button lines up with the page arrows, and the "something else" row shares the option rows' inset, divider and number column. In the sheet variant the content flows at its natural height instead of animating its own height, so sheets that size to their content fit it exactly.

## 0.5.0

### Minor Changes

- b1cb0c9: Add customizable components: SpinningMark (`nami-motion/brand`), MediaGenerating (one loading state shared by image and video, with the ImageGenerating and VideoGenerating presets and six variants), DotOrb and MatrixOrb (`nami-motion/skia`), StreamingText (`nami-motion/text`), StatusRow, ThinkingBlock, QuestionCard, EffortBar (bars, track, segmented and slider styles, each with a compact size, a `tabLabel` for the slider's tab and `levelIcon` to show each level as an icon instead of text) and the reasoning helpers (`REASONING_EFFORTS`, `reasoningRequest`, `reasoningBudget`, matching OpenRouter's `reasoning.effort`) (`nami-motion/chat`). VoiceWave gains `variant` (lines, bars, dots, pulse, ring) and `height`. Every component takes its icon, font, colors and timing as props and settles to a static state when reduce motion is on.
- DotOrb takes `scatter`, which flies its dots apart to points across the whole canvas (`"loop"` keeps scattering and gathering them), and `inset`, which sizes the orb inside the canvas. MediaGenerating passes `scatter` to its orb variants so the dots can spread just before the result replaces the loader.
- EffortBar's `barHeight` now sets the slider's track and knob height too (40 by default); the tab above the knob keeps its size.
- MediaGenerating takes a `size` prop (`"1024x1024"`, `"1024x1536"`, `"1536x1024"`) that sets the frame ratio; `aspectRatio` still overrides it, and the frame keeps its ratio when `maxHeight` caps it.
- Every style ships as its own component with the same props minus `variant`: VoiceWaveLines, VoiceWaveBars, VoiceWaveDots, VoiceWavePulse, VoiceWaveRing, EffortBars, EffortTrack, EffortSegmented, EffortSlider, MediaGeneratingBlobs, MediaGeneratingMatrix, MediaGeneratingOrbit, MediaGeneratingScan, MediaGeneratingConstellation, MediaGeneratingHelix and QuestionSheet.
- Add `LiquidOrb` (`nami-motion/skia`), a liquid voice orb in metal, water or iridescent material that follows idle, listening, thinking and speaking states and an optional live `level`, and `SpokenText` (`nami-motion/text`), which highlights the word being spoken and dims the words already read aloud.

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
