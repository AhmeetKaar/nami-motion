---
"nami-motion": minor
---

Trim the package down to `ShimmerText` (`nami-motion/text`) and `VoiceWave` (`nami-motion/skia`) plus the Moodstone theme entry. The `chat`, `feedback`, `gestures` and `gradient` entries and every other component (Skeleton, StatusRow, ThinkingBlock, SourceChips, SourceStack, SourceBadge, MessageActions, FollowUpChips, ThinkingTrace, TraceSteps, StreamingMarkdown, AttachmentPicker, PlusToggle, DrawerReveal, SwipeActions, ShimmerBand, GeneratingImage, RemainingRing, MatrixOrb, DictationBar, AttachmentTile, AttachmentTray) are removed, along with the `react-native-gesture-handler` and `expo-linear-gradient` peer dependencies.
