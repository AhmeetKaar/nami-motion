---
"nami-motion": minor
---

Skeleton gets `effect="wave"` (a soft highlight band sweeping across each bar, no gradient dependency) and `SkeletonGroup`, which drives every Skeleton inside it from one clock so pulses and waves stay in sync. `color` is now optional and falls back to the palette; `highlightColor` sets the wave tint.
