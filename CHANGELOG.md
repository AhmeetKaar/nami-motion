# nami-motion

## 0.1.0

### Minor Changes

- 7d3b299: Add a Moodstone-based palette (`nami-motion/theme`: `moodstone`, `MotionThemeProvider`, `useMotionPalette`) and new building blocks that read from it: `SourceChips`, `SourceBadge`, `MessageActions`, `FollowUpChips`, `ThinkingTrace` and `TraceSteps` in `nami-motion/chat`, `GeneratingImage` in `nami-motion/gradient`, and `DictationBar`, `AttachmentTile` and `AttachmentTray` in `nami-motion/skia`. `StatusRow` now falls back to the palette text color when `color` is omitted.
- c03faae: Add `SwipeActions` and `SwipeActionsGroup` to `nami-motion/gestures`: rows reveal actions with a rubber-banded swipe, a full swipe runs the primary action, `onThreshold` reports threshold crossings for haptics, a group keeps one row open at a time, `configureGesture` composes the row pan with parent gestures such as a full-width drawer, and rows with actions expose them to screen readers. The root entry no longer re-exports the gestures entry, so it stays free of react-native-gesture-handler.

### Patch Changes

- 7c0d652: ShimmerText exposes its text to screen readers as one label instead of one element per character.
- dd70359: Skeleton pulses more calmly: opacity now dips to 0.6 instead of 0.45 over a 1000 ms sine curve, so placeholders stay visible on light surfaces.
