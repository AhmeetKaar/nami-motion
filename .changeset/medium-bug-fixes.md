---
"react-native-ai-animations": patch
---

Fix the medium bugs found in a package audit:

- QuestionCard shows the send button after a single choice pick when `autoSubmit` (last page) or `autoAdvance` is off, so the card can always be sent.
- EffortBar picks a level on release or once a horizontal drag starts, and lets a parent ScrollView take a vertical swipe. `value` is rounded and NaN falls back to 0. `fillColors` blend any color React Native accepts.
- ShimmerText splits by grapheme, so ZWJ emoji, flags and combining marks stay whole; Arabic, Indic and other joined scripts shimmer as one text, and CJK wraps per character.
- StatusRow takes `seconds` for a fixed duration, stops its timer at the exact moment it turns inactive and is no longer announced as a progress bar when inactive.
- ThinkingBlock keeps the live seconds and SpokenText keeps spoken and upcoming colors when reduce motion is on.
- DotOrb, the blobs field and VoiceWave stop their frame clock while still, and a paused DotOrb holds its current frame.
- MatrixOrb takes `colors` and defaults its dots to the palette text color; VoiceWave `colors` is optional and defaults to the palette accent with sky and mint.
- The MediaGenerating header shows the queued text after a custom `label`.
