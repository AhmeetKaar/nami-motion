---
"nami-motion": minor
---

Add a Moodstone-based palette (`nami-motion/theme`: `moodstone`, `MotionThemeProvider`, `useMotionPalette`) and new building blocks that read from it: `SourceChips`, `SourceBadge`, `MessageActions`, `FollowUpChips`, `ThinkingTrace` and `TraceSteps` in `nami-motion/chat`, `GeneratingImage` in `nami-motion/gradient`, and `DictationBar`, `AttachmentTile` and `AttachmentTray` in `nami-motion/skia`. `StatusRow` now falls back to the palette text color when `color` is omitted.
